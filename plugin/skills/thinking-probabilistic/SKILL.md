---
name: thinking-probabilistic
description: Use when forecasting, estimating, or sizing risk — anchor on base rates, give ranges, update prior→likelihood→posterior on evidence, and factor unmeasured quantities into order-of-magnitude bounds.
disable-model-invocation: true
---

# Probabilistic Thinking

**Core rule:** State beliefs as numbers and ranges, not vibes. Anchor on a base rate, update with an explicit likelihood, and bound unknowns by factoring them — never invent false precision.

## When to Use

- Timeline, effort, or outcome forecasts where the true value is uncertain.
- Risk sizing for a change, migration, deploy, or launch.
- Any moment you are about to state a confident single number you cannot actually know.
- New evidence arrives and a prior estimate should move.

## When NOT to Use

- The quantity is measurable or look-up-able — measure or look it up.
- The decision is invariant across the whole plausible range — skip the estimate and act.
- There is no real reference class and you would invent a base rate — label it a guess, not a calibrated forecast.
- You only need a binary gate and already have a decisive observation — do not pad with ceremony.

## Procedure

1. **Define a checkable claim:** outcome + timeframe + unit. Prefer a falsifiable statement over vague language ("likely").
2. **Lock a prior and challenge it:** name a reference-class base rate and at least one credible alternative path/hypothesis with its rate. Pull the prior toward the base rate unless you write a concrete reason for deviation. Then state the strongest evidence-based case that your chosen prior or range is wrong, what estimate it supports, and revise if that countercase survives. Convert vague words to numbers (e.g. "likely" ≈ 65–80%).
3. **Express a range, not a point:** give at least one confidence interval (50% and 80% preferred). Assume overconfidence; widen intervals when the outside view is thin.
4. **Update prior → likelihood → posterior when evidence arrives:**
   - Prior odds = p / (1 − p).
   - Likelihood ratio LR = P(E|H) / P(E|¬H). LR > 1 supports H; LR = 1 is noise; LR < 1 undermines H.
   - Posterior odds = prior odds × LR (multiply even when LR < 1); p = odds / (1 + odds).
   - Strength bands for distance from 1: weak ~1.5–3×, moderate 3–10×, strong 10–100×, definitive 100×+.
   - Yesterday's posterior is today's prior for the next evidence. For rare events, start from the base rate — vivid positives still leave most mass on false alarms.
5. **Fermi-bound unmeasured quantities** (only when you need a magnitude you cannot measure/look up):
   - Decompose: Quantity = Factor₁ × Factor₂ × … (or sum of components).
   - Bound each factor with a range; use one-significant-figure geometric means for order-of-magnitude.
   - Multiply; report "~X within 3–5×"; sanity-check whether a 10× error would change the decision; replace any factor that is actually lookup-able.
   - Skip Fermi when the number is cheaply measurable, when the decision needs tighter than ~3–5× precision, or when every factor is pure invention.
6. **State the final estimate for checking:** claim, range/CIs, key uncertainties, and the observation that would prove it wrong. Stop when the decision is stable across the remaining range or the next update needs new evidence you do not have.

## Output

1. **Claim** — falsifiable statement with timeframe.
2. **Prior** — base rate, alternative path, adjustment reason, strongest countercase, and resulting prior probability.
3. **Range** — confidence intervals (not a lone point).
4. **Updates** — each evidence row: prior, LR (or explicit heuristic Δ), posterior.
5. **Fermi bounds** (if used) — factor product and "~X within N×".
6. **Decision implication** — what changes if the true value is at the low vs high end of the range.

## Verification

- **Falsify/stop:** if you cannot name a base rate, alternative, or serious countercase, label the estimate as a guess rather than calibrated. If the decision is unchanged across the full range, stop estimating. If new evidence arrives and the number does not move (or moves without an LR/Δ), recompute.
- **Over-application guard:** do not dress checkable facts as probabilities, invent reference classes, or Fermi-decompose quantities you can measure. Do not report three significant figures on a 5×-uncertain product. For rare events, refuse jumps from one vivid hit to near-certainty without the base-rate prior.
