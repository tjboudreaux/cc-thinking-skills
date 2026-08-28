'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const {
  loadRegistry,
  validateRegistry,
  loadAndValidateRegistry,
  getSkillBudget,
  getDeclaredStudyBundle,
} = require('../lib/registry');
const {
  listDeclaredBundles,
  evaluateConfirmationEligibility,
  readDeclaredBundle,
  verifyArchiveObject,
  healthComplete,
  powerConfigPresent,
} = require('../lib/evidence');
const {
  classifyArtifact,
  generateClaimLedger,
  evaluateStudyClaim,
} = require('../lib/claims');

test('registry loads 28 active skills with 11 deleted provenance rows', () => {
  const { registry, validation } = loadAndValidateRegistry();
  assert.equal(validation.ok, true, validation.errors.join('; '));
  assert.equal(Object.keys(registry.skills).length, 28);
  assert.equal(Object.keys(registry.deleted_skills).length, 11);
  assert.equal(
    new Set([...Object.keys(registry.skills), ...Object.keys(registry.deleted_skills)]).size,
    39
  );
  assert.equal(registry.catalog.expected_count, 28);
  assert.equal(registry.catalog.baseline_count, 39);
  assert.equal(registry.catalog.survivors.length, 28);
  assert.equal(registry.catalog.deletions.length, 11);
  assert.equal(registry.gates.utility_margin_pp, 5);
  assert.equal(registry.gates.noninferiority_margin_pp, 3);
  assert.equal(registry.gates.harm_margin_pp, 2);
  assert.equal(registry.gates.efficacy_hypotheses, 84);
  assert.equal(registry.judge_panel.models.length, 3);
  assert.ok(registry.judge_panel.max_votes_per_item >= registry.judge_panel.min_valid_votes_to_decide);
  assert.ok(registry.arms.all.includes('none'));
  assert.ok(registry.arms.all.includes('lean'));
  assert.ok(registry.arms.all.includes('workflow'));
  assert.equal(getSkillBudget(registry, 'systems'), 950);
  assert.equal(getSkillBudget(registry, 'scientific-method'), 900);
  assert.equal(registry.deleted_skills['dual-process'].disposition.cutover, 'delete');
  assert.equal(registry.skills.systems.disposition.cutover, 'survive');
  assert.equal(registry.skills['dual-process'], undefined);
});

test('judge panel calibration is blocked_missing_human_labels and manual-only', () => {
  const { registry, validation } = loadAndValidateRegistry();
  assert.equal(validation.ok, true, validation.errors.join('; '));
  assert.equal(registry.judge_panel.calibration_status, 'blocked_missing_human_labels');
  assert.equal(registry.judge_panel.decision_eligible, false);
  assert.equal(registry.judge_panel.judged_studies_policy_while_blocked, 'manual_only');
  assert.equal(registry.judge_panel.human_labeled_pairs.count, 0);
  const contract = registry.study_contracts.judge_panel_calibration;
  assert.ok(contract);
  assert.equal(contract.status, 'blocked_missing_human_labels');
  assert.equal(contract.decision_eligible, false);
  assert.equal(contract.rule.judged_studies_while_blocked, 'manual_only');
  const bundle = getDeclaredStudyBundle(registry, 'judge-panel-calibration');
  assert.ok(bundle);
  assert.equal(bundle.decision_eligible, false);
  assert.equal(bundle.judged_studies_policy, 'manual_only');
  assert.equal(bundle.declared_inline, true);
});

test('judged bundle cannot confirm while panel calibration is blocked', () => {
  const { registry } = loadRegistry();
  // Inject a temporary judged declaration with path for evaluation shape only
  const judgedId = 'fixture-judged-blocked';
  registry.declared_study_bundles = [
    ...(registry.declared_study_bundles || []),
    {
      study_id: judgedId,
      path: 'evals/studies/legacy-july-wf-confirm-behavioral',
      kind: 'judged',
      requires_judges: true,
      confirmatory_eligible_by_default: true,
    },
  ];
  const evaluation = evaluateConfirmationEligibility({
    studyId: judgedId,
    registry,
  });
  assert.equal(evaluation.confirmatory, false);
  assert.ok(evaluation.blockers.some(b => /judge panel calibration blocked|manual_only/.test(b)));
});

