---
name: thinking-socratic
description: When a request is vague, assumption-laden, or "obvious," ask the few load-bearing questions that expose hidden requirements before building or committing.
disable-model-invocation: true
---

# Socratic Questioning

**Core rule:** Surface the load-bearing assumption or undefined term before you build. Ask only what you cannot resolve yourself; stop when the next action is decision-ready.

## When to Use

- Request is underspecified ("make it fast", "add a dashboard", "fix the bug") and a guess would misbuild.
- Claim rests on an unstated assumption that may be the real problem.
- Someone treats a premise as "obvious" or jumps to a solution before the problem is defined.
- Debugging a vague symptom that needs a checkable specific before investigation.

## When NOT to Use

- Spec is already clear and actionable — do the work; do not interrogate for theater.
- Ambiguity is resolvable by reading code, running a command, or checking docs — resolve it yourself.
- Mid-execution of an agreed plan — re-questioning every step is friction, not rigor.
- Emergency where one load-bearing fact is enough to act — clarify that fact, then act (prefer ooda).
- You need the strongest opposing case, not clarification — use steel-manning.
- You need causal chain depth on a defined failure — use five-whys-plus or scientific-method.

## Procedure

1. **Name the gap.** State what is undefined, assumed, or uncheckable. If you can fill it from tools/repo without the user, do that and stop.
2. **Ask the load-bearing question first.** Prefer one question whose answer most changes what you will build. Categories (use only what the gap needs):
   - Clarification — "What does X mean / for whom / success looks like?"
   - Assumption — "What must be true? What if it is false?"
   - Evidence — "What supports this? What would disprove it?"
   - Perspective — "Who is affected / who would disagree?"
   - Implication — "What follows if we do this?"
   - Meta — "Is this the right question?"
3. **Resolve or branch.** From the answer, either (a) write the clarified requirement/decision and proceed, or (b) ask at most one follow-up that still gates the work. Do not run all six categories by default.
4. **Make assumptions explicit.** Restate: "This assumes X; success means Y; out of scope is Z." Confirm only if still ambiguous after your restatement.
5. **Stop at decision-ready clarity.** When the next action no longer depends on a hidden premise, end questioning and act or hand off. Cap user-facing questions tightly; prefer batching the few that truly gate work.

## Output

```text
gap: <what was vague or assumed>
resolved_by: self | user | mixed
questions_asked:
  - <only questions actually needed>
assumptions_made_explicit:
  - <X must be true / success = Y>
clarified_requirement: <decision-ready statement>
next_action: <build | investigate | re-scope | stop>
stop_reason: clear_enough | self_resolved | blocked_on_<fact>
```

## Verification

- **Falsify / stop:** If answers do not change the plan, you asked non-load-bearing questions — stop interrogating. If the "clarification" is still a guess, do not build; name the remaining blocker.
- **Over-application guard:** Do not Socratic-interview a well-specified task. Do not outsource facts you can read or measure. Do not turn every step of execution into a new question round.
