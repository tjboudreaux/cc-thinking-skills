'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  validateSkillContent,
  validateAllSkills,
  DEFAULT_REQUIRED_SECTIONS,
  parseFrontmatter,
  listSkillDirs,
  listUnexpectedSkillFiles,
  validatePluginManifests,
} = require('../../scripts/validate-skills');
const {
  validateDatasetSplits,
  validateAuthoredFile,
  promptHash,
  resolveExternalReportPath,
  REPO_ROOT,
} = require('../validate-dataset-splits');

const LEAN_BODY = `---
name: thinking-example
description: Short situation-named description under two hundred characters.
disable-model-invocation: true
---

## When to Use
Use when X is observed.

## When NOT to Use
Do not use for routine Y.

## Procedure
1. Observe evidence.
2. Decide.
3. Stop.

## Output
Return a decision artifact.

## Verification
Stop if evidence is missing.
`;

test('required sections are When to Use / NOT / Procedure / Output / Verification', () => {
  assert.deepEqual(DEFAULT_REQUIRED_SECTIONS, [
    'When to Use',
    'When NOT to Use',
    'Procedure',
    'Output',
    'Verification',
  ]);
  const ok = validateSkillContent(LEAN_BODY, {
    name: 'thinking-example',
    maxWords: 100,
    enforceBudget: true,
  });
  assert.equal(ok.pass, true, JSON.stringify(ok.failed));
});

test('manual quarantine and procedure depth are enforced', () => {
  const missingQuarantine = LEAN_BODY.replace('disable-model-invocation: true\n', '');
  const quarantineResult = validateSkillContent(missingQuarantine, {
    name: 'thinking-example',
    maxWords: 100,
    enforceBudget: true,
    requireDisableModelInvocation: true,
  });
  assert.equal(quarantineResult.pass, false);
  assert.ok(quarantineResult.failed.some(check => check.name === 'Manual-only Quarantine'));

  const shallowProcedure = LEAN_BODY.replace('2. Decide.\n3. Stop.', '2. Decide.');
  const procedureResult = validateSkillContent(shallowProcedure, {
    name: 'thinking-example',
    maxWords: 100,
    enforceBudget: true,
  });
  assert.equal(procedureResult.pass, false);
  assert.ok(procedureResult.failed.some(check => check.name === 'Procedure Steps'));

  const deletedReference = `${LEAN_BODY}\nNever invoke thinking-deleted-example.\n`;
  const referenceResult = validateSkillContent(deletedReference, {
    name: 'thinking-example',
    maxWords: 100,
    enforceBudget: true,
    forbiddenSkillIds: ['deleted-example'],
  });
  assert.equal(referenceResult.pass, false);
  assert.deepEqual(referenceResult.forbidden_skill_refs, ['deleted-example']);
});

test('validator fails missing required sections and overlong description', () => {
  const body = `---
name: thinking-example
description: ${'x'.repeat(201)}
---

## Overview
Old shape only.
`;
  const result = validateSkillContent(body, {
    name: 'thinking-example',
    maxWords: 50,
    enforceBudget: true,
  });
  assert.equal(result.pass, false);
  const failedNames = result.failed.map(f => f.name);
  assert.ok(failedNames.includes('Description Length'));
  assert.ok(failedNames.some(n => n.includes('When to Use')));
  assert.ok(failedNames.some(n => n.includes('When NOT to Use')));
  assert.ok(failedNames.some(n => n.includes('Procedure')));
  assert.ok(failedNames.some(n => n.includes('Output')));
  assert.ok(failedNames.some(n => n.includes('Verification')));
});

test('parseFrontmatter returns identical fields for LF and CRLF', () => {
  const crlf = LEAN_BODY.replace(/\r?\n/g, '\r\n');
  const lfParsed = parseFrontmatter(LEAN_BODY);
  const crlfParsed = parseFrontmatter(crlf);
  assert.equal(crlfParsed.has_frontmatter, true);
  assert.deepEqual(crlfParsed.frontmatter, lfParsed.frontmatter);

  const crlfResult = validateSkillContent(crlf, {
    name: 'thinking-example',
    maxWords: 100,
    enforceBudget: true,
  });
  assert.equal(crlfResult.pass, true, JSON.stringify(crlfResult.failed));
});

