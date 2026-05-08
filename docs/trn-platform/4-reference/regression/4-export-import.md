# 4. Export / Import

Tests course export to JSON, import via API, and round-trip fidelity.

## Setup

Use a course with content (e.g., the course from test 2, or Course 3: QC System Foundations).

## Steps

### 4.1 Export Course

- [ ] Open a course in the editor (e.g., `/courses/edit/3`)
- [ ] Click **"Export"** in the toolbar
- [ ] **Expect:** Browser downloads `course-3.json`
- [ ] Open the file in a text editor
- [ ] **Expect:** JSON with `title`, `description`, `category`, `lessons[]`, each lesson has `slides[]`
- [ ] **Expect:** No database IDs (no `course_id`, `lesson_id`, `slide_id`)
- [ ] **Expect:** Slide fields present based on type (quiz has `quiz_question`, live_demo has `sql_text`)

### 4.2 Import Course via API

```bash
curl -X POST http://localhost:3001/api/v2/courses/import \
  -H "Content-Type: application/json" \
  -d @course-3.json
```

- [ ] **Expect:** 201 response with full course detail (new `course_id`, lessons, slides)
- [ ] Note the new course_id from the response: _____

### 4.3 Verify Import in UI

- [ ] Go to http://localhost:5174/courses
- [ ] **Expect:** New course appears in the list (may be under "Unassigned" since import doesn't set track)
- [ ] Open the imported course in the editor
- [ ] **Expect:** Same number of lessons and slides as the original
- [ ] Click through a few slides — content should match the original

### 4.4 Round-Trip Fidelity

- [ ] Export the imported course (click Export in the editor)
- [ ] Compare the two JSON files
- [ ] **Expect:** Content is identical (titles, descriptions, slide content, SQL, quiz fields)
- [ ] Differences are OK for: field ordering, null vs missing fields

## Teardown

Delete the imported duplicate if desired (use the Delete button in the editor).