test('registry validator errors on wrong gates and missing family_counts', () => {
  const { registry } = loadRegistry();
  const badGates = JSON.parse(JSON.stringify(registry));
  badGates.gates.utility_margin_pp = 4;
  const g = validateRegistry(badGates);
  assert.equal(g.ok, false);
  assert.ok(g.errors.some(e => /utility_margin_pp/.test(e)));

  const badFamily = JSON.parse(JSON.stringify(registry));
  delete badFamily.family_counts;
  const f = validateRegistry(badFamily);
  assert.equal(f.ok, false);
  assert.ok(f.errors.some(e => /family_counts/.test(e)));
});

test('deleted_skills provenance fields are required and mutation-protected', () => {
  const { registry, validation } = loadAndValidateRegistry();
  assert.equal(validation.ok, true, validation.errors.join('; '));
  assert.equal(Object.keys(registry.deleted_skills).length, 11);

  for (const [id, row] of Object.entries(registry.deleted_skills)) {
    assert.ok(typeof row.contract_path === 'string' && row.contract_path.length > 0, id);
    assert.ok(Array.isArray(row.study_ids), id);
    assert.ok(Array.isArray(row.disposition.absorb_into), id);
    assert.ok(typeof row.disposition.mechanism === 'string' && row.disposition.mechanism.length > 0, id);
  }

  const base = JSON.parse(JSON.stringify(registry));
  const sampleId = 'dual-process';
  assert.ok(base.deleted_skills[sampleId]);

  const dropContract = JSON.parse(JSON.stringify(base));
  delete dropContract.deleted_skills[sampleId].contract_path;
  const c = validateRegistry(dropContract);
  assert.equal(c.ok, false);
  assert.ok(c.errors.some(e => /deleted_skill dual-process missing contract_path/.test(e)));

  const dropStudyIds = JSON.parse(JSON.stringify(base));
  delete dropStudyIds.deleted_skills[sampleId].study_ids;
  const s = validateRegistry(dropStudyIds);
  assert.equal(s.ok, false);
  assert.ok(s.errors.some(e => /deleted_skill dual-process study_ids must be an array/.test(e)));

  const dropAbsorb = JSON.parse(JSON.stringify(base));
  delete dropAbsorb.deleted_skills[sampleId].disposition.absorb_into;
  const a = validateRegistry(dropAbsorb);
  assert.equal(a.ok, false);
  assert.ok(a.errors.some(e => /deleted_skill dual-process absorb_into must be an array/.test(e)));

  const dropMechanism = JSON.parse(JSON.stringify(base));
  delete dropMechanism.deleted_skills[sampleId].disposition.mechanism;
  const m = validateRegistry(dropMechanism);
  assert.equal(m.ok, false);
  assert.ok(m.errors.some(e => /deleted_skill dual-process missing disposition\.mechanism/.test(e)));

  // Empty arrays remain valid provenance (dual-process has no absorb targets; most study_ids are []).
  const emptyArrays = JSON.parse(JSON.stringify(base));
  emptyArrays.deleted_skills[sampleId].study_ids = [];
  emptyArrays.deleted_skills[sampleId].disposition.absorb_into = [];
  const okEmpty = validateRegistry(emptyArrays);
  assert.equal(okEmpty.ok, true, okEmpty.errors.join('; '));
});

test('every absorbed mechanism has a symmetric mutation-protected destination', () => {
  const { registry, validation } = loadAndValidateRegistry();
  assert.equal(validation.ok, true, validation.errors.join('; '));
  const edges = [];
  for (const [deletedId, deleted] of Object.entries(registry.deleted_skills)) {
    for (const targetId of deleted.disposition.absorb_into) {
      edges.push(`${deletedId}->${targetId}`);
      const destination = registry.skills[targetId].disposition;
      assert.ok(destination.absorbs.includes(deletedId), `${deletedId}->${targetId}`);
      assert.deepEqual(
        destination.absorbed_mechanisms.filter(entry => entry.id === deletedId),
        [{ id: deletedId, mechanism: deleted.disposition.mechanism }],
        `${deletedId}->${targetId}`
      );
    }
  }
  assert.equal(edges.length, 12);

  const missingSource = JSON.parse(JSON.stringify(registry));
  missingSource.skills.systems.disposition.absorbs =
    missingSource.skills.systems.disposition.absorbs.filter(id => id !== 'feedback-loops');
  const missingValidation = validateRegistry(missingSource);
  assert.equal(missingValidation.ok, false);
  assert.ok(missingValidation.errors.some(error => /systems missing absorbed source feedback-loops/.test(error)));

  const wrongMechanism = JSON.parse(JSON.stringify(registry));
  wrongMechanism.skills.probabilistic.disposition.absorbed_mechanisms
    .find(entry => entry.id === 'bayesian').mechanism = 'generic updating';
  const mechanismValidation = validateRegistry(wrongMechanism);
  assert.equal(mechanismValidation.ok, false);
  assert.ok(mechanismValidation.errors.some(error => /probabilistic absorbed mechanism mismatch for bayesian/.test(error)));
});