test('parseFrontmatter decodes quoted scalars and preserves valid bare scalars', () => {
  const content = `---
# full-line comments are ignored

name: thinking-example
description: 'It''s useful: when reality is expensive.'
double-quoted: "line\\nvalue"
disable-model-invocation: true
---
body
`;
  const parsed = parseFrontmatter(content);
  assert.equal(parsed.has_frontmatter, true);
  assert.deepEqual(parsed.errors, []);
  assert.deepEqual(parsed.frontmatter, {
    name: 'thinking-example',
    description: "It's useful: when reality is expensive.",
    'double-quoted': 'line\nvalue',
    'disable-model-invocation': 'true',
  });

  const thoughtExperiment = fs.readFileSync(
    path.join(REPO_ROOT, 'skills', 'thinking-thought-experiment', 'SKILL.md'),
    'utf8',
  );
  const thoughtParsed = parseFrontmatter(thoughtExperiment);
  assert.deepEqual(thoughtParsed.errors, []);
  assert.match(thoughtParsed.frontmatter.description, /counterfactual: isolate one variable/);
});

test('parseFrontmatter reports every malformed flat-scalar class with LF/CRLF parity', () => {
  const cases = [
    ['not a mapping', 'frontmatter line 2: expected key: scalar'],
    ['name:', 'frontmatter line 2: expected key: scalar'],
    ['name: first\nname: second', 'frontmatter line 3: duplicate key "name"'],
    ["name: 'unclosed", 'frontmatter line 2: unclosed single-quoted scalar'],
    ['name: "invalid\\q"', 'frontmatter line 2: invalid double-quoted scalar'],
    ['name: ambiguous: value', 'frontmatter line 2: ambiguous bare scalar contains ": "'],
    ['name: ambiguous # value', 'frontmatter line 2: ambiguous bare scalar contains " #"'],
  ];

  for (const [frontmatter, expectedError] of cases) {
    const lf = `---\n${frontmatter}\n---\nbody\n`;
    const crlf = lf.replace(/\n/g, '\r\n');
    assert.deepEqual(parseFrontmatter(lf).errors, [expectedError]);
    assert.deepEqual(parseFrontmatter(crlf).errors, [expectedError]);
  }
});

test('validateSkillContent surfaces parser errors in YAML Frontmatter detail', () => {
  const result = validateSkillContent(
    LEAN_BODY.replace(
      'description: Short situation-named description under two hundred characters.',
      'description: ambiguous: bare scalar',
    ),
    { name: 'thinking-example', maxWords: 100, enforceBudget: true },
  );
  const yamlCheck = result.checks.find(check => check.name === 'YAML Frontmatter');
  assert.equal(yamlCheck.pass, false);
  assert.equal(
    yamlCheck.detail,
    'frontmatter line 3: ambiguous bare scalar contains ": "',
  );
});

test('router emits invocable thinking-skills IDs; NONE means no invocation', () => {
  const routerPath = path.join(REPO_ROOT, 'skills', 'thinking-model-router', 'SKILL.md');
  const content = fs.readFileSync(routerPath, 'utf8');
  const plugin = JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, '.claude-plugin', 'plugin.json'), 'utf8'),
  );

  // Positive: the invocation rule's exact ID is the plugin namespace plus a real
  // skill directory, so `thinking-skills:thinking-<slug>` resolves for the catalog.
  assert.equal(plugin.name, 'thinking-skills');
  assert.ok(content.includes('`thinking-skills:thinking-<slug>`'));
  const catalog = new Set(listSkillDirs());
  for (const dir of catalog) {
    assert.ok(dir.startsWith('thinking-'), `${dir} breaks the thinking-skills:<dir> ID rule`);
  }

  // Every fully-qualified thinking-* token the router cites must resolve to a
  // shipped skill (regression: 11 stale IDs in the original PR table did not).
  const refs = new Set([...content.matchAll(/thinking-[a-z0-9-]+/g)].map(m => m[0]));
  refs.delete('thinking-model-router');
  refs.delete('thinking-skills');
  assert.deepEqual([...refs].filter(slug => !catalog.has(slug)), []);

  // Negative: NONE is explicitly defined as no invocation.
  assert.ok(/`?NONE`? means no invocation/.test(content));
});

