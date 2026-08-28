---
name: thinking-steel-manning
description: Before rejecting a proposal or reflexively agreeing, build the strongest faithful opposing case, state agreement conditions, then update or reaffirm.
disable-model-invocation: true
---

# Steel-Manning

**Core rule:** Engage the best form of the opposing case, not a weak one. If your position survives that, reaffirm; if not, update.

## When to Use

- About to reject a proposal, design, or alternative approach.
- Inclined to agree with the user/plan and risk sycophancy — construct the best case *against* first.
- Design review, architecture debate, or conflict where trade-offs are real.
- Validating your own preferred decision before locking it (strongest-countercase check).

## When NOT to Use

- Settled fact, security anti-pattern, or violated hard requirement — correct it; do not invent a defense of what is wrong.
- You already agree for stated, weighed reasons — do not perform a fake debate.
- Trivial or fully reversible choices where deliberation cost exceeds downside.
- Live emergency — act first; steel-man in the post-incident review.
- Need definition/assumption cleanup, not opposition — use socratic.
- Need failure scenarios for a plan — use pre-mortem; need attacker paths — use red-team.

## Procedure

1. **State the target claim or decision** you are about to accept or reject, in one sentence. Name the real alternative if one exists.
2. **Extract the core insight** behind the opposing position (or against your preferred path): the legitimate concern even if the proposed solution is wrong.
3. **Construct the strongest faithful case** an informed advocate would make: best evidence, incentives, and failure modes — no mockery, no cherry-picked weak version, no motive attacks. Include base rates or concrete alternatives that could overturn the preferred path when relevant.
4. **State agreement / overturn conditions.** Write one observation or result that would make you accept the opposing case (or abandon your preferred path), and whether you have looked for it.
5. **Engage that strong version, then decide.** Respond to the steel-manned case on the merits. Output one of: accept opposing path, revise synthesis, or reaffirm original with explicit residual risks. Naming the countercase without accept/revise/reaffirm is incomplete. Stop once the decision updates or is reaffirmed with conditions.

## Output

```text
claim: <decision or proposal under test>
core_insight: <legitimate concern behind the opposition>
steel_man: <strongest faithful opposing argument>
overturn_if: <concrete observation that would change your mind>
looked_for_overturn: yes | no | partial
response_to_steel_man: <engagement on the merits>
decision: accept_opposing | revise | reaffirm
update: <what changed in belief or plan, or why reaffirm stands>
residual_risks: <what remains even after reaffirm/revise>
```

## Verification

- **Falsify / stop:** If the "steel man" is weaker than the original or attacks a caricature, rebuild it. If no overturn condition is stated, the check is incomplete. If evidence meets the overturn condition, you must update — reaffirmation is then false.
- **Over-application guard:** Do not steel-man factual errors or hard constraints. Do not run a full adversarial brief for near-zero-cost reversible choices. Do not use this skill to delay an emergency response.
