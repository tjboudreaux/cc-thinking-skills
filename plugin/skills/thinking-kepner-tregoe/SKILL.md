---
name: thinking-kepner-tregoe
description: Use when a selective defect needs IS/IS-NOT difference analysis or a consequential option choice needs must/want weighting and adverse-consequence comparison.
disable-model-invocation: true
---

# Kepner-Tregoe Analysis

**Core rule:** Diagnose deviations by testing causes against both IS and IS-NOT. Compare consequential choices by screening MUSTs, weighting WANTs, and exposing adverse consequences before selecting.

## When to Use

- A defect affects some objects, places, times, or cohorts but not comparable others.
- Several candidate causes remain and the contrast boundary can discriminate them.
- A consequential option choice has explicit non-negotiables, competing objectives, and risks that should be compared consistently.

## When NOT to Use

- A uniform failure has no meaningful IS-NOT contrast, or the cause is already confirmed.
- One cheap observation settles the cause or one option plainly dominates every requirement.
- The criteria cannot be made operational; clarify them before assigning weights.
- The task is forward failure discovery for a planned change rather than diagnosis or option selection.

## Procedure

1. **Choose the mode.** Use Problem Analysis for a deviation from expected behavior; use Decision Analysis for a choice among options. State the target and do not mix scores with causal evidence.
2. **Frame the target.** For a deviation, record object, defect, location, time, extent, and impact. For a choice, state the decision, alternatives, constraints, and deadline.
3. **Problem Analysis — build IS/IS-NOT.** For WHAT, WHERE, WHEN, and EXTENT, record IS, closest comparable IS-NOT, and the distinction unique to the IS side. List changes near the first occurrence.
4. **Problem Analysis — difference-test causes.** Generate candidates from distinctions and changes. A candidate survives only if it explains both IS and IS-NOT. Run the cheapest discriminating check; stop when one verified cause explains the full boundary.
5. **Decision Analysis — screen and score.** Define pass/fail MUSTs and weighted WANTs (1–10 importance) before scoring. Eliminate options that fail any MUST; score survivors against each WANT and calculate weighted totals using the same scale.
6. **Decision Analysis — test downside and sensitivity.** For leading options, list adverse consequences with probability × impact and identify assumptions or weight changes that would reverse the ranking. Do not let a high total conceal a ruinous failure mode.
7. **Decide or expose the gap.** Return the verified cause or highest-ranked acceptable option, the evidence/score behind it, residual risk, and next verification. If no cause verifies or no option passes MUSTs, return open/none rather than force a winner.

## Output

Return one mode-specific decision artifact:

- **Problem Analysis:** problem statement; IS/IS-NOT matrix with distinctions; nearby changes; candidate-vs-boundary tests; confirmed cause or next discriminating check.
- **Decision Analysis:** decision statement; alternatives; MUST screen; weighted WANT matrix; adverse-consequence table; sensitivity/reversal conditions; selected option or none.

## Verification

- **Falsify/stop:** reject a cause that cannot explain both sides of the boundary. Reject a choice if it fails a MUST, depends on inconsistent scoring, or loses under a plausible weight/risk change that was hidden.
- **Over-application guard:** skip the full matrix for an obvious cause, trivial choice, or one-shot check. Stop when the cause verifies or the option is robust enough for the stated stakes; extra rows are ceremony.
