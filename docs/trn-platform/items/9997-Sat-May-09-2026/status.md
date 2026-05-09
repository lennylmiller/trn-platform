# Session Status — Saturday May 9, 2026

## Where We Are

**Current branch:** `experiment/7.5-mcp-centric-approach` (branched from `experiment/7-new-course-flow`)

Two branches exist with different AI architectures:

| Branch | Architecture | Status |
|---|---|---|
| `experiment/7-new-course-flow` | Chat service has its own tool executor (duplicate of MCP) | Stable, tested |
| `experiment/7.5-mcp-centric-approach` | Chat service routes through MCP server (single source of truth) | Built, needs testing |

**Decision pending:** Which branch to merge to main? 7.5 is cleaner (eliminates duplication) but is newer and less tested.

## What's On Main (Experiments 1-6)

All merged and stable:

| Exp | Feature | Status |
|---|---|---|
| 1 | Course outline editor (3-panel layout) | Merged |
| 2 | Slide editor form (per-type fields, save) | Merged |
| 3 | Add/delete lessons and slides | Merged |
| 4 | Inline preview toggle (Edit/Preview) | Merged |
| 5 | Course tracks (audience grouping above series) | Merged |
| 6 | AI authoring (ChatPanel with course CRUD tools, persistent chat) | Merged |

## What's On experiment/7-new-course-flow (Not Yet Merged)

| Feature | Commits |
|---|---|
| Guided "New Course" flow (Create Course → AI conversation) | 3225ca7 |
| Button nesting fix in CoursesPage | 14e07b6 |
| Bulk `build_course_content` tool (one call builds entire course) | db582af |
| Delete course, export/import course | db582af |
| Track selector with CRUD (add/edit/delete tracks, gear icon) | 69090b2, 259bc36 |
| Regression test docs (6 files) | 906d94f |
| Automated tests (28 integration tests + smoke script) | bb4c66d |
| Fix: smoke test health check path | c088dd3 |
| Fix: onToolCall stale closure | 6fbb5ac |
| Fix: Create Course modal with track assignment | f56f219 |
| Inline series creation (Autocomplete) | e10fed9 |
| Fix: stale course list after create | e4b08fc |
| Stabilize AI: intent detection, templates, JSON validation | a374ee3 |
| Schema cache + SQL read-only guard + auto-injected context | 517be45 |
| MCP architecture doc + courses reference update | 410a7b4, 5fc080f |

## What's On experiment/7.5-mcp-centric-approach (On Top of 7)

| Feature | Commits |
|---|---|
| MCP-centric AI: chat service routes through MCP server | 7004b87 |
| Source resolution: server-dev.cjs loads from src/ not dist/ | 0323157 |
| Plan/Act toggle: Claude Code refines prompts via CLI subprocess | bcf69df |
| Auto-navigate to editor with AI Author open on create | 53584ea |
| `build_course_content` added to MCP server | 7004b87 |
| Deleted duplicate tools.ts and api-client.ts from chat server | 7004b87 |

## Overall Roadmap Status

| Experiment | Status | Notes |
|---|---|---|
| 1-6 | Done, on main | Core editor + AI authoring |
| 7: New Course Flow | Done, on branch | Needs merge decision |
| 7.5: MCP-Centric | Done, on branch | Needs testing, then merge decision |
| 8: Schema-Driven Templates | Not started | AI traces dependency chain, generates lesson plan |
| 9: PDF Document Ingestion | Not started | Upload doc → AI extracts course structure |
| 10: Capture Pipeline (POC) | Not started | hooksai + capture-mcp integration |
| 11: Verification Slides | Not started | configure_and_verify, stronger do_it_in_qc |

## Key Tangents Taken (All Productive)

1. **Track system** — wasn't in original plan, grew from "add grouping above series" discussion
2. **Create Course modal** — replaced the AI-only `/courses/new` page with a structured form
3. **Schema cache** — emerged from debugging why AI explored instead of building
4. **SQL guard** — emerged from "what guardrails exist?" discussion
5. **Source resolution** — emerged from "why do I keep having to rebuild?" frustration
6. **Plan/Act toggle** — emerged from "what would it take to use Claude Code?" discussion
7. **MCP-centric refactor** — emerged from "should we use the MCP server from the app?"

## Next Steps

1. **Test experiment 7.5** — does the MCP-centric approach + Plan/Act toggle work?
2. **Merge decision** — merge 7.5 to main (or fall back to 7 if issues)
3. **Clean up branches** — delete merged experiment branches
4. **Continue to Experiment 8** — schema-driven template generation
5. **Three-day hardening goal** — stabilize for the AI-guided document course creation + screenshot capture workflow

## Files Changed This Session

### New files created:
- `packages/chat/server/src/mcp-client.ts` — MCP client (spawns server, proxies tools)
- `packages/chat/server/src/tool-filter.ts` — SQL guard, tool subset filter
- `packages/chat/server/src/claude-code.ts` — Claude Code CLI subprocess integration
- `packages/chat/server/src/schema-cache.ts` — Pre-computed schema snapshots for 6 QC domains
- `packages/courses/ui-mui/src/components/CreateCourseDialog.tsx` — Create course modal
- `scripts/smoke-test.sh` — Curl-based smoke test
- `server/db/migrations/007_course_tracks.sql` — Track table
- `server/db/migrations/008_course_track_metadata.sql` — Track metadata column
- `packages/courses/server/src/__tests__/courses-api.test.ts` — 28 integration tests
- `packages/courses/server/vitest.config.ts` — Test config
- `docs/trn-platform/4-reference/regression/*.md` — 7 regression test docs
- `docs/trn-platform/4-reference/mcp-architecture.md` — MCP architecture doc
- `docs/trn-platform/4-reference/courses-feature-reference.md` — Updated reference
- `docs/trn-platform/items/Sat-May-09-2026/ai-course-creation-design.md` — AI design doc

### Files deleted (in 7.5):
- `packages/chat/server/src/tools.ts` — replaced by MCP client
- `packages/chat/server/src/api-client.ts` — replaced by MCP client
