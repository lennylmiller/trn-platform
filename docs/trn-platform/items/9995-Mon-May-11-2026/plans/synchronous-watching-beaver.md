# Plan: Tango PHCN Paid Claims Report — Recoupment Support (RT-27905)

## Context

Tango uses a custom Crystal Reports "PHCN Paid Claims Report" backed by `PHCN_Paid_Claims_Report` proc. They want to see provider recoupments/credits on this report. Currently recoupment lines (negative units/charges with status "ADJUST REVIEW") are **invisible** because the proc INNER JOINs to `claim_procedure_payment` → `payment`, and **99.8% of recoupment lines have no payment record** (3,754 of 3,763 on BEAST).

### Key BEAST Data Findings
- **3,761 negative-charge lines** have status `ADJUST REVIEW` (status_type `APP`)
- **1,516 claims** with negative lines are `CLOSED` — they pass the existing `claim_status_ud = 'CLOSED'` filter
- **3,754 of 3,763** negative-charge lines have **no** `claim_procedure_payment` record — the INNER JOIN on line 183 silently drops them
- The 9 lines that DO have payment records show odd amounts (e.g., negative charges but positive payment amounts) — edge cases to handle gracefully
- `approve_for_accounting_date` IS populated on these lines, so that filter is not the blocker

### Root Cause
The INNER JOINs on lines 183-185 of the proc:
```sql
join claim_procedure_payment cpp on cp.claim_procedure_id = cpp.claim_procedure_id
join payment pay on cpp.payment_id = pay.payment_id
join payment_method_code pmc on pmc.payment_method_code_id = pay.payment_method_code_id
```
These exclude any claim_procedure without a payment record — which is nearly all recoupment lines.

---

## Plan

### Step 1: Update Preamble.md
**File**: `clients/Tango/Tango-RT-27905-Paid-Claims-Recoupments/Preamble.md`

Replace the scaffolded TODOs with actual findings:
- Report platform: **Crystal Reports** (`.rpt` + `.rcg`)
- Report Files table: `PHCN_PaidClaim.rpt`, `PHCN_PaidClaim.rcg`, `PHCN_Paid_Claims_Report.sql`
- Stored Procedures table: `PHCN_Paid_Claims_Report` (v2.0, 2025-04-08), `PHCN_usp_rpt_claims_paid_detail` (v4.0, 2025-04-08), plus ~20 other PHCN procs on BEAST
- Root Cause: INNER JOIN to `claim_procedure_payment` drops 99.8% of recoupment lines
- BEAST data stats: 3,761 ADJUST REVIEW negative-charge lines, 3,754 without payment records
- Remove speculative `adjudication_payment_item_claim_adjustment` references — recoupments are negative `claim_procedure` rows, not adjustment table entries
- Parameters section: document the 6 proc params from the SQL
- Key Tables: `claim_procedure`, `claim_procedure_payment`, `payment`, `payment_method_code`, `claim_procedure_status`

### Step 2: Update Working-Document.md
**File**: `clients/Tango/Tango-RT-27905-Paid-Claims-Recoupments/Working-Document.md`

Populate sections 1-3 with actual analysis:
- **Section 1 (Context)**: Update with confirmed details, replace open questions with resolved answers
- **Section 2 (Data Model)**: Replace speculative table list with actual join chain from proc; add BEAST row count findings
- **Section 3 (Execution Flow)**: Document the proc's two-phase flow (#rpt_clm_lines → #rpt_data), the join chain, the payment join bottleneck, and the examiner audit update
- **Section 5 (Proposed Solution)**: Outline the LEFT JOIN approach

### Step 3: Modify the development proc
**File**: `clients/Tango/Tango-RT-27905-Paid-Claims-Recoupments/development/PHCN-Paid-Claim-2/PHCN_Paid_Claims_Report.sql`

Changes:
1. **Lines 183-185**: Change INNER JOINs to LEFT JOINs:
   ```sql
   left join claim_procedure_payment cpp on cp.claim_procedure_id = cpp.claim_procedure_id
   left join payment pay on cpp.payment_id = pay.payment_id
   left join payment_method_code pmc on pmc.payment_method_code_id = pay.payment_method_code_id
   ```

2. **Line 197 WHERE clause**: The `pay.payment_date` filter (lines 198-199) will exclude rows where `pay` is NULL (recoupment lines). Wrap in ISNULL or move to JOIN condition:
   ```sql
   where (p.provider_id = @provider_id or @provider_id = -1)
       and (pay.payment_date IS NULL OR (pay.payment_date >= @begin_date and pay.payment_date < @end_date))
       and (cp.adjudication_date >= @adjudicated_begin_date and cp.adjudication_date < @adjudicated_end_date)
   ```

3. **Operator precedence bug (line 197)**: The existing WHERE has `p.provider_id = @provider_id or @provider_id = -1` without parens — the `OR` binds loosely, making the date filters only apply when `@provider_id = -1`. This is a pre-existing bug. Add parens:
   ```sql
   where (p.provider_id = @provider_id or @provider_id = -1)
   ```
   (Already has correct intent but needs explicit grouping to avoid AND/OR precedence issue.)

4. **Revision header**: Add version 3.0 entry with description.

### Step 4: Update ticket CLAUDE.md
**File**: `clients/Tango/Tango-RT-27905-Paid-Claims-Recoupments/CLAUDE.md`

Update to reflect Crystal Reports platform, BEAST database details, and the actual technical focus (LEFT JOIN fix, not adjustment tables).

---

## Verification

1. **On BEAST** — run the modified proc with a date range known to contain recoupment lines and confirm negative-charge rows now appear in the output
2. **Regression check** — run with same params as original proc and confirm positive-charge rows are unchanged (same count, same amounts)
3. **Edge cases** — verify the 9 lines that have both negative charges AND payment records render correctly
4. **Crystal Report** — the `.rpt` file is binary and can't be edited here; flag that it may need Crystal Reports Designer changes to display negative amounts distinctly (red text, parentheses, etc.)
