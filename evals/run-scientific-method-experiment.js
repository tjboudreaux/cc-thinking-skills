#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { executeDroid, usageSummary } = require('./lib/droid');
const { writeJsonAtomic, readJsonIfExists, mapPool } = require('./lib/io');
const { runObjectiveItems } = require('./lib/objective');
const { sha256 } = require('./lib/result');
const {
  eligibleLocalizationItems,
  freezeDisjointSplits,
  analyzeObjectiveEnvelope,
  evaluateCandidateGate,
} = require('./lib/scientific-method-experiment');
const {
  applyIttParseHealthPolicy,
  assertStudyRuntime,
  createCallBudget,
  extractFocusedSplits,
  ineligibleHealthReason,
  mergeObjectiveEnvelopes,
  resolveDatasetPath,
  resolveFocusedCandidate,
  resolveStudyVersion,
} = require('./lib/scientific-method-runner');

const REPO = path.join(__dirname, '..');
const STUDY_DIR = path.join(__dirname, 'studies', 'scientific-method-vnext');
const VARIANT_DIR = path.join(STUDY_DIR, 'variants');
const DATASET_PATH = resolveDatasetPath(
  process.env,
  path.join(__dirname, 'datasets', 'external', 'swebench-verified.jsonl'),
  REPO,
);
const RESULTS_DIR = process.env.SCI_RESULTS_DIR
  ? path.resolve(process.env.SCI_RESULTS_DIR)
  : path.join(__dirname, 'results', 'local', 'scientific-method-vnext');
const CURRENT_SKILL_PATH = path.join(
  REPO,
  'plugin',
  'skills',
  'thinking-scientific-method',
  'SKILL.md',
);
const SPLITS_PATH = process.env.SCI_SPLITS_PATH
  ? path.resolve(process.env.SCI_SPLITS_PATH)
  : path.join(STUDY_DIR, 'splits.json');
const MANIFEST_PATH = process.env.SCI_MANIFEST_PATH
  ? path.resolve(process.env.SCI_MANIFEST_PATH)
  : path.join(STUDY_DIR, 'manifest.json');
const PREREG_PATH = process.env.SCI_PREREG_PATH
  ? path.resolve(process.env.SCI_PREREG_PATH)
  : path.join(STUDY_DIR, 'prereg.md');
const MODEL = process.env.SOLVER_MODEL || 'claude-sonnet-4-6';
const EFFORT = process.env.SOLVER_EFFORT || 'high';
const STUDY_VERSION = resolveStudyVersion();
const FOCUSED_CANDIDATE = resolveFocusedCandidate();
const ALLOW_PARSE_FAILURES = process.env.SCI_ALLOW_PARSE_FAILURES === '1';
const ARM_ORDER_SEED = 'scientific-method-vnext-arm-order-v1';
const SPLIT_SEED = process.env.SCI_SPLIT_SEED || 'scientific-method-vnext-splits-v1';
const STAGES = {
  calibration: {
    maxCalls: Number(process.env.SCI_CALIBRATION_MAX_CALLS || 22),
    maxEstimatedCostUsd: 5,
  },
  pilot: {
    maxCalls: Number(process.env.SCI_PILOT_MAX_CALLS || 320),
    maxEstimatedCostUsd: 40,
  },
  confirmation: {
    maxCalls: Number(process.env.SCI_CONFIRMATION_MAX_CALLS || 400),
    maxEstimatedCostUsd: Number(process.env.SCI_CONFIRMATION_MAX_COST_USD || 60),
  },
  replication: {
    maxCalls: Number(process.env.SCI_REPLICATION_MAX_CALLS || 400),
    maxEstimatedCostUsd: 60,
  },
};

function usage(code = 0) {
  const message = `Usage:
  node evals/run-scientific-method-experiment.js prepare
  node evals/run-scientific-method-experiment.js calibration
  node evals/run-scientific-method-experiment.js pilot
  node evals/run-scientific-method-experiment.js confirmation
  node evals/run-scientific-method-experiment.js replication

Stages are cost-gated, checkpointed, and resumable. Results default to:
  evals/results/local/scientific-method-vnext
`;
  if (code) process.stderr.write(message);
  else process.stdout.write(message);
  process.exitCode = code;
}