test('absorbed mechanisms remain executable in destination skill contracts', () => {
  const contracts = [
    ['systems', [/reinforcing/i, /balancing/i, /delay/i, /recurring structure/i, /leverage/i, /side effects/i]],
    ['probabilistic', [/Prior odds/i, /Likelihood ratio/i, /Posterior odds/i, /Fermi-bound/i, /order-of-magnitude/i, /strongest evidence-based case/i]],
    ['steel-manning', [/strongest faithful case/i, /base rates or concrete alternatives/i, /overturn conditions/i]],
    ['pre-mortem', [/Failure-first reverse analysis/i, /necessary\/enabling conditions/i, /invert\W+each condition/i]],
    ['model-router', [/problem fit ≥4/i, /weighted total ≥3\.5/i, /return \*\*NONE\*\*/i]],
    ['scientific-method', [/fewest independent unsupported assumptions/i, /Parsimony ranks survivors after fit/i]],
    ['reversibility', [/Asymmetric downside \/ recovery/i, /Not acting/i, /permanently closes/i]],
    ['opportunity-cost', [/Future tradeoff \/ permanent forgone options/i, /permanent losses/i, /recoverable/i]],
  ];
  for (const [skillId, assertions] of contracts) {
    const content = fs.readFileSync(
      path.join(__dirname, '..', '..', 'plugin', 'skills', `thinking-${skillId}`, 'SKILL.md'),
      'utf8'
    );
    for (const assertion of assertions) {
      assert.match(content, assertion, `${skillId}: ${assertion}`);
      const flags = assertion.flags.includes('i') ? 'gi' : 'g';
      const mutated = content.replace(new RegExp(assertion.source, flags), '');
      assert.doesNotMatch(mutated, assertion, `${skillId} mutation survived: ${assertion}`);
    }
  }
});

test('consumed migration coverage cannot count as fresh confirmatory data', () => {
  const { registry, validation } = loadAndValidateRegistry();
  assert.equal(validation.ok, true, validation.errors.join('; '));
  const migration = registry.skills['pre-mortem'].data.migration_coverage;
  assert.equal(migration.status, 'consumed_provisional');
  assert.equal(migration.freshness_eligible, false);
  assert.equal(migration.excluded_from_confirmatory_counts, true);
  assert.ok(migration.sources.length > 0);

  const falselyFresh = JSON.parse(JSON.stringify(registry));
  falselyFresh.skills['pre-mortem'].data.migration_coverage.freshness_eligible = true;
  const freshValidation = validateRegistry(falselyFresh);
  assert.equal(freshValidation.ok, false);
  assert.ok(freshValidation.errors.some(error => /freshness_eligible=false/.test(error)));

  const doubleCounted = JSON.parse(JSON.stringify(registry));
  const consumed = doubleCounted.skills['pre-mortem'].data.migration_coverage.sources[0];
  doubleCounted.skills['pre-mortem'].data.sources.push({
    path: consumed.path,
    sha256: consumed.sha256,
  });
  const countValidation = validateRegistry(doubleCounted);
  assert.equal(countValidation.ok, false);
  assert.ok(countValidation.errors.some(error => /cannot be a confirmatory data source/.test(error)));
});

test('verifyExactHashes fails closed without path/payload verification targets', () => {
  const { verifyExactHashes } = require('../lib/evidence');
  const presenceOnly = verifyExactHashes({
    preregistration: { sha256: 'a'.repeat(64) },
    dataset: { sha256: 'b'.repeat(64) },
    solver: { model: 'claude-sonnet-4-6' },
    arms: [{ id: 'lean', prompt_sha256: 'c'.repeat(64), skill_sha256: 'd'.repeat(64) }],
    judges: ['gpt-5.5-pro'],
  }, null);
  assert.equal(presenceOnly.ok, false);
  assert.ok(presenceOnly.reasons.some(r => /prompt_sha256 not byte-verifiable|solver config/.test(r)));
  assert.ok(presenceOnly.reasons.some(r => /judge/.test(r)));
});

