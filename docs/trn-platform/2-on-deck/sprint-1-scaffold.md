# Sprint 1: Scaffold the Monorepo

**Status:** In Progress
**Sprint Goal:** Establish the full monorepo structure with all packages, Storybook, and component-demo app.

## Completed

- [x] Initialize pnpm workspace with `pnpm-workspace.yaml`
- [x] Create `tsconfig.base.json` with strict TypeScript config
- [x] Create root `package.json` with all dev scripts
- [x] Scaffold `packages/shared/` with Zod schemas for all 4 domains
- [x] Scaffold `packages/steps/` (server, data-access, feature, ui-mui)
- [x] Scaffold `packages/flows/` (server, data-access, feature, ui-mui)
- [x] Scaffold `packages/compositions/` (server, data-access, feature, ui-mui)
- [x] Scaffold `packages/execution/` (server only -- ui layers TBD)
- [x] Implement server layer for all 4 domains (routes + queries)
- [x] Implement data-access layer with TanStack Query hooks
- [x] Implement feature layer with business logic hooks
- [x] Implement ui-mui layer with MUI components and stories
- [x] Create `.storybook/` configuration (main.ts, preview.tsx)
- [x] Create MSW mock data and handlers
- [x] Create 5 workflow story suites (26 stories + 5 FullFlow)
- [x] Create 3 standalone stories
- [x] Create 8 page composition stories
- [x] Create `apps/component-demo/` with Vite + React + MUI
- [x] Create Obsidian vault structure in `docs/trn-platform/`

## Remaining

- [ ] Create execution domain ui-mui layer (ConsoleDrawer, ExecutionControls, ProgressBar)
- [ ] Create execution domain data-access layer
- [ ] Create execution domain feature layer
- [ ] Wire up component-demo to live Express API
- [ ] Add Vitest configs to all packages
- [ ] Add `__tests__/` directories with initial test files
- [ ] Run `pnpm install` and verify all packages resolve
- [ ] Run `pnpm storybook` and verify all stories render
- [ ] Set up GitHub Actions CI workflow
- [ ] Create `.changeset` configuration

## Notes

- The execution domain only has server code so far (SSE, executor). The frontend layers need to be built.
- Component-demo pages import from domain ui-mui packages; they will show loading/error states until the Express API is running.
- Storybook workflow stories are self-contained with inline components. Page stories import real domain components.
