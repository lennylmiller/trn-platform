# Plan: Hail Mary — Four Last Optimizations Before Handoff

## Context
The IFL Member EOB report is stuck loading on a known slow system. We've built _llm prototypes with parameter cascading and schema-namespaced procs, but haven't gotten a clean render. Research surfaced four more things to try before handing off to Derek and Kirk.

## 1. Add temp table indexes + SET NOCOUNT ON + OPTION (RECOMPILE) to the stored proc

**File:** `clients/IFL/IFL-Member-EOB-Report/production/plx_rpt_member_eob_qc_llm.sql`

Changes:
- Add `SET NOCOUNT ON;` immediately after `AS` (line 42)
- After `#AdjAmounts` is populated (~line 199), add:
  ```sql
  CREATE CLUSTERED INDEX IX_AdjAmounts ON #AdjAmounts(claim_procedure_id);
  ```
- After `#rpt_data` is populated with INSERT (~after the main INSERT...SELECT DISTINCT block), add:
  ```sql
  CREATE CLUSTERED INDEX IX_rpt_data ON #rpt_data(claim_procedure_id);
  ```
- Add `OPTION (RECOMPILE)` to the main INSERT...SELECT DISTINCT statement (end of WHERE clause, before the closing of the INSERT block)

## 2. ExecutionLog3 diagnostic query

Write a new file: `clients/IFL/IFL-Member-EOB-Report/profiling/executionlog3_diagnostic.sql`

Contains the exact query to paste in SSMS on Citrix against the ReportServer database.

## 3. Statistics staleness check

Write a new file: `clients/IFL/IFL-Member-EOB-Report/profiling/check_statistics.sql`

Contains queries to check AUTO_UPDATE_STATISTICS and stats freshness on the key tables.

## 4. Test default value dataset theory

**File:** `clients/IFL/IFL-Member-EOB-Report/production/member_eob_llm.rdl`

Find the `report_company_id` parameter's `<DefaultValue>` block that references `param_report_company_default` dataset. Replace the `<DataSetReference>` with a hardcoded `<Values><Value>1</Value></Values>`. (Lenny will test on Citrix and revert if it's not the issue.)

## Verification
1. Re-deploy `plx_rpt_member_eob_qc_llm` on Citrix and test report
2. Run ExecutionLog3 query to see where time is spent
3. Run statistics check to see if stats are stale
4. Upload modified RDL with hardcoded default and test parameter loading
