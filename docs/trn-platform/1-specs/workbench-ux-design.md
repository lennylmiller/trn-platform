# Course Authoring Workbench — User Experience Design

## Context

Before building the workbench, we need to visualize the complete authoring journey. This document walks through the ideal user experience from "I have an idea" to "here's a polished, branded presentation." It includes the slide container layer (blocks compose into slides) and a theming/branding system.

---

## The Journey: Creating "Claims & Adjudication" Course

### Act 1: Starting the Course

**The author clicks "Create Course."** A modal appears:
- Title: "Claims & Adjudication"
- Track: "New User Onboarding"  
- Category: "Implementation"
- Theme: dropdown with "QC Default", "Verda Health Plan", "Acme Dark" — each with a color preview swatch

**Click Create.** The workbench opens. It's not the old 3-panel editor — it's a purpose-built authoring environment.

### Act 2: The Workbench — First View

The screen has three areas:

**Left sidebar (narrow, ~250px): Course Navigator**
- Course title + theme badge at top
- Collapsible tree: Lessons → Slides → Blocks
- Right now it's empty: "No lessons yet"
- At the bottom: "Add Lesson" button
- The navigator is always visible — it's your map

**Center stage (flexible): The Canvas**
- Large, clean workspace
- Shows a welcome state: "How do you want to start?"
- Three cards:
  - **"I have a goal"** — opens AI chat in the canvas
  - **"I have a document"** — opens upload/paste zone
  - **"Start from scratch"** — opens an empty lesson editor
- This is the first thing the author interacts with

**Right dock (collapsible, ~380px): Tools Panel**
- Tabbed: **AI** | **Drafts** | **Properties**
- Starts on **AI** tab with Plan/Act toggle
- Can be collapsed to give canvas full width
- Can be expanded to take over the canvas

### Act 3: Planning with AI

The author clicks **"I have a goal"** on the welcome screen. The canvas transforms into a focused chat view (not crammed into a sidebar). Full width, comfortable.

Author types: *"I want to teach new QC users how claim adjudication works, using the Borgia family as the training scenario."*

**Plan mode is active.** The message goes to Claude Code. 30 seconds later, the canvas shows:

> **Draft: Claims & Adjudication — Comprehensive**
> 
> Build out this course with 4 lessons...
> Lesson 1: "What Is a Claim?"...
> Lesson 2: "Claim Procedure Lines"...
> ...

But it doesn't stop there. The AI generates **two more drafts** — saved automatically:

> **Draft: Claims & Adjudication — Quick Overview** (3 lessons, lightweight)
> **Draft: Claims & Adjudication — Hands-On Deep Dive** (6 lessons, heavy on sql_challenge and do_it_in_qc)

The author sees all three in the **Drafts tab** of the tools panel. They click between them. The canvas renders each draft as formatted markdown. They can compare.

### Act 4: Promoting a Draft

The author picks "Comprehensive" and clicks **Promote to Course**. A confirmation shows: "This will create 4 lessons with ~16 blocks. Continue?"

Yes. The AI calls `build_course_content`. The navigator populates:

```
Lesson 1: What Is a Claim?
  ├─ Slide 1: [narrative] The Claim Table
  ├─ Slide 2: [live_demo] Query TRAIN-BORGIA-CLM-001
  └─ Slide 3: [quiz] What is claim_ud?
Lesson 2: Claim Procedure Lines
  ├─ Slide 1: [narrative] + [image placeholder]
  ...
```

Each "slide" in the navigator is a **container** — it might have one block (like the quiz) or multiple blocks + an image (like a narrative with a screenshot beside it).

### Act 5: Composing Slides

The author clicks "Slide 1" under Lesson 1. The canvas shows the **Slide Composer**:

A visual representation of the slide. Right now it has one block — a narrative. The author sees:

```
┌────────────────────────────────────────────┐
│  The Claim Table                           │
│                                            │
│  Every claim in qc_core has a header...    │
│  [rendered markdown preview]               │
│                                            │
└────────────────────────────────────────────┘
```

