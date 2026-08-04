# Claude Code Thinking Skills

> **28 Mental Models and Critical-Thinking Frameworks for Claude Code, GitHub Copilot, Codex, Cursor, and other Agent Skills-compatible tools**

**Claude Code Thinking Skills is a portable [Agent Skills](https://agentskills.io) catalog of 28 mental-model and critical-thinking frameworks for decisions, debugging, systems, risk, and strategy.** It originated for Claude Code and now works across GitHub Copilot, Codex, Cursor, and other compatible agents. Each skill packages a proven thinking framework — from first-principles reasoning to the theory of constraints — into a skill an agent can invoke by name, and the whole collection is backed by a transparent, replication-gated evaluation pipeline.

[![Claude Code Skills](https://img.shields.io/badge/Claude_Code-Skills-7C3AED?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMiA3TDEyIDEyTDIyIDdMMTIgMloiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMiAxN0wxMiAyMkwyMiAxNyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0yIDEyTDEyIDE3TDIyIDEyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+)](https://github.com/tjboudreaux/cc-thinking-skills)
[![Agent Skills Compatible](https://img.shields.io/badge/Agent_Skills-compatible-0A7EA4?style=flat)](https://agentskills.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Skills Count](https://img.shields.io/badge/Skills-28-blue)](https://github.com/tjboudreaux/cc-thinking-skills)

![Claude Code Thinking Skills banner](assets/readme-banner.png)

## TL;DR — At a Glance

| | |
|---|---|
| **What it is** | A portable Agent Skills library of 28 mental-model and critical-thinking frameworks. |
| **Who it's for** | Engineers, founders, and analysts who want compatible AI agents to reason with structured frameworks instead of ad-hoc heuristics. |
| **How to start** | Run `npx skills add tjboudreaux/cc-thinking-skills`, then invoke `thinking-model-router` to be routed to the right skill. |
| **License** | MIT — free to use, modify, and distribute. |
| **Evidence** | Every skill ran through a replication-gated [Elevate-or-Kill evaluation pipeline](analysis/ELEVATE-OR-KILL-SCORECARD.md). The honest headline: **zero skills currently hold a robust, replicated ELEVATE verdict** — and we publish that result rather than hide it. |
| **Entry point** | `thinking-model-router` → **START HERE** |

## Table of Contents

- [Why This Project Is Different](#why-this-project-is-different)
- [Features](#features)
- [Quick Start](#quick-start)
- [Verified distribution](#verified-distribution)
- [Available Skills](#available-skills)
- [How the Skills Were Evaluated](#how-the-skills-were-evaluated)
- [Quality Assurance Tools](#quality-assurance-tools)
- [Detailed Skill Descriptions](#detailed-skill-descriptions)
- [FAQ](#faq)
- [Contributing](#contributing)
- [Keywords](#keywords)
- [Related Resources](#related-resources)
- [License](#license)
- [Author](#author)

## Why This Project Is Different

Most "AI prompt pack" repositories claim their content makes models smarter and never test the claim. This project did the opposite: it built an objective, length-controlled, replication-gated evaluation harness and evaluated the 39-skill legacy catalog. The result is documented openly, including the inconvenient finding that **no skill yet meets the bar for a proven, replicated accuracy gain.**

That rigor is the point. These skills are useful structured-reasoning scaffolds grounded in established frameworks, and the evaluation methodology is honest enough to tell you exactly how strong the evidence is. Transparency over hype is the standard here.

## Features

- **28 Thinking Frameworks** — A curated library of mental models for decision-making, debugging, and strategy.
- **Eval-Backed and Honest** — Built and tested with a rigorous, replication-gated evaluation pipeline; see the [Elevate-or-Kill Scorecard](analysis/ELEVATE-OR-KILL-SCORECARD.md).
- **Battle-Tested Foundations** — Grounded in frameworks from cognitive science, systems thinking, and strategic analysis (Munger, Meadows, Kahneman, Goldratt, Altshuller/TRIZ, Boyd/OODA).
- **Claude Code Native, Agent Skills Portable** — First-class Claude Code marketplace support plus the shared Agent Skills format used by GitHub Copilot, Codex, Cursor, and other compatible tools.
- **Quality Scripts** — Tooling to validate, score, and improve skill quality.
- **Zero Configuration** — Install through a supported client and invoke skills by name; no framework setup required.

## Quick Start

### skills.sh / `npx skills`

Use the skills.sh CLI to discover the catalog and choose skills or target agents interactively:

```bash
npx skills add tjboudreaux/cc-thinking-skills
```

For a non-interactive all-skill, all-agent installation:

```bash
npx skills add tjboudreaux/cc-thinking-skills --all
```

### GitHub CLI

Install all 28 skills from the immutable release:

```bash
gh skill install tjboudreaux/cc-thinking-skills --all --pin v1.0.0
```

The pin makes the source reproducible. Without `--pin`, GitHub Skills resolves the latest release before falling back to default-branch `HEAD`.

### Claude Code Marketplace

Claude Code users can install the native plugin wrapper:

```bash
# Add the marketplace
/plugin marketplace add tjboudreaux/cc-thinking-skills

# Install the plugin
/plugin install thinking-skills@thinking-skills-marketplace
```

### Clone and Copy Fallback

Clone the repository once:

```bash
git clone https://github.com/tjboudreaux/cc-thinking-skills.git
```

For agents using the shared project-level Agent Skills location:

```bash
mkdir -p /path/to/project/.agents/skills
cp -R cc-thinking-skills/skills/* /path/to/project/.agents/skills/
```

For Claude Code, copy to the global or project-specific Claude skills directory:

```bash
mkdir -p ~/.claude/skills /path/to/project/.claude/skills
cp -R cc-thinking-skills/skills/* ~/.claude/skills/
# Or:
cp -R cc-thinking-skills/skills/* /path/to/project/.claude/skills/
```

Other clients should use the skills directory documented by that client.

### Development: Load as a Local Claude Code Plugin

For Claude Code testing or development:

```bash
claude --plugin-dir ./cc-thinking-skills
```

### Usage

Once installed, ask your compatible agent to invoke a skill by name, or use the client's documented skill command. **If you're not sure which framework fits, start with `thinking-model-router`** and let it route you:

```
> Use the thinking-model-router to pick the right framework for this problem
> Use first-principles thinking to analyze this architecture decision
> Apply the pre-mortem framework to this project plan
> Help me use probabilistic reasoning to evaluate this hypothesis
> Use the theory of constraints to find our bottleneck
```

## Verified distribution

| Surface | Route | Status |
|---|---|---|
| skills.sh | [Listing](https://skills.sh/tjboudreaux/cc-thinking-skills) · [refresh issue](https://github.com/vercel-labs/skills/issues/1868) | submitted |
| GitHub Skills / Awesome Copilot | [v1.0.0 release](https://github.com/tjboudreaux/cc-thinking-skills/releases/tag/v1.0.0) · [Awesome Copilot intake](https://github.com/github/awesome-copilot/issues/2544) | verified (direct install); submitted (Awesome Copilot) |
| SkillsMP | [Repository listing](https://skillsmp.com/creators/tjboudreaux/cc-thinking-skills) | sync pending |
| ClawHub | [v1.0.0 source](https://github.com/tjboudreaux/cc-thinking-skills/tree/v1.0.0) · `npx clawhub sync --root ./skills --owner tjboudreaux --all` | authentication required |
| officialskills.sh | [officialskills.sh](https://officialskills.sh) · [upstream PR](https://github.com/VoltAgent/awesome-agent-skills/pull/874) | submitted |

## Available Skills

All 28 shipped skills, grouped by domain. The meta-skill `thinking-model-router` is the recommended entry point.

### Decision Making & Analysis

| Skill | Description | Best For |
|-------|-------------|----------|
| `thinking-first-principles` | Break problems into fundamental truths | Innovation, challenging assumptions |
| `thinking-second-order` | Think beyond immediate consequences | Strategic decisions, policy changes |
| `thinking-pre-mortem` | Imagine failure and work backward | Project kickoffs, risk assessment |
| `thinking-kepner-tregoe` | Systematic rational process for complex analysis | High-stakes decisions, root cause analysis |
| `thinking-reversibility` | Classify decisions by reversibility (Type 1/2) | Commitment sizing, risk assessment |
| `thinking-opportunity-cost` | Evaluate choices by what you give up | Resource allocation, prioritization |

### Cognitive & Behavioral

| Skill | Description | Best For |
|-------|-------------|----------|
| `thinking-bounded-rationality` | Make good-enough decisions under constraints | Time pressure, satisficing |
| `thinking-socratic` | Systematic questioning framework | Requirements, debugging, coaching |
| `thinking-probabilistic` | Calibrated probability estimation | Forecasting, uncertainty quantification |
| `thinking-steel-manning` | Argue the strongest opposing position | Debate, decision validation |

### Systems & Strategy

| Skill | Description | Best For |
|-------|-------------|----------|
| `thinking-systems` | Analyze interconnected systems | Complex debugging, architecture |
| `thinking-ooda` | Rapid decision-making for dynamic situations | Incident response, competitive scenarios |
| `thinking-theory-of-constraints` | Identify and manage bottlenecks | Performance optimization, throughput |
| `thinking-cynefin` | Classify problems by complexity domain | Methodology selection, approach matching |

### Problem Solving & Innovation

| Skill | Description | Best For |
|-------|-------------|----------|
| `thinking-map-territory` | Recognize limits of mental models | Expectation mismatches, abstractions |
| `thinking-circle-of-competence` | Know the boundaries of expertise | Delegation, learning decisions |
| `thinking-triz` | Resolve technical contradictions | Engineering design, innovation |
| `thinking-five-whys-plus` | Enhanced root cause analysis with bias guards | Debugging, incident postmortems |
| `thinking-scientific-method` | Hypothesis-differential debugging | Fault localization, ambiguous symptoms |
| `thinking-thought-experiment` | Structured imagination for exploration | Architecture, edge cases, philosophy |

### Estimation & Risk

| Skill | Description | Best For |
|-------|-------------|----------|
| `thinking-margin-of-safety` | Build in buffers for uncertainty | Risk management, system design |
| `thinking-lindy-effect` | Older things likely to last longer | Technology selection, durability |
| `thinking-via-negativa` | Improve by removing, not adding | Simplification, robustness |
| `thinking-red-team` | Attack your own plans adversarially | Security review, plan validation |

### Product & Innovation

| Skill | Description | Best For |
|-------|-------------|----------|
| `thinking-jobs-to-be-done` | Understand the job customers hire products for | Product development, feature design |
| `thinking-effectuation` | Start with means, not goals | Startups, innovation, uncertainty |

### Meta-Skills

| Skill | Description | Best For |
|-------|-------------|----------|
| `thinking-model-router` | **START HERE** - Route to the right model by domain | Entry point for all thinking skills |
| `thinking-model-combination` | Combine multiple models for richer analysis | Complex problems, high-stakes decisions |

## How the Skills Were Evaluated

Honesty about evidence is a core feature of this project, so the evaluation results are reported plainly.

- **The evidence base:** Historical coverage is heterogeneous and remains provisional. The corrected `portfolio-v1` gate made zero model calls because power, dataset, and judge-calibration requirements were not met.
- **The headline result:** **Zero skills currently hold a robust, replicated ELEVATE verdict.** All 28 shipped skills are manual-only; none is proven to improve model accuracy.
- **The closest historical candidate:** `thinking-scientific-method` recorded a provisional **+4.0pp** fault-localization lift in its larger-N July artifact. Although its recomputed McNemar result was significant, the effect is below the predeclared +5pp utility margin and the study has scoring, control, denominator, and raw-archive defects. It is directional evidence only, not ELEVATE.
- **What that means for you:** Treat these skills as structured-reasoning scaffolds, not guaranteed accuracy improvements. The audit preserves the useful frameworks while keeping unsupported performance claims out of the product.

Read the evidence yourself:

- [Decision-ready audit](analysis/AUDIT.md) — catalog dispositions, study citations, and explicit evidence gaps.
- [Canonical evidence registry](analysis/evidence.json) — machine-readable authority for counts, claims, and product dispositions.

The shipped catalog now contains 28 skills. Eleven unsupported or overlapping skills were removed at the evidence-backed cutover; their unique mechanisms were absorbed into surviving skills and their historical evidence remains preserved.

## Quality Assurance Tools

This collection includes a small, outcome-focused harness:

### Outcome Evals

The `evals/` directory contains the current harness:

- **Structural validation** for frontmatter, catalog metadata, and format checks
- **Routing evals** for skill discoverability and false-positive control
- **Generic objective evals** with exact, boolean, abstention, numeric, probability, and strict file-localization scorers
- **Generic blind pairwise evals** for rubric-based comparisons
- **Evidence registry checks** that fail closed when provenance or confirmatory gates are incomplete

### Validate Skills

Check all skills against quality criteria:

```bash
node scripts/validate-skills.js
```

Outputs a report showing:
- Required sections present/missing
- Quality metrics (examples, tables, checklists)
- Overall score per skill
- Skills needing attention


## Detailed Skill Descriptions

### First Principles Thinking
Strip away assumptions to reveal fundamental truths, then rebuild solutions from basics. Championed by Elon Musk and rooted in Aristotle's philosophy.

**When to use:**
- Conventional approaches have failed
- You're told something is "impossible"
- Need innovation, not incremental improvement

### Probabilistic Reasoning
Estimate uncertainty, update priors with evidence, and expose assumptions and calibration.

**When to use:**
- Estimating probabilities or likelihoods
- Interpreting test results or metrics
- Making decisions with incomplete information

### Systems Thinking
View problems as part of interconnected wholes with feedback loops and emergent properties. Essential for debugging complex distributed systems.

**When to use:**
- Debugging spans multiple components
- Fix in one place breaks another
- Behavior seems emergent or unexpected

### Theory of Constraints
Every system has exactly one constraint limiting throughput. Optimizing anything else is wasted effort. Based on Eliyahu Goldratt's work.

**When to use:**
- Performance optimization
- Process improvement
- Resource allocation
- Identifying bottlenecks

### Scientific Method / Hypothesis-Differential Debugging
Localize an ambiguous bug by enumerating falsifiable hypotheses, ranking them by likelihood x cheapness-to-check, and making the cheapest discriminating observation first. This is the most empirically scrutinized skill in the collection (final verdict: DIRECTIONAL-NOT-REPLICATED — see [evaluation results](#how-the-skills-were-evaluated)).

**When to use:**
- A symptom could plausibly come from several files/functions/components
- You can inspect code, logs, diffs, traces, or tests now
- You need to localize the fault before applying root-cause analysis

### Cynefin Framework
Classify problems by the relationship between cause and effect: Clear, Complicated, Complex, or Chaotic. Each domain requires a different approach.

**When to use:**
- Choosing methodologies
- Understanding why approaches fail
- Crisis management

### Jobs to Be Done
Customers don't buy products—they hire them to do jobs. Understanding the job unlocks innovation.

**When to use:**
- Product development
- Feature prioritization
- Understanding customer behavior

### Red Team Thinking
Attack your own plans before adversaries do. The best defense is knowing your weaknesses.

**When to use:**
- Security review
- Pre-launch preparation
- Plan stress-testing

## FAQ

### What are Claude Code thinking skills?
Claude Code Thinking Skills is a portable catalog of 28 reusable mental-model and critical-thinking frameworks in the Agent Skills format. Each one gives a compatible AI agent a structured method — such as first-principles reasoning, probabilistic updating, or the theory of constraints — for analyzing a specific kind of problem. You can invoke them by name in Claude Code, GitHub Copilot, Codex, Cursor, and other Agent Skills-compatible tools.

### How do I install the thinking skills?
Use `npx skills add tjboudreaux/cc-thinking-skills` for interactive installation, or add `--all` for a non-interactive all-skill, all-agent install. GitHub Skills users can run `gh skill install tjboudreaux/cc-thinking-skills --all --pin v1.0.0`; an unpinned install resolves the latest release before default-branch `HEAD`. Claude Code users can instead use the native plugin marketplace commands above. The clone/copy fallback supports `.agents/skills/`, `.claude/skills/`, or another client-documented skills directory.

### Which thinking skill should I start with?
Start with `thinking-model-router`. It's the meta-skill entry point that reads your problem and routes you to the most relevant framework, so you don't need to memorize all 28. If you already know your need — for example debugging, risk, or prioritization — you can invoke the specific skill directly.

### Do these skills actually improve model accuracy?
No skill is currently proven to improve accuracy. Every skill was run through a replication-gated evaluation, and **zero skills hold a robust, replicated ELEVATE verdict.** The closest candidate, `thinking-scientific-method`, scored +5.3pp (p=0.061, n=150) on its fresh primary run — directional but short of the p<0.05 gate — with a significant +8.0pp (p=0.001) replication; because a significant replication can't rescue a primary that fails the gate, its verdict is DIRECTIONAL-NOT-REPLICATED. Treat the skills as solid structured-reasoning scaffolds, not a guaranteed accuracy boost.

### What is the model-router skill?
`thinking-model-router` is a meta-skill that acts as the front door to the collection. Given a problem description, it identifies the domain (decision-making, systems, estimation, debugging, and so on) and points you to the most appropriate thinking framework. It exists so newcomers can get value without studying the entire catalog.

### Are these skills based on real research?
Yes. The frameworks draw on established work from thinkers including Charlie Munger (mental models), Donella Meadows (systems thinking), Daniel Kahneman (dual-process cognition), Eliyahu Goldratt (theory of constraints), Genrich Altshuller (TRIZ), and John Boyd (OODA loop). Beyond their source theory, the skills were also subjected to this project's own length-controlled, replication-gated evaluation pipeline, with all results published in the [Elevate-or-Kill Scorecard](analysis/ELEVATE-OR-KILL-SCORECARD.md).

### Are the skills free to use?
Yes. The entire collection is released under the MIT License, so you're free to use, modify, and distribute it. See the [LICENSE](LICENSE) file for the full terms.

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Adding New Skills

1. Create a new directory under `skills/` with the format `thinking-{name}`
2. Add a `SKILL.md` file with YAML frontmatter:
```yaml
---
name: thinking-your-skill-name
description: Brief description under 200 chars (used by compatible agents for skill matching)
---
```
3. Write comprehensive documentation with:
   - Overview and core principle
   - When to use decision flow
   - Step-by-step process
   - At least 2 practical examples
   - Reusable template
   - Verification checklist
   - Key questions

4. Validate your skill:
```bash
node scripts/validate-skills.js
```

## Keywords

`agent-skills` `skills-sh` `github-copilot` `codex` `cursor` `claude-code` `claude` `anthropic` `ai` `skills` `claude-code-skills` `mental-models` `critical-thinking` `decision-making` `problem-solving` `ai-reasoning` `systems-thinking` `first-principles` `probabilistic-reasoning` `uncertainty-estimation` `cognitive-bias` `strategic-thinking` `frameworks` `triz` `ooda` `pre-mortem` `socratic-method` `theory-of-constraints` `cynefin` `jobs-to-be-done` `red-team`

## Related Resources

- [Agent Skills specification](https://agentskills.io)
- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [Charlie Munger's Mental Models](https://fs.blog/mental-models/)
- [Thinking in Systems - Donella Meadows](https://www.chelseagreen.com/product/thinking-in-systems/)
- [Thinking, Fast and Slow - Daniel Kahneman](https://www.amazon.com/Thinking-Fast-Slow-Daniel-Kahneman/dp/0374533555)
- [The Goal - Eliyahu Goldratt](https://www.amazon.com/Goal-Process-Ongoing-Improvement/dp/0884271951)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

Created by [TJ Boudreaux](https://github.com/tjboudreaux)

---

**Found this useful?** Give it a star and share it with others who could benefit from better thinking frameworks in their AI agents.
