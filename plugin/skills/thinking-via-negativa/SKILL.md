---
name: thinking-via-negativa
description: Use when the reflex is to add a feature, layer, or process. Prefer removing harmful or nonessential elements first, with an irreversibility guard before deletion.
disable-model-invocation: true
---

# Via Negativa

Improve by subtraction before addition. Prefer removing harm, waste, and nonessential complexity; add only when a demonstrated need remains after removal candidates are exhausted.

## When to Use

- About to add a feature, abstraction, dependency, process, or control to fix a problem.
- Simplifying a system or workflow where complexity is the tax.
- Prioritizing by deciding what not to keep, build, or maintain.
- Performance or reliability work where eliminating a bad path beats bolting on mitigation.

## When NOT to Use

- Load-bearing controls: auth, validation, tests, rate limits, retries, safety checks — presume necessary until proven dead.
- A demonstrated requirement that cannot be met by removal or simplification.
- Aesthetic minimalism without evidence of non-use or net harm.
- Irreversible deletion without a rollback path when impact is unknown.

## Procedure

1. **Pause the add reflex.** State the goal and the proposed addition in one line.
2. **Ask the subtraction question first.** List what could be removed or stopped to achieve the same goal with less surface area.
3. **Catalog candidates with evidence.** Prefer unused, redundant, high-cost/low-value, or harmful elements. Require usage, call-graph, metrics, or experiment evidence — not taste.
4. **Apply the irreversibility guard.** Classify reversible vs hard-to-restore; identify dependents; refuse deleting unproven mystery guards. Plan staged removal or flag when risk is non-trivial.
5. **Remove the safest high-value candidate first.** Subtract, monitor, and verify absence of needed behavior before the next removal.
6. **Add only if the goal still fails.** If subtraction cannot meet the need, add the minimum change and record why removal was insufficient.
7. **Stop** when the goal is met by absence, or remaining candidates fail the irreversibility/evidence bar and a minimal addition is justified.

**Stop condition:** Goal achieved via removal, or residual need documented after evidence-backed subtraction failed.

## Output

```text
Goal: <desired outcome>
Proposed add (if any): <thing>
Removal candidates: <element — evidence — risk — reversible?>
Action: remove <X> | staged remove <X> | add minimal <Y> because <why removal failed>
Verification plan: <how absence/success is checked>
Do-not-touch: <load-bearing items preserved>
```

## Verification

- Falsify if something was deleted without non-use/harm evidence, or a safety control was removed as "complexity."
- Falsify if an addition shipped without a prior subtraction pass on the same goal.
- Over-application guard: do not delete for line-count or purity when the element is load-bearing or the need is demonstrated.
