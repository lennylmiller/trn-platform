# Tightened Plan: Slide Editing Experience

## Context

We have: document-first slides (markdown with component tags), templates with placeholders, and a rendering pipeline that works. But the **editor** still shows old block-level forms. There's no way to see, edit, or interact with a slide's markdown content in the app.

The goal: click a slide in the outline → see its rendered content in the canvas → edit the markdown in the right panel → see live preview update. Simple, clean, one flow.

## The Experience

1. **Outline shows Lesson → Slide** (not Lesson → Block)
2. **Click a slide** → center canvas renders the markdown (with component tags rendered inline — quizzes, SQL demos, placeholders all visible)
3. **Right panel: split editor** — top half is a monospace textarea with the raw markdown, bottom half shows a mini toolbar (insert `<Quiz/>`, `<LiveDemo/>`, `<Placeholder/>`, `<Image/>` tags)
4. **Edit the markdown** → canvas updates live
5. **Save** → persists to `course_slide.content`

No heavyweight editor library. Split view: raw markdown input + live rendered preview. The canvas IS the preview. The right panel IS the editor. Zero new dependencies.

## What Changes

### 1. Outline: show slides instead of blocks

**File:** `packages/courses/ui-mui/src/components/CourseOutline.tsx`

When a lesson has `slides[]`, show slides in the tree instead of blocks. Each slide row shows its title and a "doc" icon. Fall back to showing blocks for lessons without slides.

### 2. Selection state: support slide selection

**File:** `packages/courses/feature/src/hooks/useCourseEditor.ts`

Add `selectedSlide` to the hook's return value. When a slide is selected (from outline), resolve the `CourseSlide` object from the course data. Existing block selection still works for old-model courses.

### 3. Canvas: render slide content

**File:** `packages/courses/ui-mui/src/components/CourseEditor.tsx`

When a slide is selected:
- Center canvas renders `slide.content` through `MarkdownBlock` (interactive=true)
- This shows narrative text, rendered quizzes, SQL demos, and placeholder boxes — all inline

### 4. Right panel: SlideMarkdownEditor

**File:** `packages/courses/ui-mui/src/components/SlideMarkdownEditor.tsx` (NEW)

Simple component:
- `<TextField multiline>` with monospace font, full height
- Value bound to `slide.content`
- Save button (explicit save, not auto-save)
- Insert toolbar: buttons that insert component tag snippets at cursor
  - `<LiveDemo sql="" label="" />`
  - `<Quiz question="" options='["","","",""]' answer="0" explanation="" />`
  - `<Placeholder type="" label="" />`
  - `<Image src="" alt="" />`
- On save: `PUT /api/v2/courses/:id/slides/:slideId` updates `course_slide.content`

### 5. Slide CRUD API

**File:** `packages/courses/server/src/queries.ts` + `routes.ts`

- `updateSlideContent(slideId, content)` — updates `course_slide.content`
- `PUT /api/v2/courses/:id/slides/:slideId` route

### 6. Wire it together in CourseEditor

**File:** `packages/courses/ui-mui/src/components/CourseEditor.tsx`

Right panel logic:
- If `selectedSlide` has `content` → show `SlideMarkdownEditor`
- If `selectedBlock` → show `BlockEditorForm` (old model)
- If AI tab → show `ChatPanel`
- If Drafts tab → show `DraftPanel`

The Editor/AI/Drafts tabs remain. "Editor" tab now shows either SlideMarkdownEditor or BlockEditorForm depending on what's selected.

## Files

| File | Change |
|---|---|
| `packages/courses/ui-mui/src/components/CourseOutline.tsx` | Show slides when available |
| `packages/courses/feature/src/hooks/useCourseEditor.ts` | Add selectedSlide |
| `packages/courses/ui-mui/src/components/CourseEditor.tsx` | Canvas renders slide.content, right panel adapts |
| `packages/courses/ui-mui/src/components/SlideMarkdownEditor.tsx` | NEW — markdown textarea + insert toolbar |
| `packages/courses/server/src/queries.ts` | updateSlideContent() |
| `packages/courses/server/src/routes.ts` | PUT slide content route |

## Verification

1. Apply template to a course: `POST /api/v2/courses/:id/apply-template`
2. Open the course in the editor
3. Outline shows Lesson → Slide (not blocks)
4. Click a slide → canvas renders markdown with placeholders highlighted
5. Right panel shows markdown editor with the raw content
6. Edit the markdown → click Save → refresh → content persisted
7. Click insert "Quiz" button → `<Quiz ... />` tag inserted at cursor
8. Player still renders the course correctly
9. Old block-based courses still work (fallback)
