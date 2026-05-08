# 3. Course Editor

Tests the 3-panel editor: outline, slide preview, slide editing, add/delete.

## Setup

Open an existing course with content in the editor. Use the course created in test 2, or use Course 4 (Benefit Administration): http://localhost:5174/courses/edit/4

## Steps

### 3.1 Outline Navigation

- [ ] **Expect:** Left panel shows lessons with expand/collapse
- [ ] Click a lesson title — it expands showing slide rows
- [ ] **Expect:** Each slide shows a colored type chip (Read, Demo, Quiz, etc.)
- [ ] Click a slide — center panel shows rendered preview
- [ ] Click a different slide — preview updates with animation

### 3.2 Slide Editing

- [ ] Toggle off AI Author (if on) → right panel shows slide editor form
- [ ] Select a narrative slide
- [ ] **Expect:** Form shows: Slide Type, Title, Content (markdown), Presenter Notes
- [ ] Change the title → click **Save**
- [ ] **Expect:** Outline reflects the new title, center preview updates
- [ ] Select a quiz slide
- [ ] **Expect:** Form shows: Question, Options (with A/B/C/D chips), Answer selector, Explanation
- [ ] Select a live_demo slide
- [ ] **Expect:** Form shows: SQL Text (monospace), SQL Label fields

### 3.3 Add Lesson

- [ ] Click **"Add Lesson"** (bottom of outline)
- [ ] Enter title: `Test Lesson`, description: `Temporary for testing`
- [ ] Click Add
- [ ] **Expect:** New lesson appears at the bottom of the outline

### 3.4 Add Slide to Lesson

- [ ] Expand the new "Test Lesson"
- [ ] Click **"Add slide"** under it
- [ ] Select "Quiz" type, enter title: `Test Quiz`
- [ ] Click Add
- [ ] **Expect:** Quiz slide appears under Test Lesson in the outline
- [ ] Click it — center panel shows empty quiz, right panel shows quiz editor

### 3.5 Delete Slide

- [ ] Hover over the "Test Quiz" slide in the outline
- [ ] **Expect:** Delete icon appears on the right
- [ ] Click delete icon → confirm
- [ ] **Expect:** Slide removed from outline

### 3.6 Delete Lesson

- [ ] Hover over "Test Lesson" in the outline
- [ ] Click delete icon → confirm
- [ ] **Expect:** Lesson and any remaining slides removed

### 3.7 Preview Toggle

- [ ] Click **"Preview"** in the toolbar
- [ ] **Expect:** Full course player replaces the 3-panel editor
- [ ] Navigate with arrow keys or Next/Prev buttons
- [ ] Press `N` — presenter notes toggle (if slide has notes)
- [ ] Press `Escape` or click **"Edit"** — returns to editor

## Teardown

None needed — changes are saved to the database.
