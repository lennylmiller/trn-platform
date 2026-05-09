# Courses Feature Reference

Living reference for the courses domain — data model, UI, API, fixtures, MCP tooling, and current state.

Last verified: 2026-05-07 against running app (localhost:5174) and API (localhost:3001).

---

## 1. Data Model (qc_training database)

### Hierarchy

```
course_series (optional grouping)
  └── course
        └── course_lesson       (was "course_section" — renamed in migration 006)
              └── course_slide
```

### Tables

| Table | PK | Key Columns | Notes |
|---|---|---|---|
| `course_series` | `series_id` INT IDENTITY | `title`, `description` | Optional grouping — a series has many courses |
| `course` | `course_id` INT IDENTITY | `title`, `description`, `category`, `status`, `actor`, `series_id` FK, `series_seq` | Status: draft/published/archived |
| `course_lesson` | `lesson_id` INT IDENTITY | `course_id` FK, `seq`, `title`, `description` | Ordering via `seq` (0-based) |
| `course_slide` | `slide_id` INT IDENTITY | `lesson_id` FK, `seq`, `slide_type`, `title`, `content`, `sql_text`, `sql_label`, `verify_mode`, `expected_json`, `quiz_*`, `hints`, `presenter_notes`, `seed_sql`, `seed_label` | The actual content unit |
| `course_dependency` | `dependency_id` INT IDENTITY | `course_id` FK, `depends_on_course_id` FK | Prerequisite chain between courses |

### Section-to-Lesson Rename (Migration 006)

`server/db/migrations/006_rename_section_to_lesson.sql` renamed:
- Table: `course_section` -> `course_lesson`
- Column: `section_id` -> `lesson_id` (on both `course_lesson` and `course_slide`)
- Constraint: `UQ_course_section_seq` -> `UQ_course_lesson_seq`

The rename is fully applied — all code, schemas, and API use "lesson" consistently. The only vestige is the fixture-schema.ts comment mentioning "section_id" (cosmetic).

### Slide Types

| `slide_type` | Purpose | Key Fields Used |
|---|---|---|
| `narrative` | Rich markdown content | `title`, `content` |
| `reference` | Reference/lookup material | `title`, `content` |
| `live_demo` | Instructor runs SQL live | `title`, `content`, `sql_text`, `sql_label` |
| `sql_challenge` | Learner writes SQL | `title`, `content`, `sql_text`, `hints` |
| `quiz` | Multiple-choice question | `quiz_question`, `quiz_options`, `quiz_answer`, `quiz_explanation` |
| `do_it_in_qc` | Hands-on task verified via SQL | `title`, `content`, `sql_text`, `sql_label`, `verify_mode`, `expected_json`, `seed_sql`, `seed_label` |
| `screenshot_task` | Learner captures a screenshot | `title`, `content` |

### Verify Modes (for `do_it_in_qc`)

- `auto` — system runs the SQL and checks against `expected_json`
- `show` — system runs the SQL and displays results for manual check

### Seed SQL

Slides with `seed_sql` + `seed_label` can seed prerequisite data into qc_core before the learner attempts the task. Example: Course 4's "Verify Your Setup" slide has a full seed script that creates the Verda Health Plan hierarchy.

---

## 2. Current Course Inventory

### Series: "QC Implementation: Setting Up Verda Health Plan" (10 courses)

| Seq | Course | Lessons | Slides | Category |
|---|---|---|---|---|
| 1 | QC System Foundations | 5 | 22 | implementation |
| 2 | Benefit Administration — Creating a Health Plan | 7 | 21 | implementation |
| 3 | Code Management — Procedure & Diagnosis Codes | 0 | 0 | implementation |
| 4 | Provider Network Setup | 0 | 0 | implementation |
| 5 | Fee Schedules & Payment Contracts | 0 | 0 | implementation |
| 6 | Accumulators & Benefit Rules | 0 | 0 | implementation |
| 7 | Member Enrollment | 0 | 0 | implementation |
| 8 | Premium Billing | 0 | 0 | implementation |
| 9 | Claims & Adjudication | 0 | 0 | implementation |
| 10 | Payments & Accounting | 0 | 0 | implementation |

