# Plan: QC Training Lab Web Application

## Context
The CLI tool `qc-train.sh` works but is cumbersome for running multi-step training demos. Lenny wants a browser-based companion that makes it easy to compose demo sequences, run them step-by-step with live output, and see the database state update in real time. This is initially for Lenny's own learning but could be handed off to other team members if embraced.

The web app **complements** the CLI -- it calls `qc-train.sh` under the hood via child_process, reusing all existing SQL logic.

## Architecture

```
Browser (React SPA)           Express Server              qc-train.sh
  |                              |                           |
  |-- SSE connect -------------->|                           |
  |-- POST /api/cmd/scenario/new |                           |
  |                              |-- spawn zsh qc-train.sh ->|
  |<-- SSE step:output ----------|<-- stdout line ---------- |
  |<-- SSE step:output ----------|<-- stdout line ---------- |
  |<-- SSE step:complete --------|<-- exit code 0 ---------- |
  |-- GET /api/status ---------->|                           |
  |<-- JSON {members, pcp, ...} -|-- spawn qc-train status ->|
```

- **Backend**: Express wrapping `qc-train.sh` via `child_process.spawn`, SSE for streaming
- **Frontend**: Vite + React, no external state library (useState/useReducer sufficient)
- **Persistence**: localStorage for saved demo flows
- **Launch**: `qc-train web` (new subcommand) or `cd training/QC-Training/web && npm start`

## Project Structure

```
training/QC-Training/web/
  package.json                 # root: scripts for dev + prod
  server/
    index.js                   # Express app (port 3847)
    lib/
      executor.js              # Spawns qc-train.sh, streams stdout/stderr
      sse.js                   # SSE connection manager
      status-parser.js         # Parses qc-train status output into JSON
    routes/
      commands.js              # POST /api/cmd/:command/:subcommand?
      status.js                # GET /api/status
      flows.js                 # POST /api/flows/run
      events.js                # GET /api/events (SSE)
  client/
    index.html
    vite.config.js             # proxy /api -> localhost:3847
    src/
      main.jsx
      App.jsx
      api/client.js            # fetch + SSE helpers
      hooks/
        useSSE.js              # EventSource lifecycle hook
        useCommand.js          # Run single command, consume SSE
      components/
        Layout.jsx             # Sidebar + main + console
        Dashboard.jsx          # Live state tables (members, PCP, QCAP, claim)
        CommandBar.jsx          # Quick-action buttons
        ScenarioPanel.jsx       # Scenario selector with descriptions
        SyncPanel.jsx           # Preview/commit toggle + output
        VerifyPanel.jsx         # Area picker + results
        FlowDesigner.jsx        # Compose/edit step sequences
        FlowRunner.jsx          # Step-by-step execution with pause
        StepCard.jsx            # Single step: label, status icon, expandable output
        OutputConsole.jsx       # Streaming terminal-like output
      presets/
        full-demo.json         # Preset: NEW -> sync -> CHANGED -> sync
        idempotent-proof.json  # Preset: SYNCED -> sync -> verify (no changes)
      store/
        flowStore.js           # localStorage CRUD for flows
```

## API Endpoints

| Method | Path | Maps To | Response |
|--------|------|---------|----------|
| GET | `/api/events` | SSE connection | Persistent SSE stream |
| GET | `/api/status` | `qc-train status` | JSON `{exists, members, pcp, qcap, claim, referral}` |
| POST | `/api/cmd/setup` | `qc-train setup` | Streams via SSE |
| POST | `/api/cmd/teardown` | `qc-train teardown` | Streams via SSE |
| POST | `/api/cmd/reset` | `qc-train reset` | Streams via SSE |
| POST | `/api/cmd/scenario/:name` | `qc-train scenario <name>` | Streams via SSE |
| POST | `/api/cmd/sync?preview=true` | `qc-train sync --preview` | Streams via SSE |
| POST | `/api/cmd/sync` | `qc-train sync` | Streams via SSE |
| POST | `/api/cmd/verify/:area` | `qc-train verify <area>` | Streams via SSE |
| POST | `/api/flows/run` | Execute step sequence | Streams via SSE |

## SSE Event Types

```
step:start    {stepId, label, command}
step:output   {stepId, line, stream: "stdout"|"stderr"}
step:complete {stepId, exitCode, durationMs}
step:paused   {stepId, message}        // flow runner waits for user
step:error    {stepId, exitCode, stderr}
status:update {members, pcp, qcap}     // pushed after each command completes
```

## Demo Flow Data Model (localStorage)

```json
{
  "id": "flow_xxx",
  "name": "Full QCAP Sync Demo",
  "steps": [
    {"id": "s1", "command": "reset", "label": "Fresh start", "pauseAfter": true, "notes": "Seeds Garcia family"},
    {"id": "s2", "command": "scenario", "args": ["new"], "label": "Set NEW scenario"},
    {"id": "s3", "command": "sync", "args": ["--preview"], "label": "Preview sync", "pauseAfter": true},
    {"id": "s4", "command": "sync", "label": "Execute sync"},
    {"id": "s5", "command": "verify", "args": ["qcap"], "label": "Verify QCAP inserted", "pauseAfter": true}
  ]
}
```

## Implementation Phases

### Phase 1: Server + SSE + Minimal UI
- `npm init` the project, install express/cors/concurrently
- `executor.js`: spawn `qc-train.sh`, strip ANSI codes, emit lines
- SSE endpoint with connection tracking
- Command routes (POST triggers spawn, pipes to SSE)
- React skeleton: CommandBar + OutputConsole
- **Verify**: Click "Reset" in browser, see streamed output in console panel

### Phase 2: Dashboard + Status
- `status-parser.js`: run `qc-train status`, parse sections into JSON
- Dashboard component: Members table, PCP table, QCAP table, Claim table
- Auto-refresh dashboard after each command completes (SSE `step:complete` triggers refetch)
- Scenario and Sync panels with descriptions

### Phase 3: Flow Designer + Runner
- FlowDesigner: add/remove/reorder steps, edit labels/notes, save to localStorage
- Ship 2 preset flows (full demo + idempotent proof)
- FlowRunner: sequential execution with pause support, step status indicators
- Resume button for paused steps

### Phase 4: Polish
- Keyboard shortcuts (Space=continue, Escape=abort)
- Step notes displayed during pause
- Error recovery (retry/skip)
- Mobile-friendly layout (for tablet beside QC screen)

## Key Files Modified/Created
- **Create**: `training/QC-Training/web/` (entire directory)
- **Modify**: `training/QC-Training/qc-train.sh` (add `web` subcommand)
- **Modify**: `~/code/nix-config/shell/qc-training.zsh` (add `qc-train-web` function if needed)
- **Reference only**: All existing SQL files in `training/QC-Training/sql/`

## CLI Integration
Add to `qc-train.sh` main dispatch:
```bash
web)
    cd "$SCRIPT_DIR/web" && node server/index.js
    ;;
```

## Verification
1. `cd training/QC-Training/web && npm install && npm run dev`
2. Open `http://localhost:5173`
3. Click "Reset" -- see streamed output in console, dashboard populates
4. Click "Scenario: NEW" -- dashboard shows no QCAP code
5. Click "Sync Preview" -- see audit + 1 row to insert
6. Click "Sync Commit" -- QCAPVICARE appears in dashboard
7. Open FlowDesigner, load preset "Full Demo", click Run -- steps execute sequentially with pauses
8. Verify `qc-train status` in terminal matches dashboard state
