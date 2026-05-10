# Courses Domain — Interactive Training Course Builder

## Context

Plexis has existing training content (PowerPoint decks, PDF walkthroughs, ER diagrams, SQL examples) that are static and non-interactive. The goal is a **Course Builder** — a tool that converts this content into interactive, web-based training courses where SQL runs live, learners do tasks in the real QC application, and the system verifies their work.

This is a new domain (`packages/courses/`) following the existing DDD 4-layer architecture. It is independent of the existing compositions domain — compositions remain for the Bridge Builder presentation system, courses are the next-gen interactive training platform.

## User Decisions

- **New domain** — `packages/courses/` as 6th domain (server/data-access/feature/ui-mui)
- **All 7 slide types** designed from the start (build incrementally)
- **File upload** to Express for images/screenshots
- **Independent of stories** — courses stand alone
- **Both verification modes** — auto-verify (pass/fail) and show-results, per slide

---

## Slide Types

| Type | What learner sees | Author provides | Verification |
|------|------------------|----------------|-------------|
| `narrative` | Rich markdown text, images, tables | Markdown content, optional image_url | None |
| `reference` | ER diagram, screenshot, visual reference | Image + caption, optional markdown | None |
| `live_demo` | Runnable SQL with results | SQL query, label, optional expected results | Optional — auto-verify row count/values |
| `sql_challenge` | Editable SQL area, "Check" button | Prompt, solution SQL, hints | Auto — compare learner results vs solution results |
| `quiz` | Multiple choice or true/false | Question, options[], correct_answer, explanation | Auto — check selected answer |
| `do_it_in_qc` | Instructions + "Check My Work" button | Task description, verification SQL, expected values | Auto — runs verification SQL, compares to expected |
| `screenshot_task` | Instructions + image drop zone | Task description, expected screen name | Manual — instructor reviews uploaded image |

---

## Database Tables

### `course` — The training course container

```sql
CREATE TABLE course (
  course_id      INT IDENTITY(1,1) PRIMARY KEY,
  title          NVARCHAR(300)  NOT NULL,
  description    NVARCHAR(MAX)  NULL,
  category       NVARCHAR(50)   NULL,        -- 'database', 'reports', 'enrollment', etc.
  status         NVARCHAR(20)   NOT NULL DEFAULT 'draft',  -- draft, published, archived
  cover_image_url NVARCHAR(500) NULL,
  created_at     DATETIME2      DEFAULT SYSUTCDATETIME(),
  updated_at     DATETIME2      DEFAULT SYSUTCDATETIME()
);
```

### `course_section` — Groups slides into sections (acts/chapters)

```sql
CREATE TABLE course_section (
  section_id     INT IDENTITY(1,1) PRIMARY KEY,
  course_id      INT            NOT NULL REFERENCES course(course_id) ON DELETE CASCADE,
  seq            INT            NOT NULL,
  title          NVARCHAR(300)  NOT NULL,
  description    NVARCHAR(MAX)  NULL,
  CONSTRAINT UQ_course_section_seq UNIQUE (course_id, seq)
);
```

### `course_slide` — Individual slides with typed content

```sql
CREATE TABLE course_slide (
  slide_id       INT IDENTITY(1,1) PRIMARY KEY,
  section_id     INT            NOT NULL REFERENCES course_section(section_id) ON DELETE CASCADE,
  seq            INT            NOT NULL,
  slide_type     NVARCHAR(30)   NOT NULL,    -- narrative, reference, live_demo, sql_challenge, quiz, do_it_in_qc, screenshot_task
  title          NVARCHAR(300)  NULL,
  content        NVARCHAR(MAX)  NULL,        -- markdown text (narrative, instructions)
  image_url      NVARCHAR(500)  NULL,        -- for reference slides, screenshots
  
  -- SQL-related fields (live_demo, sql_challenge, do_it_in_qc)
  sql_text       NVARCHAR(MAX)  NULL,        -- the SQL to run or the solution SQL
  sql_label      NVARCHAR(200)  NULL,        -- display label for the SQL block
  
  -- Verification fields
  verify_mode    NVARCHAR(20)   NULL,        -- 'auto' (compare results) or 'show' (just display) or NULL
  expected_json  NVARCHAR(MAX)  NULL,        -- JSON: expected results for auto-verify {row_count?, values?: [...]}
  
  -- Quiz fields
  quiz_question  NVARCHAR(MAX)  NULL,
  quiz_options   NVARCHAR(MAX)  NULL,        -- JSON array of option strings
  quiz_answer    INT            NULL,        -- index of correct option (0-based)
  quiz_explanation NVARCHAR(MAX) NULL,       -- shown after answering
  
  -- Hints and notes
  hints          NVARCHAR(MAX)  NULL,        -- JSON array of hint strings (revealed progressively)
  presenter_notes NVARCHAR(MAX) NULL,
  
  created_at     DATETIME2      DEFAULT SYSUTCDATETIME(),
  CONSTRAINT UQ_course_slide_seq UNIQUE (section_id, seq)
);
```

