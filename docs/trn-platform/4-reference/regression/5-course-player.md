# 5. Course Player

Tests the learner-facing course player — slide rendering, navigation, keyboard shortcuts.

## Setup

Open a course with content in the player. Use Course 3 (QC System Foundations, 5 lessons, 22 slides): http://localhost:5174/courses/play/3

Or click any course card on the courses page.

## Steps

### 5.1 Player Loads

- [ ] **Expect:** Top bar shows course title, current lesson chip, slide type chip, "1 / 22"
- [ ] **Expect:** Progress bar at top (thin linear bar)
- [ ] **Expect:** Center area shows first slide content
- [ ] **Expect:** Navigation bar at bottom with Prev (disabled) and Next buttons

### 5.2 Slide Navigation

- [ ] Click **Next** → advances to slide 2
- [ ] **Expect:** Counter updates to "2 / 22", progress bar advances
- [ ] Click **Prev** → goes back to slide 1
- [ ] **Expect:** Counter back to "1 / 22"

### 5.3 Keyboard Shortcuts

- [ ] Press `→` (right arrow) → advances to next slide
- [ ] Press `←` (left arrow) → goes back
- [ ] Press `Space` → advances (same as right arrow)
- [ ] Press `N` → toggles presenter notes (if slide has notes, panel appears/hides)
- [ ] Press `F` → toggles fullscreen
- [ ] Press `Escape` → exits fullscreen, or exits player back to courses list

### 5.4 Slide Types Render Correctly

Navigate through slides and verify each type renders:

- [ ] **Narrative:** Title + markdown content with tables, bold, blockquotes
- [ ] **Live Demo:** Title + description + SQL code block with label
- [ ] **Quiz:** Question + radio options + "Check Answer" button
  - [ ] Select an answer → click Check Answer → shows correct/incorrect + explanation
- [ ] **SQL Challenge** (if present): Prompt + empty SQL area + "Show Hint" button + "Show Solution" toggle

### 5.5 Dot Indicators

- [ ] **Expect:** Bottom navigation shows dot indicators (up to 20 dots)
- [ ] **Expect:** Current dot is highlighted (primary color)

### 5.6 Exit Player

- [ ] Click the back arrow (top left) OR press Escape
- [ ] **Expect:** Navigates back to courses list

## Notes

- The player is read-only — no editing from here
- Quiz state resets when navigating away and back (no persistence)
- Fullscreen uses the browser's native fullscreen API
