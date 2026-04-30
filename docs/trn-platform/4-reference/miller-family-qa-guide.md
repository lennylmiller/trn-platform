# Miller Family QA Guide

Manual QA plan for verifying the Step Workbench, MCP tools, and AI Chat using a new "Miller Family" training story.

## Prerequisites

- [ ] `pnpm db:migrate` run (adds `story` column to step_library)
- [ ] `pnpm build` run (all packages built)
- [ ] `pnpm server:dev` running (Express on :3001)
- [ ] `.env` has `ANTHROPIC_API_KEY` set (for AI Chat tests)
- [ ] `.env` has `SHELL_WRAPPER` set (for qc_train tests)

## The Miller Story

Tom Miller starts a new job at Pacific Industries. Pacific offers health insurance through Summit Health Plan. Tom enrolls himself and his wife Sarah in the "PPO Silver" plan. Tom picks Dr. Lisa Chen (GEN prefix, Genesis Medical Group) as his PCP. The weekly QCAP sync assigns QCAPGMG. Tom gets a referral to cardiologist Dr. Adams for chest pain. Tom visits Dr. Adams, and claim TRAIN-CLM-002 is submitted, adjudicated, and paid.

All data tagged with **MILLER-TRAIN** suffix.

---

## Track A: Claude Code (MCP Tools)

Open Claude Code in the trn-platform repo. Run `/mcp` to verify `trn-platform` is connected.

### A1. Explore the Schema

```
> "Use explore_schema to describe the member table in qc_core"
```

**Expected:** Column listing with member_id (PK), birth_date, gender_id, active, etc.

```
> "Use explore_schema to describe the member_name table"
```

**Expected:** member_name_id (PK), member_id (FK), name_first, name_last, is_primary.

### A2. Create Miller Steps

Ask Claude to create each step. Verify with `list_steps story=miller` after each.

**Step M1:**
```
> "Create a step: label 'Seed Miller client & group', type sql, category setup,
   story miller, description 'Creates Summit Health Plan client, Pacific Industries
   group, and MILLER_PPO_SILVER benefit contract.', command_text:

   -- Miller client, group, contract (placeholder SQL)
   PRINT 'Step M1: Seed Miller client & group'
   PRINT 'TODO: INSERT client, client_group, benefit_contract for MILLER-TRAIN'
   "
```

**Step M2:**
```
> "Create a step: label 'Enroll Tom & Sarah', type sql, category scenario,
   story miller, description 'Creates Tom and Sarah Miller as members with
   family eligibility and benefit plan enrollment.'"
```

**Steps M3-M8:** Continue the pattern for:
- M3: Assign PCP Dr. Chen (category: scenario)
- M4: Sync QCAP for Miller (category: sync)
- M5: Create referral to Dr. Adams (category: scenario)
- M6: Submit claim TRAIN-CLM-002 (category: scenario)
- M7: Adjudicate claim (category: scenario)
- M8: Verify Miller data (category: verify)

### A3. Verify Story Filtering

```
> "List steps filtered by story miller"
```

**Expected:** Only the 8 Miller steps appear.

```
> "List steps filtered by story garcia"
```

**Expected:** Only Garcia family steps appear.

### A4. Run a Step

```
> "Run step <M1 step_id>"
```

**Expected:** Returns execution ID and note about SSE streaming. Check the QC Training app console for live output.

### A5. Use run_sql to Verify

```
> "Run this SQL against qc_training:
   SELECT step_id, label, story, category FROM step_library WHERE story = 'miller' ORDER BY step_id"
```

**Expected:** 8 rows, all with story='miller'.

---

## Track B: QC Training App (Workbench)

Open `http://localhost:5174` (or wherever `pnpm --filter @trn-platform/qc-training dev` runs).

### B1. Verify Story Filter on Steps Tab