### `upload` — File uploads (images, screenshots)

```sql
CREATE TABLE upload (
  upload_id      INT IDENTITY(1,1) PRIMARY KEY,
  filename       NVARCHAR(500)  NOT NULL,
  original_name  NVARCHAR(500)  NOT NULL,
  mime_type      NVARCHAR(100)  NOT NULL,
  size_bytes     INT            NOT NULL,
  uploaded_at    DATETIME2      DEFAULT SYSUTCDATETIME()
);
```

---

## Relationship Diagram

```
course (1)
└── (N) course_section
        ├── seq (ordering)
        ├── title ("Act 1: Enrollment", "QC Database Standards")
        └── (N) course_slide
              ├── seq (ordering within section)
              ├── slide_type (narrative, live_demo, quiz, etc.)
              ├── content (markdown)
              ├── sql_text (for runnable slides)
              ├── verify_mode + expected_json (for auto-verify)
              ├── quiz_* fields (for quiz slides)
              └── image_url → upload or external URL

upload (standalone, referenced by image_url)
```

Key difference from compositions: **slides are typed** and the type determines which fields are used and how the player renders the slide.

---

## Zod Schemas (`packages/shared/src/schemas/course.ts`)

```typescript
export const SlideTypeSchema = z.enum([
  'narrative', 'reference', 'live_demo', 'sql_challenge',
  'quiz', 'do_it_in_qc', 'screenshot_task'
]);

export const VerifyModeSchema = z.enum(['auto', 'show']);

export const CourseStatusSchema = z.enum(['draft', 'published', 'archived']);

export const CourseSchema = z.object({
  course_id: z.number(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  status: CourseStatusSchema,
  cover_image_url: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export const CourseSectionSchema = z.object({
  section_id: z.number(),
  course_id: z.number(),
  seq: z.number(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
});

export const CourseSlideSchema = z.object({
  slide_id: z.number(),
  section_id: z.number(),
  seq: z.number(),
  slide_type: SlideTypeSchema,
  title: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  sql_text: z.string().nullable().optional(),
  sql_label: z.string().nullable().optional(),
  verify_mode: VerifyModeSchema.nullable().optional(),
  expected_json: z.unknown().nullable().optional(),
  quiz_question: z.string().nullable().optional(),
  quiz_options: z.array(z.string()).nullable().optional(),
  quiz_answer: z.number().nullable().optional(),
  quiz_explanation: z.string().nullable().optional(),
  hints: z.array(z.string()).nullable().optional(),
  presenter_notes: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
});

export const CourseDetailSchema = CourseSchema.extend({
  sections: z.array(CourseSectionSchema.extend({
    slides: z.array(CourseSlideSchema),
  })),
});
```

---

## API Endpoints

```
# Courses
GET    /api/v2/courses                     — list all courses
GET    /api/v2/courses/:id                 — get course with sections + slides
POST   /api/v2/courses                     — create course
PUT    /api/v2/courses/:id                 — update course
DELETE /api/v2/courses/:id                 — delete course (cascades)

# Sections
POST   /api/v2/courses/:id/sections        — add section
PUT    /api/v2/courses/:id/sections/:secId  — update section
DELETE /api/v2/courses/:id/sections/:secId  — delete section (cascades slides)

# Slides
POST   /api/v2/courses/:id/sections/:secId/slides       — add slide
PUT    /api/v2/courses/:id/sections/:secId/slides/:slId  — update slide
DELETE /api/v2/courses/:id/sections/:secId/slides/:slId  — delete slide

# Uploads
POST   /api/v2/uploads                     — upload file (multipart)
GET    /api/v2/uploads/:filename           — serve file
```

