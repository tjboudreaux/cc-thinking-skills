---
name: thinking-bounded-rationality
description: Use when search or investigation could run forever. Set an explicit good-enough threshold first, then stop at the first option that clears it.
disable-model-invocation: true
---

# Bounded Rationality

Under finite tool, context, and time budgets, stop at the first option that meets a predeclared aspiration level. Optimize only when the good-to-best gap is worth the remaining budget.

## When to Use

- Search or option comparison has no natural endpoint and could consume the turn budget.
- Multiple options would clear the requirement and further comparison has diminishing returns.
- The decision is reversible or low-stakes relative to more search.
- You are gathering context beyond what the decision needs to ship.

## When NOT to Use

- Irreversible or high-stakes choices (data loss, security, migrations, public commitments) where the good-to-best gap is material.
- Correctness gates: tests, security checks, and "did the fix work?" need the right answer, not a sufficient-looking one.
- One cheap lookup would settle the fact — do it; do not satisfice past it.
- The aspiration level cannot be stated — clarify the requirement first.

## Procedure

1. **State decision and budget.** Name the choice, residual tool/context/time budget, and reversibility.
2. **Set aspiration before searching.** Write concrete pass/fail criteria for "good enough." Do not evaluate until the threshold is explicit.
3. **Search sequentially.** Score options in encounter order against the threshold only. Skip full matrices unless step 1 marked high-stakes/irreversible.
4. **Stop at first adequate.** When an option clears every criterion, select it immediately.
5. **Handle search failure without moving the goalposts.** If nothing clears after the pre-set cap, preserve the threshold and report no adequate option. Relax only a criterion predeclared as non-load-bearing, record the relaxation, and resume within a new cap; never raise the bar after failure.
6. **Commit.** Record choice and residual uncertainty; spend remaining budget on execution, not re-ranking.

**Stop condition:** First option meets the predeclared aspiration level, or the search cap is exhausted with none adequate.

## Output

```text
Decision: <choice>
Aspiration: <pass/fail criteria>
Search: evaluated N; stopped at first adequate | cap exhausted
Selected: <option or none>
Residual risk: <what further search might change>
Next spend: <execution step>
```

## Verification

- Falsify if you kept comparing after an option cleared the threshold, or invented the threshold after seeing winners.
- Falsify if a correctness gate or irreversible decision was treated as satisficeable.
- Over-application guard: if one cheap check settles a fact, look it up — do not invoke this skill.
