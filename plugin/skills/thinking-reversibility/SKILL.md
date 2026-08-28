---
name: thinking-reversibility
description: Before heavy deliberation, classify the decision as cheap or costly to undo; decide two-way doors fast and stage one-way doors to preserve options.
disable-model-invocation: true
---

# Reversibility

Core rule: match process depth to undo cost. Most decisions are cheaper to reverse than they look; irreversible ones deserve deliberation and staged commitment.

## When to Use

- Uncertain how much analysis a decision deserves (tech, process, product, org)
- Tempted to committee a low-blast-radius choice, or to rush a high-lock-in one
- Can redesign the move (pilot, flag, abstraction, time-box) to lower undo cost
- High-stakes choice where acting vs waiting have asymmetric recovery profiles

## When NOT to Use

- Already classified this session—decide at matched depth; do not re-label forever
- Trivial two-way calls (names, local refactors) where deciding is cheaper than classifying
- Externally forced move with no optionality (hard deadline, contract, regulation)
- Correctness gates (security, data integrity) that need the right answer, not speed theater

## Procedure

1. **Name the decision and undo path.** State what would be committed and the concrete reverse move (rollback, migrate back, revoke, re-hire, re-contract).
2. **Score reversibility.** Assess technical effort, time, money, reputation, dependents, and learning lost if reversed. Classify:
   - **Type 2:** undo in days, low cost → decide fast
   - **Type 1.5:** undo in weeks, moderate cost → light structure + monitor
   - **Type 1:** months or not realistically undoable → deliberate
3. **Asymmetric downside / recovery.** For Type 1 or 1.5:
   - Acting wrong: downside, recoverable?, recovery cost
   - Not acting: what permanently closes (window, exclusivity, path lock)
   - Rule: recoverable acting downside + permanent inaction loss → staged commit over indefinite delay; catastrophic or third-party harm → refuse or redesign first
4. **Option-preserving redesign.** Prefer pilots, feature flags, interfaces, versioning, time-boxed vendor terms, or strangler slices that convert Type 1 surface into Type 2 experiments. Deliberate only the residual irreversible core.
5. **Match process and commit.** Type 2: pick a reasonable option, ship, monitor. Type 1: document assumptions, argue the opposing case, surface to owner if stakes require it. Stop once class and commitment depth are set—do not re-analyze without new undo-cost evidence.

## Output

```text
Decision: …
Undo path: …
Class: Type 2 | 1.5 | 1 (factors: …)
Acting downside / recovery: …
Not-acting permanent loss: …
Staging / option-preserving move: …
Process depth: decide-now | pilot | full deliberation
Commitment: …
```

## Verification

- **Falsify:** If "we can always change later" has no concrete undo path and cost, treat as more irreversible until proven otherwise.
- **Stop:** After class and process depth are set, further taxonomy is waste—execute the matched process.
- **Over-application guard:** Do not slow trivial Type 2 work with matrices. Do not use "two-way door" to skip verification on irreversible data, security, or public commitments.