Below the slide, a toolbar: **+ Add Block** | **+ Add Image** | **Layout: Full Width ▾**

The author clicks **+ Add Image**. A drag-drop zone appears. They drag a screenshot from their desktop — a picture of the QC application's claim screen. The image uploads, and the slide now has two elements.

They click **Layout: Side by Side**. The slide rearranges:

```
┌──────────────────────┬─────────────────────┐
│  The Claim Table     │  [screenshot.png]   │
│                      │                     │
│  Every claim in      │  [QC claim screen]  │
│  qc_core has a...    │                     │
└──────────────────────┴─────────────────────┘
```

The Properties panel (right dock) shows slide properties: layout type, transition, background color from the theme.

### Act 6: Editing Blocks

The author double-clicks the narrative text area. It switches from preview to edit mode — inline. A markdown editor appears in place (or the Properties panel switches to the block editor with the title, content textarea, etc.).

They adjust the text, add a table showing column names. Click outside — it renders back to preview. The slide updates in real-time.

For the SQL demo slide, they click the SQL block. The Properties panel shows the SQL editor (monospace textarea) and a **Run** button that tests it against qc_core. Results appear inline below the SQL.

### Act 7: Theming & Branding

The author clicks the **theme badge** in the navigator header. A theme editor opens:

- **Color palette:** primary, secondary, background, text
- **Logo:** upload or URL — appears in the player header
- **Font family:** dropdown (Inter, Roboto, Georgia, system)
- **Slide backgrounds:** default color, optional background image
- **Code block style:** dark/light theme for SQL blocks

They pick "Verda Health Plan" theme — blue/white with the Verda logo. The canvas immediately re-renders with the new colors. Every slide preview updates.

The theme is stored on the course (or the track) — all courses in a track share the theme unless overridden.

### Act 8: Preview & Polish

The author clicks **Preview** in the top toolbar. The full course player opens — but now it renders **slides, not blocks**. Each slide is a composed visual unit with its layout, images, and theme applied.

Slide 1: narrative text on the left, screenshot on the right, Verda logo in the corner, blue header bar.
Slide 2: full-width SQL demo with dark code block theme.
Slide 3: quiz centered with branded radio buttons.

They navigate through with arrow keys. Everything looks polished. They notice Slide 4 needs a screenshot — it shows a placeholder: "📷 Screenshot needed: Benefit contract form." They go back to edit, capture the screenshot, drop it in.

### Act 9: Publishing

The author clicks **Publish** (where "Draft" chip currently is). The status changes to "Published." The course appears in the learner-facing catalog. The theme, images, and composed slides are all part of the published output.

---

## Data Model for This Experience

### Slide Container (new)

```
Course → Lesson → Slide → SlideElement
```

```sql
CREATE TABLE course_slide (
  slide_id      INT IDENTITY(1,1) PRIMARY KEY,
  lesson_id     INT NOT NULL REFERENCES course_lesson(lesson_id) ON DELETE CASCADE,
  seq           INT NOT NULL,
  layout        NVARCHAR(30) DEFAULT 'full',  -- full, side-by-side, image-left, image-right
  title         NVARCHAR(300) NULL,
  notes         NVARCHAR(MAX) NULL,           -- presenter notes (moved from block)
  CONSTRAINT UQ_course_slide_seq UNIQUE (lesson_id, seq)
);

CREATE TABLE course_slide_element (
  element_id    INT IDENTITY(1,1) PRIMARY KEY,
  slide_id      INT NOT NULL REFERENCES course_slide(slide_id) ON DELETE CASCADE,
  seq           INT NOT NULL,
  element_type  NVARCHAR(20) NOT NULL,        -- 'block' or 'image'
  block_id      INT NULL REFERENCES course_block(block_id),  -- if element_type='block'
  image_url     NVARCHAR(500) NULL,           -- if element_type='image'
  image_alt     NVARCHAR(300) NULL,
  CONSTRAINT UQ_slide_element_seq UNIQUE (slide_id, seq)
);
```

A **slide** is a visual screen. It has a layout and contains **elements** — either blocks (content) or images. The same block can appear in multiple slides (reusable), or each block belongs to one slide (simpler).

