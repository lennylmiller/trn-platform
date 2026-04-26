# Flows Domain -- Use Cases

## UC-FLOW-1: List Flows

**Actor:** Trainer / Developer
**Precondition:** User has access to the TRN Platform
**Trigger:** User navigates to the Flows tab

### Main Flow
1. System fetches flow list from `GET /api/v2/flows`
2. System displays flows in card list showing name, description, step count, seed status

### Alternate Flows
- **AF-1a:** Empty list -- "No flows found" empty state
- **AF-1b:** API error -- error alert with retry

### Postcondition
Flow list displayed.

---

## UC-FLOW-2: View Flow Detail

**Actor:** Trainer / Developer
**Precondition:** Flow exists
**Trigger:** User clicks a flow card

### Main Flow
1. System fetches flow detail from `GET /api/v2/flows/:id` (includes joined steps)
2. System displays flow metadata + ordered timeline of FlowSteps
3. Each step shows: seq, label, type, category, pause_after, visible_in_execution

### Alternate Flows
- **AF-2a:** Flow not found -- 404 message

### Postcondition
Full flow detail with timeline displayed.

---

## UC-FLOW-3: Create Flow

**Actor:** Trainer / Developer
**Trigger:** User clicks "New Flow" button

### Main Flow
1. System opens create dialog with name and description fields
2. User fills in name (required) and optional description
3. User clicks "Create"
4. System validates with `FlowCreateSchema`, sends `POST /api/v2/flows`
5. System navigates to the new flow's detail/builder view

### Alternate Flows
- **AF-3a:** Validation error -- field highlights
- **AF-3b:** Cancel -- dialog closes

### Postcondition
Empty flow created, user is on builder view.

---

## UC-FLOW-4: Add Step to Flow

**Actor:** Trainer / Developer
**Precondition:** Flow detail view is open (UC-FLOW-2)
**Trigger:** User clicks "Add Step" or drags from step library

### Main Flow
1. Step library panel displays available steps
2. User selects/drags a step to the flow timeline
3. System assigns next seq number
4. System sends `POST /api/v2/flows/:id/steps` with step_id and default properties
5. Timeline updates to show new step

### Alternate Flows
- **AF-4a:** Same step added twice -- allowed (different flow_step_id, same step_id)

### Postcondition
Step appears in flow timeline at the end.

---

## UC-FLOW-5: Reorder Flow Steps

**Actor:** Trainer / Developer
**Precondition:** Flow has 2+ steps
**Trigger:** User drags a step to a new position in the timeline

### Main Flow
1. User drags a FlowStep card up or down
2. System recalculates seq values for all affected steps
3. System sends `PUT /api/v2/flows/:id/steps` with complete ordered list
4. Timeline re-renders with new order

### Postcondition
Flow steps reflect new order.

---

## UC-FLOW-6: Configure Flow Step Properties

**Actor:** Trainer / Developer
**Precondition:** Flow step exists in timeline
**Trigger:** User clicks a flow step or opens properties panel

### Main Flow
1. System displays properties panel for selected flow step
2. User can toggle: pause_after, visible_in_execution
3. User can edit: presenter_notes, override_display_queries
4. System sends `PATCH /api/v2/flows/:id/steps/:flowStepId` on save

### Postcondition
Flow step properties updated.

---

## UC-FLOW-7: Remove Step from Flow

**Actor:** Trainer / Developer
**Precondition:** Flow step exists in timeline
**Trigger:** User clicks remove icon on a flow step

### Main Flow
1. System shows brief confirmation
2. User confirms
3. System sends `DELETE /api/v2/flows/:id/steps/:flowStepId`
4. System re-sequences remaining steps

### Postcondition
Step removed from flow; other steps re-sequenced.

---

## UC-FLOW-8: Delete Flow

**Actor:** Trainer / Developer
**Precondition:** Flow exists and is not a seed flow
**Trigger:** User clicks "Delete Flow" in flow detail or list

### Main Flow
1. Confirmation dialog with flow name
2. User confirms
3. System sends `DELETE /api/v2/flows/:id`
4. System navigates back to flow list

### Alternate Flows
- **AF-8a:** Flow is seed -- delete button disabled
- **AF-8b:** Flow is used in a composition -- API returns 409 with message

### Postcondition
Flow deleted from database.

---

## UC-FLOW-9: Edit Flow Metadata

**Actor:** Trainer / Developer
**Precondition:** Flow exists
**Trigger:** User clicks edit on flow name/description

### Main Flow
1. System enables inline editing of name and description
2. User modifies fields
3. System validates with `FlowUpdateSchema`
4. System sends `PATCH /api/v2/flows/:id`

### Postcondition
Flow metadata updated.
