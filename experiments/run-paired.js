#!/usr/bin/env node
'use strict';

/**
 * Paired, length-balanced, same-run head-to-head: does the MODIFIED skill make
 * the solver reason better than the ORIGINAL skill on the same problems?
 *
 * Fixes the two confounds in the first experiment pass:
 *  - run variance: both arms are solved + judged in the SAME invocation.
 *  - length: the shorter skill version is padded with neutral filler to equal
 *    the longer one, so only CONTENT differs (key for L1 trigger-vs-full).
 *
 * Reports the modified-vs-original win-rate with a CI + sign-test p-value, so the
 * lift is a real (if small-N) significance statement, not a stored-baseline delta.
 *
 * Env: ORIG_DIR (original repository root), MOD_DIR (modified repository root),
 *      SOLVER_MODEL, JUDGES, CONC, OUT (json path). Args: skill short-names.
 */

const fs = require('fs');
const path = require('path');
const { droidExecAsync } = require('../evals/lib/droid');
const { buildBalancedSkillPrompt, wordCount } = require('../evals/lib/conditions');
const { panelJudge } = require('../evals/lib/judge');
const { summarize } = require('../evals/lib/stats');
const { mapPool } = require('../evals/lib/io');

const ORIG_DIR = process.env.ORIG_DIR;
const MOD_DIR = process.env.MOD_DIR;
const SOLVER = process.env.SOLVER_MODEL || 'claude-sonnet-4-6';
const SOLVER_EFFORT = process.env.SOLVER_EFFORT || 'medium';
const CONC = parseInt(process.env.CONC || '3', 10);
const OUT = process.env.OUT;
const DATA_DIR = path.join(__dirname, '..', 'evals', 'datasets', 'behavioral');
const RUBRIC = fs.readFileSync(path.join(__dirname, '..', 'evals', 'rubrics', 'behavioral-pairwise.md'), 'utf8');

function skillMd(dir, short) { return fs.readFileSync(path.join(dir, 'plugin', 'skills', 'thinking-' + short, 'SKILL.md'), 'utf8'); }
function judgePrompt(problem, a, b) { return `${RUBRIC}\n\n=== PROBLEM ===\n${problem.prompt}\n\n=== RESPONSE A ===\n${a}\n\n=== RESPONSE B ===\n${b}\n\n=== END ===\nReturn ONLY the JSON verdict.`; }

async function runSkill(short) {
  const orig = skillMd(ORIG_DIR, short), mod = skillMd(MOD_DIR, short);
  const target = Math.max(wordCount(orig), wordCount(mod));
  const ds = JSON.parse(fs.readFileSync(path.join(DATA_DIR, `thinking-${short}.json`), 'utf8'));
  let wins = 0, losses = 0, ties = 0;
  for (let i = 0; i < ds.problems.length; i++) {
    const p = ds.problems[i];
    const [rm, ro] = await Promise.all([
      droidExecAsync({ model: SOLVER, effort: SOLVER_EFFORT, prompt: buildBalancedSkillPrompt(mod, p.prompt, target) }),
      droidExecAsync({ model: SOLVER, effort: SOLVER_EFFORT, prompt: buildBalancedSkillPrompt(orig, p.prompt, target) }),
    ]);
    if (!rm.ok || !ro.ok) continue;
    const modIsA = i % 2 === 0; // deterministic order balance
    const v = await panelJudge(judgePrompt(p, modIsA ? rm.text : ro.text, modIsA ? ro.text : rm.text));
    let w = 'tie';
    if (v.winner === 'A') w = modIsA ? 'mod' : 'orig';
    else if (v.winner === 'B') w = modIsA ? 'orig' : 'mod';
    if (w === 'mod') wins++; else if (w === 'orig') losses++; else ties++;
  }
  return { skill: short, ...summarize(wins, losses, ties) };
}

async function main() {
  if (!ORIG_DIR || !MOD_DIR) { console.error('set ORIG_DIR and MOD_DIR'); process.exit(1); }
  const skills = process.argv.slice(2).map(s => s.replace(/^thinking-/, ''));
  const perSkill = await mapPool(skills, CONC, runSkill);
  const W = perSkill.reduce((a, s) => a + s.wins, 0), L = perSkill.reduce((a, s) => a + s.losses, 0), T = perSkill.reduce((a, s) => a + s.ties, 0);
  const agg = summarize(W, L, T);
  const out = { mode: 'paired-head-to-head', metric: 'modified beats original', solver: SOLVER, skills: perSkill, aggregate: agg };
  if (OUT) { fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(out, null, 2)); }
  console.log(JSON.stringify({ aggregate: agg, perSkill: perSkill.map(s => ({ skill: s.skill, win_rate: s.win_rate, ci: s.ci95, p: s.p_value })) }, null, 2));
}

main();
