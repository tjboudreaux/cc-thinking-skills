---
name: thinking-margin-of-safety
description: When provisioning, setting a limit, or committing an estimate under uncertainty, size a buffer to residual error and the cost of breach—not to the optimistic edge.
disable-model-invocation: true
---

# Margin of Safety

Core rule: commit a buffered number when residual uncertainty plus breach cost can cause ruin or costly failure. Margin covers estimation error; it is not free slack for laziness.

## When to Use

- Capacity, timeouts, pool sizes, queue depths, storage, or SLA numbers under load uncertainty
- Timeline or budget commitments where underestimation is costly
- Architecture headroom when scaling or recovery is slow
- Any public or production commitment where being wrong has asymmetric downside

## When NOT to Use

- Breach is detected immediately and fixed near-zero cost (fast auto-scale, live-tunable limit)—static fat buffers waste resources
- `cost(buffer) > P(breach) × cost(breach)`—right-size or measure instead of maxing out
- Uncertainty is eliminable by measurement or lookup—get the real number first
- Stopping-criterion / search budget problems—use bounded rationality, not padding
- Fully known parameters and low stakes where edge optimization is the goal

## Procedure

1. **Point estimate without padding.** State the base requirement in explicit units (RPS, weeks, GB, ms) and confidence (high / medium / low).
2. **Uncertainty and breach cost.** List drivers (spike, growth, unknowns, dependency variance). State what fails if undershot: outage, missed launch, data loss, reputation—and whether failure is recoverable or ruinous.
3. **Size the buffer.** Multiply or add margin to residual uncertainty and stakes—not to vanity. Typical bands (adjust with evidence):
   - Well-known, low consequence: ~1.2–1.5×
   - Familiar with unknowns / reversible: ~1.5–2×
   - New domain, external deps, SLA, irreversible: ~2–3×
   Cap or cut when buffer cost exceeds expected breach cost.
4. **Ruin constraint.** If a breach can cause irreversible harm, size so the worst plausible miss still stays above the failure threshold; if that buffer is unaffordable, change the design (shed load, degrade, stage) rather than pretend precision.
5. **Strongest countercase.** Challenge both under-buffering ("we will scale later") and over-buffering (idle cost, complexity). Prefer measure-then-trim when history exists.
6. **Commit and monitor.** Publish the buffered commitment, the failure threshold, and the metric that would prove margin excessive or thin. Stop when the number is set and monitorable.

## Output

```text
Base estimate: … (units, confidence)
Uncertainty drivers: …
Breach cost / failure threshold: …
Margin applied: …× (or absolute buffer …)
Buffered commitment: …
Ruin check: pass | redesign needed
Cost of margin vs expected breach cost: …
Monitor: metric … ; thin if … ; excessive if …
```

## Verification

- **Falsify:** If the buffered number equals the optimistic point estimate, no margin was applied—or if margin was added with zero stated breach cost, it is cargo-cult padding.
- **Stop:** Once commitment, threshold, and monitor exist, stop stacking multipliers without new uncertainty evidence.
- **Over-application guard:** Do not pad when adjustment is free and instant, or when the real number is cheaply measurable. Do not confuse search-stopping with capacity buffers.
