# MUI 7 → 9 Upgrade

## Context
MUI 9.0.0 is available. We're on 7.3.10. MUI skipped v8 for core, so this is a direct upgrade. The codebase has light MUI usage (44 files, no Lab/X deps, no Emotion styled-components) making this low-risk.

## Steps

### 1. Fix deprecated `PaperProps` on Drawer
- `packages/execution/ui-mui/src/components/ConsoleDrawer.tsx:70` — change `PaperProps` to `slotProps={{ paper: ... }}`

### 2. Bump versions in all package.json files
- Root: `@mui/material` ^7.3.9 → ^9.0.0, `@mui/icons-material` ^7.3.10 → ^9.0.0
- All 4 domain ui-mui packages (steps, flows, compositions, execution): same bumps
- Add `@mui/material` and `@mui/icons-material` to pnpm overrides for consistency

### 3. Install dependencies
- `pnpm install`

### 4. Run codemod for system props (safety check)
- `npx @mui/codemod@latest v9.0.0/system-props packages/ apps/`

### 5. Typecheck
- `pnpm typecheck`

### 6. Build & test
- `pnpm build`
- `pnpm test`

## Verification
- `pnpm typecheck` passes
- `pnpm build` passes
- `pnpm storybook` launches and renders correctly
- `pnpm test` passes
