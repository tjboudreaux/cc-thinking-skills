---
name: thinking-model-combination
description: When one mental model leaves a material blind spot on a multi-domain or high-stakes problem, sequence complementary models with named roles and a conflict rule.
disable-model-invocation: true
---

# Model Combination

**Core rule:** Combine only when each model answers a different named question. Cap at three, name the conflict rule before applying, then synthesize once.

## When to Use

- One model already applied (or clearly primary) still leaves a material blind spot that another mechanism covers.
- Problem spans domains (e.g. risk + choice + system structure) and stakes justify multi-lens work.
- You need independent checks, not confirmation of the same conclusion.
- You can name a distinct role per model before running them.

## When NOT to Use

- A single catalog skill fully answers the unknown — apply that skill alone.
- Routine, local, or fully reversible work where multi-lens cost exceeds upside.
- You cannot state what unique question each extra model answers (checkbox / model soup).
- Near-duplicate mechanisms (two diagnosis skills that ask the same causal question).
- Time budget cannot support genuine synthesis — prefer one honest model over contradictory partials.

## Procedure

1. **State the unknown and the gap.** Write the decision question. If one model already covers it, stop and use that model alone. Otherwise name the specific blind spot (e.g. "failure modes unexamined", "displaced alternative unknown").
2. **Pick 2–3 models with distinct roles.** For each, record: model id, role (narrow / decide / stress / cost / …), and the unique question it answers. Drop any model that only rephrases another. Prefer sequential pipeline (narrow → stress → decide) over parallel unless independent concurrent checks are required.
3. **Lock the relation and conflict rule before applying.** Choose pattern: sequential, parallel, nested (macro→meso→micro), or adversarial (for/against). Predeclare the tiebreaker (e.g. reversibility class, evidence strength, ruin constraint, primary decision owner). Incompatible worldviews run sequential or adversarial — never blended.
4. **Apply each model fully for its role only.** Capture one key insight per model plus what only that model revealed. Do not re-run a model that adds no new insight.
5. **Synthesize once.** Record convergence, divergence, how the conflict rule resolves divergence, and a single combined recommendation with residual uncertainty. Stop when the recommendation is decision-ready or when further models would only reconfirm.

## Output

```text
problem: <decision question>
gap: <named blind spot justifying combination>
pattern: sequential | parallel | nested | adversarial
models:
  - id: <skill>
    role: <named job>
    unique_question: <what only this answers>
    insight: <key finding>
conflict_rule: <predeclared tiebreaker>
convergence: <where models agree>
divergence: <where they conflict + resolution>
recommendation: <single decision-ready answer>
stop_reason: gap_closed | single_model_suffices | budget
```

## Verification

- **Falsify / stop:** Remove a model only when it changes none of the recommendation, supporting evidence, confidence, residual risks, or mitigations; then re-synthesize with fewer. If no predeclared conflict rule exists and models disagree, do not average — pick one primary model or stop and re-route.
- **Over-application guard:** Never exceed three models. Never add a model for thoroughness theater. If the first adequate single model already closes the gap, combination is wrong for this task.
