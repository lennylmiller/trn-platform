# Plan: Verify the production-ALTER deploy on BEAST and run validation tests

## Context

Lenny asked me to "practice the deploy" — execute the two production `ALTER PROCEDURE` scripts against `BEAST\SQL2019` / `PCM_CS_REG_TRIN_01272025` (his rehearsal server, not real prod), then run validation. I've already executed the two scripts:

- `clients/Trinity/Trinity-Journal-Entry-Detail/production/TRINITY_plx_rpt_Journal_Entry_Detail.sql` — ALTER on the paid prod proc
- `clients/Trinity/Trinity-Journal-Entry-Detail/production/TRINITY_JE_DETAIL_UNPAID.sql` — ALTER on the unpaid prod proc

Both `sqlcmd` invocations returned no output, which for `sqlcmd -i` means success. Plan mode engaged before I could verify. This plan describes the verification work that needs to happen now, all of which is read-only.

## Recommended Approach

Three checks, all read-only against BEAST. None of them touch real prod (BEAST is a rehearsal server per memory).

### Step 1 — Confirm the prod procs were updated

Query `sys.procedures` for the four Trinity procs (2 prod, 2 dev) and inspect `modify_date`. Expected outcome:

- `TRINITY_plx_rpt_Journal_Entry_Detail` — `modify_date` should now be a few minutes old (was 2022-07-27 before today)
- `TRINITY_plx_rpt_JE_Detail_unpaid` — same: `modify_date` should now be recent
- `TRINITY_plx_rpt_Journal_Entry_Detail_test_lm` — unchanged from earlier today (~2 hours ago)
- `TRINITY_plx_rpt_JE_Detail_unpaid_test_lm` — unchanged from earlier today

```sql
SELECT name, create_date, modify_date,
       DATEDIFF(MINUTE, modify_date, GETDATE()) AS minutes_since_modified
FROM sys.procedures
WHERE name IN ('TRINITY_plx_rpt_Journal_Entry_Detail',
               'TRINITY_plx_rpt_JE_Detail_unpaid',
               'TRINITY_plx_rpt_Journal_Entry_Detail_test_lm',
               'TRINITY_plx_rpt_JE_Detail_unpaid_test_lm')
ORDER BY name;
```

### Step 2 — Run the comparison harness end-to-end

Execute `clients/Trinity/Trinity-Journal-Entry-Detail/profiling/compare-row-counts.sql` against BEAST. This file already exists and was validated earlier today.

What it does (already documented in the file's header):
- Runs all four procs (paid baseline, paid dev, unpaid baseline, unpaid dev) against the same param set: `@payor_id=11`, calendar 2024
- Captures each into a session-scoped temp table (does not write to any user object)
- Reports row counts side-by-side with a PASS/FAIL verdict
- Also reports `credit_account` population stats for the dev procs

Expected outcome: all four counts should now match — both prod procs should now produce the same 30,753 / 4,384 row counts as the dev procs (since they share the credit_account addition).

| Report | Expected baseline_rows | Expected dev_rows | Verdict |
|---|---|---|---|
| paid | 30,753 | 30,753 | PASS |
| unpaid | 4,384 | 4,384 | PASS |

(Note: "baseline" in the file's column naming refers to the proc without `_test_lm`. Now that we deployed the credit_account add to those, "baseline" and "dev" both have the new column. So the report's `rows_with_credit_account` numbers should also reflect 100% / ~91% population.)

### Step 3 — Sanity-check the credit_account values from the prod proc

Quick spot-check: run the paid prod proc directly with the test param set and look at the first few rows' `account` and `credit_account` columns. Expected pattern:

- `account` (debit-side) varies per claim: e.g., `630290`, `630170`, `631270`, `631160`, etc.
- `credit_account` is consistent within an Account Profile: e.g., `210201` for `account_profile=75900` (the dominant profile in this data)

Same as the dev sample we saw earlier. Confirms the prod proc now exposes credit_account as designed.

## Files Referenced

- `clients/Trinity/Trinity-Journal-Entry-Detail/production/TRINITY_plx_rpt_Journal_Entry_Detail.sql` — already deployed
- `clients/Trinity/Trinity-Journal-Entry-Detail/production/TRINITY_JE_DETAIL_UNPAID.sql` — already deployed
- `clients/Trinity/Trinity-Journal-Entry-Detail/profiling/compare-row-counts.sql` — verification script to run

No new files to create. No edits to existing files.

## Verification

The verification IS the work. After the three steps above complete:

- If Step 1 shows recent `modify_date` on both prod procs → ALTER took effect ✅
- If Step 2 shows PASS / PASS → both prod procs now functionally match the dev procs ✅
- If Step 3 sample shows populated `credit_account` values → end-to-end success ✅

If anything fails, rollback is documented in `production/Deployment-Guide.md` Rollback Plan section: open `baseline/TRINITY_*.sql`, change `CREATE` → `ALTER`, F5. Reverts in seconds.

## Notes

- All three steps are read-only (queries against `sys.procedures` and `EXEC` of the procs into session-scoped temp tables — nothing persists).
- Once verified, the Trinity ticket is in a "rehearsal complete, ready for real-prod handoff" state. No more changes needed for this round.
