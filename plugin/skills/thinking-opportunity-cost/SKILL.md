---
name: thinking-opportunity-cost
description: Before committing scarce time, people, or money, name the best forgone use of those resources and the value delta of the chosen path versus that alternative.
disable-model-invocation: true
---

# Opportunity Cost

Core rule: every commitment displaces its best alternative. Report both that forgone value and the net value delta; decide on the delta, not the chosen path alone.

## When to Use

- Allocating scarce time, headcount, budget, or attention across competing options
- Feature prioritization, build-vs-buy, tech-debt vs product work
- Saying yes to a large commitment that displaces other work
- Comparing a bold path against polishing the status quo when windows may close

## When NOT to Use

- Trivial or cheaply reversible choices where analysis costs more than the resource
- No real alternative use (resource is idle, earmarked, or non-fungible)
- Mandatory work (compliance, security fix, hard dependency) with no optional alternative
- Inventing speculative alternatives only to look rigorous when the next-best is clearly worse

## Procedure

1. **State the commitment.** Name the choice, the scarce resource units (eng-weeks, dollars, calendar), and the decision horizon.
2. **List real alternatives, including do-nothing.** At least: proposed option, next-best productive use of the same resources, and status quo / wait. Drop fantasy options with no owner or feasibility.
3. **Value each path.** For each alternative, estimate direct value, strategic value, risk, and time-to-value in the same units. Prefer rough comparable magnitudes over fake precision.
4. **Compute best forgone value and value delta.** Identify the single best non-chosen alternative (may be do-nothing). `best_forgone_value` = its estimated value. `value_delta` = `chosen_value − best_forgone_value` (same units). True cost of choosing = direct cost of the choice + `best_forgone_value`. Prefer the option with the superior (positive) value delta after risk; a large positive chosen value is not enough if the forgone alternative is larger.
5. **Future tradeoff / permanent forgone options.** For serious alternatives (including the bold path): mark temporary recoverable costs vs permanent losses (window closes, lock-in, no re-entry). Prefer avoiding the greater permanent loss when acting downside is recoverable and non-catastrophic—even if near-term value_delta is slightly negative. Do not invent permanence for speculative upside without evidence.
6. **Strongest countercase and decide.** Steel the case that the best alternative or its value is misidentified (sunk-cost anchoring, status-quo undervalued, or a "free" option that still burns time). Recompute `value_delta` under that challenge. Then choose: proceed if delta stays favorable (or permanent-loss rule applies), else switch, wait, or split. Stop when ranking is stable.

## Output

```text
Choice: …
Resources committed: …
Alternatives:
  A (proposed): value … risk …
  B (next-best): value … risk …
  C (do-nothing / wait): value … risk …
Best forgone alternative: …
Best forgone value: …
Value delta (chosen_value − best_forgone_value): …
Permanent vs temporary losses: …
Decision: proceed | switch | wait | split — because value_delta … (and permanent-loss rule if used)
Countercase checked: …
```

## Verification

- **Falsify:** If the analysis never names a concrete next-best use of the same resources, or reports only one number labeled both "opportunity cost" and "delta," it is incomplete—add B, then report `best_forgone_value` and `value_delta` separately.
- **Stop:** When one best forgone alternative and a signed value delta determine the choice, stop enumerating weaker options.
- **Over-application guard:** Do not run full accounting on mandatory or trivial work. Ignore sunk costs; revalue only from current state forward.
