# Thinking Skills — Eval Harness

Outcome-based evaluation for the thinking skills. The repo's original
`scripts/validate-skills.js` measures **structural conformance** (does a file have
the right headers/tables/checkboxes). This harness measures whether a skill
actually **improves reasoning** and **fires at the right time**.

All model calls go through the authenticated `droid` CLI (`evals/lib/droid.js`).
`claude -p` is not used — the headless subprocess fails auth (401); `droid` has
provider keys configured and can drive Claude/GPT/Gemini/DeepSeek uniformly.

## Canonical engines

| Runner | Cost | What it measures |
|---|---|---|
| `run-structural.js` | free | header/format conformance + substance-aware re-score |
| `run-routing.js` | LLM | catalog auto-routing / NONE |
| `run-objective.js` | free (fixture) / LLM | generic paired objective engine (boolean, MCQ, abstention, numeric OOM, Brier, file localization) |
| `run-pairwise.js` | free (fixture) / LLM study | generic blind pairwise engine with typed envelopes |
| `run-calibration.js` | free / LLM | dataset difficulty and calibration utilities |
| `run-replication.js` | free | replication parsing and disposition helpers |

## Objective / pairwise engines

```bash
node evals/run-objective.js --fixture path/to/fixture.json
FIXTURE=1 node evals/run-pairwise.js --fixture path/to/pairwise-fixture.json
```

Shared helpers live in `evals/lib/objective.js` and `evals/lib/pairwise.js`
(`parseBooleanAnswer`, `summarizePairedArms`, `balancedAcc` in `stats.js`, etc.).

## Retired specialized runners

The old correctness, routing-data, binary-decision, abstention, numeric,
behavioral, rubric, SWE, workflow, shell-batch, and experiment-specific runners
are historical producers only. Current studies use the generic objective or
pairwise engine. Historical manifests keep the retired command names and hashes
for provenance. Tool-localization v1 also preserves its pre-cutover
`skills/thinking-scientific-method/SKILL.md` path. Run that study from its
historical revision. Create a new versioned manifest and runner for the current
`plugin/skills/` layout instead of changing its frozen pins.

## Other gates

```bash
EVAL_RUN=catalog-cutover node evals/run-structural.js
EVAL_RUN=run1 CONC=4 ROUTER_MODEL=claude-sonnet-4-6 node evals/run-routing.js
node evals/validate-dataset-splits.js
```

## Evidence policy

Public claims require machine-linked confirmatory artifacts under
`evals/studies/` and `analysis/evidence.json`. Historical result directories may
name older runners; those paths are historical only.
