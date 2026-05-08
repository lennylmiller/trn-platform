# 6. Cleanup & Delete

Tests destructive operations: clear course content, delete course, delete track.

## Setup

Use the test course created in test 2 and the test tracks from test 1.

## Steps

### 6.1 Clear Course

- [ ] Open the test course in the editor
- [ ] **Expect:** "Clear" button visible in toolbar (red, enabled when course has content)
- [ ] Click **Clear** → confirm dialog appears
- [ ] Click OK
- [ ] **Expect:** All lessons and slides removed, outline shows "No lessons yet"
- [ ] **Expect:** Course still exists (title, description intact), just empty

### 6.2 Rebuild After Clear

- [ ] With the cleared course open, click **AI Author**
- [ ] Type: `Add one lesson about naming conventions with a narrative and a quiz`
- [ ] **Expect:** AI builds content, outline refreshes with 1 lesson + 2 slides
- [ ] This verifies that clear + rebuild cycle works

### 6.3 Delete Course

- [ ] Click **Delete** in the toolbar (red button)
- [ ] **Expect:** Confirm dialog: "Delete this entire course? This cannot be undone."
- [ ] Click OK
- [ ] **Expect:** Redirected to courses list
- [ ] **Expect:** Course no longer appears in the list

### 6.4 Delete Track

- [ ] On the courses page, click the track selector
- [ ] Click the gear icon on "Troubleshooting" track
- [ ] Click **Delete Track** (red, bottom-left of settings dialog)
- [ ] **Expect:** Confirm dialog: "Delete track? Courses and series will be unlinked but not deleted."
- [ ] Click OK
- [ ] **Expect:** Track removed from selector
- [ ] **Expect:** Any courses that were in "Troubleshooting" now appear under "All Courses" (unassigned)

### 6.5 Verify No Orphans

```bash
# Check for courses with invalid track_id
curl -s http://localhost:3001/api/v2/courses | python3 -c "
import json, sys
courses = json.load(sys.stdin)
tracks = set()
for c in courses:
    if c.get('track_id'):
        tracks.add(c['track_id'])
print(f'{len(courses)} courses, track_ids used: {tracks}')
"
```

- [ ] **Expect:** No track_id values pointing to deleted tracks

## Final State

After running all 6 test files:
- Original fixture courses intact (Course 1-13)
- "Operations" track exists (from test 1)
- "Troubleshooting" track deleted (test 6.4)
- Test course deleted (test 6.3)
- System is clean for next test run

To fully reset to baseline:
```bash
npx tsx packages/courses/server/src/fixtures.ts
```
This reloads all fixture courses (upsert — won't duplicate, will restore any modified content).
