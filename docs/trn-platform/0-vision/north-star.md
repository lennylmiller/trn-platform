# North Star: TRN Platform

## Vision

TRN Platform is the successor to TRN-Vibe (the original prototype built on a rapid-iteration stack). The migration to trn-platform standardizes the codebase on TypeScript strict mode, MUI 7, a 4-layer architecture, and a full Storybook-driven development workflow.

## Goals

1. **TypeScript Strict** -- All code compiles under `strict: true` with additional strict flags (`noUnusedLocals`, `noImplicitReturns`, `noUncheckedIndexedAccess`). No `any` casts.

2. **MUI 7 Component Library** -- All UI components use MUI 7 with Emotion styling. Consistent theme across all domains with deep blue primary and amber accents.

3. **4-Layer Architecture** -- Every domain follows the layered pattern:
   - `server/` -- Express routes + SQL Server queries
   - `data-access/` -- TanStack Query hooks wrapping fetch calls to the Express API
   - `feature/` -- Business logic hooks orchestrating data-access hooks
   - `ui-mui/` -- React components with MUI, co-located Storybook stories

4. **SQL Server Dual-Database** -- Two databases (`qc_training` for training data, `qc_core` for production reference) accessed via `mssql` multi-pool connections. No ORM; raw parameterized SQL.

5. **Full Storybook Coverage** -- Every component has a co-located story. 5 workflow journeys (Build Demo, Present Flow, Author Story, Run Training, Manage Steps) plus standalone stories and page compositions.

6. **pnpm Monorepo** -- Workspace-managed packages with `tsup` builds, `changesets` for versioning, and CI/CD on GitHub Actions.

## Domains

| Domain | Purpose |
|--------|---------|
| `steps` | Reusable step library (SQL, shell, manual steps) |
| `flows` | Ordered sequences of steps with pause points |
| `compositions` | Stories, tutorials, and modules combining narrative + flows |
| `execution` | Real-time step execution via SSE, training status |
| `shared` | Zod schemas, types, constants, DB utilities |

## Migration Path

TRN-Vibe (prototype) --> trn-platform (production):
- Port all step/flow/composition logic to typed 4-layer architecture
- Replace ad-hoc API calls with TanStack Query hooks
- Add comprehensive Storybook coverage
- Implement proper error handling and validation with Zod
- Add Vitest unit tests for every layer

## Success Criteria

- All 4 domains fully implemented across all 4 layers
- 80%+ test coverage across packages
- All 5 workflow stories functional in Storybook
- Component-demo app navigable with real API data
- CI/CD pipeline green on every push to main
