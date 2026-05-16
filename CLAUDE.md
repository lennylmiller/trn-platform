# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TRN Platform is a Training & Demo platform for QC (Quality Care) systems, built as a pnpm monorepo with 7 domains. Each domain follows a strict 4-layer architecture using React 19, TypeScript (strict), MUI 9, TanStack Query 5, and SQL Server via Express as the backend.

**Stack:** React 19 · MUI 9 · Emotion · TanStack Query 5 · SQL Server (mssql) · Express 5 · Zod · Vitest · Storybook 10 · tsup · pnpm workspaces · changesets

## Environment Setup

Copy `.env.example` to `.env` and fill in `DB_USER`/`DB_PASSWORD`. Key variables:
- `AUTH_DISABLED=true` — bypasses JWT auth for local dev
- `VITE_API_URL=http://localhost:3001` — frontend API target
- `DB_TRUST_CERT=true` — trusts SQL Server self-signed certs locally
- Named databases configured via `DB_QC_TRAINING_DATABASE` and `DB_QC_CORE_DATABASE`

## Development Commands

```bash
# Testing
pnpm test                                                # All tests across all packages
pnpm --filter @trn-platform/steps-ui-mui test            # Single package
pnpm test:watch                                          # Watch mode
pnpm test:coverage                                       # Coverage reports
pnpm test:all                                            # Full check: typecheck + lint + test + build

# Visual regression (Playwright via Storybook)
pnpm test:visual
pnpm test:visual:update                                  # Update snapshots
pnpm test:visual:ui                                      # Interactive UI

# Building
pnpm build                                               # All packages (excludes component-demo)
pnpm build:all                                           # All packages including demo
pnpm typecheck                                           # Type checking across all packages
pnpm lint                                                # Linting

# Server
pnpm server:dev                                          # Express dev server (node --watch, CJS wrapper, port 3001)
pnpm server:build                                        # Build server with tsup
pnpm dev                                                 # Concurrently: server + storybook

# Database
pnpm db:migrate                                          # Run SQL migrations
pnpm db:seed                                             # Seed via sqlcmd

# Storybook (port 6006)
pnpm storybook                                           # Dev server
pnpm build-storybook                                     # Static build
pnpm test:storybook                                      # Story component tests (vitest in-browser)
pnpm test:storybook:watch                                # Story component tests (watch mode)

# Changesets
pnpm changeset                                           # Create changeset
pnpm version                                             # Version packages
```

## Architecture

### Layered Architecture (per domain, up to 4 layers)

```
server  →  data-access  →  feature  →  ui-mui  →  shared
(Express)  (TanStack Q)    (business)   (MUI)      (schemas/types)
```

- **`server/`** — Express routes + raw SQL queries via `mssql`. Handles validation, error responses, SSE streams.
- **`data-access/`** — TanStack Query hooks wrapping `fetch` calls to the Express API at `localhost:3001`. Query key factories, Zod response validation.
- **`feature/`** — Business logic hooks orchestrating data-access hooks. Filtering, sorting, derived state. Depends on `data-access`.
- **`ui-mui/`** — React components with MUI + Emotion. Co-located Storybook stories. Can depend on `feature` and `data-access`.

**Package naming:** `@trn-platform/{domain}-data-access`, `@trn-platform/{domain}-feature`, `@trn-platform/{domain}-ui-mui`

### Workspace Structure

```
packages/{domain}/data-access/   # TanStack Query hooks
packages/{domain}/feature/       # Business logic
packages/{domain}/server/        # Domain-specific Express routes
packages/{domain}/ui-mui/        # MUI components + stories
packages/shared/                 # Cross-domain schemas, types, constants, db
packages/mcp-server/             # MCP server for AI-assisted training (bin: trn-mcp)
server/                          # Root Express entry point, middleware, db migrations
apps/qc-training/                # Primary Vite app (full training platform UI)
apps/component-demo/             # Demo app (excluded from default build)
```

Note: `server/` at root (Express entry point + middleware) is distinct from `packages/*/server/` (domain route handlers). The root server imports and mounts domain routers at `/api/v2/{domain}` (e.g., `/api/v2/steps`, `/api/v2/flows`). Health check at `/api/health` (no auth).

### Critical Dependency Rules
- Never skip layers (ui-mui must not import data-access directly when feature exists for that use case)
- Never import across sibling domains
- All shared types/schemas live in `packages/shared/`
- Import by package name (`@trn-platform/...`), never relative paths across packages
- Import from package root only: `from '@trn-platform/shared'` not `from '@trn-platform/shared/types'`
- Exception: `@trn-platform/shared` exports sub-paths `./db` and `./tools` for server-side use

### 7 Domains
`steps`, `flows`, `compositions`, `execution`, `chat`, `stories`, `courses` — plus `shared` for cross-domain schemas, types, constants, and database utilities. All 7 domains have the full 4-layer stack (server, data-access, feature, ui-mui).