---

## Domain Stack (4-layer DDD)

```
packages/courses/
├── server/           @trn-platform/courses-server
│   ├── routes.ts         — Express routes for course + section + slide CRUD
│   ├── queries.ts        — SQL queries for all entities
│   └── uploads.ts        — multer-based file upload handling
│
├── data-access/      @trn-platform/courses-data-access
│   ├── queries/
│   │   ├── useCourses.ts     — list courses
│   │   └── useCourse.ts      — get course detail (sections + slides)
│   ├── mutations/
│   │   ├── useCreateCourse.ts
│   │   ├── useUpdateCourse.ts
│   │   ├── useAddSection.ts
│   │   ├── useAddSlide.ts
│   │   ├── useUpdateSlide.ts
│   │   └── useUploadFile.ts
│   ├── keys.ts
│   └── client.ts
│
├── feature/          @trn-platform/courses-feature
│   └── hooks/
│       ├── useCoursePlayer.ts    — navigation state (section/slide index, next/prev)
│       ├── useCourseAuthor.ts    — authoring state (active section, active slide)
│       └── useSlideVerify.ts     — verification logic (run SQL, compare results)
│
└── ui-mui/           @trn-platform/courses-ui-mui
    └── components/
        ├── CoursePlayer.tsx       — fullscreen player shell (keyboard nav, transitions)
        ├── CourseAuthor.tsx       — split view (chat + outline + preview)
        ├── CourseOutline.tsx      — sidebar: sections + slides with status
        ├── SlideRenderer.tsx      — dispatches to type-specific renderers
        │
        ├── slides/               — one component per slide type
        │   ├── NarrativeSlide.tsx     — markdown + images
        │   ├── ReferenceSlide.tsx     — image + caption
        │   ├── LiveDemoSlide.tsx      — runnable SQL + results
        │   ├── SqlChallengeSlide.tsx  — editable SQL + check + hints
        │   ├── QuizSlide.tsx          — question + options + feedback
        │   ├── DoItInQcSlide.tsx      — instructions + "Check My Work" button
        │   └── ScreenshotTaskSlide.tsx — instructions + image upload drop zone
        │
        └── shared/
            ├── MarkdownBlock.tsx       — reusable markdown renderer (already built)
            └── RunnableSqlBlock.tsx    — reusable SQL block (already built)
```

---

## Reuse from existing code

| Component | Source | Reuse in courses |
|-----------|--------|-----------------|
| `MarkdownBlock` | `packages/compositions/ui-mui/` | NarrativeSlide, DoItInQcSlide instructions |
| `RunnableSqlBlock` | `packages/compositions/ui-mui/` | LiveDemoSlide, SqlChallengeSlide |
| `TrainingPlayer` chrome | `packages/compositions/ui-mui/` | CoursePlayer (keyboard nav, progress bar, transitions) |
| `useExecuteSql` | `packages/execution/feature/` | All SQL-running slides |
| `ChatPanel` | `packages/chat/ui-mui/` | CourseAuthor left panel |
| `useCompositionPresenter` pattern | `packages/compositions/feature/` | Pattern for useCoursePlayer |

**Move MarkdownBlock and RunnableSqlBlock to shared or courses-ui-mui** since they're now used by both compositions and courses.

---

## Implementation Phases

### Phase 1: Foundation (data model + server)
1. Migration: `004_create_course_tables.sql`
2. Zod schemas: `packages/shared/src/schemas/course.ts`
3. Server package: `packages/courses/server/` — CRUD routes + queries + file upload
4. Mount in `server-dev.cjs` and `server/src/index.ts`
5. MCP tools: `list_courses`, `get_course`, `create_course`, `add_section`, `add_slide`

### Phase 2: Player (read-only experience)
6. Feature: `useCoursePlayer` hook (navigation state)
7. Feature: `useSlideVerify` hook (run verification SQL, compare results)
8. UI: `SlideRenderer` dispatch + all 7 slide type components
9. UI: `CoursePlayer` shell (keyboard nav, transitions, progress)
10. Route: `/courses/play/:courseId` in qc-training app

### Phase 3: Author (create courses)
11. Data-access: full CRUD hooks
12. Feature: `useCourseAuthor` hook
13. UI: `CourseOutline` + `CourseAuthor` (split view with ChatPanel)
14. Chat tools for course CRUD
15. Route: `/courses/author/:courseId` in qc-training app