function loadJsonl(file) {
  return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
}

function readRequiredJson(file) {
  const value = readJsonIfExists(file);
  if (!value) throw new Error(`required JSON missing or invalid: ${file}`);
  return value;
}

function listCandidatePaths() {
  if (!fs.existsSync(VARIANT_DIR)) return [];
  return fs.readdirSync(VARIANT_DIR)
    .filter((name) => /^candidate-\d+$/.test(name))
    .sort()
    .map((name) => ({
      id: name,
      file: path.join(VARIANT_DIR, name, 'SKILL.md'),
    }))
    .filter((entry) => fs.existsSync(entry.file));
}

function fileRecord(file) {
  const bytes = fs.readFileSync(file);
  return {
    path: path.relative(REPO, file),
    sha256: sha256(bytes),
    bytes: bytes.length,
  };
}

function prepare() {
  if (!fs.existsSync(DATASET_PATH)) {
    throw new Error(`dataset missing: ${DATASET_PATH}`);
  }
  if (!fs.existsSync(PREREG_PATH)) {
    throw new Error(`preregistration missing: ${PREREG_PATH}`);
  }
  const candidates = listCandidatePaths();
  if (candidates.length !== 6) {
    throw new Error(`expected six candidate variants, found ${candidates.length}`);
  }
  if (FOCUSED_CANDIDATE && !candidates.some((entry) => entry.id === FOCUSED_CANDIDATE)) {
    throw new Error(`focused candidate file missing: ${FOCUSED_CANDIDATE}`);
  }
  if (FOCUSED_CANDIDATE && !ALLOW_PARSE_FAILURES) {
    throw new Error('focused confirmation requires SCI_ALLOW_PARSE_FAILURES=1');
  }
  const rows = loadJsonl(DATASET_PATH);
  const eligible = eligibleLocalizationItems(rows);
  const source = fileRecord(DATASET_PATH);
  const byId = new Map(rows.map((item) => [String(item.id), item]));
  const excludedSplitPath = process.env.SCI_EXCLUDE_SPLITS_PATH
    ? path.resolve(process.env.SCI_EXCLUDE_SPLITS_PATH)
    : null;
  const excludedSplitStages = String(process.env.SCI_EXCLUDE_STAGES || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const excludedArtifact = excludedSplitPath ? readRequiredJson(excludedSplitPath) : {};
  const excludedSplits = excludedArtifact.splits || excludedArtifact;
  const excludeIds = (excludedSplitStages.length
    ? excludedSplitStages
    : Object.keys(excludedSplits))
    .flatMap((stage) => excludedSplits[stage] || [])
    .flatMap((entry) => Array.isArray(entry) ? entry : entry.ids || [])
    .map(String);
  let sizes;
  let splitArtifact;
  if (FOCUSED_CANDIDATE) {
    const inheritedPath = process.env.SCI_INHERIT_SPLITS_PATH
      ? path.resolve(process.env.SCI_INHERIT_SPLITS_PATH)
      : null;
    if (!inheritedPath) throw new Error('SCI_INHERIT_SPLITS_PATH is required for focused confirmation');
    const inheritedArtifact = readRequiredJson(inheritedPath);
    sizes = { confirmation: 100, replication: 100 };
    const focusedSplits = extractFocusedSplits(inheritedArtifact, sizes);
    splitArtifact = {
      schema_version: 1,
      seed: 'inherited-untouched-splits',
      source,
      raw_count: rows.length,
      eligible_count: eligible.length,
      eligibility_rule: 'swe-localize with gold files and no exact gold path or basename in prompt',
      inherited_from: fileRecord(inheritedPath),
      splits: focusedSplits,
    };
  } else {
    sizes = { calibration: 20, pilot: 40, confirmation: 100, replication: 100 };
    const splits = freezeDisjointSplits(rows, {
      seed: SPLIT_SEED,
      sizes,
      excludeIds,
    });
    splitArtifact = {
      schema_version: 1,
      seed: SPLIT_SEED,
      source,
      raw_count: rows.length,
      eligible_count: eligible.length,
      eligibility_rule: 'swe-localize with gold files and no exact gold path or basename in prompt',
      splits: Object.fromEntries(Object.entries(splits).map(([name, ids]) => [name, {
        count: ids.length,
        ids,
        prompt_sha256: sha256(ids.map((id) => sha256(byId.get(id).prompt))),
        ids_sha256: sha256(ids),
      }])),
    };
  }
  writeJsonAtomic(SPLITS_PATH, splitArtifact);

  const calibrationAnalysisPath = process.env.SCI_CALIBRATION_ANALYSIS_PATH
    ? path.resolve(process.env.SCI_CALIBRATION_ANALYSIS_PATH)
    : null;
  if (FOCUSED_CANDIDATE && !calibrationAnalysisPath) {
    throw new Error('SCI_CALIBRATION_ANALYSIS_PATH is required for focused confirmation');
  }
  if (calibrationAnalysisPath) {
    const calibration = readRequiredJson(calibrationAnalysisPath);
    if (!calibration.calibration_in_band || !calibration.health?.decision_eligible) {
      throw new Error('inherited calibration is not decision-eligible and in-band');
    }
  }
  const manifestCandidates = FOCUSED_CANDIDATE
    ? candidates.filter((entry) => entry.id === FOCUSED_CANDIDATE)
    : candidates;
  const manifest = {
    schema_version: 1,
    study_id: 'scientific-method-vnext',
    study_version: STUDY_VERSION,
    created_at: new Date().toISOString(),
    preregistration: fileRecord(PREREG_PATH),
    dataset: source,
    current_lean: fileRecord(CURRENT_SKILL_PATH),
    variants: manifestCandidates.map((entry) => ({ id: entry.id, ...fileRecord(entry.file) })),
    focused_candidate: FOCUSED_CANDIDATE,
    solver: { model: MODEL, effort: EFFORT },
    retry_policy: {
      max_attempts: Number(process.env.DROID_ATTEMPTS || 1),
      parse_failures_retried: false,
    },
    health_policy: {
      parse_failures_are_itt_incorrect: ALLOW_PARSE_FAILURES,
      non_parse_failures_are_ineligible: true,
    },
    calibration_evidence: calibrationAnalysisPath ? fileRecord(calibrationAnalysisPath) : null,
    arm_order_seed: ARM_ORDER_SEED,
    split_seed: SPLIT_SEED,
    excluded_splits: excludedSplitPath
      ? {
        path: path.relative(REPO, excludedSplitPath),
        sha256: sha256(fs.readFileSync(excludedSplitPath)),
        stages: excludedSplitStages.length ? excludedSplitStages : Object.keys(excludedSplits),
        item_count: new Set(excludeIds).size,
      }
      : null,
    stages: STAGES,
    split_artifact: fileRecord(SPLITS_PATH),
  };
  writeJsonAtomic(MANIFEST_PATH, manifest);
  process.stdout.write(`${JSON.stringify({
    prepared: true,
    raw_items: rows.length,
    eligible_items: eligible.length,
    split_sizes: sizes,
    manifest: path.relative(REPO, MANIFEST_PATH),
  }, null, 2)}\n`);
}

function stageItems(stage) {
  const rows = loadJsonl(DATASET_PATH);
  const byId = new Map(rows.map((item) => [String(item.id), item]));
  const splits = readRequiredJson(SPLITS_PATH);
  const split = splits.splits && splits.splits[stage];
  if (!split) throw new Error(`frozen split missing for stage ${stage}`);
  return split.ids.map((id) => {
    const item = byId.get(String(id));
    if (!item) throw new Error(`frozen item missing from dataset: ${id}`);
    return item;
  });
}

function skillArm(id, file) {
  const skillContent = fs.readFileSync(file, 'utf8');
  return {
    id,
    condition: 'skill',
    skillName: 'thinking-scientific-method',
    skillContent,
    skill_sha256: sha256(skillContent),
  };
}

function selectedCandidateIds(stage) {
  if (stage === 'confirmation' && FOCUSED_CANDIDATE) {
    return [FOCUSED_CANDIDATE];
  }
  if (stage === 'confirmation') {
    const selected = readRequiredJson(path.join(RESULTS_DIR, 'pilot', 'selected.json'));
    return selected.selected || [];
  }
  if (stage === 'replication') {
    const selected = readRequiredJson(path.join(RESULTS_DIR, 'confirmation', 'selected.json'));
    return selected.selected || [];
  }
  return listCandidatePaths().map((entry) => entry.id);
}

function stageArms(stage) {
  if (stage === 'calibration') return [{ id: 'none', condition: 'none' }];
  const byId = new Map(listCandidatePaths().map((entry) => [entry.id, entry.file]));
  const selected = selectedCandidateIds(stage);
  const arms = [
    { id: 'none', condition: 'none' },
    skillArm('lean', CURRENT_SKILL_PATH),
  ];
  for (const id of selected) {
    const file = byId.get(id);
    if (!file) throw new Error(`selected candidate file missing: ${id}`);
    arms.push(skillArm(id, file));
  }
  return arms;
}

function stageLimits(stage, plannedCalls) {
  const defaults = STAGES[stage];
  const maxCalls = Number(process.env.SCI_MAX_CALLS || defaults.maxCalls);
  const maxEstimatedCostUsd = Number(
    process.env.SCI_MAX_COST_USD || defaults.maxEstimatedCostUsd,
  );
  if (plannedCalls > maxCalls) {
    throw new Error(`planned calls ${plannedCalls} exceed stage cap ${maxCalls}`);
  }
  return { maxCalls, maxEstimatedCostUsd };
}

function readCheckpointUsage(checkpointDir) {
  if (!fs.existsSync(checkpointDir)) return { calls: 0, estimated_cost_usd: 0 };
  let calls = 0;
  let estimatedCostUsd = 0;
  for (const name of fs.readdirSync(checkpointDir).filter((entry) => entry.endsWith('.json'))) {
    const checkpoint = readJsonIfExists(path.join(checkpointDir, name));
    if (!checkpoint) continue;
    calls += Number(checkpoint.usage && checkpoint.usage.calls || 0);
    estimatedCostUsd += Number(checkpoint.usage && checkpoint.usage.estimated_cost_usd || 0);
  }
  return { calls, estimated_cost_usd: estimatedCostUsd };
}

function checkpointSolve(stage, budget) {
  const stageDir = path.join(RESULTS_DIR, stage);
  const checkpointDir = path.join(stageDir, 'checkpoints');
  const rawDir = path.join(stageDir, 'raw');
  fs.mkdirSync(checkpointDir, { recursive: true });
  fs.mkdirSync(rawDir, { recursive: true });

  return async ({ prompt, observationCheckpointKey }) => {
    const checkpointFile = path.join(checkpointDir, `${observationCheckpointKey}.json`);
    const existing = readJsonIfExists(checkpointFile);
    if (existing) {
      const text = existing.archive_path && fs.existsSync(existing.archive_path)
        ? fs.readFileSync(existing.archive_path, 'utf8')
        : '';
      return { ...existing.result, text, archive_uri: existing.archive_uri };
    }

    const maxAttempts = Number(process.env.DROID_ATTEMPTS || 1);
    budget.reserve(maxAttempts);
    const result = await executeDroid({
      model: MODEL,
      effort: EFFORT,
      prompt,
      timeoutMs: Number(process.env.DROID_TIMEOUT_MS || 180000),
      attempts: maxAttempts,
    });
    const normalized = usageSummary(result.usage, MODEL);
    const rowUsage = {
      ...normalized,
      calls: result.attempts,
      latency_ms: result.durationMs || 0,
      estimated_cost_usd: normalized.est_cost_usd,
    };
    budget.record(rowUsage, maxAttempts);

    const rawFile = path.join(rawDir, `${observationCheckpointKey}.txt`);
    if (result.text != null) fs.writeFileSync(rawFile, String(result.text), { mode: 0o600 });
    const archiveUri = result.text != null ? pathToFileURL(rawFile).href : null;
    const resultRecord = {
      ok: result.ok,
      attempts: result.attempts,
      durationMs: result.durationMs,
      usage: rowUsage,
      failure: result.failure && typeof result.failure.toJSON === 'function'
        ? result.failure.toJSON()
        : result.failure,
      cost_model_version: result.cost_model_version,
    };
    writeJsonAtomic(checkpointFile, {
      observation_checkpoint_key: observationCheckpointKey,
      archive_path: result.text != null ? rawFile : null,
      archive_uri: archiveUri,
      response_sha256: result.text != null ? sha256(String(result.text)) : null,
      result: resultRecord,
      usage: rowUsage,
    });
    return { ...resultRecord, text: result.text, archive_uri: archiveUri };
  };
}

function requirePreviousGate(stage) {
  if (stage === 'confirmation' && FOCUSED_CANDIDATE) {
    const manifest = readRequiredJson(MANIFEST_PATH);
    if (!manifest.calibration_evidence) {
      throw new Error('focused confirmation calibration evidence is missing');
    }
    return;
  }
  if (stage === 'pilot') {
    const analysis = readRequiredJson(path.join(RESULTS_DIR, 'calibration', 'analysis.json'));
    if (!analysis.calibration_in_band) {
      throw new Error('calibration baseline is outside the preregistered 40-70% band');
    }
  }
  if (stage === 'confirmation' || stage === 'replication') {
    const previous = stage === 'confirmation' ? 'pilot' : 'confirmation';
    const selected = readRequiredJson(path.join(RESULTS_DIR, previous, 'selected.json'));
    if (!Array.isArray(selected.selected) || selected.selected.length === 0) {
      throw new Error(`no candidates advanced from ${previous}`);
    }
  }
}

function selectAdvancingCandidates(stage, analysis) {
  const candidateIds = Object.keys(analysis.candidates || {});
  const gates = Object.fromEntries(candidateIds.map((id) => [
    id,
    evaluateCandidateGate(analysis, id, { stage }),
  ]));
  const ranked = candidateIds
    .filter((id) => gates[id].pass)
    .sort((left, right) => {
      const delta = analysis.candidates[right].vs_none.delta_pp
        - analysis.candidates[left].vs_none.delta_pp;
      if (delta) return delta;
      return gates[left].token_ratio_vs_lean - gates[right].token_ratio_vs_lean;
    });
  const limit = stage === 'pilot' ? 2 : ranked.length;
  return { selected: ranked.slice(0, limit), gates };
}

function analyzeStage(stage, envelope) {
  if (stage === 'calibration') {
    const none = envelope.statistics.per_arm.none;
    return {
      stage,
      health: envelope.health,
      baseline_accuracy: none.accuracy,
      baseline_n: none.attempted,
      calibration_in_band: none.accuracy >= 0.4 && none.accuracy <= 0.7,
      usage: envelope.usage,
    };
  }
  const candidateArms = envelope.arms
    .map((arm) => arm.id)
    .filter((id) => id.startsWith('candidate-'));
  return {
    stage,
    ...analyzeObjectiveEnvelope(envelope, {
      controlArm: 'none',
      leanArm: 'lean',
      candidateArms,
    }),
  };
}

async function runStage(stage) {
  if (!STAGES[stage]) throw new Error(`unknown stage: ${stage}`);
  const manifest = readRequiredJson(MANIFEST_PATH);
  assertStudyRuntime(manifest, {
    studyVersion: STUDY_VERSION,
    focusedCandidate: FOCUSED_CANDIDATE,
    allowParseFailures: ALLOW_PARSE_FAILURES,
  });
  requirePreviousGate(stage);
  const items = stageItems(stage);
  const arms = stageArms(stage);
  if (FOCUSED_CANDIDATE) {
    assertStudyRuntime(manifest, {
      studyVersion: STUDY_VERSION,
      focusedCandidate: FOCUSED_CANDIDATE,
      allowParseFailures: ALLOW_PARSE_FAILURES,
      leanSha256: arms.find((arm) => arm.id === 'lean')?.skill_sha256,
      candidateSha256: arms.find((arm) => arm.id === FOCUSED_CANDIDATE)?.skill_sha256,
    });
  }
  const plannedCalls = items.length * arms.length;
  const limits = stageLimits(stage, plannedCalls);
  const stageDir = path.join(RESULTS_DIR, stage);
  const checkpointDir = path.join(stageDir, 'checkpoints');
  const prior = readCheckpointUsage(checkpointDir);
  const budget = createCallBudget({
    ...limits,
    initialCalls: prior.calls,
    initialEstimatedCostUsd: prior.estimated_cost_usd,
  });
  const solve = checkpointSolve(stage, budget);
  const concurrency = Math.max(1, Number(process.env.SCI_CONC || 4));
  let completedItems = 0;
  let stopReason = null;
  const partials = await mapPool(items, concurrency, async (item) => {
    if (stopReason) throw new Error(stopReason);
    const itemFile = path.join(stageDir, 'items', `${sha256(item.id)}.json`);
    const existing = readJsonIfExists(itemFile);
    if (existing) {
      completedItems += 1;
      return ALLOW_PARSE_FAILURES ? applyIttParseHealthPolicy(existing) : existing;
    }
    let envelope = await runObjectiveItems({
      studyId: `scientific-method-vnext-${stage}`,
      studyVersion: manifest.study_version,
      preregistrationSha256: manifest.preregistration.sha256,
      dataset: {
        source: manifest.dataset.path,
        version: manifest.study_version,
        split: stage,
        sha256: manifest.dataset.sha256,
      },
      arms,
      solver: { model: MODEL, effort: EFFORT },
      scorer: 'file_localization',
      scorerOptions: {},
      armOrderSeed: ARM_ORDER_SEED,
      items: [item],
      trials: 1,
      solve,
    });
    if (ALLOW_PARSE_FAILURES) envelope = applyIttParseHealthPolicy(envelope);
    writeJsonAtomic(itemFile, envelope);
    completedItems += 1;
    const itemStopReason = ineligibleHealthReason(stage, envelope);
    if (itemStopReason) {
      stopReason = itemStopReason;
      throw new Error(itemStopReason);
    }
    process.stderr.write(
      `${stage}: ${completedItems}/${items.length} items, ${JSON.stringify(budget.snapshot())}\n`,
    );
    return envelope;
  });
  const poolFailure = partials.find((part) => part && part.__error);
  if (poolFailure) throw new Error(`stage worker failed: ${poolFailure.__error}`);

  let envelope = mergeObjectiveEnvelopes(partials);
  if (ALLOW_PARSE_FAILURES) envelope = applyIttParseHealthPolicy(envelope);
  const analysis = analyzeStage(stage, envelope);
  writeJsonAtomic(path.join(stageDir, 'envelope.json'), envelope);
  writeJsonAtomic(path.join(stageDir, 'analysis.json'), analysis);
  if (stage !== 'calibration') {
    writeJsonAtomic(
      path.join(stageDir, 'selected.json'),
      selectAdvancingCandidates(stage, analysis),
    );
  }
  process.stdout.write(`${JSON.stringify({
    stage,
    results_dir: stageDir,
    health: envelope.health,
    usage: envelope.usage,
    analysis,
  }, null, 2)}\n`);
}

async function main() {
  const command = process.argv[2];
  if (!command || command === '--help' || command === '-h') {
    usage(command ? 0 : 1);
    return;
  }
  if (command === 'prepare') {
    prepare();
    return;
  }
  await runStage(command);
}

main().catch((error) => {
  process.stderr.write(`${error && error.stack ? error.stack : error}\n`);
  process.exitCode = 1;
});
