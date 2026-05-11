# Plan: Reconcile Spec vs Reality & Practice Workflows

## Context

The capture-mcp repo has a detailed 9-doc spec (`docs/plan/00-08`) and a fully-implemented MCP server with 5 tools. All tools compile and have evidence of real usage (1 bug note, 8 triaged captures, 2 curated files, 2 lesson drafts). The user wants to:
1. Understand what's done vs what's not
2. Practice each workflow several times to build fluency and find friction
3. Let that practice inform what tool changes matter for efficiency

---

## Part 1: Spec vs Reality — What's Done, What's Not, What Matters

### Done and working (no action needed)
| What | Evidence |
|------|----------|
| All 5 MCP tools implemented | `src/tools/*.ts` — all compile, all callable from Claude Code |
| Bug capture → Obsidian note | `Bugs/2026-05-03-cisco-duo-access-denied-error.md` exists, properly templated |
| Course triage (keep/noise) | 8 PNG+JSON pairs in `course-pending-review/` |
| Move to curated | 2 files in `course-curated/` with `m1-l2-01-...` naming |
| Lesson drafting | 2 drafts in `course-drafts/` |
| hooksai file watching | `intake-triage.hook.md` + `intake-triage.js` working via `intake/` symlink |
| Bug template | `Templates/Bug.md` with all placeholders |
| Build pipeline | `npm run build` succeeds, `dist/` current |

### Spec divergences that DON'T matter for practice (defer)
- **`lib/paths.ts` shared module** — each tool has its own `toWslPath()`. Duplication is fine for now.
- **`lib/obsidian.ts`** — template substitution is inline in `processBugCapture.ts`. Works.
- **`config.ts` fail-loud** — tools use `??` fallback defaults. Works in WSL context.
- **Error code naming** — spec says `IMAGE_NOT_FOUND`, code uses `NOT_FOUND`. Consistent within codebase.
- **Structured logging** — not implemented, not needed for practice.
- **File-locking retry** — only matters with real Snagit; irrelevant from WSL.
- **Windows-native server** (Milestone 7) — WSL-only is reality for now.

### Spec divergences that DO matter
1. **`triage_capture` has filesystem side effects** — spec says no side effects (caller handles moves), but implementation copies to pending-review and writes sidecar JSON on "keep". This is *actually better* for the workflow. **Decision: accept the divergence, update the spec doc later.**
2. **No separate bug hook** — only `intake-triage.hook.md` exists (course triage). Bug workflow is manual MCP calls only. Fine for practice.
3. **No `course-raw/` directory** — `list_recent_captures("course-raw")` would return empty. The current flow bypasses this: intake → triage → pending-review directly.
4. **`intake-triage.js` deletes source files after triage** (lines 43, 49) — both "keep" and "noise" files are deleted from `intake/`. This means you can't re-examine noise decisions. Worth noting during practice.

---

## Part 2: Simulating Captures from WSL

No Snagit from WSL. Simulate by copying PNGs into the right folders:
- **For course triage**: copy images into `intake/` (hooksai watches this)
- **For bug capture**: call `process_bug_capture` MCP tool directly with any error-state screenshot path
- **For curation/drafting**: use existing files in `course-pending-review/` and `course-curated/`

Good test images already available:
- `course-pending-review/*.png` — 8 real app screenshots
- `attachments/2026-05-03-cisco-duo-access-denied-error.png` — error dialog (good for bug practice)
- `course-curated/*.png` — 2 curated images

---

## Part 3: Practice Sessions (in order)

### Session 1: Bug Capture (3 runs, ~15 min)

**Goal:** Process 3 screenshots as bugs, compare AI output quality with and without context hints.

Steps:
1. Pick 3 images (the existing error dialog, plus 2 from pending-review that show UI issues)
2. Run `process_bug_capture` via MCP three times:
   - Run 1: no contextHint (baseline)
   - Run 2: with contextHint `"training management application"`
   - Run 3: with detailed contextHint about the specific feature
3. After each: read the generated note in `Bugs/`, evaluate title, description, severity, repro steps
4. Check `attachments/` for copied images

**Watch for:**
- Slug quality (too long? too generic?)
- Severity calibration (does context change it?)
- Duplicate handling (same image twice → same slug → overwrite)
- Does the Obsidian `![[image]]` embed have the right filename?

### Session 2: Course Triage (5-8 captures, ~20 min)

**Goal:** Triage a batch of images, observe keep/noise decisions and slug proposals.

Two paths to practice:

**Path A — hooksai automated:**
1. Verify hooksai is running (check `.hooksai/logs/`)
2. Copy 5+ images into `intake/` (mix of real UI screenshots and something obviously off-topic)
3. Watch the hook fire and process each file
4. Check `course-pending-review/` for new files + sidecar JSON