### Standalone Courses

| Course | Lessons | Slides | Category |
|---|---|---|---|
| QC Database Training | 4 | 19 | database |
| QC Core Insurance Walkthrough | 8 | 25 | walkthrough |

**Content status:** 4 of 12 courses have lesson/slide content. The 8 implementation courses (seq 3-10) have titles and descriptions but no lessons yet — they are shells waiting for content authoring.

### Actor Field

Series courses use `actor: "QC Administrator"` — identifies who the learner role-plays as during the course.

---

## 3. API Endpoints

Base: `GET/POST/PUT/DELETE http://localhost:3001/api/v2/courses`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List all courses with lesson/slide counts |
| GET | `/series` | List all series |
| GET | `/:id` | Get course detail with all lessons and slides |
| POST | `/` | Create course |
| PUT | `/:id` | Update course |
| DELETE | `/:id` | Delete course (cascades) |
| POST | `/:id/lessons` | Add lesson to course |
| PUT | `/:id/lessons/:lessonId` | Update lesson |
| DELETE | `/:id/lessons/:lessonId` | Delete lesson (cascades slides) |
| POST | `/:id/lessons/:lessonId/slides` | Add slide to lesson |
| PUT | `/:id/lessons/:lessonId/slides/:slId` | Update slide |
| DELETE | `/:id/lessons/:lessonId/slides/:slId` | Delete slide |

All request bodies validated via Zod schemas from `@trn-platform/shared/schemas`.

---

## 4. Architecture Layers

```
packages/courses/
├── server/src/
│   ├── routes.ts          — Express router (CRUD endpoints)
│   ├── queries.ts         — Raw SQL queries via mssql pool
│   ├── fixtures.ts        — YAML fixture loader (upsert semantics)
│   ├── export-fixtures.ts — DB -> YAML exporter
│   └── fixture-schema.ts  — Zod schemas for YAML format
├── data-access/src/
│   ├── index.ts           — Exports: useCourses, useCourse, useSeries,
│   │                        useCreateCourse, useAddLesson, useAddSlide, useUpdateSlide
│   └── mutations/
│       ├── useAddLesson.ts
│       ├── useAddSlide.ts
│       └── useUpdateSlide.ts
├── feature/src/hooks/
│   └── useCoursePlayer.ts — Flattens lessons+slides into linear sequence for navigation
├── ui-mui/src/components/
│   ├── CoursePlayer.tsx    — Full-screen player with keyboard nav, progress bar, notes
│   ├── SlideRenderer.tsx   — Dispatches to slide-type components
│   └── slides/
│       ├── NarrativeSlide.tsx
│       ├── ReferenceSlide.tsx
│       ├── LiveDemoSlide.tsx
│       ├── SqlChallengeSlide.tsx
│       ├── QuizSlide.tsx
│       ├── DoItInQcSlide.tsx
│       └── ScreenshotTaskSlide.tsx
└── fixtures/               — 12 YAML fixture files (source of truth for course content)

packages/shared/src/schemas/course.ts — Zod schemas + TypeScript types
server/db/migrations/006_rename_section_to_lesson.sql — The section->lesson DDL
```

---

## 5. UI & Navigation

### App Shell (`apps/qc-training/src/App.tsx`)

- Default tab: **Courses** — shows course list grouped by series
- Clicking a course card navigates to `/courses/play/:courseId`
- Route: `CoursePlayerPage` renders `CoursePlayer` component

### Hidden Dev Toggle

An **invisible 24x24px box** sits immediately left of the theme toggle (dark/light mode button) in the toolbar. Clicking it toggles `showDevTabs`, which reveals three additional tabs:

