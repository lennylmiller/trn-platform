# 2. AI Course Creation

Tests the "Create Course" flow and bulk content building via AI.

## Prerequisites

- Server running with `ANTHROPIC_API_KEY` set in `.env`
- Chat server rebuilt: `pnpm --filter @trn-platform/chat-server build`

## Steps

### 2.1 Navigate to New Course

- [ ] From the courses page, click **"Create Course"** button (top right)
- [ ] **Expect:** Navigates to `/courses/new` with full-width ChatPanel
- [ ] **Expect:** Placeholder text: "Describe what you want to teach..."

### 2.2 AI-Guided Course Definition

- [ ] Type: `I want to create a course about claim adjudication for new QC users`
- [ ] **Expect:** AI responds conversationally — asks about scope, suggests a title/description
- [ ] Approve the AI's suggestion (or type: `yes, create it`)
- [ ] **Expect:** AI calls `create_course` tool (visible in tool call cards)
- [ ] **Expect:** Page redirects to `/courses/edit/<courseId>` within ~2 seconds

### 2.3 Bulk Content Build

- [ ] In the CourseEditor, click **"AI Author"** button
- [ ] Type: `Build a 3-lesson course. Lesson 1: what a claim looks like (claim + claim_procedure). Lesson 2: adjudication math (adjudication_result_amount). Lesson 3: verifying with TRAIN-CLM-001. Each lesson: narrative, live demo, quiz.`
- [ ] **Expect:** AI calls `build_course_content` (ONE tool call, not 20+)
- [ ] **Expect:** Outline refreshes with 3 lessons, ~9 slides
- [ ] **Expect:** AI response includes summary of what was built

### 2.4 Verify Content Quality

- [ ] Click each lesson in the outline — verify it expands with slides
- [ ] Click a narrative slide — verify markdown content renders in center panel
- [ ] Click a live_demo slide — verify SQL text is present
- [ ] Click a quiz slide — verify question + 4 options render
- [ ] **Expect:** Slide type chips in outline match (Read, Demo, Quiz)

### 2.5 Chat Persistence

- [ ] Note the conversation in the AI Author panel
- [ ] Refresh the page (F5)
- [ ] Click **"AI Author"** again
- [ ] **Expect:** Previous conversation is restored from localStorage

## Teardown

Leave the course in place for editor tests. Note the course ID for later steps.

**Course ID created:** _____ (write it down)