test('verifyExactHashes requires prereg verification target not mere presence', () => {
  const { verifyExactHashes } = require('../lib/evidence');
  const presenceOnly = verifyExactHashes({
    preregistration_sha256: 'a'.repeat(64),
    dataset: { path: 'evals/datasets/authored/challenging-cynefin.jsonl', sha256: 'b'.repeat(64) },
    solver: { model: 'm', config: { x: 1 }, config_sha256: require('../lib/result').sha256({ x: 1 }) },
    arms: [{
      id: 'none',
      prompt_sha256: require('../lib/result').sha256('p'),
      prompt: 'p',
      skill_sha256: null,
    }],
    judges: [{ model: 'j', config: { j: 1 }, config_sha256: require('../lib/result').sha256({ j: 1 }) }],
  }, null);
  assert.equal(presenceOnly.ok, false);
  assert.ok(presenceOnly.reasons.some(r => /preregistration_sha256 not verifiable|prereg/.test(r)));

  const withCurrent = verifyExactHashes({
    preregistration_sha256: 'a'.repeat(64),
    dataset: { path: 'evals/datasets/authored/challenging-cynefin.jsonl', sha256: require('../lib/evidence').fileSha256(require('path').join(__dirname, '..', 'datasets', 'authored', 'challenging-cynefin.jsonl')) },
    solver: { model: 'm', config: { x: 1 }, config_sha256: require('../lib/result').sha256({ x: 1 }) },
    arms: [{
      id: 'none',
      prompt_sha256: require('../lib/result').sha256('p'),
      prompt: 'p',
      skill_sha256: null,
    }],
    judges: [{ model: 'j', config: { j: 1 }, config_sha256: require('../lib/result').sha256({ j: 1 }) }],
  }, null, { currentPreregSha256: 'a'.repeat(64) });
  // may still fail on other fields; prereg itself should not be the missing-target reason
  assert.ok(!withCurrent.reasons.some(r => /not verifiable \(need currentPreregSha256/.test(r)));
});

test('registry validator rejects judge panel that cannot meet min votes', () => {
  const { registry } = loadRegistry();
  const bad = JSON.parse(JSON.stringify(registry));
  bad.judge_panel.votes_per_item = 1;
  bad.judge_panel.min_valid_votes_to_decide = 2;
  bad.judge_panel.max_votes_per_item = 1;
  const result = validateRegistry(bad);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => /max_votes_per_item|votes_per_item/.test(e)));
});

test('registry makes unknown and inadequate data explicit', () => {
  const { registry, validation } = loadAndValidateRegistry();
  assert.equal(validation.ok, true, validation.errors.join('; '));
  assert.ok(Array.isArray(registry.data_adequacy.unknown_skill_ids));
  assert.ok(Array.isArray(registry.data_adequacy.inadequate_skill_ids));
  assert.ok(registry.data_adequacy.unknown_skill_ids.length > 0);
  for (const id of registry.data_adequacy.unknown_skill_ids) {
    assert.equal(registry.skills[id].data.status, 'unknown');
    assert.ok(registry.skills[id].data.gaps.length > 0);
    assert.equal(registry.deleted_skills[id], undefined);
  }
  for (const id of registry.data_adequacy.inadequate_skill_ids) {
    assert.equal(registry.skills[id].data.status, 'inadequate');
    assert.ok(registry.skills[id].data.gaps.length > 0);
    assert.equal(registry.deleted_skills[id], undefined);
  }
  const prov = registry.data_adequacy.deleted_skills_provenance;
  assert.ok(prov);
  for (const id of prov.unknown_skill_ids || []) {
    assert.equal(registry.deleted_skills[id].data.status, 'unknown');
    assert.ok(registry.deleted_skills[id].data.gaps.length > 0);
  }
  for (const id of prov.adequate_skill_ids || []) {
    assert.equal(registry.deleted_skills[id].data.status, 'adequate');
  }
});

