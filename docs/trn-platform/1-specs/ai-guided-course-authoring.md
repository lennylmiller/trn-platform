# AI-Guided Course Authoring: Vision & Implementation Roadmap

## Part 1: Vision

### The Problem

Creating a QC training course requires deep domain knowledge — which tables matter, what order to configure them, what depends on what, how to verify the trainee did it right. That knowledge lives in people's heads. The existing 12 courses were hand-crafted through iterative conversation with AI (Claude Code). That process worked, but it's not repeatable by other authors without the same expertise.

### The Solution

An AI assistant embedded in the courseware app that project-manages an author through course creation. It builds domain expertise by reading the QC schema and data, then uses that knowledge to guide the author from a rough idea to a finished, verified course — generating templates, directing screenshot capture, building slides, and verifying data flow.

### Two Entry Points

**"I have a document"** — Author brings a PDF, procedures doc, or meeting notes. AI reads it, identifies teachable concepts, maps sections to slide types, proposes course structure. The document is the source material; the AI turns it into courseware.

**"I have a goal"** — Author describes an intent: "I need someone to understand adjudication and configure different rules." AI explores the QC schema, traces the dependency chain, identifies prerequisite courses, builds the course from the database up.

Both entry points converge on the same pipeline: the AI knows what needs to be taught, in what order, and what the trainee needs to do and verify at each step.

### The Capture Pipeline (POC)

For courses that involve the QC application UI, there's a third dimension: screenshots.

1. AI generates a **capture plan** — ordered list of screens to visit, what to configure, what to screenshot, what to name it, where to save it
2. Author works through the QC app following the plan, capturing with Snagit
3. **hooksai** watches the capture folder, triggers **capture-mcp** to triage each screenshot (keep/noise, suggest module/lesson assignment)
4. Author reviews and curates pending captures
5. When a lesson's captures are complete, AI drafts slides around the visual anchors

**Why hooksai:** It's a file-system-triggered automation runner that's MCP-native — it can call capture-mcp tools directly via `.hook.md` files. It bridges the physical act of taking screenshots (outside the browser) to the AI pipeline. This is POC territory — hooksai is one possible "how" for the automation. The pipeline design doesn't depend on it.

**Why capture-mcp:** It's the "single brain" for image processing — same MCP tools callable from hooksai, Claude Code, or the courseware app. Triage proposes, human disposes. Sidecar JSON makes decisions debuggable.

### The Conversational State Machine

The embedded AI maintains an internal progress checklist — not shown to the user, but guiding every interaction. The user experiences a natural conversation; the AI steers toward gaps.

**Course Definition Phase:**
- Audience/track identified
- Topic and scope defined
- Source material identified (PDF, screenshots, goal)
- QC tables/modules involved

**Structure Phase:**
- Prerequisite courses identified and linked
- Lesson outline proposed and approved by author
- Slide types assigned per lesson
- Data flow mapped (what seed SQL is needed, what each lesson produces)

**Content Phase (per lesson):**
- Narrative slides drafted with markdown content
- SQL demos written and verified via `run_sql`
- Quizzes with correct answers and explanations
- Verification slides with seed_sql and expected outcomes
- Screenshot placeholders or captures assigned

**Data Flow Phase:**
- Seed SQL creates required prerequisite state
- Each lesson's data builds on the previous
- Final verification confirms the full chain
- course_dependency records link to prerequisite courses

The AI doesn't dump this checklist on the author. It asks the next natural question based on what's missing. "Who's taking this course?" → "What QC tables are involved?" → "Let me explore those tables..." → "Here's a lesson outline — what do you think?"

### The Boundary

The AI can only do what the tools allow:
- `explore_schema` — inspect table structures
- `run_sql` — query data, test demo SQL
- `get_course`, `list_courses` — see existing courseware
- `add_course_lesson`, `add_course_slide` — build content
- `update_course` — set metadata
- `triage_capture`, `draft_lesson`, `move_to_curated` — process screenshots (via capture-mcp, future)

The system prompt encodes template patterns and authoring rhythm. MCP architecture means the same tools work from the web app, from Claude Code, and from hooksai. One brain, multiple entry points, human gates at every decision.

---

## Part 2: Implementation Roadmap

### Current State

| Experiment | Status | What It Delivered |
|---|---|---|
| 1: Course Outline Editor | Merged to main | 3-panel layout, lesson/slide tree |
| 2: Slide Editor | Merged to main | Per-type editable form, save to DB |
| 3: Add/Delete Content | Merged to main | CRUD dialogs, confirm deletes |
| 4: Preview Toggle | Merged to main | Inline Edit/Preview mode switch |
| 5: Course Tracks | Merged to main | Track > Series > Course hierarchy |
| 6: AI Authoring (ChatPanel) | Built, untested | Embedded ChatPanel with 5 course CRUD tools, authoring system prompt |

### Experiment 7: Guided "New Course" Flow

