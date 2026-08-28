'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  buildToolLocalizationPrompt,
  createKeyedSerialExecutor,
  eligibleToolLocalizationItems,
  freezeToolLocalizationSplits,
  parseToolLocalizationResponse,
  repoCachePath,
  prepareRepository,
} = require('../lib/tool-localization');

test('eligibleToolLocalizationItems requires one non-leaked owner and checkout metadata', () => {
  const base = {
    id: 'i1',
    mode: 'swe-tool-localize',
    repo: 'org/repo',
    base_commit: 'abc123',
    problem_statement: 'A nested behavior fails.',
    prompt: 'A nested behavior fails.',
    gold_files: ['pkg/core/owner.py'],
  };
  assert.deepEqual(eligibleToolLocalizationItems([
    base,
    { ...base, id: 'leak', problem_statement: 'owner.py fails', prompt: 'owner.py fails' },
    { ...base, id: 'multi', gold_files: ['pkg/a.py', 'pkg/b.py'] },
    { ...base, id: 'missing', base_commit: null },
  ]).map((item) => item.id), ['i1']);
});

test('freezeToolLocalizationSplits is deterministic, disjoint, and commit-isolated', () => {
  const items = Array.from({ length: 7 }, (_, index) => ({
    id: `i${index}`,
    mode: 'swe-tool-localize',
    repo: index % 2 ? 'org/one' : 'org/two',
    base_commit: index === 6 ? 'commit-0' : `commit-${index}`,
    problem_statement: `Nested behavior ${index} fails.`,
    prompt: `Nested behavior ${index} fails.`,
    gold_files: [`pkg/core/owner${index}.py`],
  }));
  const options = {
    seed: 'frozen-seed',
    sizes: { calibration: 2, pilot: 2 },
    excludeIds: ['i1'],
  };
  const first = freezeToolLocalizationSplits(items, options);
  assert.deepEqual(first, freezeToolLocalizationSplits(items, options));
  assert.equal(first.calibration.length, 2);
  assert.equal(first.pilot.length, 2);
  assert.equal(new Set([...first.calibration, ...first.pilot]).size, 4);
  assert.equal([...first.calibration, ...first.pilot].includes('i1'), false);
  const byId = new Map(items.map((item) => [item.id, item]));
  const commits = [...first.calibration, ...first.pilot].map((id) => byId.get(id).base_commit);
  assert.equal(new Set(commits).size, commits.length);
});

test('repoCachePath produces a safe deterministic repository directory', () => {
  assert.equal(
    repoCachePath('/tmp/cache', 'Org/Repo.Name'),
    path.join('/tmp/cache', 'org__repo.name'),
  );
  assert.throws(() => repoCachePath('/tmp/cache', '../escape'), /invalid repository/);
});

test('prepareRepository clones, fetches missing commit, checks cleanliness, and detaches', async () => {
  const calls = [];
  const ensured = [];
  const existing = new Set();
  const run = async (args) => {
    calls.push(args);
    if (args[0] === 'clone') {
      existing.add('/tmp/cache/org__repo/.git');
      return { status: 0, stdout: '' };
    }
    if (args.includes('cat-file')) return { status: 1, stdout: '' };
    if (args.includes('status')) return { status: 0, stdout: '' };
    if (args.includes('rev-parse')) return { status: 0, stdout: 'abc123\n' };
    return { status: 0, stdout: '' };
  };
  const checkout = await prepareRepository({
    repo: 'org/repo',
    base_commit: 'abc123',
  }, {
    cacheRoot: '/tmp/cache',
    exists: (file) => existing.has(file),
    ensureDir: (dir) => ensured.push(dir),
    run,
  });
  assert.equal(checkout, '/tmp/cache/org__repo');
  assert.deepEqual(ensured, ['/tmp/cache']);
  const clone = calls.find((args) => args[0] === 'clone');
  assert.ok(clone);
  assert.equal(clone.includes('--no-checkout'), false);
  assert.equal(calls.some((args) => args.includes('fetch')), true);
  assert.equal(calls.some((args) => args.includes('checkout') && args.includes('abc123')), true);
});

