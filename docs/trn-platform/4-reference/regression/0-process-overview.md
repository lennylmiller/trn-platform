# Regression Testing — Process Overview

Manual regression tests for the QC Training courseware app. Run these after any major feature bump or bug fix to verify nothing is broken.

## Prerequisites

```bash
# 1. Database running with migrations applied
pnpm db:migrate

# 2. Fixtures loaded
npx tsx packages/courses/server/src/fixtures.ts

# 3. Servers built and running
pnpm --filter @trn-platform/shared build
pnpm --filter @trn-platform/courses-server build
pnpm --filter @trn-platform/chat-server build
pnpm server:dev

# 4. Frontend running
# (in another terminal)
cd apps/qc-training && npx vite
# Or: pnpm dev (runs server + storybook concurrently)
```

**App URL:** http://localhost:5174
**API URL:** http://localhost:3001

## Test Files

Run these in order. Each file is self-contained but they build on each other for a full end-to-end flow.

| File | Area | Time | What It Covers |
|---|---|---|---|
| [1-tracks.md](1-tracks.md) | Track Management | ~3 min | Create, edit, switch, delete tracks |
| [2-course-creation.md](2-course-creation.md) | AI Course Creation | ~5 min | New course via AI conversation, bulk build |
| [3-editor.md](3-editor.md) | Course Editor | ~5 min | Outline, slide editing, add/delete, preview |
| [4-export-import.md](4-export-import.md) | Export / Import | ~3 min | Export JSON, import via API, verify round-trip |
| [5-course-player.md](5-course-player.md) | Course Player | ~3 min | Slide navigation, keyboard shortcuts, slide types |
| [6-cleanup.md](6-cleanup.md) | Cleanup & Delete | ~2 min | Clear course, delete course, delete track |

**Total time:** ~20 minutes for a full pass.

## When to Run

- After merging an experiment branch to main
- After any changes to: courses server, chat server, shared schemas, CoursesPage, CourseEditor
- Before a demo or presentation
- After database migration changes

## Quick Smoke Test (5 min)

If you're short on time, run just these steps:
1. Load the courses page — verify tracks and courses render
2. Open an existing course in the editor — click a slide, verify preview
3. Open AI Author — type "add a quiz about naming conventions" — verify it creates a slide
4. Click Preview toggle — verify player works
5. Export a course — verify JSON downloads
