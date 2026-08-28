---
name: thinking-lindy-effect
description: Use when longevity of a non-perishable option matters. Treat survival duration as a remaining-life prior, then check domain drift before favoring the proven.
disable-model-invocation: true
---

# Lindy Effect

For non-perishable ideas, technologies, and practices, expected remaining life scales with current survival age. Prefer proven survivors unless the new option clears a burden of proof or the domain has drifted.

## When to Use

- Choosing languages, frameworks, databases, protocols, patterns, or dependencies where long-term survival matters.
- Skill or architecture bets whose value depends on lasting relevance.
- Ranking options when ages differ materially and the choice outlives a short experiment.

## When NOT to Use

- Perishable targets: specific SaaS vendors, hardware, fashion, or products that can shut down regardless of concept age.
- Active paradigm discontinuity where age in the old regime is weak evidence.
- Throwaway work where longevity is irrelevant — optimize for fit and speed.
- Treating "older" as "optimal for a new requirement"; survival predicts further survival, not best fit.

## Procedure

1. **Confirm non-perishable scope.** Concept/tech/practice continues; vendor/device → score fit/risk only and stop.
2. **Record survival age.** First significant production use and current age (ecosystem-relative if the ecosystem is young).
3. **Form the Lindy prior.** Expected remaining life ≈ current age; mark confidence from age and continued active use.
4. **Run domain-drift checks.** Problem class changed? Paradigm shift invalidating old assumptions? New option uniquely closes a real present gap?
5. **Assign burden of proof.** Default to the older adequate option. Accept newer only for a stated necessary advantage the Lindy option cannot meet at acceptable cost.
6. **Decide with residual risk.** Pick primary; note impact if the prior is wrong and any fallback.

**Stop condition:** Primary chosen with age prior, drift check, and why new did or did not meet burden of proof.

## Output

```text
Options: <name, age, Lindy prior>
Drift: stable | discontinuous — <note>
Burden: on new | waived because <gap>
Decision: <primary>
Rejected: <one line each>
If Lindy wrong: <impact + fallback>
```

## Verification

- Falsify if age was used without non-perishable scope, or a paradigm shift was ignored.
- Falsify if a new option was rejected solely for youth despite a documented necessary gap.
- Over-application guard: skip throwaway prototypes and perishable vendor bets where fit and exit cost dominate.