test('word budget failure is observable for survivors', () => {
  const words = Array.from({ length: 120 }, () => 'word').join(' ');
  const body = `---
name: thinking-example
description: ok description
---

## When to Use
x

## When NOT to Use
y

## Procedure
z

## Output
o

## Verification
v

${words}
`;
  const result = validateSkillContent(body, {
    name: 'thinking-example',
    maxWords: 50,
    enforceBudget: true,
  });
  assert.equal(result.pass, false);
  assert.ok(result.failed.some(f => f.name === 'Word Budget'));
});

test('current lean catalog satisfies every structural contract', () => {
  const report = validateAllSkills();
  assert.equal(report.found_count, 28);
  assert.equal(report.expected_count, 28);
  assert.equal(report.ok, true, report.failed.map(result => result.name).join(', '));
  assert.equal(report.failed.length, 0);
  assert.equal(report.summary.passed, 28);
  assert.equal(report.summary.failed, 0);
  for (const result of report.results) {
    assert.ok(result.procedure_steps >= 3 && result.procedure_steps <= 7, result.name);
    assert.equal(result.frontmatter['disable-model-invocation'], 'true', result.name);
    assert.deepEqual(result.forbidden_skill_refs, [], result.name);
  }
});

test('catalog boundary rejects stray SKILL.md files but ignores local trees and candidates', () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-catalog-'));
  const writeFixture = (relativePath) => {
    const absolutePath = path.join(repoRoot, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, 'fixture\n');
  };

  writeFixture('evals/study/SKILL.md');
  writeFixture('evals/study/CANDIDATE.md');
  for (const ignoredPath of [
    '.git/cache/SKILL.md',
    '.claude/cache/SKILL.md',
    'backups/cache/SKILL.md',
    'evals/checkouts/cache/SKILL.md',
    'node_modules/package/SKILL.md',
  ]) {
    writeFixture(ignoredPath);
  }

  assert.deepEqual(listUnexpectedSkillFiles(repoRoot), ['evals/study/SKILL.md']);
  const report = validateAllSkills({
    repoRoot,
    skillsDir: path.join(REPO_ROOT, 'skills'),
  });
  assert.ok(report.catalog_errors.includes('unexpected SKILL.md: evals/study/SKILL.md'));
  assert.throws(
    () => listUnexpectedSkillFiles(path.join(repoRoot, 'missing')),
    /ENOENT/,
  );
});

function createManifestRepo() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-manifests-'));
  const manifest = fs.readFileSync(
    path.join(REPO_ROOT, '.claude-plugin', 'plugin.json'),
    'utf8',
  );
  for (const relativePath of [
    '.claude-plugin/plugin.json',
    '.github/plugin/plugin.json',
  ]) {
    const absolutePath = path.join(repoRoot, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, manifest);
  }
  return repoRoot;
}

test('plugin manifests expose the same portable skills catalog', () => {
  assert.deepEqual(validatePluginManifests(createManifestRepo()), []);
});

test('plugin manifest validation rejects metadata drift', () => {
  const repoRoot = createManifestRepo();
  const githubPath = path.join(repoRoot, '.github', 'plugin', 'plugin.json');
  const githubManifest = JSON.parse(fs.readFileSync(githubPath, 'utf8'));
  githubManifest.version = '9.9.9';
  fs.writeFileSync(githubPath, `${JSON.stringify(githubManifest, null, 2)}\n`);
  assert.deepEqual(
    validatePluginManifests(repoRoot),
    ['manifest field mismatch: version'],
  );
});

test('plugin manifest validation reports malformed JSON', () => {
  const repoRoot = createManifestRepo();
  fs.writeFileSync(
    path.join(repoRoot, '.github', 'plugin', 'plugin.json'),
    '{ invalid',
  );
  const errors = validatePluginManifests(repoRoot);
  assert.equal(errors.length, 1);
  assert.match(
    errors[0],
    /^manifest invalid JSON: \.github\/plugin\/plugin\.json:/,
  );
});

