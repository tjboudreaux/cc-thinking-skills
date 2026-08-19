# Claude Code thinking skills

> 28 portable Agent Skills for structured reasoning in Claude Code, GitHub Copilot, Codex, Cursor, and other compatible tools

Claude Code Thinking Skills is a public catalog of Agent Skills. Use it for decisions, diagnosis, systems, risk, strategy, and innovation. Each skill gives an agent a clear procedure. Use a skill when its mechanism fits the task.

![Claude Code thinking skills banner](assets/readme-banner.png)

## Contents

Jump to [why use this catalog](#why-use-this-catalog), [quick start](#quick-start), [use a skill](#use-a-skill), [skill catalog](#skill-catalog), [evidence](#evidence), [repository layout](#repository-layout), [checks and contribution](#checks-and-contribution), [questions](#questions), or [license](#license).

## Why use this catalog

Use these skills when a problem needs a clear reasoning frame. The catalog covers diagnosis, decisions, creation, risk, execution, product, and strategy.

Read the [catalog audit](analysis/AUDIT.md) before making performance claims.

## Quick start

### Skills CLI

```bash
npx skills add tjboudreaux/cc-thinking-skills
```

Install all skills without prompts:

```bash
npx skills add tjboudreaux/cc-thinking-skills --all
```

### Claude Code plugin

```text
/plugin marketplace add tjboudreaux/cc-thinking-skills
/plugin install thinking-skills@thinking-skills-marketplace
```

### OpenCode (via OCX)

Add the registry:

```bash
ocx registry add https://tjboudreaux.github.io/cc-thinking-skills/registry --name thinking-skills
```

Install a specific skill:

```bash
ocx add thinking-skills/thinking-pre-mortem
```

Or install all 28 skills at once:

```bash
ocx add thinking-skills/all
```

### Copy from a clone

```bash
git clone https://github.com/tjboudreaux/cc-thinking-skills.git
mkdir -p /path/to/project/.agents/skills
cp -R cc-thinking-skills/skills/* /path/to/project/.agents/skills/
```

Claude Code can also load the same directories from `~/.claude/skills/` or `.claude/skills/`.

## Use a skill

Start with the router when the right frame is unclear:

```text
Use thinking-model-router to choose the right framework for this problem.
```

Invoke a leaf skill when the match is clear:

```text
Use thinking-scientific-method to localize this bug.
Use thinking-reversibility to classify this architecture decision.
Use thinking-pre-mortem to stress-test this launch plan.
Use thinking-theory-of-constraints to find the binding bottleneck.
```

The Claude Code plugin uses `thinking-skills:thinking-model-router` as the exact router ID. The router can return `NONE`, one skill, or up to three complementary skills.

## Skill catalog

The 28 active skill IDs match the directories under [`skills/`](skills/)

### Route and compose

- [`thinking-model-router`](skills/thinking-model-router/); choose `NONE`, one frame, or a few complementary frames
- [`thinking-model-combination`](skills/thinking-model-combination/); sequence distinct models when one model leaves a blind spot

### Diagnose and understand

- [`thinking-scientific-method`](skills/thinking-scientific-method/); rank causes and test the cheapest discriminator
- [`thinking-five-whys-plus`](skills/thinking-five-whys-plus/); find systemic causes after localization
- [`thinking-kepner-tregoe`](skills/thinking-kepner-tregoe/); compare IS/IS-NOT defects and must/want options
- [`thinking-systems`](skills/thinking-systems/); map flows, feedback, delays, and high-impact points
- [`thinking-map-territory`](skills/thinking-map-territory/); resolve conflicts between docs and live behavior
- [`thinking-cynefin`](skills/thinking-cynefin/); classify the cause-and-effect domain
- [`thinking-socratic`](skills/thinking-socratic/); expose hidden requirements with direct questions

### Decide and evaluate

- [`thinking-reversibility`](skills/thinking-reversibility/); separate easy-to-undo choices from costly commitments
- [`thinking-opportunity-cost`](skills/thinking-opportunity-cost/); compare a choice with the top forgone use of resources
- [`thinking-probabilistic`](skills/thinking-probabilistic/); forecast with base rates, ranges, and belief updates
- [`thinking-second-order`](skills/thinking-second-order/); trace delayed effects, incentives, and feedback
- [`thinking-steel-manning`](skills/thinking-steel-manning/); build the strongest opposing case before deciding
- [`thinking-bounded-rationality`](skills/thinking-bounded-rationality/); set a good-enough threshold and stop the search
- [`thinking-circle-of-competence`](skills/thinking-circle-of-competence/); check the evidence boundary before answering
- [`thinking-lindy-effect`](skills/thinking-lindy-effect/); weigh durability while checking for domain change

### Create and improve

- [`thinking-first-principles`](skills/thinking-first-principles/); separate physics from convention and rebuild from basics
- [`thinking-triz`](skills/thinking-triz/); resolve apparently incompatible design requirements
- [`thinking-via-negativa`](skills/thinking-via-negativa/); remove harmful or nonessential elements first
- [`thinking-thought-experiment`](skills/thinking-thought-experiment/); test controlled what-if scenarios when real tests cost too much
- [`thinking-jobs-to-be-done`](skills/thinking-jobs-to-be-done/); understand the progress users hire a product to make
- [`thinking-effectuation`](skills/thinking-effectuation/); act from available means under uncertainty

### Manage risk and execution

- [`thinking-pre-mortem`](skills/thinking-pre-mortem/); turn failure paths into fixes and stop checks
- [`thinking-red-team`](skills/thinking-red-team/); review authorized attack paths with reproducible findings
- [`thinking-margin-of-safety`](skills/thinking-margin-of-safety/); size buffers against error and breach cost
- [`thinking-theory-of-constraints`](skills/thinking-theory-of-constraints/); find and manage the binding throughput constraint
- [`thinking-ooda`](skills/thinking-ooda/); act while a time-pressured situation changes

## Evidence

The catalog audit reports:

- 28 active skills, all manual-only
- no automatic-retain verdict
- `portfolio-v1` with zero model calls and an unmeasured result
- a provisional `thinking-scientific-method` row at +4.0 percentage points

The +4.0-point row is below the +5-point utility margin and has evidence gaps. Treat it as directional evidence, not an accuracy claim. See the [decision-ready audit](analysis/AUDIT.md) and [`analysis/evidence.json`](analysis/evidence.json)

## Repository layout

```text
skills/          Agent Skill source
scripts/         skill validation
evals/           structural, routing, and outcome evals
analysis/        evidence registry and audit
.claude-plugin/  Claude Code metadata
```

Study artifacts live under [`evals/studies/`](evals/studies/). External datasets follow their license limits.

## Checks and contribution

Validate skill structure:

```bash
node scripts/validate-skills.js
```

Run the local structural gate:

```bash
EVAL_RUN=local node evals/run-structural.js
```

Run routing evaluation with the authenticated `droid` CLI:

```bash
EVAL_RUN=local node evals/run-routing.js
```

Read the [evaluation harness guide](evals/README.md) and [CONTRIBUTING.md](CONTRIBUTING.md) before changing the catalog.

To add a skill, create `skills/thinking-{name}/SKILL.md` with Agent Skills YAML front matter, a precise trigger, a non-trigger boundary, a procedure, and checks. Run validation and the relevant evaluation before submitting.

## Questions

### Which skill should I start with?

Use `thinking-model-router` when the fit is unclear. Use a leaf skill when the task already names its mechanism.

### Can I use a skill without the router?

Yes. Invoke any skill directly when its trigger matches.

### Do these skills guarantee better model accuracy?

No. The evidence supports structured procedures, not a guaranteed accuracy gain.

## License

MIT License. See [LICENSE](LICENSE) for the full text.
