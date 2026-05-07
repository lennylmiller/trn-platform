# POC Plan: Course Authoring UI

## Context

Courses are currently authored via YAML fixtures or MCP tools — there's no web UI for editing. This POC builds an authoring experience incrementally using **Experiment 1** as the first deliverable. We use Course 4 ("Benefit Administration — Creating a Health Plan", 7 lessons, 21 slides) as the concrete test case throughout.

The codebase already has strong patterns for this (CompositionEditorPage's 3-panel layout, useCompositionEditor's query+mutation hook, mutation invalidation in data-access). We follow these exactly.

---

## Experiment 1: Course Outline Editor

**Goal:** A new route `/courses/edit/:courseId` showing the lesson/slide tree for a course. Read-only structure view with expandable lessons, slide type chips, and a link to preview in the player.

### What we build

**New files:**

1. **`packages/courses/feature/src/hooks/useCourseEditor.ts`**
   - Wraps `useCourse(courseId)` from data-access
   - Manages selection state: `selectedLessonId`, `selectedSlideId`
   - Exposes `course`, `isLoading`, `error`, selection methods
   - This hook grows in later experiments (mutations, reorder) but starts read-only

2. **`packages/courses/ui-mui/src/components/CourseOutline.tsx`**
   - Left panel component: renders lesson/slide tree
   - Each lesson: expandable row with title, slide count, description
   - Each slide: indented row with slide type chip (colored by type), title
   - Click a lesson or slide to select it (highlight)
   - Uses MUI `List`, `ListItemButton`, `Collapse`, `Chip`

3. **`packages/courses/ui-mui/src/components/CourseEditor.tsx`**
   - Main editor shell: 3-panel layout following CompositionEditorPage pattern
   - Left: `CourseOutline` (lesson/slide tree)
   - Center: Selected slide preview (reuses `SlideRenderer` from player)
   - Right: Properties panel (read-only for Exp 1 — shows slide metadata)
   - Top bar: Back button, course title, status chip, "Preview" button (links to player)

4. **`apps/qc-training/src/pages/CourseEditorPage.tsx`**
   - Thin page wrapper (same pattern as `CoursePlayerPage`)
   - Gets `courseId` from route params, renders `CourseEditor`
   - `onExit` navigates back to `/courses`

**Modified files:**

5. **`apps/qc-training/src/App.tsx`**
   - Add route: `<Route path="/courses/edit/:courseId" element={<CourseEditorPage />} />`
   - Add import for `CourseEditorPage`

6. **`apps/qc-training/src/pages/CoursesPage.tsx`**
   - Add an "Edit" icon button on each `CourseCard` (next to existing click-to-play)
   - Or: long-press / right-click context menu — **simpler: just add a small edit icon**

7. **`packages/courses/ui-mui/src/index.ts`** (or barrel export)
   - Export `CourseEditor` and `CourseOutline`

8. **`packages/courses/feature/src/index.ts`**
   - Export `useCourseEditor`

### Key patterns followed

- **3-panel layout** from CompositionEditorPage (Box with flexbox, fixed-width sidebars)
- **Selection state** in feature hook (like `selectedBlockId` in useCompositionEditor)
- **SlideRenderer reuse** — the center panel uses the exact same slide rendering as the player
- **MUI components** — List, Chip, Collapse, Paper, IconButton (consistent with rest of app)
- **No new dependencies** — everything uses existing MUI, TanStack Query, React Router

### Navigation flow

```
CoursesPage                    CourseEditorPage
┌──────────────────┐          ┌──────────────────────────────────────┐
│ Course Card [✏️]──┼─────────▶│ ← Back │ Course Title │ Preview ▶  │
│                  │          │──────────────────────────────────────│
│                  │          │ Outline │   Slide Preview  │ Props  │
│                  │          │  │L1    │                  │ type:  │
│                  │          │  │ S1   │   [rendered      │ title: │
│                  │          │  │ S2●  │    slide         │ sql:   │
│                  │          │  │L2    │    content]       │        │
│                  │          │  │ S3   │                  │        │
└──────────────────┘          └──────────────────────────────────────┘
```

### Files and their locations (respecting layer architecture)

| Layer | Package | File | Purpose |
|---|---|---|---|
| feature | `@trn-platform/courses-feature` | `src/hooks/useCourseEditor.ts` | Editor state hook |
| ui-mui | `@trn-platform/courses-ui-mui` | `src/components/CourseOutline.tsx` | Tree view of lessons/slides |
| ui-mui | `@trn-platform/courses-ui-mui` | `src/components/CourseEditor.tsx` | 3-panel editor shell |
| app | `apps/qc-training` | `src/pages/CourseEditorPage.tsx` | Page wrapper + route |

### What we DON'T build in Experiment 1

- No editing / mutations (read-only view)
- No drag-and-drop reordering
- No add/delete lesson or slide
- No form fields for editing slide content
- No new API endpoints (existing GET is sufficient)

---

## Experiments 2-4 (Future — not built yet, just the roadmap)

### Experiment 2: Single Slide Editor
- Replace read-only properties panel with editable form
- Different form layouts per slide type (narrative = markdown editor, quiz = question + options, live_demo = SQL + label)
- Wire up `useUpdateSlide` mutation
- Auto-save or explicit save button

### Experiment 3: Add New Content
- "Add Lesson" button at bottom of outline
- "Add Slide" button within each lesson
- Slide type picker dialog
- Wire up `useAddLesson` and `useAddSlide` mutations
- Delete lesson/slide (need new mutations in data-access + server)

### Experiment 4: Preview Toggle
- Toggle button in editor toolbar: Edit / Preview
- Preview mode renders `CoursePlayer` inline (reuse full component)
- Seamless switch between authoring and learner view

---

## Verification (Experiment 1)

1. Start dev server: `pnpm dev` (server + storybook) or `pnpm server:dev` + open app
2. Navigate to `http://localhost:5174/courses`
3. Click edit icon on "Benefit Administration — Creating a Health Plan"
4. Verify: 7 lessons visible in outline, expandable to show 21 slides
5. Click a slide — center panel shows rendered preview, right panel shows metadata
6. Click "Preview" — navigates to existing course player
7. Click "Back" — returns to courses list
8. Test with Course 1 (QC Database Training, 4 lessons, 19 slides) for variety
9. Test with Course 5 (Code Management, 0 lessons) — should show empty state gracefully
