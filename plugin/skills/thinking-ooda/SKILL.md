---
name: thinking-ooda
description: Use under time pressure when the situation is still changing and you must act before certainty — cycle Observe→Orient→Decide→Act on ~70% confidence, then re-observe.
disable-model-invocation: true
---

# OODA Loop

**Core rule:** For reversible moves under time pressure, act on ~70% confidence, then immediately re-observe. Cycle faster than the situation compounds; a late perfect plan loses to a fast loop.

## When to Use

- Incident response, outage, or ongoing degradation where state is still moving.
- Debugging a moving target (intermittent failure, live traffic shift).
- Any time-bounded decision where waiting for full certainty costs more than a reversible action.

## When NOT to Use

- The situation is static and you have time — deliberate analysis or a hypothesis differential wins.
- The next action is irreversible or high blast-radius — raise the evidence bar; 70% is not enough.
- You can cheaply localize the cause (read the failing diff, log, or metric) — test that hypothesis directly instead of looping in the dark.
- There is no time pressure and no changing environment — OODA adds churn without value.

## Procedure

1. **Observe (time-boxed):** gather the cheapest high-signal state now — metrics, logs, alerts, recent deploys/config, and feedback from the last action. Cap the window; do not collect forever.
2. **Orient:** match observations to a pattern and form **≥2** candidate explanations. Update or discard the mental model when data contradicts it; refuse single-hypothesis lock.
3. **Decide:** pick one reversible action that tests the leading hypothesis. State confidence (~70% threshold for reversible moves), the predicted effect, the observation you will check next, and a time box for that check.
4. **Act:** execute once, decisively, with a known rollback or degrade path.
5. **Re-observe immediately:** compare outcome to prediction within the time box; feed the result into the next Observe. Loop until stable or until the next move is no longer reversible enough for this skill.
6. **Stop condition:** exit the loop when the system is stable, the remaining work is static analysis, or the next step requires irreversible commitment — then switch method.

## Output

A cycle record (repeat per loop):

1. **Observed** — current signals and what changed since last cycle.
2. **Orientation** — ≥2 hypotheses; which one leads and why.
3. **Decision** — action, confidence, predicted effect, next observation, time box.
4. **Act + result** — what ran and what the immediate re-observe showed.
5. **Loop status** — continue / stable / escalate out of OODA.

## Verification

- **Falsify/stop:** if you cannot name a reversible next action and a near-term observation that would refute it, stop looping and gather more evidence or escalate. If re-observe never happens after act, the loop is broken — fix that before another action.
- **Over-application guard:** do not OODA static design work, irreversible launches, or cases where a single cheap localization check ends the uncertainty. Do not wait for 100% confidence on reversible mitigations under active incident pressure.
