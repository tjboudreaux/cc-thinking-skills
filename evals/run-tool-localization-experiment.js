#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  analyzeToolStage,
  evaluateToolCandidateGate,
  runToolStage,
  selectPilotCandidate,
  stageArmIds,
  verifyPinnedFiles,
} = require('./lib/tool-localization-runner');
const { writeJsonAtomic } = require('./lib/io');
const { sha256 } = require('./lib/result');

const ROOT = path.resolve(__dirname, '..');
const STUDY_DIR = path.join(__dirname, 'studies/scientific-method-vnext');
const MANIFEST_FILE = path.join(STUDY_DIR, 'manifest-tool-v1.json');
const RESULTS_DIR = path.join(__dirname, 'results/local/scientific-method-tool-v1');
const CHECKOUT_DIR = path.join(__dirname, 'checkouts/tool-v1');
const CANDIDATE_ARMS = ['clue-first', 'module-role'];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readJsonl(file) {
  return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
}

function stageCaps(manifest, stage) {
  const caps = manifest && manifest.stage_caps && manifest.stage_caps[stage];
  if (!caps) throw new Error(`missing manifest caps for ${stage}`);
  return caps;
}

function loadArmDefinitions(armIds) {
  const files = {
    current: 'skills/thinking-scientific-method/SKILL.md',
    'clue-first': 'evals/studies/scientific-method-vnext/variants/candidate-clue-first/CANDIDATE.md',
    'module-role': 'evals/studies/scientific-method-vnext/variants/candidate-module-role/CANDIDATE.md',
  };
  return armIds.map((id) => ({
    id,
    skillContent: id === 'none' ? '' : fs.readFileSync(path.join(ROOT, files[id]), 'utf8'),
  }));
}

function calibrationDecision(envelope, analysis) {
  const rows = envelope.items.filter((row) => row.arm_id === 'none');
  const correct = rows.filter((row) => row.correct).length;
  const accuracy = rows.length ? correct / rows.length : null;
  const reasons = [];
  if (!envelope.health.decision_eligible) reasons.push('stage health is not decision eligible');
  if (accuracy == null || accuracy < 0.20 || accuracy > 0.85) {
    reasons.push('no-skill accuracy is outside the preregistered 20%-85% band');
  }
  return {
    stage: 'calibration',
    pass: reasons.length === 0,
    no_skill_accuracy: accuracy,
    analysis,
    reasons,
  };
}

function pilotDecision(envelope, analysis) {
  const gates = Object.fromEntries(
    CANDIDATE_ARMS.map((armId) => [
      armId,
      evaluateToolCandidateGate(analysis, armId, { stage: 'pilot' }),
    ]),
  );
  const selected = envelope.health.decision_eligible
    ? selectPilotCandidate(analysis, CANDIDATE_ARMS)
    : null;
  return {
    stage: 'pilot',
    pass: Boolean(selected),
    selected_candidate: selected,
    gates,
    reasons: selected
      ? []
      : ['no candidate passed every preregistered pilot gate'],
  };
}

function confirmatoryDecision(stage, envelope, analysis, selectedCandidate) {
  const gate = evaluateToolCandidateGate(analysis, selectedCandidate, {
    stage,
    minN: 100,
  });
  return {
    stage,
    pass: gate.pass,
    selected_candidate: selectedCandidate,
    gate,
    reasons: gate.reasons,
  };
}

function priorDecision(stage) {
  const file = path.join(RESULTS_DIR, stage, 'decision.json');
  if (!fs.existsSync(file)) throw new Error(`required prior decision missing: ${file}`);
  return readJson(file);
}

function selectedCandidateFor(stage) {
  if (stage === 'design' || stage === 'calibration' || stage === 'pilot') return null;
  const pilot = priorDecision('pilot');
  if (!pilot.pass || !pilot.selected_candidate) {
    throw new Error('pilot did not select an eligible candidate');
  }
  if (stage === 'replication') {
    const confirmation = priorDecision('confirmation');
    if (!confirmation.pass) throw new Error('confirmation did not pass');
  }
  return pilot.selected_candidate;
}

async function main() {
  const stage = process.argv[2];
  if (!['design', 'calibration', 'pilot', 'confirmation', 'replication'].includes(stage)) {
    throw new Error('usage: node evals/run-tool-localization-experiment.js <design|calibration|pilot|confirmation|replication>');
  }
  const manifestBytes = fs.readFileSync(MANIFEST_FILE);
  const manifest = JSON.parse(manifestBytes);
  verifyPinnedFiles(manifest, ROOT);
  const manifestHash = sha256(manifestBytes);
  const splitArtifact = readJson(path.join(ROOT, manifest.split_file));
  const dataset = readJsonl(path.join(ROOT, manifest.dataset_file));
  const byId = new Map(dataset.map((item) => [item.id, item]));
  const selectedCandidate = selectedCandidateFor(stage);
  const armIds = stage === 'design'
    ? stageArmIds('pilot')
    : stageArmIds(stage, selectedCandidate);
  if (stage === 'design') {
    console.log(JSON.stringify({
      study_id: manifest.study_id,
      manifest_hash: manifestHash,
      model: manifest.model,
      effort: manifest.effort,
      stages: splitArtifact.sizes,
      arm_ids: armIds,
      stage_caps: manifest.stage_caps,
    }, null, 2));
    return;
  }
  if (stage === 'pilot' && !priorDecision('calibration').pass) {
    throw new Error('calibration did not pass');
  }
  const ids = splitArtifact.splits[stage];
  if (!Array.isArray(ids)) throw new Error(`split missing for ${stage}`);
  const items = ids.map((id) => {
    const item = byId.get(id);
    if (!item) throw new Error(`split item missing from dataset: ${id}`);
    return item;
  });
  const caps = stageCaps(manifest, stage);
  const envelope = await runToolStage({
    studyId: manifest.study_id,
    manifestHash,
    stage,
    items,
    armDefinitions: loadArmDefinitions(armIds),
    model: manifest.model,
    effort: manifest.effort,
    outputDir: RESULTS_DIR,
    cacheRoot: CHECKOUT_DIR,
    maxObservations: manifest.max_observations,
    callCap: caps.calls,
    costCapUsd: caps.estimated_cost_usd,
    concurrency: manifest.repository_concurrency,
    timeoutMs: manifest.timeout_ms,
    onProgress: (progress) => {
      process.stderr.write(`${JSON.stringify(progress)}\n`);
    },
  });
  const candidateArms = armIds.filter((id) => CANDIDATE_ARMS.includes(id));
  const analysis = analyzeToolStage(envelope.items, candidateArms, envelope.health);
  const stageDir = path.join(RESULTS_DIR, stage);
  writeJsonAtomic(path.join(stageDir, 'analysis.json'), analysis);
  let decision;
  if (stage === 'calibration') decision = calibrationDecision(envelope, analysis);
  else if (stage === 'pilot') decision = pilotDecision(envelope, analysis);
  else decision = confirmatoryDecision(stage, envelope, analysis, selectedCandidate);
  writeJsonAtomic(path.join(stageDir, 'decision.json'), decision);
  console.log(JSON.stringify({
    stage,
    health: envelope.health,
    decision,
  }, null, 2));
  if (!envelope.health.decision_eligible) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error && error.stack || error);
  process.exitCode = 1;
});