**Path B — Manual MCP calls (more control):**
1. Call `triage_capture` directly for each image
2. Try with and without `contextHint` and `recentCaptures` parameters
3. Compare: does context improve module/lesson guesses? Does recentCaptures help dedup?

**Watch for:**
- Keep vs noise accuracy (is the AI right?)
- Slug quality and consistency across a batch
- Module/lesson guesses (always null without context hint? expected.)
- Speed per image (Haiku should be fast)
- The intake-triage hook deletes source files — is that the right behavior?

### Session 3: Curation (4-6 files, ~15 min)

**Goal:** Move pending-review files to curated, building a real module/lesson structure.

Steps:
1. `list_recent_captures(folder: "course-pending-review")` — see what's available
2. Read 2-3 sidecar JSONs to see AI suggestions
3. Plan a structure: e.g., Module 1 Lesson 4 = member search (3 images), Module 2 Lesson 1 = training lab (2 images)
4. Call `move_to_curated` for each, assigning module/lesson/order/slug
5. Verify files appear in `course-curated/` with correct names
6. Verify source + sidecar removed from `course-pending-review/`

**Watch for:**
- Is the AI's slug good enough to reuse, or do you always override?
- Module/lesson assignment is the real decision — the tool only moves, it doesn't help you decide
- No undo: once moved, the pending-review copy is gone
- What happens with duplicate m/l/order/slug? (silent overwrite — a gap)

### Session 4: Lesson Drafting (2-3 drafts, ~20 min)

**Goal:** Generate lesson markdown from curated screenshots, evaluate quality.

Steps:
1. `list_recent_captures(folder: "course-curated")` — see available images
2. Group by module/lesson from filenames
3. Call `draft_lesson` with 3-5 images, a title, context, and audience level
4. Read the generated draft in `course-drafts/`
5. Repeat with different parameters:
   - Same images, `audience: "beginner"` vs `"advanced"`
   - Same images, vague vs specific `lessonContext`
   - Different image ordering to see if narrative changes

**Watch for:**
- Image references: are filenames correct? (uses `![caption](filename)` — check if Obsidian renders this)
- Step quality: action-oriented titles or generic?
- Sweet spot for image count (1-2 images → thin draft; 5+ → better)
- Overview/summary: useful or boilerplate?

### Session 5: Full Pipeline (end-to-end, ~30 min)

**Goal:** Simulate a complete capture session from intake to finished lesson.

Steps:
1. Place 6-8 images in `intake/` (mix of useful + noise + 1-2 error dialogs)
2. Let triage run (hook or manual). Note the keep/noise split.
3. Process error dialogs as bug captures
4. Review pending items, curate 4-5 into a module/lesson
5. Generate a lesson draft from the curated set
6. Time the whole pipeline — where did you wait? Where did you have to think?

---

## Part 4: Small Fixes to Make Practice Smoother

Apply these before/during practice sessions:

1. **`mkdir course-raw`** at repo root — prevents confusion when listing folders
2. **Gather 8-10 test images** — copy diverse screenshots into a `test-fixtures/` folder so you can reset `intake/` easily between sessions
3. **Verify hooksai is running** — `ls .hooksai/logs/` to confirm the watcher is active before Session 2

Changes to consider AFTER practice (informed by friction):
- Duplicate-name guard in `move_to_curated` (prevent silent overwrite)
- Dry-run mode for `move_to_curated` (preview filename before committing)
- Undo for curation (copy instead of move, or archive to a `course-archive/` folder)
- Image reference format in `draft_lesson` (Obsidian `![[]]` vs standard markdown `![]()`)
- Course outline reference file for module/lesson assignment context

---

## Part 5: Verification

After all sessions, you should have:
- 4+ bug notes in `Bugs/` with varying quality/context
- 10+ sidecar JSONs showing triage decisions
- 6+ curated images with proper naming
- 3+ lesson drafts with different parameters
- A clear list of friction points and tool improvement ideas

---

## Critical Files

| File | Role |
|------|------|
| `src/tools/triageCapture.ts` | Course triage — the most-exercised tool |
| `src/tools/processBugCapture.ts` | Bug workflow — most self-contained |
| `src/tools/moveToCurated.ts` | Curation — where friction will be highest |
| `src/tools/draftLesson.ts` | Lesson generation — prompt tuning target |
| `src/tools/listRecentCaptures.ts` | Read-only enumeration — used in every session |
| `.hooksai/scripts/intake-triage.js` | Hook glue — controls automated triage behavior |
| `.hooksai/on-change/intake-triage.hook.md` | Hook definition — glob pattern and runner |
| `Templates/Bug.md` | Obsidian bug note template |
