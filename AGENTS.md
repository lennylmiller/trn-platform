# Repository Guidelines

## Project Structure & Module Organization

TRN Platform is a pnpm TypeScript monorepo. Application entry points live in `apps/`: `apps/qc-training` is the primary Vite app, and `apps/component-demo` is the demo app. Shared backend startup, middleware, and migrations live in `server/`. Domain packages live under `packages/{steps,flows,compositions,execution}/` and follow the layer pattern `server`, `data-access`, `feature`, and `ui-mui`. Cross-domain schemas, types, constants, and database helpers belong in `packages/shared`. Docs live in `docs/trn-platform`.

## Build, Test, and Development Commands

Use Node `>=22` and pnpm `>=8`.

- `pnpm dev`: run the Express dev server and Storybook together.
- `pnpm dev:qc`: run the Express dev server plus the QC Training Vite app.
- `pnpm storybook`: start Storybook on port 6006.
- `pnpm test`: run Vitest across all workspace packages.
- `pnpm test:visual`: run Playwright visual regression tests.
- `pnpm build`: build all packages except `component-demo`.
- `pnpm build:all`: build every workspace package and app.
- `pnpm typecheck`: run TypeScript checks across the monorepo.
- `pnpm db:migrate`: apply SQL Server migrations from `server/db`.

For package-scoped work, prefer filters such as `pnpm --filter @trn-platform/steps-ui-mui test`.

## Coding Style & Naming Conventions

Use strict TypeScript, ESM modules, React 19, MUI 9, and TanStack Query 5 patterns already present in the repo. Import from package roots, for example `@trn-platform/shared`, not deep package paths. Do not import across sibling domains. Preserve domain layering: UI components use feature hooks when they exist, feature code coordinates data access, and server packages own Express routes and SQL queries. Package names follow `@trn-platform/{domain}-{layer}`.

## Testing Guidelines

Vitest is the default test runner, with package configs extending the root/base configuration. Place tests close to source files using local package conventions. UI package stories use `*.stories.tsx`; visual regression runs through Playwright against Storybook. Coverage uses the v8 provider with 80% thresholds. For React/MUI tests, prefer role queries such as `getByRole('heading', { name })` and `getByRole('combobox')`.

## Commit & Pull Request Guidelines

Recent commits use concise imperative summaries, for example `Refactor useFlowRunner...`. Keep commits focused on one behavior or structural change. Pull requests should include a short description, linked issue or ticket, test results, and screenshots or Storybook references for UI changes. Note database migration or environment changes explicitly.

## Security & Configuration Tips

Copy `.env.example` to `.env` for local development and set database credentials there. Do not commit secrets. Common local variables include `AUTH_DISABLED=true`, `VITE_API_URL=http://localhost:3001`, `DB_TRUST_CERT=true`, `DB_QC_TRAINING_DATABASE`, and `DB_QC_CORE_DATABASE`.