test('healthComplete requires parsed and equal denominators', () => {
  assert.equal(healthComplete({
    attempted: 2, completed: 2, scored: 2, failures: 0, decision_eligible: true,
  }).ok, false);
  assert.ok(healthComplete({
    attempted: 2, completed: 2, scored: 2, failures: 0, decision_eligible: true,
  }).reasons.some(r => /parsed/.test(r)));

  assert.equal(healthComplete({
    attempted: 2, completed: 2, parsed: 1, scored: 1, failures: 0, decision_eligible: true,
  }).ok, false);

  assert.equal(healthComplete({
    attempted: 2, completed: 2, parsed: 2, scored: 2, failures: 0, decision_eligible: true,
  }).ok, true);
});

test('undeclared study bundles cannot be read for confirmation', () => {
  const evaluation = evaluateConfirmationEligibility({ studyId: 'not-a-real-study' });
  assert.equal(evaluation.confirmatory, false);
  assert.equal(evaluation.status, 'undeclared_bundle');
  assert.throws(() => readDeclaredBundle('not-a-real-study'), /undeclared/);
});

test('legacy july bundle is declared but not confirmatory without gates', () => {
  const { registry } = loadRegistry();
  assert.ok(getDeclaredStudyBundle(registry, 'legacy-july-sci-method-larger-n'));
  const evaluation = evaluateStudyClaim('legacy-july-sci-method-larger-n', registry);
  assert.equal(evaluation.confirmatory, false);
  assert.ok(evaluation.blockers.length > 0);
  // provisional evidence and missing archive should surface
  assert.ok(evaluation.blockers.some(b => /archive|replication|power|split|evidence_validity|prereg|health/i.test(b)));
});

test('confirmation requires archive readback and matching sha', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'evidence-archive-'));
  const payload = Buffer.from('raw-response-bytes');
  const file = path.join(tmp, 'raw.bin');
  fs.writeFileSync(file, payload);
  const digest = crypto.createHash('sha256').update(payload).digest('hex');

  const ok = verifyArchiveObject({ uri: file, sha256: digest });
  assert.equal(ok.ok, true);

  const bad = verifyArchiveObject({ uri: file, sha256: '0'.repeat(64) });
  assert.equal(bad.ok, false);
  assert.ok(bad.reasons.some(r => /mismatch/.test(r)));

  const absent = verifyArchiveObject({ status: 'absent', uri: null });
  assert.equal(absent.ok, false);
});

test('powerConfigPresent rejects legacy powered-only flags', () => {
  const gates = { power_target: 0.9 };
  assert.equal(powerConfigPresent({ power: { powered: true, power_target: 0.95 } }, gates).ok, false);
  assert.equal(powerConfigPresent({
    power: {
      power_target: 0.95,
      multiplicity_adjusted: true,
      disposition_rule: 'AUTO-RETAIN LEAN',
      decision_eligible: true,
    },
  }, gates).ok, true);
});

test('classifyArtifact never marks legacy scan as confirmatory', () => {
  const artifact = {
    claim_status: 'confirmed',
    mode: 'objective',
    run_health: { decision_eligible: true, failure_rate: 0, solver_failures: 0 },
  };
  const c = classifyArtifact(artifact);
  assert.equal(c.eligible, true);
  assert.equal(c.confirmatory_eligible, false);
});

test('generateClaimLedger includes declared bundle evaluations', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'claims-ledger-'));
  const ledger = generateClaimLedger(tmp, path.join(__dirname, '..', 'preregistrations', 'workflow-vs-skill-proof.md'));
  assert.ok(Array.isArray(ledger.declared_bundle_evaluations));
  assert.ok(ledger.declared_bundle_evaluations.length >= 1);
  assert.ok(ledger.claims.some(c => c.source === 'declared_bundle'));
  assert.ok(ledger.claims.every(c => c.source !== 'declared_bundle' || c.confirmatory_eligible === false || c.confirmatory_eligible === true));
  // no declared july bundle should currently be confirmatory
  assert.ok(ledger.claims.filter(c => c.source === 'declared_bundle').every(c => c.confirmatory_eligible === false));
});

test('listDeclaredBundles only returns registry entries', () => {
  const bundles = listDeclaredBundles();
  assert.ok(bundles.length >= 7);
  assert.ok(bundles.every(b => b.study_id && (b.path || b.declared_inline)));
});
