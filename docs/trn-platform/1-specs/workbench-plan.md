# Experiment 9: Course Authoring Workbench

## Context

The course editor works for block-level editing, and the AI can build courses from prompts. But there's no creative workspace between "rough idea" and "finished course." Authors need a place to plan, draft, collect images, compare approaches, and compose visual layouts before committing to the course structure.

This plan is **intent-driven** — it describes what the author needs to do, not which tools implement it. Tool choices (hooksai, capture-mcp, etc.) are noted as options, not commitments.

---

## Use Cases

### UC-1: Plan a Course from a Goal

**Actor:** Course Author
**Intent:** "I want to teach adjudication. Help me figure out what lessons to create."

**Flow:**
1. Author opens workbench for a course (new or existing)
2. Author types rough idea in Plan mode
3. AI generates 2-3 draft outlines (different approaches: quick overview vs deep dive vs hands-on)
4. Author browses drafts as markdown documents, compares them
5. Author selects a draft (or edits one), promotes it to the course structure
6. Blocks and lessons are created from the selected draft

**What's needed:**
- Draft document storage (per-course, multiple drafts)
- Draft comparison view (side by side or tabbed)
- "Promote to course" action that converts a draft into blocks via build_course_content

### UC-2: Plan a Course from a Document

**Actor:** Course Author  
**Intent:** "I have a training PDF. Turn it into a course."

**Flow:**
1. Author uploads a PDF or pastes text into the workbench
2. AI reads the document, identifies teachable sections
3. AI generates a draft outline mapping document sections to lessons/blocks
4. Author refines the draft, adjusts block types
5. Author promotes the draft to course structure

**What's needed:**
- Document upload (PDF, text, markdown)
- AI document analysis (extract sections, map to block types)
- Same draft workflow as UC-1

### UC-3: Capture Screenshots for a Course

**Actor:** Course Author
**Intent:** "I need screenshots of the QC application screens for this lesson."

**Flow:**
1. Author views a lesson in the workbench that has image placeholders
2. Workbench shows a capture checklist: "Screenshot 1: Client setup screen, Screenshot 2: Benefit contract form"
3. Author captures screenshots (Snagit, browser screenshot, or drag-drop from desktop)
4. Author uploads/drops images into the workbench
5. Images are associated with specific blocks or placeholders
6. AI optionally writes narrative content around the captured image

**What's needed:**
- Image upload (drag-drop zone per block or per lesson)
- Image storage (static files served by Express, or blob storage)
- Image placeholder in draft outlines
- Optional: AI vision to describe uploaded screenshots

**Tool options (not commitments):**
- **Manual upload** — simplest, author drags images into workbench (no external tools)
- **capture-mcp** — automated triage of Snagit screenshots landing in a folder
- **hooksai** — file watcher that triggers capture-mcp when screenshots appear
- **Browser extension** — future option, capture directly from within the app

### UC-4: Compose Visual Slides from Blocks + Images

**Actor:** Course Author
**Intent:** "I want this lesson's first slide to show a narrative block on the left and a screenshot on the right."

**Flow:**
1. Author views a lesson in the workbench
2. Each lesson has a "slide composer" where blocks and images can be arranged
3. Author drags a narrative block and an image into a slide layout
4. The slide becomes the visual unit the learner sees
5. Author previews the slide as the learner would see it

**What's needed:**
- Slide container (new data model: slide has many blocks + images + layout)
- Layout system (simple: full-width, side-by-side, image-left/right)
- Preview rendering

**Note:** This is the most complex use case. For the POC, we can skip the visual composer and just have blocks render sequentially (current behavior) with images inline.

### UC-5: Verify Data Flow Across Lessons

**Actor:** Course Author
**Intent:** "Does lesson 3 have the right seed SQL so the learner can run the demo?"

**Flow:**
1. Author views the course in the workbench
2. Workbench shows a data flow diagram: which lessons produce data, which consume it
3. Author clicks a lesson to see what seed SQL is needed vs what exists
4. AI suggests seed SQL based on the tables involved
5. Author tests the seed SQL against qc_training

**What's needed:**
- Dependency analysis (which tables each lesson touches)
- Seed SQL generator tool
- SQL test runner (already exists: run_sql)

---

## Architecture: Intent vs Tool

