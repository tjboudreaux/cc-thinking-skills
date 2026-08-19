#!/usr/bin/env bash
set -euo pipefail

# Determine repo root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if ! command -v ocx >/dev/null 2>&1; then
  echo "Error: ocx CLI not found on PATH." >&2
  echo "Install it via: curl -fsSL https://ocx.kdco.dev/install.sh | sh" >&2
  exit 1
fi

# Ensure .opencode-registry/files/skills symlink exists
mkdir -p .opencode-registry/files
if [ ! -e .opencode-registry/files/skills ]; then
  ln -sf ../../skills .opencode-registry/files/skills
fi

OUT_DIR=".opencode-registry/dist"
if [ $# -gt 0 ] && [[ "$1" != -* ]]; then
  OUT_DIR="$1"
  shift
fi

echo "Building OCX registry from .opencode-registry/ to ${OUT_DIR}..."
ocx build .opencode-registry --out "${OUT_DIR}" "$@"

echo "OCX registry successfully built to ${OUT_DIR}."
