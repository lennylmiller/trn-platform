# TRN Platform Component-Demo: Feature Parity Strategy

## Context

Two apps exist for QC training delivery:

1. **QC Training web app** (`training/QC-Training/web/`) — vibe-coded React+Express app, running at localhost:5173. Fully functional with real-time SSE execution, composition presentation mode, flow runner with pause/resume/abort, block editing, two-layer content model (narrative + technical), and database-driven content from `qc_training`.

2. **TRN Platform component-demo** (`inner-agility.dev/trn-platform/apps/component-demo/`) — properly architected 4-layer monorepo (server → data-access → feature → ui-mui). Has 4 tab pages with hardcoded mock data and simulated execution (setTimeout). Not wired to the Express API. Missing the execution domain's frontend layers entirely.

**Goal:** Get component-demo to feature parity with the working QC Training web app, leveraging the TRN Platform's existing architecture rather than bolting on vibe-coded patterns.

## Feature Gap Analysis

| Feature | QC Training Web | TRN Component-Demo |
|---------|----------------|-------------------|
| Steps CRUD | Full (list, create, edit, delete by category) | List only (mock data) |
| Flows CRUD | Full (list, create, edit, reorder steps) | List only (mock data) |
| Compositions CRUD | Full (list, create, edit, block reorder, picker modals) | List only (mock data) |
| Composition Run/Present | Full (stepped presentation, progress dots, story/tutorial modes) | Not implemented |
| Flow Execution | Full (SSE streaming, pause/resume/abort, real-time log) | Simulated (setTimeout) |
| SQL Display Queries | Full (auto-run after step completion, results display) | Not implemented |
| Two-Layer Content | Full (narrative + technical, collapsible details) | Not implemented |
| Block Editing | Full (drag reorder, debounced auto-save, properties panel) | Not implemented |
| Live API connection | Express on port 3847 | Not wired (TanStack Query configured for port 3001) |

## Strategy: 4 Phases

### Phase 1: Wire the Plumbing (Execution Domain + API Connection)
**Why first:** Everything downstream depends on real data flowing.

1. **Build execution domain frontend layers** (the biggest gap per sprint-1-scaffold.md):
   - `packages/execution/data-access/` — `useExecuteStep`, `useExecuteFlow`, `useExecutionStatus` hooks, SSE EventSource hook
   - `packages/execution/feature/` — orchestration: flow execution state machine (idle → running → paused → complete), step queuing, pause/resume/abort logic
   - `packages/execution/ui-mui/` — `ConsoleDrawer`, `ExecutionControls` (run/pause/resume/abort buttons), `ProgressBar`, `StreamingOutput` (monospace log with stdout/stderr coloring)

2. **Verify Express API** (`pnpm server:dev` on port 3001) serves the same endpoints the web app uses (steps, flows, compositions, execute)

3. **Wire component-demo** to live API — the QueryClient is already configured, just needs the server running and data seeded

**Key files:**
- `packages/execution/server/src/routes/` — already exists (SSE, executor)
- `packages/execution/data-access/` — create
- `packages/execution/feature/` — create  
- `packages/execution/ui-mui/` — create
- `server/` root — verify routes mount correctly

### Phase 2: Composition Presentation Mode
**Why second:** This is the killer feature of the web app — the stepped narrative walkthrough.

1. Add a `CompositionRunPage` to component-demo (or enhance RunPage) that:
   - Fetches a composition + blocks from the API
   - Renders blocks in sequence with progress indicator (dots/steps)
   - Supports story mode (narrative foregrounded, technical in `<details>`) and tutorial mode (technical foregrounded)
   - Renders markdown via `react-markdown` (already in QC Training web)
   - Embeds flow execution within flow blocks (using Phase 1's execution components)

2. Block type rendering:
   - **Narrative blocks** → markdown content + collapsible technical details
   - **Flow blocks** → flow description + "Run Flow" button → SSE execution
   - **Note blocks** → styled alert box with technical content
   - **Composition blocks** → link to open another composition

**Key packages to consume:**
- `@trn-platform/compositions-ui-mui` — existing composition components
- `@trn-platform/execution-ui-mui` — from Phase 1

### Phase 3: CRUD Operations
**Why third:** The editing experience makes it a complete authoring tool, not just a viewer.

1. **Steps tab:** wire to `@trn-platform/steps-ui-mui` components with create/edit/delete mutations
2. **Flows tab:** wire to `@trn-platform/flows-ui-mui` with step reordering (drag-drop), step picker
3. **Compositions tab:** wire to `@trn-platform/compositions-ui-mui` with:
   - Block add/edit/delete
   - Drag-to-reorder blocks
   - Flow picker modal (embed flow in flow block)
   - Composition picker modal (link to another composition)
   - Debounced auto-save on block property edits

### Phase 4: Polish & Parity
1. SQL display queries (auto-run after step completion, render results in table/modal)
2. Presenter notes (collapsible per-block notes)
3. Flow configuration (per-step pause points, visible_in_execution toggle)
4. localStorage persistence for flow configs (matching web app pattern)

## Verification

After each phase:
1. `pnpm server:dev` — Express API on port 3001
2. `pnpm --filter @trn-platform/component-demo dev` — Vite dev server
3. Compare feature-by-feature against QC Training web at localhost:5173
4. `pnpm test` — all existing tests still pass
5. `pnpm storybook` — stories render correctly with new execution components

## Key Insight

The web app's entire codebase lives in ~15 files (flat React + Express). The TRN Platform has the same logic distributed across 4 layers x 4 domains = 16+ packages. The strategy is NOT to port code line-by-line, but to:
- Use the web app as the **functional spec** (what it does)
- Use the TRN Platform architecture as the **structural spec** (how it's organized)
- Build each feature through the proper layer chain: server route → data-access hook → feature hook → ui-mui component