| Intent | What the workbench provides | Tool options |
|---|---|---|
| "Help me plan" | Draft documents, AI-generated outlines | Claude API (current), Claude Code (Plan mode) |
| "I have a document" | Upload zone, AI extraction | PDF parsing library, Claude vision, paste-as-text |
| "I need screenshots" | Upload zone, image placeholders, checklist | Manual drag-drop, capture-mcp, hooksai, browser extension |
| "Compose a slide" | Layout editor, block+image arrangement | Custom React component, future feature |
| "Verify data flow" | Dependency graph, seed SQL testing | Schema cache + run_sql (existing tools) |
| "Build it" | Promote draft → build_course_content | MCP tools (existing) |

The workbench **decouples the creative workflow from the tool implementation.** Each intent can start with the simplest tool (manual upload, paste text) and graduate to automation (capture-mcp, hooksai) later without changing the UI.

---

## Implementation Phases

### Phase 1: Draft Documents (Experiment 9a)

**Goal:** Authors can generate, browse, edit, and promote AI-generated course outlines.

**New data model:**
```sql
CREATE TABLE course_draft (
  draft_id      INT IDENTITY(1,1) PRIMARY KEY,
  course_id     INT NOT NULL REFERENCES course(course_id) ON DELETE CASCADE,
  title         NVARCHAR(300) NOT NULL,
  content       NVARCHAR(MAX) NOT NULL,  -- markdown
  source        NVARCHAR(50) NULL,       -- 'ai-plan', 'ai-document', 'manual'
  status        NVARCHAR(20) DEFAULT 'draft',  -- draft, selected, archived
  created_at    DATETIME2 DEFAULT SYSUTCDATETIME()
);
```

**UI:** New "Drafts" tab in the workbench (alongside Outline and Chat). Shows a list of draft documents. Click to view/edit. "Promote" button converts selected draft to course content.

**AI integration:** Plan mode generates a draft document (instead of putting text in the input field). The draft is saved to the database. Author can ask for more drafts.

**Files:**
- Migration: `server/db/migrations/010_course_drafts.sql`
- Schema: `packages/shared/src/schemas/course.ts` (add CourseDraft types)
- Server: `packages/courses/server/src/queries.ts` (draft CRUD)
- Routes: `packages/courses/server/src/routes.ts` (draft endpoints)
- UI: `packages/courses/ui-mui/src/components/DraftPanel.tsx`
- CourseEditor: add draft panel as an alternative to chat/editor in the right column

### Phase 2: Image Upload (Experiment 9b)

**Goal:** Authors can upload images and associate them with blocks.

**Implementation:**
- Express static file serving: `POST /api/v2/uploads` → saves to `uploads/` directory
- Image URL stored on blocks via existing `image_url` field
- Drag-drop zone in BlockEditorForm for image_url field
- Image preview in block renderer

**No external tools required.** This is pure file upload. capture-mcp integration is a future enhancement.

### Phase 3: Workbench Layout (Experiment 9c)

**Goal:** Replace the current 3-panel editor with the workbench layout.

**Layout:**
```
[Outline] [Canvas/Preview] [Drafts/Chat/Editor]
```

The right panel becomes tabbed:
- **Chat** — AI Author (current ChatPanel)
- **Drafts** — draft documents (Phase 1)
- **Editor** — block editor (current BlockEditorForm)

The center panel (Canvas) adapts based on context:
- Viewing a draft → renders the markdown document
- Viewing a block → renders the block preview
- Capture mode → shows image placeholders and upload zones

### Phase 4: Data Flow & Verification (Experiment 9d)

**Goal:** Authors can see and test data dependencies across lessons.

**Implementation:**
- Dependency visualization (which tables each lesson's SQL touches)
- Seed SQL suggestions based on schema cache
- "Test" button that runs seed SQL + verification SQL against qc_training

---

## What We DON'T Build (Yet)

- Visual slide composer (drag blocks + images into layouts) — save for after the container model
- capture-mcp integration — manual upload first, automate later
- hooksai automation — same as above
- PDF parsing — paste-as-text is sufficient for POC
- Multi-user collaboration — single author for now

---

## Verification

### Phase 1 (Drafts):
1. Create course → open workbench
2. Use Plan mode → AI generates draft → draft saved to database
3. Browse drafts in the Drafts tab
4. Edit a draft → save
5. "Promote" a draft → build_course_content creates lessons/blocks
6. Switch to Outline → see the built course

### Phase 2 (Images):
1. Open a block editor → drag-drop an image
2. Image uploads to server, image_url populated
3. Block preview shows the image
4. Course player renders the image

### Phase 3 (Layout):
1. Right panel shows Chat/Drafts/Editor tabs
2. Switching between tabs preserves state
3. Canvas adapts to current context

### Phase 4 (Data Flow):
1. View course dependencies
2. AI suggests seed SQL for a lesson
3. Test seed SQL against qc_training