### Phase 4: First Course Content
16. Convert "QC Database Training 2024" deck into a course (sections map to slide groups, SQL examples become live_demo slides, ER diagrams become reference slides)
17. Create a version of the Garcia walkthrough as a course with do_it_in_qc slides

---

## Example: "QC Database Training" as a Course

```
Course: "QC Database Training"
├── Section 1: "QC Database Standards" (seq 1)
│   ├── Slide 1: narrative — "QC's Four Databases" (qc_core, qc_saga, qc_subscription, qc_history)
│   ├── Slide 2: narrative — "Table Naming Conventions" (descriptive, lowercase, underscored)
│   ├── Slide 3: narrative — "Primary Keys" (_id suffix, always first column)
│   ├── Slide 4: narrative — "Column Suffix Convention" (_id, _ud, _nm, _from/_thru, _date)
│   ├── Slide 5: reference — "Highly Normalized Design" (member ER diagram image)
│   └── Slide 6: sql_challenge — "Find a table by name"
│         prompt: "Use INFORMATION_SCHEMA to find all tables with 'claim' in the name"
│         solution: SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%claim%'
│
├── Section 2: "QC System Tables" (seq 2)
│   ├── Slide 1: narrative — "Golden Data vs User Data"
│   ├── Slide 2: reference — "System Table Editor — Golden" (screenshot)
│   ├── Slide 3: reference — "System Table Editor — User" (screenshot)
│   └── Slide 4: do_it_in_qc — "Open System Table Editor"
│         instructions: "Open QC, navigate to System Table Editor. Find 'Benefit Plan Type'. How many rows are golden?"
│         verify_sql: SELECT COUNT(*) as cnt FROM benefit_plan_type WHERE golden_key IS NOT NULL
│         expected: {row_count: 3}
│
├── Section 3: "Finding Data in QC" (seq 3)
│   ├── Slide 1: narrative — "Four ways to find data"
│   ├── Slide 2: live_demo — "INFORMATION_SCHEMA.COLUMNS"
│         sql: SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME LIKE '%procedure%'
│   ├── Slide 3: reference — "F8 Tool" (screenshot with callouts)
│   ├── Slide 4: do_it_in_qc — "Use F8 on the Last Name field"
│         instructions: "Open a member record, put your cursor in Last Name, press F8. What is the RecordFieldName?"
│         verify: screenshot_task (upload what you see)
│   └── Slide 5: live_demo — "SQL Traces"
│         sql: SELECT TOP 10 name FROM sys.procedures WHERE name LIKE 'plx_member%'
│
└── Section 4: "Common Tables" (seq 4)
    ├── Slide 1: narrative — "Product areas: Claims, Members, Eligibilities, Benefits, AP, AR"
    ├── Slide 2: live_demo — "Claims join pattern"
          sql: SELECT * FROM claim c JOIN claim_procedure cp ON cp.claim_id = c.claim_id
    ├── Slide 3: sql_challenge — "Write the member query"
          prompt: "Write a query that returns member name and date of birth. Use the is_primary = 1 filter."
          hints: ["JOIN member_name", "AND mn.is_primary = 1"]
          solution: SELECT mn.name_first, mn.name_last, m.birth_date FROM member m JOIN member_name mn ON mn.member_id = m.member_id AND mn.is_primary = 1
    └── Slide 4: quiz — "Column naming"
          question: "What does the '_ud' suffix mean on a column?"
          options: ["User Display", "Unique Descriptor", "Update Date", "Undefined"]
          answer: 0
          explanation: "_ud is 'User Display' — a column the user can view and change in the QC UI"
```

---

## Verification

1. Migration runs → `course`, `course_section`, `course_slide`, `upload` tables exist
2. API: `POST /courses` creates a course, `GET /courses/:id` returns sections + slides
3. MCP: `create_course`, `add_section`, `add_slide` work from Claude Code
4. Player: navigate to `/courses/play/:id`, arrow keys work, slides render by type
5. live_demo slides: SQL runs, results display
6. quiz slides: select answer, see feedback
7. do_it_in_qc slides: click "Check My Work", see pass/fail
8. Author: chat creates course structure, outline updates in real-time
