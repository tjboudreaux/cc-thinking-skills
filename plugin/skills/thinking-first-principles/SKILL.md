---
name: thinking-first-principles
description: When a constraint is treated as fixed, separate physics from convention, keep only independently supported primitives, and rebuild the simplest solution that satisfies real constraints.
disable-model-invocation: true
---

# First Principles

Strip assumed constraints to independently supported primitives, then rebuild. Escape analogy when convention fails or looks artificially expensive.

## When to Use

- A constraint is treated as fixed ("too expensive," "impossible," "always done this way") without independent support.
- Convention or analogy has failed, stalled, or only yields weak incremental variants.
- Greenfield design where industry defaults may smuggle false requirements.
- Cost or feasibility claims rest on pricing, precedent, or authority rather than physics, math, or measured need.

## When NOT to Use

- The constraint is verified physics, hard regulation, or measured capacity → accept it and optimize within it.
- A proven standard library, protocol, or known-good pattern already fits → use it; do not re-derive.
- Time-critical incidents → act on the most likely cause first; reserve first-principles rebuild for post-incident redesign.
- Incremental polish of a working system with no false-constraint signal → skip.

## Procedure

1. **State the problem and claimed constraints.** List every limit treated as fixed (cost, scale, stack, process, "must use X").
2. **Classify each constraint.** Tag as `physics/math`, `regulation/contract`, `measured fact`, or `convention/analogy/authority`. Keep only the first three as binding unless evidence upgrades a convention.
3. **Decompose to primitives.** Required inputs, conservation/complexity bounds, true non-negotiables. Demand independent support (measurement, derivation, primary requirement)—not vendor pricing or competitor precedent.
4. **Discard unsupported assumptions.** For each convention tag, state a falsifier. Drop or renegotiate anything lacking support.
5. **Rebuild from remaining primitives only.** Simplest solution that satisfies binding constraints and ignores artificial ones. Prefer commodity inputs and fewer moving parts over analogy.
6. **Validate and stop.** Check against real physics, contracts, and measured needs. Define the cheapest kill test. Stop when a coherent rebuild plus discriminating validation exists, or when only verified hard constraints remain.

## Output

Emit a first-principles rebuild:

- `claimed_constraints`: list with classification tags
- `primitives`: independently supported truths only
- `discarded_assumptions`: conventions dropped and why
- `rebuild`: solution derived only from primitives
- `binding_residuals`: real limits that remain
- `kill_test`: cheapest check that would falsify the rebuild

## Verification

- **Independence check:** every primitive must cite measurement, derivation, or primary requirement—not precedent alone.
- **No smuggled analogy:** if the rebuild still depends on "how others do it" without a primitive, strip it.
- **Constraint honesty:** verified physics/regulation must remain; do not wish them away.
- **Over-application guard:** if a standard solution is already optimal under verified constraints, do not rebuild for novelty.
- **Stop:** one decompose → classify → rebuild → kill-test pass; do not recurse without new evidence.