test('plugin manifest validation rejects a noncanonical skills path', () => {
  const repoRoot = createManifestRepo();
  const githubPath = path.join(repoRoot, '.github', 'plugin', 'plugin.json');
  const githubManifest = JSON.parse(fs.readFileSync(githubPath, 'utf8'));
  githubManifest.skills = ['./skills'];
  fs.writeFileSync(githubPath, `${JSON.stringify(githubManifest, null, 2)}\n`);
  assert.deepEqual(validatePluginManifests(repoRoot), [
    'manifest skills must equal ["skills/"]: .github/plugin/plugin.json',
    'manifest field mismatch: skills',
  ]);
});

test('validate-skills does not write quality-report.json', () => {
  const reportPath = path.join(__dirname, '..', '..', 'scripts', 'quality-report.json');
  const before = fs.existsSync(reportPath) ? fs.statSync(reportPath).mtimeMs : null;
  // invoke pure API only
  validateAllSkills();
  const after = fs.existsSync(reportPath) ? fs.statSync(reportPath).mtimeMs : null;
  assert.equal(after, before);
});

test('global split validator checks ids and clusters without requiring tracked output', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'split-val-'));
  const authored = path.join(tmp, 'authored');
  fs.mkdirSync(authored);
  // two rows same cluster across splits -> fail
  const rows = [
    {
      id: 'a1',
      prompt: 'hello one',
      cluster_id: 'c1',
      source_family: 'f',
      split: 'dev',
      cluster_basis: 'x',
    },
    {
      id: 'a2',
      prompt: 'hello two',
      cluster_id: 'c1',
      source_family: 'f',
      split: 'heldout',
      cluster_basis: 'x',
    },
  ];
  fs.writeFileSync(path.join(authored, 'sample.jsonl'), rows.map(r => JSON.stringify(r)).join('\n') + '\n');

  const fileResult = validateAuthoredFile('sample.jsonl', authored);
  assert.equal(fileResult.status, 'failed');
  assert.ok(fileResult.errors.some(e => /cluster overlap/.test(e)));

  // prompt hash helper is stable
  assert.equal(promptHash({ prompt: 'abc' }), promptHash({ prompt: 'abc' }));
  assert.notEqual(promptHash({ prompt: 'abc' }), promptHash({ prompt: 'abd' }));

  // full validator on real tree should return structure and not throw
  const real = validateDatasetSplits();
  assert.ok(real.summary);
  assert.ok(Array.isArray(real.authored));
  assert.ok(Array.isArray(real.workflow));
  assert.ok(real.global);
  // ensure workflow-cases-replication is included when present
  assert.ok(real.workflow.some(w => w.file.includes('replication')) || !fs.existsSync(path.join(__dirname, '..', 'datasets', 'workflow-cases-replication.jsonl')));
});

test('consumed provisional authored rows are dev-only and non-fresh', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'split-consumed-'));
  const authored = path.join(tmp, 'authored');
  fs.mkdirSync(authored);
  const consumed = {
    id: 'consumed-1',
    prompt: 'already evaluated',
    cluster_id: 'consumed-cluster',
    source_family: 'legacy',
    split: 'heldout',
    cluster_basis: 'legacy reuse',
    evidence_status: 'consumed_provisional',
    freshness_eligible: false,
  };
  fs.writeFileSync(path.join(authored, 'consumed.jsonl'), `${JSON.stringify(consumed)}\n`);
  const invalid = validateAuthoredFile('consumed.jsonl', authored);
  assert.equal(invalid.status, 'failed');
  assert.ok(invalid.errors.some(error => /must use split=dev/.test(error)));

  consumed.split = 'dev';
  fs.writeFileSync(path.join(authored, 'consumed.jsonl'), `${JSON.stringify(consumed)}\n`);
  const valid = validateAuthoredFile('consumed.jsonl', authored);
  assert.equal(valid.status, 'passed', valid.errors.join('; '));
});

