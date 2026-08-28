---
name: thinking-cynefin
description: When the right response mode is unclear, classify the cause-effect domain first; decompose disorder.
disable-model-invocation: true
---

# Cynefin Classification

Classify by cause-effect, then use only the matching response mode. Wrong-domain method is the failure mode.

## When to Use

- Unsure whether to run a playbook, analyze, probe, or stabilize.
- A method keeps failing and domain mismatch is plausible.
- A novel or mixed problem needs approach selection before solution work.

## When NOT to Use

- Domain and method are already agreed—execute.
- Task is finding a specific cause, not choosing an approach.
- Classification done; switch to the domain method—do not re-label endlessly.
- Pure mechanical edits with no approach uncertainty.

## Procedure

1. **State the unit.** Name the decision, incident, or subsystem; if mixed, list separable parts.
2. **Probe cause-effect.** Is the link obvious, expert-analyzable, retrospective only, or imperceptible in turbulence? Check predictability, urgency, and probe safety.
3. **Assign one domain per unit:**
   - **Clear** — obvious → Sense → Categorize → Respond with a runbook.
   - **Complicated** — expert-analyzable → Sense → Analyze → Respond; several valid answers.
   - **Complex** — emergent → Probe → Sense → Respond with safe-to-fail probes; amplify/dampen signals.
   - **Chaotic** — no safe sensing time → Act → Sense → Respond; stabilize first.
   - **Disorder** — unknown → split and classify each part.
4. **Mismatch check.** Reject Clear if its runbook fails; Complicated if analysis cannot predict; Complex if probing is unsafe; Chaotic once safe probing becomes possible.
5. **Commit and stop.** Output domain + first actions. Re-classify only on evidence of domain shift.

**Stop when** every unit has one domain, first actions, and a falsifier—or disorder is decomposed.

## Output

```text
unit: <decision/incident/part>
domain: clear | complicated | complex | chaotic | disorder
evidence: <cause-effect basis>
response_mode: <Sense-Categorize-Respond | Sense-Analyze-Respond | Probe-Sense-Respond | Act-Sense-Respond | decompose>
first_actions: <1-3 concrete steps>
falsifier: <what forces reclassification>
parts: <only if disorder>
```

## Verification

- **Falsify:** Reliable prediction → not Complex. No safe probe → Chaotic. Working runbook → Clear.
- **Stop:** Stop classifying once the matched action is clear.
- **Over-application guard:** Do not call work Complex to avoid analysis or Complicated to avoid a standard fix. One label per unit; decompose multi-domain work.
