---
name: thinking-map-territory
description: When a claim, doc, test, metric, or assumption conflicts with observed behavior, stop theorizing from the map and verify the live code or data; let territory overrule.
disable-model-invocation: true
---

# Map Territory

Docs, tests, diagrams, metrics, comments, and mental models are maps. Running code and actual data are the territory. When they disagree, verify territory and update the model — never force reality to match the description.

## When to Use

- Observed behavior contradicts a doc, test expectation, diagram, comment, dashboard, or prior assumption.
- A claim about the system rests on a secondary source rather than current code or data.
- Tests pass but production or manual behavior is wrong.
- You are about to theorize why something happens before inspecting what happens.
- A decision depends on whether a model, schema, or metric is still current.

## When NOT to Use

- The map is the artifact you are asked to edit (doc, diagram, spec) — that artifact is the task territory.
- Same path already verified this session — reuse that observation.
- Map is authoritative and generative (codegen types, derived schema) with no claimed drift.
- The mismatch cannot change the decision — note and move on.
- Competing causal hypotheses after territory is confirmed — switch to scientific-method.
- Security exploit construction — use red-team; this skill only settles model-versus-observation.

## Procedure

1. **Name the map.** State the exact representation trusted: which doc, test, metric, diagram, comment, or assumption. Quote the claim, not a paraphrase.
2. **Name the territory check.** Specify the observation that would prove or disprove the claim: code path, runtime value, query, reproduction, recent change, or live metric.
3. **Verify source and freshness.** Confirm origin of the map (author, generator, last update) and whether it could be stale relative to deploy, config, or data change. Prefer primary current sources over summaries.
4. **Observe the territory.** Read the real code path, run or instrument it, query real data, or reproduce the behavior. Do not predict from signatures or names alone.
5. **Record the delta and update.** If territory contradicts the map, territory wins for shipped behavior. Document the gap, revise the model, then decide the fix (code, map, or both). Note unmapped paths — likely next failure sites.
6. **Stop when settled.** Once the claim is confirmed or overturned with a concrete observation, stop re-checking the same path.

## Output

```text
Map: <claim + source + freshness>
Territory check: <what was inspected/run/queried>
Observation: <concrete result, not interpretation>
Delta: <aligned | map wrong | territory incomplete>
Updated model: <corrected understanding>
Action: <fix code | update map | no decision impact>
Uncovered: <paths no map covers>
```

## Verification

- Falsify if you reasoned from the map without a territory observation, trusted a stale secondary source, or forced code to match a wrong doc without checking either.
- Stop when the contradiction is resolved or irrelevant to the decision.
- Over-application guard: do not re-verify the whole system when editing the map, when the map is the generative source of truth, or when the gap cannot change the next action.
