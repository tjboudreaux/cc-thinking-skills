---
name: thinking-thought-experiment
description: 'When a real test is too rare, large, or irreversible, run a controlled counterfactual: isolate one variable, fix conditions, trace the mechanistic chain, and bound what the result implies.'
disable-model-invocation: true
---

# Thought Experiment

When empiricism is out of reach, run a disciplined counterfactual: one isolated change, fixed conditions, step-by-step mechanism, and a hard bound on implications.

## When to Use

- You need behavior under failure, scale, or policy you cannot cheaply trigger or measure (region outage, 100x load, one-way architecture).
- A decision is expensive or irreversible and a mental trace can surface break points before commit.
- Edge cases are too costly to stage, but a mechanistic chain can still expose missing controls.

## When NOT to Use

- A cheap real test exists (load test, flag, query, spike) → run the test; do not substitute imagination.
- Adversarial security attack-path work → use red-team structure, not free-form scenarios.
- You already know the mechanism and only need a decision under known facts → decide; do not dramatize.
- Vague "what if everything" brainstorming without a single isolated variable → tighten or stop.

## Procedure

1. **State the question and isolation.** Name exactly one primary variable or counterfactual change. Freeze all other conditions as the control world. Reject multi-variable "and also" scenarios.
2. **Fix initial conditions.** Specify system state, load, configuration, actors, and what is *not* changed. Write values concrete enough that another agent could replay the setup.
3. **Trace the mechanism step by step.** From t0, record what fails, queues, retries, or adapts next—and why—using known components and policies only. No hand-wavy "then everything collapses"; each step needs a causal link.
4. **Extract invariants and break points.** Note what still holds (invariants) and the first step where the system violates a requirement (capacity, correctness, safety, UX). Mark assumptions that, if false, void the chain.
5. **Bound implications.** Map insights only to actions or checks justified by the chain (limits, guards, monitoring, redesign). Label speculative leaps beyond the isolation as out of bound.
6. **Name a discriminating real check, then stop.** For the weakest link, state the cheapest observation or experiment that would confirm or kill it. Stop after one controlled chain with bounded implications; if a link is cheaply testable now, exit to that test instead of further imagination.

## Output

Emit a thought-experiment record:

- `question`: what behavior or decision is under test
- `isolated_variable`: single change vs control world
- `initial_conditions`: frozen state and non-changes
- `consequence_chain`: ordered mechanistic steps
- `invariants`: what still holds
- `break_points`: first requirement failures and critical assumptions
- `implication_bound`: actions/checks justified by the chain only
- `discriminating_check`: cheapest real observation to confirm or kill the weak link

## Verification

- **Isolation check:** more than one free variable without a stated control → invalid; reset.
- **Mechanism check:** any step without a causal link to a known component/policy → rewrite or drop.
- **Implication bound:** recommendations not entailed by the chain are out of scope.
- **Empiricism override:** if a real test became available mid-analysis, stop the thought experiment and test.
- **Over-application guard:** do not use this skill for ordinary debugging you can reproduce, or as a substitute for red-team threat modeling.
- **Stop:** one isolated counterfactual → full chain → bounded implications + discriminating check; no scenario sprawl.
