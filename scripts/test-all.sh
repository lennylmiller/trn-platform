#!/usr/bin/env bash
set -euo pipefail

echo "=== Typecheck ==="
pnpm typecheck

echo "=== Lint ==="
pnpm lint

echo "=== Unit Tests ==="
pnpm test

echo "=== Build ==="
pnpm build

echo "=== All checks passed ==="
