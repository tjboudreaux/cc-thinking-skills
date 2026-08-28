---
name: thinking-jobs-to-be-done
description: Deciding what to build or why adoption fails. Recover the progress users hire a solution for under a circumstance, then rank by outcome and competing workarounds.
disable-model-invocation: true
---

# Jobs to Be Done

Core rule: users hire solutions for progress in a situation. Prioritize the job, forces, outcome, and competing workaround—not the feature list.

## When to Use

- Choosing what to build, cut, or prioritize when user need is unclear
- Explaining low adoption of a shipped feature
- Mapping competition beyond same-category products (email, spreadsheets, manual work, non-consumption)
- Positioning or research when the progress sought is contested

Requires at least one evidence source: PRD/spec, tickets, support/sales notes, analytics/logs, or current product behavior. If none exist, name the research gap; do not invent quotes.

## When NOT to Use

- Pure execution once the job is known (bug fix, schema, CI, performance)—implement, do not rediscover the job
- Retro-justifying a decision already locked—framework theater
- Infrastructure/internal work with no end-user progress decision
- When the open question is only *how* to implement a settled job

## Procedure

1. **Name performers and circumstance.** Who hires a solution, in what trigger situation, how often, and with what stakes. Prefer primary performers with daily high-stakes jobs over rare secondary ones.
2. **State the job, not the solution.** Frame: `When [circumstance], I want to [progress], so I can [outcome]`. Reject solution-shaped statements ("use Slack", "add a dashboard"). Capture functional, emotional, and social dimensions only if evidence supports them.
3. **Map forces and switch.** From artifacts: what push made the old way fail, what pull the new progress offers, what anxiety blocks switching, what habit keeps the status quo. List what they hire today—including non-software and non-consumption.
4. **Define done and outcome metrics.** How the performer knows the job is finished. List outcomes to minimize and maximize (time-to-progress, rework, confidence, surprises). Prefer frequent, poorly served jobs over rare, adequately worked-around ones.
5. **Score candidates against the job.** For each feature/priority: which job step it serves, performer share, frequency, quality of alternatives. Promote high-frequency underserved dimensions; demote polished work for well-served or low-stakes jobs.
6. **Strongest countercase.** State the best case that the stated job is wrong (wrong performer, vanity metric, process-is-the-job, competition is actually non-consumption). If the countercase fits evidence better, revise the job before recommending build.
7. **Stop.** Stop when one primary job statement, competing set, and outcome metrics are evidence-backed enough to change a build/position decision—or when artifacts cannot answer and research is the only next step.

## Output

Produce a JTBD decision artifact:

```text
Job statement: When …, I want to …, so I can …
Performers: primary / secondary (frequency, stakes)
Forces: push / pull / anxiety / habit
Competition: direct | indirect | non-consumption
Outcomes: minimize […] ; maximize […]
Priority implication: build / cut / reposition — because job gap is …
Countercase checked: …
Evidence used / gaps: …
```

## Verification

- **Falsify:** If replacing the job statement with a feature name does not change the recommendation, you never left solution-space—rewrite the job from circumstance and progress.
- **Stop:** Do not keep mapping job steps once the ranking decision is stable.
- **Over-application guard:** Skip on pure implementation tasks and known jobs. Never fabricate user quotes or personas to fill missing evidence.
