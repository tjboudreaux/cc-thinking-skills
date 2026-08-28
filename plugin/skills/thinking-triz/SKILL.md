---
name: thinking-triz
description: When two design requirements seem mutually exclusive, name the contradiction, separate conflicting states, then invent a concrete no-compromise resolution.
disable-model-invocation: true
---

# TRIZ

Resolve technical design contradictions without midpoint compromise. Name the conflict, separate the opposing states, and transform the system so both benefits hold.

## When to Use

- Architecture, API, or system parameters pull in opposite directions (stable vs evolving, fresh vs cached, strict vs frictionless).
- You are about to accept a trade-off because "you can't have both."
- Every candidate solution shares the same structural weakness—the conflict is in the requirements, not the options list.

## When NOT to Use

- One option is simply better under stated constraints → pick it; do not manufacture a contradiction.
- A cheap measurement shows which side actually matters → measure instead of inventing a separation.
- A standard pattern already resolves it (cache-aside, CQRS, feature flags, versioning) → apply the pattern directly.
- Non-technical people/org conflicts → out of scope; separation targets system parameters.
- Ordinary prioritization or resource allocation without opposing states of the same parameter.

## Procedure

1. **Name the contradiction in template form.** Write: "We need [PARAMETER] to be [STATE_1] for [BENEFIT_1] BUT [STATE_2] for [BENEFIT_2]." If this form fails, stop—use another method.
2. **State the ideal final result (IFR).** Describe both benefits held with minimal new machinery and no permanent midpoint sacrifice.
3. **Try separation before invention.** Test, in order: **time** (different moments), **space** (different components/layers), **condition** (context, load, risk), **scale** (interface vs implementation, aggregate vs element). Keep the first separation that delivers both benefits without hidden compromise.
4. **If separation fails, apply an inventive transform.** Prefer resource-light moves: segmentation, preliminary action, inversion (push/pull), intermediary, copying/replication, dynamization (flags/config), another dimension (metadata/versioning/events). Scan only principles that map to the named parameter conflict.
5. **Reuse existing resources first.** Before adding services or stores, check data, traffic, headers, schedulers, and side effects already present that can carry the separation.
6. **Lock a concrete resolution and stop.** Specify the design change, where each state lives, and how both benefits are preserved. Stop when a no-compromise design is stated, or when honest analysis shows only a constrained trade-off remains—then document the residual trade-off explicitly rather than forcing TRIZ theater.

## Output

Emit a TRIZ resolution:

- `contradiction`: parameter / state_1+benefit_1 / state_2+benefit_2
- `ideal_final_result`: both benefits without permanent compromise
- `separation_tried`: time | space | condition | scale → result each
- `inventive_move`: principle or pattern used if separation alone was insufficient (or none)
- `resources_reused`: existing capabilities leveraged
- `resolution`: concrete design decision and where each state holds
- `residual_tradeoff`: none, or the honest remaining compromise

## Verification

- **Template gate:** if the contradiction cannot be written in the required form, do not apply TRIZ.
- **No-compromise check:** a pure midpoint on the trade-off curve without a separation or inventive move is a failed application.
- **Separation-first:** principles without attempted time/space/condition/scale separation are incomplete.
- **Over-application guard:** if measurement or a standard pattern settles the design, skip TRIZ.
- **Stop:** one named contradiction → separation/inventive pass → concrete resolution; do not cycle principles as decoration.
