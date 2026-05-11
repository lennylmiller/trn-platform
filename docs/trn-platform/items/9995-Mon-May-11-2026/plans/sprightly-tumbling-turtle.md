# Plan: Series-Grouped Course List UI

## Context

The courses list page (`CoursesPage.tsx`) currently renders a flat list of Card components. Now that we have a 10-course series ("QC Implementation: Setting Up Verda Health Plan") plus 2 standalone courses, the flat list doesn't convey the series structure or sequence. We need collapsible series containers that group courses visually.

## Current State

- **CoursesPage.tsx** — flat `Stack` of `Card` components, one per course
- **Data** — `useCourses()` returns `CourseListItem[]` which already includes `series_id` and `series_seq`
- **API** — `GET /api/v2/courses` returns all courses ordered by series_seq. No series list endpoint exists yet.
- **DB** — `course_series` table has `series_id`, `title`, `description`. One series exists (id=1).
- **Schema** — `CourseSeriesSchema` already defined in `packages/shared/src/schemas/course.ts`

## Approach

**Client-side grouping** — no new API endpoint needed. The `useCourses()` data already has `series_id` and `series_seq` on each course. We group courses by `series_id` in the component, fetching series metadata with a new `useSeries()` hook.

### New API Endpoint: `GET /api/v2/courses/series`

Returns all series with their metadata. Lightweight — just the `course_series` table.

### UI Design

```
┌─────────────────────────────────────────────────────────┐
│ ▼ QC Implementation: Setting Up Verda Health Plan       │  ← Accordion header (series title)
│   A 10-course series that walks a QC administrator...   │  ← Series description (collapsed = hidden)
│                                                         │
│   ┌──┬─────────────────────────────────────────────┐    │
│   │ 1│ QC System Foundations          draft  impl  │    │  ← Numbered card with series_seq
│   │  │ 5 sections · 22 slides                      │    │
│   ├──┼─────────────────────────────────────────────┤    │
│   │ 2│ Benefit Administration — Creating a Health…  │    │
│   │  │ 7 sections · 18 slides                      │    │
│   ├──┼─────────────────────────────────────────────┤    │
│   │ 3│ Code Management — Procedure & Diagnosis…     │    │
│   │  │ 0 sections · 0 slides                       │    │
│   └──┴─────────────────────────────────────────────┘    │
│   ... (courses 4-10)                                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│   Standalone Courses                                    │  ← Section header for ungrouped courses
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ QC Database Training              draft  database│   │  ← Same card style, no seq number
│   │ 4 sections · 19 slides                           │   │
│   ├─────────────────────────────────────────────────┤   │
│   │ QC Core Insurance Walkthrough     draft  walk…   │   │
│   │ 8 sections · 25 slides                           │   │
│   └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

MUI Components:
- **Accordion / AccordionSummary / AccordionDetails** — collapsible series container
- Existing **Card / CardActionArea / CardContent** — individual course cards (reused)
- **Avatar** or **Box** with number — the sequence indicator on the left of each card

## Files to Change

### 1. Server: Add series list query
**`packages/courses/server/src/queries.ts`** — add `listSeries()` function
**`packages/courses/server/src/routes.ts`** — add `GET /series` route

### 2. Shared: Export series response type (already exists)
**`packages/shared/src/schemas/course.ts`** — `CourseSeriesSchema` already defined, just need to add a response array schema if missing

### 3. Data-access: Add useSeries hook
**`packages/courses/data-access/src/queries/useSeries.ts`** — new hook
**`packages/courses/data-access/src/keys.ts`** — add `seriesKeys`
**`packages/courses/data-access/src/index.ts`** — export

### 4. UI: Rewrite CoursesPage with grouping
**`apps/qc-training/src/pages/CoursesPage.tsx`** — main change:
- Fetch both `useCourses()` and `useSeries()`
- Group courses by `series_id` (utility function)
- Render each series as an Accordion with numbered course cards inside
- Render standalone courses (series_id = null) in a separate section

## Implementation Details

### Grouping logic (in CoursesPage)
```typescript
// Group courses by series_id
const seriesMap = new Map<number, CourseListItem[]>();
const standalone: CourseListItem[] = [];
courses.forEach(c => {
  if (c.series_id) {
    if (!seriesMap.has(c.series_id)) seriesMap.set(c.series_id, []);
    seriesMap.get(c.series_id)!.push(c);
  } else {
    standalone.push(c);
  }
});
```

### Series Accordion
- Default expanded for the first series
- Series title + course count in the AccordionSummary
- Series description as subtitle text
- Course cards inside AccordionDetails with seq number badge

### Sequence badge
A small `Box` or `Avatar` on the left side of each card showing `series_seq`. Gives visual ordering (1, 2, 3... 10).

## Verification
- Load the courses page — series courses grouped under expandable accordion
- Standalone courses shown separately below
- Click a course card — still navigates to player
- Expand/collapse works
- Sequence numbers display correctly 1-10
- Server builds clean: `pnpm server:build`