| Tab | Route | Component | Purpose |
|---|---|---|---|
| Steps | `/steps` | LandingPage (steps) | Step library management |
| Flows | `/flows` | LandingPage (flows) | Flow builder |
| Workbench | `/workbench` | StepWorkbenchPage | Step testing/editing |

When dev tabs are hidden and the user is on a dev tab, the app redirects to `/courses`.

**Implementation:** `opacity: 0`, `cursor: default`, `data-feedback-ignore="true"` (excluded from feedback screenshots).

### Course Player

- **Top bar:** Course title, current lesson chip, slide type chip, slide counter (N/M), notes toggle, fullscreen toggle
- **Progress bar:** Linear progress based on slide position
- **Slide area:** Animated transitions (framer-motion), max-width 900px
- **Presenter notes:** Collapsible panel (toggle with `N` key)
- **Navigation:** Prev/Next buttons + dot indicators (up to 20 dots)
- **Keyboard shortcuts:**
  - `→` or `Space` = Next slide
  - `←` = Previous slide
  - `N` = Toggle presenter notes
  - `F` = Toggle fullscreen
  - `Escape` = Exit fullscreen or exit player

### Courses Page (`CoursesPage.tsx`)

- Groups courses by series in collapsible `Accordion` components
- First series expanded by default
- Each course shows: title, description (2-line clamp), status chip, category chip, lesson/slide counts
- Standalone courses (no series) shown below series in a separate section

---

## 6. Fixture System

### Format

YAML files in `packages/courses/fixtures/`, one per course. Named by slugified title (e.g., `qc-system-foundations.yaml`).

```yaml
title: QC System Foundations
description: "..."
category: implementation
actor: QC Administrator
series:
  title: "QC Implementation: Setting Up Verda Health Plan"
  description: "..."
  seq: 1
lessons:
  - title: "QC's Four Databases"
    description: "..."
    slides:
      - slide_type: narrative
        title: "Four Databases, One System"
        content: |
          Markdown content here...
      - slide_type: live_demo
        title: "How Big Is qc_core?"
        content: "..."
        sql_text: |
          SELECT s.name AS schema_name, COUNT(*) AS table_count
          FROM sys.tables t ...
        sql_label: "Tables by Schema"
      - slide_type: quiz
        title: "Database Check"
        quiz_question: "Which database holds 99% of all QC data?"
        quiz_options: ["qc_saga", "qc_core", "qc_history", "qc_subscription"]
        quiz_answer: 1
        quiz_explanation: "qc_core is the primary database..."
```

### Key differences from DB schema
- No IDs — assigned by DB on insert
- No `seq` — array index = sequence
- Series referenced by title (upserted)
- Prerequisites referenced by course title

### Commands

```bash
# Load fixtures into DB (upsert semantics)
npx tsx packages/courses/server/src/fixtures.ts [fixtures-dir]

# Export DB courses back to YAML
npx tsx packages/courses/server/src/export-fixtures.ts [out-dir]
```

Upsert semantics: course matched by title (UPDATE if exists, INSERT if new). Lessons and slides are DELETE + re-INSERT on each load.

---

## 7. AI & MCP Tools

### MCP Server Tools (for Claude Code / developer use)

Available via `packages/mcp-server/` (`trn-mcp`), 30 tools total. Course-related:

| Tool | Description |
|---|---|
| `list_courses` | List all courses with lesson/slide counts |
| `get_course` | Get course by ID with full lesson/slide detail |
| `create_course` | Create a new course |
| `update_course` | Update course metadata (title, description, category, status) |
| `add_course_lesson` | Add a lesson to a course |
| `add_course_slide` | Add a slide to a lesson (pass slide as JSON string) |

These proxy to the Express API at localhost:3001. Full SQL access (no read-only guard).

### Chat Service Tools (for browser-based AI authoring)

Available via `packages/chat/server/src/tools.ts`, 11 tools. Used by the embedded ChatPanel in the CourseEditor.

