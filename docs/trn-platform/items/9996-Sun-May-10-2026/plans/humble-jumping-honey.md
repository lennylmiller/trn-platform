# Plan: Edit-at-Pause — Full Configure Screen During Runtime

## Context

During a live demo, the presenter hits a pause point and realizes they need to change the plan — skip a step, add a pause, or redo from an earlier point. Currently the only options are Continue or Abort. The user wants to open the **full configure screen** at any pause point, make changes to ALL steps (past, present, future), save, then choose how to proceed.

## Workflow at a pause point

```
[Running view, flow is paused]
     |
  [Edit] → opens full configure screen (all steps, full include/pause toggles, save as...)
     |
  [Save] → pushes updated steps to server, returns to running view with action buttons:
     |
     ├── [Continue]           — resume from current position
     ├── [Restart]            — abort + re-run from step 1
     └── [Restart from ▾ ]   — abort + re-run from a chosen step (dropdown of included steps)
```

## Files to change

### 1. `client/src/api/client.js` — add `updateFlowSteps`
```js
export async function updateFlowSteps(steps) {
  const res = await fetch(`${BASE}/flows/update-steps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ steps }),
  });
  return res.json();
}
```

### 2. `server/routes/flows.js` — already done
The `POST /api/flows/update-steps` endpoint and `activeFlow.steps` storage are already in place from the prior partial edit. No further server changes needed.

### 3. `client/src/components/FlowRunner.jsx` — runtime edit mode

**New state:**
- `const [editing, setEditing] = useState(false)` — true when configure screen is open mid-run
- `const [editOverrides, setEditOverrides] = useState({})` — working copy during edit (separate from `overrides` so Cancel discards changes)

**Running view (View 3) changes:**
- When `pausedStepId` is truthy, show an **Edit** button alongside Continue/Abort
- Clicking Edit: copies current `overrides` into `editOverrides`, sets `editing: true`

**New View 4: Edit-at-pause configure screen**
- Renders when `editing && running`
- Identical layout to the pre-run configure screen (View 2): all steps with include checkboxes + pause toggles, config selector dropdown, save as, bulk actions
- Uses `editOverrides` state (not `overrides`) so Cancel is non-destructive
- **Save** button:
  1. Copies `editOverrides` → `overrides`
  2. Builds the new steps array (filtered + pause-applied)
  3. Calls `updateFlowSteps(newSteps)` to push to server
  4. Sets `editing: false`, returns to running view
- **Cancel** button: discards `editOverrides`, sets `editing: false`

**Running view after Save — action buttons:**
- **Continue** — calls `resumeFlow()` as before
- **Restart** — calls `abortFlow()`, waits briefly, then calls `runFlow()` with the full updated steps from step 1
- **Restart from step ▾** — dropdown of included steps. Selecting one calls `abortFlow()`, then calls `runFlow()` with the updated steps array sliced from the chosen step onward

**Reuse:** The step list rendering (checkboxes, toggles, bulk actions, config selector) is identical between View 2 and View 4. Extract the configure UI into a `ConfigurePanel` component that accepts overrides/setters as props and renders the step list + controls. Both View 2 and View 4 use it.

## Implementation order

1. Add `updateFlowSteps` to `client/src/api/client.js`
2. Extract `ConfigurePanel` from the existing View 2 JSX in `FlowRunner.jsx`
3. Add `editing` / `editOverrides` state
4. Add Edit button to running view (View 3) when paused
5. Add View 4 (edit-at-pause) using `ConfigurePanel`
6. Add Save/Cancel handlers
7. Replace Continue button with Continue/Restart/Restart-from action bar after a save
8. Build + verify

## Verification

1. `npm run build` — no errors
2. Run a flow, let it pause at w1
3. Click Edit — full configure screen appears with all 14 steps
4. Toggle some pauses, exclude w11-w14, click Save
5. Click Continue — flow resumes, skips excluded steps, respects new pauses
6. Let it pause again, click Edit, click Cancel — nothing changed
7. Click Edit again, save, click "Restart from w7" — flow aborts and restarts from step w7
8. Click Edit, save, click "Restart" — flow aborts and restarts from step 1
