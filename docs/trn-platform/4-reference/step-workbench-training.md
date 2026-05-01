# Step Workbench Training: Building a Member Claims Audit Flow

This guide walks through creating 4 steps, assembling them into a flow, and embedding that flow in a composition — all from the QC Training app.

## Prerequisites

- `pnpm dev` running (server on :3001, qc-training on :5173)
- Training database seeded (`pnpm db:seed`)

---

## Part 1: Create the Steps

Navigate to the **Workbench** tab in QC Training.

### Step 1 — List active members

| Field | Value |
|-------|-------|
| Label | `List active members` |
| Type | `Sql` |
| Category | `Setup` |
| Command Text | see below |
| Description | `Pull up the member roster to pick a cohort for review` |

**Command Text:**
```sql
SELECT TOP 10 member_id, first_name, last_name, status
FROM member
ORDER BY member_id
```

Click **Create**. The step is saved and the form switches to edit mode.

**Test it:** Click **Run Step**. You should see the SQL execute in the console output. Check the SQL Scratch Pad below if you want to experiment with variations of the query before committing.

### Step 2 — Pull approved claims

Click **New Step** to reset the form.

| Field | Value |
|-------|-------|
| Label | `Pull approved claims` |
| Type | `Sql` |
| Category | `Scenario` |
| Command Text | see below |
| Description | `Join claims to members, filtering to approved claims only` |

**Command Text:**
```sql
SELECT c.claim_id, c.status, m.first_name, m.last_name
FROM claim c
JOIN member m ON c.member_id = m.member_id
WHERE c.status = 1
```

Click **Create**, then **Run Step** to verify.

### Step 3 — Count claims by status

Click **New Step**.

| Field | Value |
|-------|-------|
| Label | `Count claims by status` |
| Type | `Sql` |
| Category | `Verify` |
| Command Text | see below |
| Description | `Aggregate view — are the claim counts what we expect?` |

**Command Text:**
```sql
SELECT status, COUNT(*) AS total
FROM claim
GROUP BY status
ORDER BY status
```

**Display Queries (optional):** If you want a secondary result panel when this step runs inside a flow, paste this into the Display Queries field:

```json
[
  {
    "label": "Claims by status",
    "sql": "SELECT status, COUNT(*) AS total FROM claim GROUP BY status ORDER BY status"
  }
]
```

Click **Create**, then **Run Step** to verify.

### Step 4 — Discuss audit findings

Click **New Step**.

| Field | Value |
|-------|-------|
| Label | `Discuss audit findings` |
| Type | `Manual` |
| Category | `Verify` |
| Command Text | `PAUSE` |
| Description | `Trainer pauses to review results with the audience before moving on` |

Click **Create**. Manual steps don't execute — they pause the flow for the presenter.

---

## Part 2: Assemble the Flow

Navigate to the **Flows** tab.

1. Click the **+** button (or "New Flow") to create a flow
2. Set the flow name to `Member Claims Audit`
3. Set the description to `Training scenario: inspect members, review claims, verify counts, discuss findings`
4. Save the flow

### Add steps to the flow

Open the flow in dev mode (click the flow card, or navigate to `/flows/dev/:flowId`).

Add the 4 steps in order using the Step Library sidebar:

| Seq | Step | pause_after | Presenter Notes |
|-----|------|-------------|-----------------|
| 1 | List active members | No | `Let's start by looking at who's in the system` |
| 2 | Pull approved claims | No | `Now we join to claims — notice the status filter` |
| 3 | Count claims by status | Yes | `Before we discuss, look at the aggregate counts` |
| 4 | Discuss audit findings | No | `Open floor — what patterns do you see?` |

> **Tip:** Setting `pause_after: true` on step 3 gives the audience a moment to read the aggregation results before the manual discussion step.

### Test the flow

Click **Run** in the flow dev view. You should see:
- Steps 1-2 execute their SQL and stream output
- Step 3 executes, then pauses (because `pause_after` is set)
- Click **Continue** to advance to step 4
- Step 4 is a manual pause — the flow waits for the presenter
- Click **Continue** again to complete the flow

---

## Part 3: Embed in a Composition

Navigate to the **Compositions** tab.

1. Create a new composition:
   - Title: `Claims Audit Training`
   - Kind: `tutorial`
   - Description: `Walk through a member claims audit from start to finish`

2. Add blocks in order:

| Seq | Block Type | Content |
|-----|-----------|---------|
| 1 | **narrative** | Heading: `Introduction` — Content: `This module walks through a basic claims audit. We'll query the member roster, inspect their claims, and verify the aggregate counts match expectations.` |
| 2 | **flow** | Select the `Member Claims Audit` flow |
| 3 | **narrative** | Heading: `What we learned` — Content: `The audit flow demonstrated joining across tables, filtering by status, and aggregating results. These are the same patterns used in production QC workflows.` |

3. Save the composition

### Run the composition

Open the composition and click **Run**. The narrative blocks display as text. When the flow block is reached, it executes the 4-step Member Claims Audit flow inline, with the same pause/resume behavior.

---

## Using the SQL Scratch Pad

At any point during step authoring, the SQL Scratch Pad (bottom-right of the Workbench) lets you run ad-hoc queries to explore data:

```sql
-- What tables are in qc_core?
SELECT name FROM sys.tables WHERE type = 'U' ORDER BY name

-- What columns does the claim table have?
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'claim'

-- Quick count of all members
SELECT COUNT(*) AS total_members FROM member
```

Type your SQL and press **Ctrl+Enter** (or click **Run SQL**). Results appear inline below the input.

---

## Recap

| What you built | Where it lives |
|---------------|---------------|
| 4 steps | Step Library (visible in Steps tab and Workbench picker) |
| 1 flow | Flows tab — `Member Claims Audit` |
| 1 composition | Compositions tab — `Claims Audit Training` |

Each layer builds on the one below: steps are the atoms, flows sequence them, compositions wrap flows with narrative context. This is the same pattern used for all QC Training content.