### Shared Package (`packages/shared/`)
- **Zod schemas** (`src/schemas/`) — API validation, types inferred via `z.infer<>`
- **TypeScript types** (`src/types/`) — domain types inferred from Zod schemas
- **Constants** (`src/constants/`) — SSE event names, step type colors, category labels
- **Database** (`src/db/`) — Multi-pool connection manager for SQL Server

## Database

### SQL Server — Dual Database

| Database | Purpose |
|----------|---------|
| `qc_training` | Training data: steps, flows, compositions, blocks |
| `qc_core` | Production reference: members, PCPs, claims, referrals |

Connection via `mssql` multi-pool. Environment variables: `DB_SERVER`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`.

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary keys | `INT IDENTITY` | SQL Server convention |
| String type | `NVARCHAR` | Unicode support |
| Auth | Express middleware | No RLS in SQL Server |
| ORM | None — raw parameterized SQL | Full SQL Server access |
| Real-time | Server-Sent Events (SSE) | Simpler than WebSocket for one-way streaming |
| Dedup/ordering | `seq` column + unique constraints | Deterministic ordering for flows and blocks |

### Tables (qc_training)
- `step_library` — PK: `step_id` INT IDENTITY
- `flow` — PK: `flow_id` INT IDENTITY
- `flow_step` — PK: `flow_step_id`; FK: `flow_id`, `step_id`; `seq` for ordering
- `composition` — PK: `composition_id` INT IDENTITY
- `composition_block` — PK: `block_id`; FK: `composition_id`, `flow_id` (nullable), `ref_composition_id` (nullable); `seq` for ordering

## Testing

### Configuration
- **Framework:** Vitest 4.x with jsdom environment
- **Coverage:** v8 provider, 80% thresholds (lines, functions, branches, statements)
- **Server tests:** supertest for Express route integration tests
- **Component tests:** React Testing Library + Vitest
- **MSW:** Used for Storybook mocking only (`.storybook/mocks/`). Unit tests mock at the hook level.

### Vitest Configuration
- **Base config:** `vitest.config.base.ts` — globals enabled, 80% coverage thresholds, v8 provider. All packages extend via `mergeConfig()`.
- **Root config:** `vitest.config.ts` — adds Storybook component testing project running in Chromium browser via `@storybook/addon-vitest`. This is separate from Playwright visual regression tests.
- **Storybook tests:** `pnpm test:storybook` runs story-level component tests in-browser. `pnpm test:visual` runs Playwright screenshot comparison tests.

### MUI Testing Gotchas
- **Heading/button text collision:** use `getByRole('heading', { name })` not `getByText()`
- **MUI Select:** use `getByRole('combobox')` not `getByLabelText()`
- **jsdom pragma:** add `// @vitest-environment jsdom` in `.tsx` test files if the package isn't configured for jsdom

## Storybook

- **Story pattern:** `packages/*/ui-mui/src/**/*.stories.tsx`
- **Workflow stories:** `.storybook/workflows/` — 5 workflows + standalone
- **Page compositions:** `.storybook/pages/` — full-page stories importing domain components
- **Path aliases** in `.storybook/main.ts` map `@trn-platform/*` to source directories
- **Addons:** docs, a11y, themes, vitest, msw-storybook-addon
- **MSW** for API mocking in stories (`.storybook/mocks/`)

### Workflows
1. **Build Demo** (wf1) — Author steps, create flow, add/configure steps, test run
2. **Present Flow** (wf2) — Select flow, start presentation, step through pauses, view results
3. **Author Story** (wf3) — Create composition, add blocks (narrative/flow/note), reorder, preview
4. **Run Training** (wf4) — Select composition, walk narrative, execute embedded flows, view SQL results
5. **Manage Steps** (wf5) — View library, edit, test, delete steps

## TypeScript Configuration

- **Base:** `tsconfig.base.json` — ES2022, ESNext modules, Bundler resolution, `react-jsx`
- **Strict mode** plus: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noImplicitReturns`, `noUncheckedIndexedAccess`

## Build System

- **tsup** for library builds: CJS + ESM + DTS, `--clean` flag
- `pnpm build` excludes `component-demo`; `pnpm build:all` includes it
- Shared package `dist/` must be current before running dependent package tests
- **pnpm overrides** in root `package.json` pin React, TanStack Query, and Vitest versions to prevent conflicts across the monorepo

---

**pnpm** >= 8.0.0 · **Node** >= 22.0.0

**Deep references:** `docs/trn-platform/0-vision/north-star.md` · `docs/trn-platform/4-reference/sql-server-config.md` · `docs/trn-platform/4-reference/pipeline-guide.md`

**Docs structure:** `docs/trn-platform/` uses a kanban-style layout: `0-vision/`, `1-specs/`, `2-on-deck/`, `3-done/`, `4-reference/`, `assets/`
