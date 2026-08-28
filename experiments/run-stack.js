#!/usr/bin/env node
'use strict';

/**
 * Skill-stacking experiment: does combining skills beat a single skill (synergy)
 * or just add bloat? Length-controlled, same-run, panel-judged.
 *
 * Conditions (all padded to the stack's word length to isolate content):
 *   placebo  — neutral filler only
 *   single   — the first skill alone
 *   stack    — all N skills combined
 * Judged pairwise: stack-vs-placebo (does stacking help at all) and
 * stack-vs-single (synergy beyond one lens). Problems = the union of the
 * stacked skills' own behavioral problems (where ≥1 lens should apply).
 *
 * Usage: node experiments/run-stack.js thinking-first-principles thinking-second-order thinking-red-team
 */

const fs = require('fs');
const path = require('path');
const { droidExecAsync } = require('../evals/lib/droid');
const { buildConditionPrompt, buildBalancedSkillPrompt, buildStackPrompt, wordCount, neutralFiller } = require('../evals/lib/conditions');
const { panelJudge } = require('../evals/lib/judge');
const { summarize } = require('../evals/lib/stats');

const SOLVER = process.env.SOLVER_MODEL || 'claude-sonnet-4-6';
const SOLVER_EFFORT = process.env.SOLVER_EFFORT || 'medium';
const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'evals', 'datasets', 'behavioral');
const RUBRIC = fs.readFileSync(path.join(ROOT, 'evals', 'rubrics', 'behavioral-pairwise.md'), 'utf8');
const skillMd = s => fs.readFileSync(path.join(ROOT, 'plugin', 'skills', 'thinking-' + s.replace(/^thinking-/, ''), 'SKILL.md'), 'utf8');
const judgePrompt = (p, a, b) => `${RUBRIC}\n\n=== PROBLEM ===\n${p.prompt}\n\n=== RESPONSE A ===\n${a}\n\n=== RESPONSE B ===\n${b}\n\n=== END ===\nReturn ONLY the JSON verdict.`;

async function main() {
  const skills = process.argv.slice(2).map(s => s.replace(/^thinking-/, ''));
  if (skills.length < 2) { console.error('give >=2 skills to stack'); process.exit(1); }
  const contents = skills.map(skillMd);
  const stackText = contents.map((c, i) => `SKILL ${i}\n${c}`).join('\n');
  const target = wordCount(stackText);
  // problems = union of the stacked skills' behavioral problems
  const problems = [];
  for (const s of skills) {
    const ds = JSON.parse(fs.readFileSync(path.join(DATA, `thinking-${s}.json`), 'utf8'));
    ds.problems.forEach(p => problems.push(p));
  }
  console.log(`Stacking ${skills.join(' + ')} | ${problems.length} problems | solver=${SOLVER}(${SOLVER_EFFORT})`);

  const tallies = { 'stack:placebo': { w: 0, l: 0, t: 0 }, 'stack:single': { w: 0, l: 0, t: 0 } };
  for (let i = 0; i < problems.length; i++) {
    const p = problems[i];
    const [placebo, single, stack] = await Promise.all([
      droidExecAsync({ model: SOLVER, effort: SOLVER_EFFORT, prompt: `Some general notes:\n\n${neutralFiller(target)}\n\nNow address this problem:\n\n${p.prompt}\n\nThink carefully and give your best, decision-useful answer.` }),
      droidExecAsync({ model: SOLVER, effort: SOLVER_EFFORT, prompt: buildBalancedSkillPrompt(contents[0], p.prompt, target) }),
      droidExecAsync({ model: SOLVER, effort: SOLVER_EFFORT, prompt: buildStackPrompt(contents, p.prompt, target) }),
    ]);
    if (!placebo.ok || !single.ok || !stack.ok) continue;
    for (const [key, other] of [['stack:placebo', placebo], ['stack:single', single]]) {
      const stackIsA = i % 2 === 0;
      const v = await panelJudge(judgePrompt(p, stackIsA ? stack.text : other.text, stackIsA ? other.text : stack.text));
      let w = 'tie';
      if (v.winner === 'A') w = stackIsA ? 'stack' : 'other';
      else if (v.winner === 'B') w = stackIsA ? 'other' : 'stack';
      if (w === 'stack') tallies[key].w++; else if (w === 'other') tallies[key].l++; else tallies[key].t++;
    }
  }
  const out = { stack: skills, solver: SOLVER, problems: problems.length };
  for (const k of Object.keys(tallies)) out[k] = summarize(tallies[k].w, tallies[k].l, tallies[k].t);
  if (process.env.OUTFILE) { fs.mkdirSync(path.dirname(process.env.OUTFILE), { recursive: true }); fs.writeFileSync(process.env.OUTFILE, JSON.stringify(out, null, 2)); }
  console.log(JSON.stringify(out, null, 2));
}

main();
