# Plan: Lummi Member ID Card Customization (RT-28002)

## Context

Lummi's Purchased and Referred Care (PRC) program needs customized Member ID cards. The existing PCM Standard Report "Member ID Cards --Card Stock" uses `plx_rpt_id_cards` as its data source. The current proc returns member name, eligibility ID, employer group, benefit contract, and assigned providers (pharmacy, chiro, PCP). Lummi's card requirements add static PRC-specific content (contact numbers, legal text, claims address) and one derived data field (RX ID = eligibility_ud + '01'). The RX Bin (025953) and RX Group (200LUMM) are Lummi-specific constants, not stored in the database.

**Key constraint:** The BEAST database is a OneHome restore (`PCM_CD_BK_ONEHOME_03082026`), not Lummi data. Proc logic can be developed/reviewed here, but end-to-end testing with real Lummi members requires Citrix.

## Phase 1: Proc Modification (development/plx_rpt_id_cards_test_lm.sql)

Modify the development copy to add the fields Lummi needs that aren't already in the result set:

1. **Add columns to `#rpt_data`:**
   - `rx_id varchar(37)` -- derived: `eligibility_ud + '01'`
   - `rx_bin varchar(10)` -- static: `'025953'`
   - `rx_group varchar(10)` -- static: `'200LUMM'`

2. **Populate in both INSERT paths** (records_selection 2/3 and 1/2):
   - `rx_id` = `eligibility.eligibility_ud + '01'`
   - `rx_bin` = `'025953'`
   - `rx_group` = `'200LUMM'`

3. **Rename the proc** to `plx_rpt_id_cards_test_lm` in the CREATE statement

4. **Leave provider columns intact** -- PHARM/CHIRO/PCP data may still be useful even if not on Lummi's card; removing them could break the shared report for other clients

**Files:**
- Modify: `clients/Lummi/Lummi-RT-28002-Member-ID-Cards/development/plx_rpt_id_cards_test_lm.sql`

## Phase 2: SSRS Report Layout (Citrix work -- document approach only)

The SSRS .rdl file is on the report server, not in this repo. The layout work must happen on Citrix. Prepare a checklist for the Citrix session:

**Front of card layout:**
- Header: "Lummi Purchased and Referred Care (PRC)"
- Subheader: "Payor of Last Resort CFR Title 42 136.61"
- Dynamic fields: Member Name (`first_name` + `last_name`), Member ID (`eligibility_ud`), RX ID (`rx_id`)
- Static fields: RX Bin, RX Group
- Copay/coverage label + 4 bullet notes
- 4 contact numbers (LNHC, Business Office, On-Call Doc, PRC Supervisor)
- Lummi logo (LIBC logo 2.jpg)

**Back of card layout:**
- Payor of last resort statement
- Medicare rates note
- Pre-authorization instructions
- Disclaimer
- Member instructions
- Claims mailing address + electronic payor ID
- PRC office phones + fax

**Deliverable:** Document the layout spec in the Working-Document.md so it can be referenced during Citrix work.

## Phase 3: Production Deliverables

Following the IFL-Member-EOB-Report pattern:

1. **production/plx_rpt_id_cards.sql** -- `ALTER PROCEDURE` version of the modified proc (no `_test_lm` suffix)
2. **production/Deployment-Guide.md** -- Steps for deploying proc + uploading RDL to report server
3. **production/*.rdl** -- Customized SSRS report definition (after Citrix work)

## Phase 4: Update Ticket Documentation

- Update `Preamble.md` with proc analysis findings (columns, join chain, data gaps)
- Update `Working-Document.md` Section 2 (Data Model) with table row counts and ER relationships
- Update `Working-Document.md` Section 3 (Execution Flow) with proc flow documentation
- Add card layout specification to Section 5 (Proposed Solution)

**Files:**
- `clients/Lummi/Lummi-RT-28002-Member-ID-Cards/Preamble.md`
- `clients/Lummi/Lummi-RT-28002-Member-ID-Cards/Working-Document.md`

## Immediate Next Steps (what we do now)

1. Modify `development/plx_rpt_id_cards_test_lm.sql` -- add rx_id, rx_bin, rx_group columns
2. Update Working-Document.md with data model findings and card layout spec
3. Update Preamble.md with db discovery results

## Verification

- Run the modified proc on BEAST to confirm it compiles: `sqlcmd -S "BEAST\SQL2022" -E -d PCM_CD_BK_ONEHOME_03082026 -i development/plx_rpt_id_cards_test_lm.sql`
- Execute with test params to verify new columns appear: `EXEC plx_rpt_id_cards_test_lm @payor_id=1, @records_selection=3, @update_database=''`
- Full end-to-end testing with Lummi data requires Citrix session