**Goal:** Click "Create Course" → enter the AI-guided conversation immediately. The AI walks you through defining the course before any manual editing.

**DoD:**
- [ ] "Create Course" button on CoursesPage opens a new route (`/courses/new`)
- [ ] New course page shows ChatPanel full-width (no outline/editor yet — course doesn't exist)
- [ ] AI greeting: asks what the author wants to teach, offers the two entry points
- [ ] AI creates the course record via `create_course` tool
- [ ] AI proposes lessons based on schema exploration or document analysis
- [ ] Once the author approves the outline, AI creates lessons and slides
- [ ] Redirects to `/courses/edit/:courseId` for refinement
- [ ] System prompt checklist tracks definition → structure → content phases internally

**Key files:**
- `apps/qc-training/src/pages/NewCoursePage.tsx` (new)
- `apps/qc-training/src/App.tsx` (add route)
- `apps/qc-training/src/pages/CoursesPage.tsx` (add Create button)
- `packages/chat/server/src/system-prompt.ts` (enhance guided flow prompt)

### Experiment 8: Schema-Driven Template Generation

**Goal:** When the author says "I want to teach adjudication", the AI explores the relevant tables, traces the dependency chain, and generates a structured template — the ordered capture/teaching plan.

**DoD:**
- [ ] AI calls `explore_schema` to discover adjudication-related tables
- [ ] AI calls `run_sql` to check what training data exists vs what's needed
- [ ] AI identifies prerequisite courses from existing catalog
- [ ] AI proposes lesson outline with slide types mapped to tables
- [ ] AI generates seed SQL for each lesson's prerequisite data
- [ ] Template output includes: lesson title, tables covered, slide types, capture instructions (if applicable), seed SQL, verification SQL
- [ ] course_dependency records created for prerequisites

**Key files:**
- `packages/chat/server/src/system-prompt.ts` (template generation instructions)
- `packages/chat/server/src/tools.ts` (may need `create_course_dependency` tool)
- `packages/courses/server/src/queries.ts` (add dependency CRUD if needed)

### Experiment 9: PDF Document Ingestion

**Goal:** Author uploads/pastes a PDF or document. AI extracts structure and proposes a course.

**DoD:**
- [ ] Upload or paste mechanism in the NewCoursePage chat
- [ ] AI reads document content, identifies sections/concepts
- [ ] AI proposes course structure mapping document sections to lessons/slides
- [ ] Author refines via conversation
- [ ] AI builds the course from the approved structure

**Key files:**
- TBD — depends on how we handle document input (file upload to API, paste as text, or PDF tool)
- `packages/chat/server/src/tools.ts` (may need document reading tool)

### Experiment 10: Capture Pipeline Integration (POC)

**Goal:** Connect capture-mcp to the courseware app so the AI can direct screenshot capture and process results.

**DoD:**
- [ ] AI generates capture instructions ("take a screenshot of the client setup screen, save as...")
- [ ] Capture-mcp triage works for course screenshots (existing tool, may need config)
- [ ] hooksai hook watches course-raw folder and calls triage (POC — `.hook.md` file)
- [ ] CourseEditor can display captured images as slide image_url candidates
- [ ] AI can call `draft_lesson` with curated captures to generate slide content

**Key files:**
- capture-mcp server (external, existing)
- hooksai hook definitions (external, POC)
- `packages/chat/server/src/tools.ts` (add capture-mcp proxy tools or direct MCP client)
- `packages/courses/ui-mui/src/components/SlideEditorForm.tsx` (image picker from curated folder)

### Experiment 11: Verification Slide Enhancements

**Goal:** Strengthen the "do it in QC and verify" loop for hands-on courses.

**DoD:**
- [ ] AI generates `do_it_in_qc` slides with working verification SQL
- [ ] AI generates seed SQL that creates known-state prerequisite data
- [ ] Verification runs against qc_core and shows pass/fail with explanation
- [ ] Consider new slide type: `configure_and_verify` — author makes a change in QC, slide verifies the DB reflects it
- [ ] AI can test its own verification SQL via `run_sql` before creating the slide

**Key files:**
- `packages/shared/src/schemas/course.ts` (new slide type if needed)
- `packages/courses/ui-mui/src/components/slides/DoItInQcSlide.tsx` (enhance)
- `packages/chat/server/src/system-prompt.ts` (verification authoring guidelines)

---

## Flexibility Notes

- **hooksai is POC plumbing.** The capture pipeline design works with any file-watcher + MCP-client. If hooksai doesn't fit long-term, the hooks become Express endpoints or browser workers.
- **capture-mcp is in-progress.** Core triage and draft_lesson tools exist. Integration with the courseware app is future work.
- **Experiments are ordered by dependency** but each is independently valuable. Experiment 7 (guided new course) is the next concrete deliverable. Experiments 9-10 can be deferred or reordered.
- **The conversational state machine starts simple** (system prompt instructions) and can grow into explicit state tracking if needed.
