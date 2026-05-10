# Plan: Single-script validate & deploy for RT-27633

## Context
Instead of 6 manual steps across 3 test scripts + compare-row-counts + manual deploys, consolidate into one bash script run from WSL. The script orchestrates sqlcmd calls against the existing SQL files — no duplication of proc definitions.

Key insights:
- Baseline procs already exist on BEAST from the fresh restore — no deploy needed
- The bash script is the orchestrator; existing SQL files are the artifacts
- Auto-abort on FAIL (don't deploy production if row counts don't match)
- Auto-cleanup dev procs on success
- Verify credit_account exists in prod proc definition as final check

## What gets created

### New file
- `profiling/validate-and-deploy.sh` — single bash script, run from the ticket directory

### Files fixed
- `profiling/test-development.sql` — currently identical to test-baseline.sql; fix to call `_test_lm` procs
- `profiling/test-production.sql` — currently has dev header/proc; fix to call original proc names (post-ALTER)
- `profiling/compare-row-counts.sql` — baseline temp tables have credit_account (45 cols) but fresh-restore baseline procs return 44 cols; fix baseline tables to 44 cols

### Files unchanged
- All baseline/, development/, production/ SQL files — used as-is by the script
- `profiling/test-baseline.sql` — correct as-is
- `profiling/discover-test-data.sql` — correct as-is

## Script flow

```
validate-and-deploy.sh
│
├─ Step 1: Capture baseline row counts (procs from restore, no deploy needed)
│    sqlcmd EXEC paid proc → count rows
│    sqlcmd EXEC unpaid proc → count rows
│
├─ Step 2: Deploy dev procs (_test_lm)
│    sqlcmd -i development/..._test_lm.sql  (×2)
│
├─ Step 3: Capture dev row counts
│    sqlcmd EXEC paid _test_lm → count rows
│    sqlcmd EXEC unpaid _test_lm → count rows
│
├─ Step 4: Compare baseline vs dev
│    If FAIL → abort, leave dev procs for debugging
│
├─ Step 5: Deploy production ALTERs
│    sqlcmd -i production/....sql  (×2)
│
├─ Step 6: Verify credit_account in prod proc definitions
│    OBJECT_DEFINITION LIKE '%credit_account%'
│
├─ Step 7: Cleanup dev procs
│    DROP PROCEDURE IF EXISTS ..._test_lm  (×2)
│
└─ Done.
```

## Verification
- Row count comparison (baseline vs dev) is the gate — PASS required to proceed
- credit_account verified via OBJECT_DEFINITION check on both procs
- Individual test-*.sql scripts remain available for ad-hoc SSMS verification
