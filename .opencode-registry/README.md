# OCX Registry: Claude Code Thinking Skills

This directory defines the [OCX](https://ocx.kdco.dev) component registry for Claude Code Thinking Skills.

## Quick Start

### 0. Initialize OCX (one-time global setup, or run `ocx init` inside a project)

```bash
ocx init --global
```

### 1. Add the Registry

Add this registry to your OpenCode configuration (global with `--global` or project-level):

```bash
ocx registry add https://tjboudreaux.github.io/cc-thinking-skills/registry --name thinking-skills --global
```

### 2. Install Skills

Install individual skills into `.opencode/skills/`:

```bash
# Install a specific thinking skill
ocx add thinking-skills/thinking-pre-mortem
ocx add thinking-skills/thinking-scientific-method
ocx add thinking-skills/thinking-first-principles
```

Or install all 28 thinking skills at once using the `all` bundle:

```bash
# Install the entire catalog (all 28 skills)
ocx add thinking-skills/all
```

### 3. Global Installation (Profiles)

To install globally for an OCX profile:

```bash
ocx add thinking-skills/all --global
# or for a specific profile
ocx add thinking-skills/all -p my-profile
```

## Available Components

The registry includes 29 components:
- **`all`** (`bundle`) — Meta-component that depends on and installs all 28 thinking skills.
- **28 individual `skill` components** matching the `thinking-*` skills in [`../skills/`](../skills/).

## Building Locally

To build the registry artifact locally:

```bash
./.opencode-registry/build.sh
```

This validates `registry.jsonc`, resolves the component files from `../skills/`, and outputs the registry packuments to `.opencode-registry/dist/`.
