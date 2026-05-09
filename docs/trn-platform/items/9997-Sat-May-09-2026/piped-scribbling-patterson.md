# Stabilize AI Course Creation

## Context

The prompt "Build out this course on claim adjudication" should reliably produce a complete course with 3-4 lessons and 12-16 slides in 2 tool calls (~30 seconds). Currently it sometimes explores too much, builds incomplete content, or fails on malformed JSON.

Design doc: `docs/trn-platform/items/Sat-May-09-2026/ai-course-creation-design.md`

## Changes

### 1. System prompt: detect "build" intent, skip proposal

**File:** `packages/chat/server/src/system-prompt.ts`

Add to COURSE_AUTHORING_HINT:
- When user says "build", "create X lessons", or provides a detailed description → skip proposal, call `build_course_content` immediately
- Pre-built templates for common course types (claims/adjudication, provider setup, enrollment)
- Each template has concrete lesson titles, slide types, and SQL examples

### 2. JSON validation in build_course_content executor

**File:** `packages/chat/server/src/tools.ts`

In the `build_course_content` case:
- try/catch the JSON.parse — return helpful error instead of crashing
- Validate lessons array is non-empty
- Validate each lesson has a title and slides array

### 3. Add description field to build_course_content context

**File:** `packages/courses/ui-mui/src/components/CourseEditor.tsx`

Pass the course description in the chat context so Claude knows what the course is about without needing to call `get_course`:
- `context: { courseId, title: course.title, description: course.description }`

This eliminates the `get_course` call — the AI already knows the course metadata.

### 4. Pass course info as initial system context

**File:** `packages/chat/server/src/system-prompt.ts`

When context includes `courseId`, `title`, `description`, embed it in the prompt:
```
You are authoring course "${title}" (ID: ${courseId}).
Description: ${description}
```

## Verification

1. Rebuild: `pnpm --filter @trn-platform/chat-server build`
2. Restart: `pnpm server:dev`
3. Create a new course "Claims & Adjudication" in the Testing track
4. Open the editor, click AI Author
5. Type: "Build out this course. It should teach a new QC user how claim adjudication works — from submitting a claim through to the adjudication result amounts."
6. **Expect:** AI calls `build_course_content` with 3-4 lessons, 12-16 slides
7. **Expect:** Outline refreshes with complete course structure
8. **Expect:** Total time < 60 seconds, 1-2 tool calls
9. Run `pnpm --filter @trn-platform/courses-server test` — all 28 pass