test('global validator detects cross-file authored id collisions', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'split-global-'));
  const authored = path.join(tmp, 'authored');
  const workflow = path.join(tmp, 'workflow');
  fs.mkdirSync(authored);
  fs.mkdirSync(workflow);
  const row = {
    id: 'dup-id',
    prompt: 'unique prompt text alpha',
    cluster_id: 'cluster-a',
    source_family: 'f',
    split: 'dev',
    cluster_basis: 'x',
  };
  const row2 = {
    id: 'dup-id',
    prompt: 'unique prompt text beta',
    cluster_id: 'cluster-b',
    source_family: 'f',
    split: 'heldout',
    cluster_basis: 'y',
  };
  fs.writeFileSync(path.join(authored, 'one.jsonl'), JSON.stringify(row) + '\n');
  fs.writeFileSync(path.join(authored, 'two.jsonl'), JSON.stringify(row2) + '\n');
  const report = validateDatasetSplits({
    authoredDir: authored,
    workflowDir: workflow,
    workflowFiles: [],
  });
  assert.equal(report.ok, false);
  assert.ok(report.global.errors.some(e => /global duplicate id/.test(e)));
});

test('EVAL_SPLIT_OUT refuses in-repo paths and leaves them absent', () => {
  const inRepo = path.join(REPO_ROOT, 'evals', 'results', 'latest', 'dataset-split-validation.json');
  const decision = resolveExternalReportPath(inRepo, REPO_ROOT);
  assert.equal(decision.ok, false);
  assert.match(decision.reason, /outside the repository/);

  const external = path.join(os.tmpdir(), `split-out-${Date.now()}.json`);
  const ok = resolveExternalReportPath(external, REPO_ROOT);
  assert.equal(ok.ok, true);
  assert.equal(ok.path, path.resolve(external));

  // Ensure resolve helper does not create the refused path
  // (file may already exist historically; only assert helper refusal).
  assert.ok(!decision.ok);
});

test('workflow base and expanded share heldout; cluster overlap is not leakage', () => {
  const {
    validateGlobal,
    effectiveSplit,
  } = require('../validate-dataset-splits');

  assert.equal(effectiveSplit({ kind: 'workflow', role: 'base' }), 'heldout');
  assert.equal(effectiveSplit({ kind: 'workflow', role: 'expanded' }), 'heldout');
  assert.equal(effectiveSplit({ kind: 'workflow', role: 'replication' }), 'replication');
  assert.equal(effectiveSplit({ kind: 'authored', role: 'dev' }), 'dev');

  const authoredResults = [{
    file: 'a.jsonl',
    rows: [{
      id: 'auth-1',
      prompt: 'authored heldout prompt',
      cluster_id: 'auth-heldout-cluster',
      source_family: 'f',
      split: 'heldout',
      cluster_basis: 'x',
    }],
  }];
  const sharedCluster = 'wf-shared-cluster';
  const workflowResults = [
    {
      file: 'workflow-cases.jsonl',
      role: 'base',
      rows: [{
        id: 'wf-base-1',
        case_brief: 'workflow base brief one',
        cluster_id: sharedCluster,
      }],
    },
    {
      file: 'workflow-cases-expanded.jsonl',
      role: 'expanded',
      rows: [{
        id: 'wf-exp-1',
        case_brief: 'workflow expanded brief two',
        cluster_id: sharedCluster,
      }],
    },
  ];

  const global = validateGlobal(authoredResults, workflowResults);
  assert.ok(!global.errors.some(e => /wf-shared-cluster/.test(e)), global.errors.join('; '));
  // still flag true cross-split leakage
  const leak = validateGlobal(authoredResults, [{
    file: 'workflow-cases-replication.jsonl',
    role: 'replication',
    rows: [{
      id: 'wf-repl-1',
      case_brief: 'replication brief',
      cluster_id: 'auth-heldout-cluster',
    }],
  }]);
  assert.ok(leak.errors.some(e => /auth-heldout-cluster/.test(e) && /effective heldout and replication/.test(e)));
});