1. Click **Steps** tab
2. Find the **Story** dropdown filter (next to Category)
3. Select "Miller Family"
4. **Expected:** Only Miller steps shown (or empty if not yet created)
5. Select "Garcia Family"
6. **Expected:** Only Garcia steps shown
7. Select "Common Only"
8. **Expected:** Only steps with no story (common/shared)

### B2. Open the Workbench

1. Click **Workbench** tab
2. Verify the form loads with the step picker

### B3. Create a Step with Story

1. Click **New Step** if needed
2. Fill in:
   - Label: `Verify Miller enrollment`
   - Type: SQL
   - Category: Verify
   - **Story: Miller Family** (new dropdown)
   - Command Text: `SELECT 'Miller QA test' AS result`
   - Description: `QA test step for the Miller family story`
3. Click **Create**
4. **Expected:** Step appears in the picker, grouped under "Miller Family"

### B4. Verify Picker Grouping

1. Click the step picker (autocomplete at top)
2. **Expected:** Steps are grouped by story:
   - "Garcia Family" group
   - "Miller Family" group
   - "Common" group (steps with no story)

### B5. Run the Step

1. Select the step from the picker
2. Click **Run Step**
3. Switch to **Console** tab
4. **Expected:** Console shows execution output

### B6. SQL Pad

1. Switch to **SQL Pad** tab
2. Run: `SELECT step_id, label, story FROM step_library WHERE story = 'miller'`
3. **Expected:** Results table shows Miller steps

### B7. AI Chat

1. Switch to **AI Chat** tab
2. Ask: `"What tables are in qc_training?"`
3. **Expected:** Claude responds with table list (uses explore_schema tool)
4. Ask: `"Help me write a SQL query to find all members enrolled under a specific benefit contract"`
5. **Expected:** Claude explores schema and generates a multi-table JOIN query

---

## Track C: Automation Potential

### C1. MCP Test Script

A Node.js script that programmatically connects to the MCP server and runs all steps:

```
scripts/test-miller-mcp.ts
```

Would use `@modelcontextprotocol/sdk` Client, call create_step for all 8, run_step for each, and run_sql to verify. **Effort:** Medium.

### C2. Playwright E2E

```
tests/e2e/miller-family.spec.ts
```

Would navigate the Workbench, create a step, run it, check SQL Pad. Playwright is already installed. **Effort:** Medium.

### C3. Agent SDK

```
scripts/test-miller-agent.ts
```

Would give Claude the MCP server and prompt: "Create and run the 8 Miller Family steps, then verify all data exists." Claude does the rest autonomously. **Effort:** Low code, high token cost.

---

## Verification Checklist

### Story Field
- [ ] `story` column exists on step_library (run migration)
- [ ] Garcia steps have `story = 'garcia'`
- [ ] New steps can be created with a story
- [ ] Steps without a story show as "Common"
- [ ] Filtering by story works in API (`?story=miller`)
- [ ] Filtering by story works in UI (dropdown)
- [ ] Step picker groups by story

### MCP Tools
- [ ] `explore_schema` returns table details
- [ ] `run_sql` executes queries and returns results
- [ ] `list_steps` accepts `story` filter
- [ ] `create_step` accepts `story` parameter
- [ ] `update_step` accepts `story` parameter
- [ ] `qc_train status` returns Garcia data status

### Workbench UI
- [ ] Form has Story dropdown (None, Garcia, Miller)
- [ ] Step picker groups by story
- [ ] Console tab shows execution output
- [ ] SQL Pad executes queries and shows results
- [ ] AI Chat sends messages and receives responses
- [ ] AI Chat shows tool call cards (collapsible)

---

## Cleanup

After QA testing, remove Miller test data:

```sql
-- Remove Miller steps from step_library
DELETE FROM step_library WHERE story = 'miller';

-- If any Miller data was seeded into qc_core, remove it:
-- (only needed if you ran actual INSERT steps against qc_core)
-- DELETE FROM member_name WHERE name_last = 'Miller-MILLER-TRAIN';
-- etc.
```
