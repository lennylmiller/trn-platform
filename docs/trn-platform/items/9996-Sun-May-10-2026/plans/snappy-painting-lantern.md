# Plan: Fix shell step execution — route through qc-train.sh wrapper

## Context

The QC Training app's DevPage runs shell steps, but they fail with `bash: line 1: teardown: command not found`. 

The step_library stores short command names like `teardown`, `setup`, `scenario new`, `sync`, `verify qcap` in `command_text`. The original QC-Training/web app routed these through `/mnt/c/Users/lmiller/Documents/client-development-tickets/training/QC-Training/qc-train.sh` — a wrapper script that dispatches each command to the right SQL scripts and executables.

The trn-platform executor (`packages/execution/server/src/executor.ts`) runs `bash -c <command_text>` directly, so these short names are interpreted as literal bash commands and fail.

## Fix

Add a configurable wrapper script to the executor. When a `SHELL_WRAPPER` env var is set, the executor prepends it to the command, matching the original behavior:

- **Before**: `spawn('bash', ['-c', 'teardown'])`
- **After**: `spawn('bash', ['-c', '/path/to/qc-train.sh teardown'])`

## Files to modify

### 1. `packages/execution/server/src/executor.ts` (line 40)

Change the spawn call to prepend the wrapper when configured:

```typescript
const wrapper = process.env.SHELL_WRAPPER;
const fullCommand = wrapper ? `${wrapper} ${command}` : command;
const child = spawn('bash', ['-c', fullCommand], { ... });
```

### 2. `.env.example` and `.env`

Add:
```
# Shell wrapper script for step execution (QC-Training commands)
SHELL_WRAPPER=/mnt/c/Users/lmiller/Documents/client-development-tickets/training/QC-Training/qc-train.sh
```

### 3. `server-dev.cjs` — no changes needed

The CJS entry already loads `.env` via dotenv, so `process.env.SHELL_WRAPPER` will be available to the executor.

## Verification

1. Start the server: `pnpm dev:qc`
2. Open DevPage for a flow with a shell step
3. Click RUN — the console should show the qc-train.sh output instead of "command not found"
4. Steps with full bash commands (not short names) should still work since the wrapper script handles arbitrary dispatch
