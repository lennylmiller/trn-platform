# Steps Domain -- Use Cases

## UC-STEP-1: List Steps

**Actor:** Trainer / Developer
**Precondition:** User has access to the TRN Platform
**Trigger:** User navigates to the Steps tab

### Main Flow
1. System fetches step list from `GET /api/v2/steps`
2. System displays steps in a table/card list showing label, type, category, and seed status
3. Steps are sorted by label alphabetically by default

### Alternate Flows
- **AF-1a:** API returns empty array -- system displays "No steps found" empty state
- **AF-1b:** API error -- system displays error alert with retry button

### Postcondition
Step list is displayed and ready for interaction.

---

## UC-STEP-2: Filter Steps

**Actor:** Trainer / Developer
**Precondition:** Step list is loaded (UC-STEP-1)
**Trigger:** User clicks a category filter chip or changes the type dropdown

### Main Flow
1. User selects one or more category filters (setup, scenario, sync, verify, utility)
2. System filters displayed steps client-side to match selected categories
3. Filter chips show active state; "All" chip clears filters

### Alternate Flows
- **AF-2a:** No steps match filters -- system displays "No steps match your filters" message

### Postcondition
Displayed list reflects the selected filters.

---

## UC-STEP-3: Search Steps

**Actor:** Trainer / Developer
**Precondition:** Step list is loaded (UC-STEP-1)
**Trigger:** User types in the search field

### Main Flow
1. User enters text in the search field
2. System filters steps whose label contains the search text (case-insensitive)
3. Results update as the user types (debounced 300ms)

### Alternate Flows
- **AF-3a:** No matches -- empty state message displayed
- **AF-3b:** User clears search -- full list restored

### Postcondition
Displayed list shows only steps matching the search query.

---

## UC-STEP-4: Create Step

**Actor:** Trainer / Developer
**Precondition:** User has access to the Steps tab
**Trigger:** User clicks "New Step" button

### Main Flow
1. System opens the Step Editor modal in create mode
2. User fills in required fields: label, type (sql/shell/manual), category
3. User optionally fills: description, command_text, display_queries
4. User clicks "Save"
5. System validates input against `StepCreateSchema`
6. System sends `POST /api/v2/steps` with validated payload
7. System closes modal, invalidates step list cache, displays success toast

### Alternate Flows
- **AF-4a:** Validation fails -- system highlights invalid fields with error messages
- **AF-4b:** API returns 400 (duplicate label) -- system displays error in modal
- **AF-4c:** User clicks "Cancel" -- modal closes, no changes made

### Postcondition
New step appears in the step list.

---

## UC-STEP-5: Edit Step

**Actor:** Trainer / Developer
**Precondition:** Step exists in the library
**Trigger:** User clicks the edit icon on a step row/card

### Main Flow
1. System opens Step Editor modal pre-filled with step data from `GET /api/v2/steps/:id`
2. User modifies one or more fields
3. User clicks "Save"
4. System validates against `StepUpdateSchema` (partial)
5. System sends `PATCH /api/v2/steps/:id`
6. System closes modal, invalidates caches, displays success toast

### Alternate Flows
- **AF-5a:** Step is seed-protected -- command_text field is read-only with explanatory note
- **AF-5b:** Concurrent edit detected (409) -- system prompts user to reload

### Postcondition
Step is updated in the library; flows using this step see updated metadata.

---

## UC-STEP-6: Delete Step

**Actor:** Trainer / Developer
**Precondition:** Step exists and is not a seed step
**Trigger:** User clicks the delete icon on a step row/card

### Main Flow
1. System opens confirmation dialog: "Are you sure you want to delete [step label]?"
2. User confirms deletion
3. System sends `DELETE /api/v2/steps/:id`
4. System invalidates caches, removes step from list, displays success toast

### Alternate Flows
- **AF-6a:** Step is seed-protected -- delete button is disabled with tooltip "Seed steps cannot be deleted"
- **AF-6b:** Step is in use by a flow -- API returns 409; system shows "Step is used in N flows. Remove it from those flows first."
- **AF-6c:** User cancels -- dialog closes, no changes

### Postcondition
Step is removed from the library.

---

## UC-STEP-7: View Step Detail

**Actor:** Trainer / Developer
**Precondition:** Step exists in the library
**Trigger:** User clicks on a step card/row

### Main Flow
1. System fetches full step detail from `GET /api/v2/steps/:id`
2. System displays: label, type, category, description, command_text (syntax highlighted), display_queries list, seed status, timestamps
3. User can navigate to edit from detail view

### Alternate Flows
- **AF-7a:** Step not found (404) -- system displays "Step not found" with link back to list

### Postcondition
Full step detail is displayed.