### Theme (new)

```sql
CREATE TABLE course_theme (
  theme_id      INT IDENTITY(1,1) PRIMARY KEY,
  title         NVARCHAR(100) NOT NULL,
  colors        NVARCHAR(MAX) NULL,           -- JSON: { primary, secondary, bg, text }
  logo_url      NVARCHAR(500) NULL,
  font_family   NVARCHAR(100) NULL,
  metadata      NVARCHAR(MAX) NULL,           -- JSON: additional style properties
  created_at    DATETIME2 DEFAULT SYSUTCDATETIME()
);

ALTER TABLE course ADD theme_id INT NULL REFERENCES course_theme(theme_id);
ALTER TABLE course_track ADD theme_id INT NULL REFERENCES course_theme(theme_id);
```

Themes can be assigned per-course or per-track (track theme is the default, course overrides).

---

## What We Build — Implementation Order

### Phase 0: Slide Container Layer (prerequisite)

**Why first:** Everything else depends on the distinction between "block" (content unit) and "slide" (visual screen). Without it, the workbench has nothing to compose.

- Migration: course_slide + course_slide_element tables
- Schema types: CourseSlide, CourseSlideElement
- Server: slide CRUD, update getCourse to include slides
- Player: render slides (each slide renders its elements) instead of flat blocks
- Editor navigator: show Lesson → Slide → Block hierarchy

**Backwards compat:** For existing courses that have no slides, auto-create one slide per block (1:1 mapping). The player falls back to flat block rendering if no slides exist.

### Phase 1: Workbench Canvas (the center panel)

- Welcome screen with three entry points
- Canvas renders: draft preview, slide composer, or block editor depending on context
- Slide composer: visual layout of blocks + images within a slide
- Inline edit: double-click a block to edit in place

### Phase 2: Image Upload + Placeholders

- Drag-drop upload to Express static serving
- Image elements in slides
- Placeholder system: AI marks where screenshots are needed
- Capture checklist per lesson

### Phase 3: Theme System

- Theme CRUD (create, assign to course/track)
- Theme editor: colors, logo, font
- Player renders with theme applied
- Canvas preview shows themed slides

### Phase 4: AI Integration (refinement)

- Plan mode saves drafts automatically
- Multiple draft generation
- "Promote" executes build_course_content AND creates slide containers
- AI-generated image placeholders with capture instructions

---

## Files Affected

| Area | Files |
|---|---|
| Migrations | `011_course_slides.sql`, `012_course_themes.sql` |
| Shared schemas | `packages/shared/src/schemas/course.ts` |
| Server queries | `packages/courses/server/src/queries.ts` |
| Server routes | `packages/courses/server/src/routes.ts` |
| Player | `packages/courses/ui-mui/src/components/CoursePlayer.tsx` |
| Player hook | `packages/courses/feature/src/hooks/useCoursePlayer.ts` |
| Editor | `packages/courses/ui-mui/src/components/CourseEditor.tsx` |
| New: SlideComposer | `packages/courses/ui-mui/src/components/SlideComposer.tsx` |
| New: ThemeEditor | `packages/courses/ui-mui/src/components/ThemeEditor.tsx` |
| New: WelcomeScreen | `packages/courses/ui-mui/src/components/WelcomeScreen.tsx` |

## Verification

### Phase 0 (Slide Container):
1. Existing courses still play correctly (backwards compat)
2. Create a slide with two elements (block + image) → player renders both
3. Layout switch (full → side-by-side) → preview updates

### Phase 1 (Canvas):
1. New course shows welcome screen
2. Click "I have a goal" → canvas becomes AI chat
3. Promote draft → navigator populates with lessons/slides

### Phase 2 (Images):
1. Drag image into slide composer → uploads, appears in slide
2. AI creates placeholder → shows "Screenshot needed" in preview
3. Player renders images alongside blocks

### Phase 3 (Theme):
1. Create theme with custom colors + logo
2. Assign to course → canvas and player render with theme
3. Track theme applies to all courses in track
