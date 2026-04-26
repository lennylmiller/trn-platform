# Compositions Domain -- Use Cases

## UC-COMP-1: List Compositions

**Actor:** Trainer / Developer
**Trigger:** User navigates to the Compositions tab

### Main Flow
1. System fetches from `GET /api/v2/compositions`
2. Displays cards with title, kind (story/tutorial/module), block count, flow count

### Alternate Flows
- **AF-1a:** Empty -- "No compositions found"

### Postcondition
Composition list displayed.

---

## UC-COMP-2: View Composition Detail

**Actor:** Trainer / Developer
**Trigger:** User clicks a composition card

### Main Flow
1. System fetches `GET /api/v2/compositions/:id` (includes blocks with joins)
2. Displays composition metadata + ordered block list
3. Each block shows: seq, block_type, heading, content preview, flow reference

### Postcondition
Full composition detail displayed.

---

## UC-COMP-3: Create Composition

**Actor:** Trainer / Developer
**Trigger:** User clicks "New Composition"

### Main Flow
1. Dialog: title (required), kind (story/tutorial/module), description
2. User fills fields and clicks "Create"
3. System validates with `CompositionCreateSchema`, sends `POST /api/v2/compositions`
4. Navigates to composition editor view

### Postcondition
Empty composition created.

---

## UC-COMP-4: Add Narrative Block

**Actor:** Trainer / Developer
**Precondition:** Composition editor open
**Trigger:** User clicks "Add Block" > "Narrative"

### Main Flow
1. System appends a new narrative block at the end
2. User enters heading and markdown content
3. User optionally adds presenter_notes
4. System sends `POST /api/v2/compositions/:id/blocks`

### Postcondition
Narrative block added to composition.

---

## UC-COMP-5: Add Flow Block

**Actor:** Trainer / Developer
**Trigger:** User clicks "Add Block" > "Flow"

### Main Flow
1. System opens FlowPickerModal showing available flows
2. User selects a flow
3. System creates block with block_type='flow' and flow_id
4. User sets heading and optional presenter_notes
5. System sends `POST /api/v2/compositions/:id/blocks`

### Alternate Flows
- **AF-5a:** No flows available -- empty state in picker

### Postcondition
Flow block added, referencing the selected flow.

---

## UC-COMP-6: Add Note Block

**Actor:** Trainer / Developer
**Trigger:** User clicks "Add Block" > "Note"

### Main Flow
1. System appends a note block
2. User enters heading and technical_content (shown in code style)
3. System sends `POST /api/v2/compositions/:id/blocks`

### Postcondition
Note block added.

---

## UC-COMP-7: Add Composition Reference Block

**Actor:** Trainer / Developer
**Trigger:** User clicks "Add Block" > "Composition"

### Main Flow
1. System opens CompositionPickerModal
2. User selects another composition to embed
3. System creates block with block_type='composition' and ref_composition_id
4. System sends `POST /api/v2/compositions/:id/blocks`

### Alternate Flows
- **AF-7a:** Self-reference attempted -- system prevents and shows error
- **AF-7b:** Circular reference detected -- API returns 400

### Postcondition
Composition reference block added.

---

## UC-COMP-8: Reorder Blocks

**Actor:** Trainer / Developer
**Precondition:** Composition has 2+ blocks
**Trigger:** User drags a block to a new position

### Main Flow
1. User drags block card
2. System recalculates seq values
3. System sends `PUT /api/v2/compositions/:id/blocks` with full ordered list

### Postcondition
Block order updated.

---

## UC-COMP-9: Edit Block Properties

**Actor:** Trainer / Developer
**Trigger:** User clicks on a block or opens properties panel

### Main Flow
1. System shows block properties panel
2. User edits: heading, content/technical_content, presenter_notes, flow_id
3. System sends `PATCH /api/v2/compositions/:id/blocks/:blockId`

### Postcondition
Block properties updated.

---

## UC-COMP-10: Remove Block

**Actor:** Trainer / Developer
**Trigger:** User clicks remove on a block

### Main Flow
1. Confirmation prompt
2. System sends `DELETE /api/v2/compositions/:id/blocks/:blockId`
3. Remaining blocks re-sequenced

### Postcondition
Block removed, remaining blocks re-sequenced.

---

## UC-COMP-11: Preview Composition

**Actor:** Trainer / Developer
**Trigger:** User clicks "Preview" button

### Main Flow
1. System renders composition in read-only presentation mode
2. Narrative blocks rendered as formatted text
3. Flow blocks shown as embedded flow summaries with "Run" buttons
4. Note blocks shown in callout style

### Postcondition
Composition displayed in presentation format.

---

## UC-COMP-12: Delete Composition

**Actor:** Trainer / Developer
**Precondition:** Composition is not seed-protected
**Trigger:** User clicks "Delete Composition"

### Main Flow
1. Confirmation dialog
2. System sends `DELETE /api/v2/compositions/:id`
3. Navigates to list

### Alternate Flows
- **AF-12a:** Seed protected -- delete disabled
- **AF-12b:** Referenced by another composition -- 409 with message

### Postcondition
Composition and its blocks deleted.
