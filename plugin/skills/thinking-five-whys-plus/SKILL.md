---
name: thinking-five-whys-plus
description: When a fault is localized and the proximate cause is known but the systemic root is not, chain evidence-linked whys with a counterfactual stop and a countermeasure.
disable-model-invocation: true
---

# Five Whys Plus

Build an evidence-linked causal chain from a known proximate fault to an actionable systemic root, then prescribe a countermeasure that would have blocked it.

## When to Use

- A fault is already localized to a component, path, or subsystem.
- The proximate cause is known, but recurrence or systemic root is not.
- Prior symptom-only fixes failed and the failure returned.
- You need prevention that addresses why the proximate cause was possible.

## When NOT to Use

- Fault is not localized or multiple candidate causes remain — discriminate first.
- Root is evidenced and actionable — fix it.
- No evidence can answer the next "why" — gather evidence.
- One-off error without a process, tooling, or design enabler.
- Selective defect needing IS/IS-NOT analysis.
- Forward failure forecasting before commitment.

## Procedure

1. **State the localized problem.** Record the observable symptom, confirmed component/path, time window, scope, and impact. Stop if localization is missing.
2. **Chain why with evidence.** Make the prior answer the new effect; propose a cause; cite logs, code, config, metrics, or witnesses; name and rule out alternatives. Stop on speculation.
3. **Branch before descending.** Ask what else could produce the same effect; keep every evidenced independent pathway. Treat the retained branches as a causal set rather than forcing one root.
4. **Counterfactually test each pathway and the set.** For each candidate ask, "Would removing this cause block this pathway?" Then ask, "Would removing the retained set block the observed failure?" Retain independently sufficient branches whose removal blocks their own pathway; do not reject them merely because another branch could still cause the failure.
5. **Enforce stop criteria per branch.** Stop a branch only when its cause is evidenced, controllable, actionable, recurrence-preventing, non-blame (not merely "someone erred"), and counterfactual-positive for that pathway. If it hits human error, ask why the error was possible.
6. **Prescribe a countermeasure for every retained root.** Name the systemic fix, owner-capable action, and how recurrence will be checked. Prefer removing enabling conditions over only patching the proximate symptom.
7. **Stop when verified or blocked.** Halt when stop criteria pass and a countermeasure is specified, or when further steps lack evidence. Do not pad by habit.

## Output

```text
Problem: <localized symptom + component>
Chain:
  Why1: <cause> | Evidence: <...> | Ruled out: <...>
  WhyN: ...
Causal set check: would removing all retained roots block the failure? yes/no
Roots:
  - <systemic cause> | Pathway counterfactual: <...>
    Countermeasure: <action that removes the enabling condition>
    Verification: <how to confirm this pathway is blocked>
```

## Verification

- Falsify the chain if any step lacks evidence, if alternatives were never considered, if a retained root does not pass its pathway counterfactual, or if the full causal set does not explain the failure.
- Stop applying this skill once the root is fixed and verified, or when the problem is still pre-localization.
- Over-application guard: skip a full chain for a single known one-line defect; do not end at blame; do not invent depth without data.