test('prepareRepository refuses to overwrite a dirty generated checkout', async () => {
  const run = async (args) => {
    if (args.includes('cat-file')) return { status: 0, stdout: '' };
    if (args.includes('status')) return { status: 0, stdout: ' M owner.py\n' };
    return { status: 0, stdout: '' };
  };
  await assert.rejects(
    prepareRepository({ repo: 'org/repo', base_commit: 'abc123' }, {
      cacheRoot: '/tmp/cache',
      exists: () => true,
      ensureDir: () => {},
      run,
    }),
    /checkout is dirty/,
  );
});

test('buildToolLocalizationPrompt applies the same bounded observation contract to each arm', () => {
  const prompt = buildToolLocalizationPrompt({
    problem_statement: 'The behavior fails after an upgrade.',
    repo: 'org/repo',
  }, {
    skillContent: 'CLUE-FIRST INSTRUCTION',
    maxObservations: 4,
  });
  assert.match(prompt, /CLUE-FIRST INSTRUCTION/);
  assert.match(prompt, /at most 4 repository observations/);
  assert.match(prompt, /OBSERVATIONS_USED: N/);
  assert.match(prompt, /ANSWER: path\/to\/file.ext/);
});

test('parseToolLocalizationResponse enforces the terminal path and records budget compliance', () => {
  assert.deepEqual(
    parseToolLocalizationResponse('analysis\nOBSERVATIONS_USED: 3\nANSWER: pkg/core/owner.py', 4),
    {
      answer: 'pkg/core/owner.py',
      reported_observations: 3,
      budget_compliant: true,
    },
  );
  assert.equal(
    parseToolLocalizationResponse('OBSERVATIONS_USED: 5\nANSWER: pkg/core/owner.py', 4).budget_compliant,
    false,
  );
  assert.equal(parseToolLocalizationResponse('ANSWER: pkg/core/owner.py\nextra', 4), null);
});

test('createKeyedSerialExecutor serializes one repository without blocking another', async () => {
  const serial = createKeyedSerialExecutor();
  const events = [];
  let releaseFirst;
  const firstGate = new Promise((resolve) => { releaseFirst = resolve; });
  const first = serial('org/repo', async () => {
    events.push('first-start');
    await firstGate;
    events.push('first-end');
  });
  const second = serial('org/repo', async () => events.push('second'));
  const other = serial('org/other', async () => events.push('other'));
  await other;
  assert.deepEqual(events, ['first-start', 'other']);
  releaseFirst();
  await Promise.all([first, second]);
  assert.deepEqual(events, ['first-start', 'other', 'first-end', 'second']);
});

test('tool localization variants each add exactly one isolated mechanism', () => {
  const root = path.resolve(__dirname, '..', '..');
  const current = fs.readFileSync(
    path.join(root, 'plugin/skills/thinking-scientific-method/SKILL.md'),
    'utf8',
  );
  const clue = fs.readFileSync(path.join(
    root,
    'evals/studies/scientific-method-vnext/variants/candidate-clue-first/CANDIDATE.md',
  ), 'utf8');
  const moduleRole = fs.readFileSync(path.join(
    root,
    'evals/studies/scientific-method-vnext/variants/candidate-module-role/CANDIDATE.md',
  ), 'utf8');
  const clueMechanism = ' Before proposing hypotheses, extract exact symbols, exception text, behavioral boundaries, lifecycle phases, and call-direction clues from the issue; spend the first observation on the rarest clue that can map directly to an owner.';
  const moduleMechanism = ' Before ranking hypotheses, map each plausible file to its runtime responsibility; favor the implementation owner whose module role owns the failed behavior over a facade, caller, wrapper, test, or compatibility layer unless direct evidence points elsewhere.';
  assert.equal(clue.replace(clueMechanism, ''), current);
  assert.equal(moduleRole.replace(moduleMechanism, ''), current);
  assert.equal(clue.includes(moduleMechanism), false);
  assert.equal(moduleRole.includes(clueMechanism), false);
});
