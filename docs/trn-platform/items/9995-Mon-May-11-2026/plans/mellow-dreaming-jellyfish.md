# Plan: Improve CLAUDE.md

## Context
The existing CLAUDE.md is comprehensive and well-structured. A few factual inaccuracies and minor gaps were found by comparing it against the actual `package.json` and source files.

## Changes

### 1. Fix MUI version: "MUI 7" → "MUI 9"
`package.json` has `@mui/material: ^9.0.0`. Update both occurrences (Project Overview paragraph and Stack line).

### 2. Fix `server:dev` description
CLAUDE.md says "tsx watch, port 3001" but the actual script is `node --watch server-dev.cjs` — a CJS wrapper that avoids ESM/CJS interop issues with `tedious`/`mssql` on WSL2. Update the comment.

### 3. Add missing test commands to Development Commands section
`test:storybook` and `test:storybook:watch` are referenced in the Vitest Configuration section but not listed in the commands block.

### 4. Add pnpm overrides note to Build System section
React, TanStack Query, and Vitest versions are pinned via `pnpm.overrides` in root `package.json` to prevent version conflicts across the monorepo. This is important context for anyone adding/updating dependencies.

## Files Modified
- `CLAUDE.md` (4 targeted edits)

## Verification
- Read the updated CLAUDE.md to confirm accuracy against `package.json` scripts
