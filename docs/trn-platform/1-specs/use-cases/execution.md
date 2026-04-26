# Execution Domain -- Use Cases

## UC-EXEC-1: Run a Flow

**Actor:** Trainer / Presenter
**Precondition:** Flow exists with at least one step
**Trigger:** User clicks "Run" on a flow

### Main Flow
1. System sends `POST /api/v2/execution/flows/:id/run`
2. Server opens SSE stream
3. Server executes steps sequentially; for each step:
   a. Emits `step:start` event
   b. Executes command (SQL or shell)
   c. Streams `step:output` events (stdout/stderr lines)
   d. Emits `step:complete` with duration
4. After last step, emits `execution:complete`
5. Client updates progress bar, step status icons, and console output

### Alternate Flows
- **AF-1a:** Step fails -- `step:error` event; execution stops; user can retry or skip
- **AF-1b:** Step has pause_after=true -- `step:paused` event; execution waits for continue

### Postcondition
All steps executed; results displayed.

---

## UC-EXEC-2: Pause and Continue

**Actor:** Trainer / Presenter
**Precondition:** Flow is running and a step has pause_after=true
**Trigger:** Step completes that has pause_after=true

### Main Flow
1. Server emits `step:paused` event after step completes
2. Client shows "Paused" status and presenter notes for the step
3. Presenter reviews notes, discusses with audience
4. Presenter clicks "Continue"
5. System sends `POST /api/v2/execution/flows/:id/continue`
6. Server resumes with next step

### Postcondition
Execution continues from the paused point.

---

## UC-EXEC-3: View Training Status

**Actor:** Trainer / Developer
**Trigger:** User navigates to status dashboard or clicks "Status"

### Main Flow
1. System sends `GET /api/v2/execution/status`
2. Server runs `qc-train.sh status` or equivalent queries
3. System displays: database exists flag, entity counts (members, PCPs, claims, referrals, QCAP)

### Alternate Flows
- **AF-3a:** Database does not exist -- exists=false, counts are empty

### Postcondition
Training status dashboard displayed.

---

## UC-EXEC-4: Execute Ad-Hoc SQL

**Actor:** Trainer / Developer
**Trigger:** User enters SQL in the query editor and clicks "Run"

### Main Flow
1. User enters SQL query in the text editor
2. User clicks "Run Query"
3. System validates with `ExecuteSqlSchema`
4. System sends `POST /api/v2/execution/sql` with the query
5. Server executes against configured database
6. System displays result grid (columns, rows, row count)

### Alternate Flows
- **AF-4a:** SQL syntax error -- server returns 400 with error message
- **AF-4b:** Query timeout -- server returns 408; client shows timeout error
- **AF-4c:** Dangerous query (DROP, TRUNCATE) -- server rejects with 403

### Postcondition
Query results displayed in data grid.

---

## UC-EXEC-5: View Display Query Results

**Actor:** Trainer / Presenter
**Precondition:** A step with display_queries has been executed
**Trigger:** Step completes and has display_queries defined

### Main Flow
1. After step completes, server runs each display query
2. Server emits results for each query
3. Client renders result tables below the step in the console

### Postcondition
Display query results shown inline.

---

## UC-EXEC-6: Run a Composition

**Actor:** Trainer / Presenter
**Precondition:** Composition exists with blocks
**Trigger:** User clicks "Present" or "Run" on a composition

### Main Flow
1. System loads composition detail
2. System presents blocks in order:
   a. Narrative blocks -- displayed as formatted content
   b. Flow blocks -- "Run" button triggers flow execution (UC-EXEC-1)
   c. Note blocks -- displayed in callout style
   d. Composition blocks -- recursively presented
3. User navigates between blocks with Next/Previous

### Alternate Flows
- **AF-6a:** Embedded flow fails -- error shown inline; user can skip or retry

### Postcondition
Composition fully presented.

---

## UC-EXEC-7: View Execution Console

**Actor:** Trainer / Presenter
**Trigger:** Execution is in progress (flow or composition)

### Main Flow
1. Console drawer shows real-time output
2. Each line prefixed with timestamp and step indicator
3. stdout in default color, stderr in red
4. Console auto-scrolls to latest output
5. User can toggle console drawer open/closed

### Postcondition
Console shows complete execution log.

---

## UC-EXEC-8: Cancel Execution

**Actor:** Trainer / Presenter
**Precondition:** Execution is running or paused
**Trigger:** User clicks "Cancel" or "Stop"

### Main Flow
1. System sends cancel signal to server
2. Server terminates running process (if shell) or cancels query
3. Server emits `execution:complete` with cancelled status
4. Client updates UI to show "Cancelled" state

### Postcondition
Execution stopped; partial results visible.

---

## UC-EXEC-9: View Step Execution History

**Actor:** Trainer / Developer
**Trigger:** User reviews completed execution

### Main Flow
1. System displays list of executed steps with: label, type, status, duration
2. Each step expandable to show: command output, display query results, errors
3. User can re-run individual steps

### Postcondition
Execution history displayed with drill-down capability.
