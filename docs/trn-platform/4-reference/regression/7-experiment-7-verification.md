# 7. Experiment 7 Verification

Quick verification for the `experiment/7-new-course-flow` branch before merging to main.

## Step 1: Rebuild

```bash
pnpm --filter @trn-platform/courses-server build
pnpm --filter @trn-platform/chat-server build
pnpm server:dev
```

## Step 2: Automated Tests (separate terminal)

```bash
pnpm --filter @trn-platform/courses-server test
```

- [ ] **Expect:** 28 passed

## Step 3: Smoke Test (server must be running)

```bash
./scripts/smoke-test.sh
```

- [ ] **Expect:** All green, zero failures

## Step 4: Manual UI Check (~3 min)

### 4.1 Track Selector

- [x] Go to `http://localhost:5174/courses`
- [x] Click track name → Select Track modal opens
- [x] Click "Add Track" → create a test track → verify it appears in the list
- [x] Click gear icon on the test track → edit description → Save
- [x] Select the test track → background shows "No courses in this track"
- [ ] Select "New User Onboarding" → original courses visible

### 4.2 AI Course Creation

- [x] Click **"Create Course"** → lands on `/courses/new` with chat panel
- [ ] Type: `Create a course about provider network setup for new QC users`
- [ ] Let AI propose title/description → approve
- [ ] AI calls `create_course` → page auto-redirects to editor

### 4.3 Bulk Build

- [ ] In the editor, click **AI Author**
- [ ] Type: `Build 2 lessons. Lesson 1: what a provider is (narrative + quiz). Lesson 2: the IPA prefix system (narrative + live demo).`
- [ ] **Expect:** AI calls `build_course_content` (one tool call)
- [ ] **Expect:** Outline refreshes with 2 lessons + slides

### 4.4 Export / Clear / Delete

- [ ] Click **Export** → JSON file downloads
- [ ] Open JSON → verify title, lessons, slides present (no IDs)
- [ ] Click **Clear** → confirm → all lessons wiped
- [ ] Click **Delete** → confirm → redirected to courses list, course gone

### 4.5 Cleanup

- [ ] Open track selector → gear on test track → Delete Track → confirm
- [ ] **Expect:** Track removed from list

## Merge

Once all steps pass:

```bash
git checkout main && git merge experiment/7-new-course-flow --no-edit
```
