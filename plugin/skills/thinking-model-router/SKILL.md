---
name: thinking-model-router
description: When unsure which thinking skill fits, map domain and problem type, then return NONE or one primary skill by default (at most three complementary).
disable-model-invocation: true
---

# Model Router

**Core rule:** Prefer NONE or one primary skill. Route by mechanism fit, not habit. Combine only when roles are distinct and necessary.

## When to Use

- The right thinking skill is unclear and you would otherwise guess or stack tools.
- Several catalog skills seem plausible and you need a single primary (or explicit NONE).
- High-stakes work where a wrong frame is costly and a quick domain×type match helps.

## When NOT to Use

- The match is already known or obvious ("where's the bottleneck?" → theory-of-constraints) — invoke that skill directly; do not route for show.
- The task is routine implementation with no analytical unknown — reason directly (NONE).
- You are mid-execution of an agreed plan and only need the next concrete step.
- The ask is outside this catalog (pure coding syntax, tool ops with no judgment call) — NONE.

## Invoking a Model (Skill IDs)

The router outputs bare slugs (e.g. `id: five-whys-plus`). Invoke a routed skill with the Skill tool using the exact ID `thinking-skills:thinking-<slug>` — never invent a slug not cited in Procedure. `NONE` means no invocation.

## Procedure

1. **Short-circuit.** If one skill clearly fits by mechanism, return that skill alone. If no skill clearly improves the work, return **NONE** and reason directly. Stop.
2. **Characterize.** Record domain (coding, architecture, product, strategy, personal, abstract, risk, innovation) and problem type (diagnose, decide, understand, create, evaluate, predict, optimize). Note constraints: time, information, stakes, reversibility, complexity.
3. **Candidate by type defaults (override when constraints demand).** Keep only active catalog skills:
   - Diagnose → five-whys-plus or scientific-method (kepner-tregoe if IS/IS-NOT matrix needed)
   - Decide → reversibility first; then opportunity-cost or probabilistic
   - Understand → systems (map-territory if model-vs-reality gap; cynefin if approach domain unclear)
   - Create → first-principles (triz for contradictions; effectuation for means-driven; via-negativa for remove-first)
   - Evaluate → steel-manning (socratic if assumptions/definitions are the unknown)
   - Predict → probabilistic
   - Optimize → theory-of-constraints (ooda under time pressure; bounded-rationality for search stop)
   - Risk / "what fails?" → pre-mortem or red-team; margin-of-safety for buffers
   - Product "what to build?" → jobs-to-be-done
   - Competence / durability → circle-of-competence, lindy-effect
   - Controlled hypothetical → thought-experiment
   - Multi-lens only after one primary fails a blind-spot check → model-combination
4. **Select with criteria (satisficing).** Score only if 2+ candidates remain or stakes make a forced default unsafe. Rate each criterion 1–5 (1 = absent/wrong fit; 3 = usable with gaps; 5 = direct fit): problem fit (30%), available inputs (20%), time to apply (15%), stakeholder usability (15%), competence to apply correctly (20%). A route must score problem fit ≥4 and weighted total ≥3.5; otherwise return **NONE**. For totals within 0.25, prefer fewer inputs and shorter execution; if still tied, choose NONE unless the skills answer distinct complementary questions.
5. **Multi-skill only as exception.** Add a second or third skill only when each has a distinct complementary role the primary leaves open. Cap at three. Prefer sequential over parallel. Near-neighbors and synonyms do not stack. For composition patterns, hand off to model-combination after naming the primary.
6. **Exit.** State abandon signals (forced fit, ignored factors, no insight ~15 minutes). On mismatch, re-route once or fall back to NONE — never force a frame.

**Domain cheat-map (primary first; still default to one or NONE):**

| Domain signal | Prefer |
|---------------|--------|
| Bug / root cause / flaky | five-whys-plus, scientific-method, systems |
| Architecture / tech choice | reversibility, systems, lindy-effect, opportunity-cost |
| Feature / roadmap / engagement | jobs-to-be-done, opportunity-cost, theory-of-constraints |
| Strategy / competition / growth | cynefin, systems, red-team, second-order |
| Personal / career commitment | opportunity-cost, reversibility, circle-of-competence, pre-mortem |
| Argument / belief update | steel-manning, probabilistic, socratic, first-principles |
| Security / disaster / ruin | pre-mortem, red-team, margin-of-safety, via-negativa |
| Innovation / contradiction / simplify | first-principles, triz, effectuation, via-negativa |

## Output

```text
outcome: NONE | one | multi
routes:
  - id: <primary skill id or NONE>
    role: <job this skill performs>
    unique_question: <question only this route answers>
  - id: <secondary skill id, only for multi>
    role: <distinct complementary job>
    unique_question: <distinct open question>
  - id: <tertiary skill id, only for multi>
    role: <distinct complementary job>
    unique_question: <distinct open question>
domain: <domain>
problem_type: <type>
constraints: <time/info/stakes/reversibility>
rationale: <mechanism fit in one sentence>
blind_spots: <what primary still ignores, if any>
exit: <when to abandon or re-route>
```

Default fill: `outcome: NONE` with one `id: NONE` route, or `outcome: one` with one route. Use `multi` only when every listed skill has a distinct role and unique question.

## Verification

- **Falsify / stop:** If the route is habit or familiarity rather than mechanism fit, discard and re-score or return NONE. If multi-skill entries lack distinct roles, collapse to the single best primary. If no candidate clearly helps, NONE is correct — do not invent a route.
- **Over-application guard:** Do not route when the skill is already obvious. Do not return more than three skills. Do not cite deleted or non-catalog names. Do not treat the router as a prerequisite for leaf skills invoked directly.