| Tool | Description |
|---|---|
| `explore_schema` | Describe a specific table (must provide table name) |
| `run_sql` | Execute SELECT queries only (read-only guard) |
| `qc_train` | Run qc-train.sh commands |
| `list_courses` | List all courses |
| `get_course` | Get course detail (usually not needed — context is pre-loaded) |
| `build_course_content` | **Bulk create** all lessons + slides in ONE call |
| `add_course_lesson` | Add single lesson |
| `add_course_slide` | Add single slide |
| `update_course` | Update course metadata |

### Guardrails (Chat Service only)

| Guardrail | What It Does | File |
|---|---|---|
| SQL read-only | Only SELECT/WITH allowed; INSERT/UPDATE/DELETE rejected | `tools.ts` |
| Schema cache | Auto-injects relevant table info based on course title keywords | `schema-cache.ts` |
| Course context | Course title/description/category pre-loaded in system prompt | `system-prompt.ts` |
| JSON validation | build_course_content validates JSON before API call | `tools.ts` |
| Intent detection | "build" keyword → immediate action, no exploration | `system-prompt.ts` |
| Course templates | Pre-built lesson structures for claims, providers, enrollment | `system-prompt.ts` |

### Schema Cache Domains

| Domain | Keywords | Tables Included |
|---|---|---|
| Claims & Adjudication | claim, adjudicat | claim, claim_procedure, adjudication_result_amount, adjudication_status |
| Member Enrollment | enroll, eligib, member | family_eligibility chain, member, member_name |
| Benefit Administration | benefit, contract, plan, client | client → group → contract → plan → framework |
| Provider Network | provider, network, ipa, pcp | provider, provider_name, provider_identifier |
| Referrals | referral, authoriz | referral, referral_provider, referral_status |
| Payments | payment, accounting, payrun | claim_payment_run, accounting_transaction_ap |

File: `packages/chat/server/src/schema-cache.ts`

---

## 8. Shared Schemas (`packages/shared/src/schemas/course.ts`)

Key types exported:

| Type | Description |
|---|---|
| `Course` | Base course record |
| `CourseLesson` | Lesson within a course |
| `CourseSlide` | Individual slide |
| `CourseLessonDetail` | Lesson + slides array |
| `CourseDetail` | Course + lessons array (each with slides) |
| `CourseListItem` | Course + lesson_count + slide_count |
| `CourseCreate` / `CourseUpdate` | Mutation input types |
| `LessonCreate` / `LessonUpdate` | Lesson mutation inputs |
| `SlideCreate` / `SlideUpdate` | Slide mutation inputs |
| `SlideType` | Union: narrative, reference, live_demo, sql_challenge, quiz, do_it_in_qc, screenshot_task |
| `VerifyMode` | Union: auto, show |
| `CourseStatus` | Union: draft, published, archived |
| `CourseSeries` | Series record |

---

## 9. What's Built vs What's Remaining

### Built (Experiments 1-7)
- Course editor: 3-panel layout, slide editing, add/delete, preview toggle
- Course tracks: audience/purpose grouping with selector modal, CRUD
- AI authoring: embedded ChatPanel with course CRUD tools, bulk build
- Create course: modal with track/series selection (inline series creation)
- Export/import: JSON round-trip, delete course, clear course
- Schema cache: auto-injected table info for 6 QC domains
- SQL read-only guard: chat service only allows SELECT
- Chat persistence: localStorage, survives refresh
- Automated tests: 28 server integration tests + smoke test script

### Remaining Gaps
- **No slide reordering UI** — no drag-and-drop in the outline
- **No SQL execution in player** — `live_demo` and `sql_challenge` display SQL but don't run it
- **No prerequisite enforcement** — `course_dependency` table exists but not enforced
- **No completion tracking** — no progress tables
- **No cover images** — no `cover_image_url` set on any course
- **capture-mcp integration** — planned but not wired in
- **hooksai integration** — planned but not wired in
- **PDF document ingestion** — planned (Experiment 9)
