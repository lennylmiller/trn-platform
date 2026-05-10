# Inner Agility Journey — Chronological Timeline & Demo Plan

## Context

Lenny is preparing a demo for Monday (May 12, 2026) that tells the story of the Inner Agility / Bridge Builder journey — from pfm-platform R&D through lar-platform AI artifacts to the latest trn-platform work. The demo needs a compelling narrative arc showing how AI-assisted architecture scaffolding evolved from experiment to repeatable pipeline.

---

## The Timeline: 8 Months of Building the Bridge

### Act 1: The Laboratory (Nov 2025 – Mar 2026) — pfm-platform

**Nov 2, 2025** — "this is it" — pfm-platform genesis. First commit.

Over 5 months, **479 commits** build out:
- 11 financial domains (accounts, budgets, goals, transactions, etc.)
- The **3-layer architecture** crystallizes: `data-access → feature → ui-mui`
- Supabase remote-first (no Docker locally), RLS on every table
- React 19 + MUI 7 + TanStack Query 5 + Zod — the proven stack
- Storybook with 7 interactive workflow journeys, MSW mocking
- Vitest with 80% coverage thresholds, 70 RLS smoke tests
- CI/CD with change detection, selective testing, auto-deploy

**Key insight:** The patterns kept repeating across all 11 domains. Every domain had the same shape — query key factory, hooks wrapping Supabase, feature hooks for business logic, MUI components with stories. This repetition was the signal.

---

### Act 2: The Thesis (Mar – Apr 2026) — je-pfm + Layers of Resolution

**Mar 22, 2026** — je-pfm kicks off ("This is wonderful"). 27 commits over 18 days.
- MakerKit SaaS kit rebranded to JE-PFM
- **Mar 29** — "Layers of Resolution" blog post published — the architectural thesis
- **Apr 7** — "Orchestrate generative cycle" blog post — the vision for AI-driven scaffolding
- POC #0 (composition fidelity test) and POC #1 (HooksAI integration)
- **Apr 9** — Rebranded to Inner-Agility.dev

**This is where the idea becomes a method.** The blog posts articulate what pfm-platform proved empirically: monoliths decompose into domains, domains have layers, layers have templates, templates can be generated.

---

### Act 3: The Extraction (Apr 12, 2026) — lar-platform v1.0

**Apr 12, 2026** — "Sprint 3 template alignment + theming initiative" (#619)

lar-platform emerges inside pfm-platform as a **complete AI artifact toolkit**:
- **11 sequential prompts** (01–10 + 01.5) — the generative pipeline
- **3 JSON schemas** — machine-readable connective tissue
- **~80 parameterized templates** (.tmpl files) — domain, infra, Storybook, SaaS shell
- **Reference examples** from pfm-platform proving each pattern

The pipeline flow:
```
Monolithic App
  → 01: Domain Discovery (identify business domains)
  → 01.5: Brand Discovery (extract theme tokens)
  → 02: Entity Extraction (Zod schemas)
  → 03: Use Case Generation (business operations)
  → 04: Workflow Discovery (user journeys)
  → 05: Component Catalog (machine-readable vocabulary)
  → 06: Pages Catalog (workflow → page → component mapping)
  → 07: Test Strategy (per-layer testing)
  → 08: Infrastructure Scaffold (CI/CD, Supabase, build)
  → 09: Storybook Composition (workflow stories, MSW)
  → 10: SaaS Shell (Turborepo + Next.js + MakerKit)
```

---

### Act 4: First Proof (Apr 12–17, 2026) — tp-platform

**Apr 12–17** — 5 days, 25 commits. The acid test.

lar-platform is applied to a trip-planner monolith:
- **Sprint 3:** `todos` domain end-to-end (4 packages, 69 tests, Storybook + MSW)
- **Sprint 4a:** 7 remaining domains scaffolded (18 packages total, 125 tests, 35 stories)
- **Sprint 4b:** Workflow stories (5 workflows, 19 steps, 4 FullFlows)
- **Sprint 4c:** Component-demo app with real Supabase backend

**8 domains scaffolded in 5 days.** Compare to pfm-platform's 5 months for 11 domains. The pipeline works.

---

### Act 5: The Ecosystem (Apr 18 – May 6, 2026) — Supporting cast

**Apr 18** — pfm-platform vault reconciliation: "reconcile with Inner Agility / Bridge Builder pivot" (#635)

**May 1** — **mcp-central** created — single source of truth for MCP server config across Claude Code, Gemini CLI, Codex CLI (Mac + WSL)

**May 3** — **capture-mcp** scaffolded — MCP server for AI-assisted screenshot capture (Snagit → Obsidian notes, bug reports, lesson drafts). Uses Claude Haiku vision.

**hooksai** (Oct 2025 – May 2026, ~500 commits) — the mature backbone:
- File system watcher + webhook → AI agent framework
- v0.5.18 by May 3 — Slack bot, MCP integration, skills system, headless mode
- This is the runtime that could power the generative cycle

---

### Act 6: The Current Sprint (May 1–9, 2026) — trn-platform

**80+ commits in 8 days.** The most intense burst of activity.

trn-platform = QC-Training rebuild. **4-layer architecture** (adds Express server layer for SQL Server):
```
server (Express 5) → data-access → feature → ui-mui → shared
```

7 domains: steps, flows, compositions, execution, chat, stories, courses

**The experiments (May 7–9) tell the demo story:**
- Exp 1: Course editor layout
- Exp 2: Slide editor
- Exp 3: Add/delete lessons
- Exp 4: Inline preview toggle
- Exp 5: Course tracks
- Exp 6: **AI-assisted authoring** (ChatPanel — one prompt builds a course)
- Exp 7: Guided "New Course" flow with AI Author

**May 8–9:** Major refactoring (Slide → Block rename), MCP client integration, resizable chat panel, workbench plan with intent-driven use cases.

This is lar-platform patterns applied with a **SQL Server backend** and an **AI authoring layer** — the pipeline adapting to a new context.

---

## Demo Structure Proposal

### Option A: "The Journey" (Narrative Arc, ~20 min)

| Segment | Duration | Content | Show |
|---------|----------|---------|------|
| **The Problem** | 2 min | 11 domains, same patterns, 5 months of manual work | pfm-platform repo stats, package structure |
| **The Insight** | 3 min | Layers of Resolution — patterns are templates | Blog post, architecture diagram |
| **The Extraction** | 3 min | lar-platform: 11 prompts, 80 templates, 3 schemas | Directory walkthrough, prompt pipeline diagram |
| **The Proof** | 4 min | tp-platform: 8 domains in 5 days | Side-by-side: pfm vs tp structure, commit velocity |
| **The Ecosystem** | 3 min | hooksai + capture-mcp + mcp-central | Architecture diagram showing integrations |
| **The Frontier** | 5 min | trn-platform: AI Author, 4-layer with SQL Server | Live demo of course editor + AI authoring |

### Option B: "Before & After" (Impact-focused, ~15 min)

| Segment | Duration | Content |
|---------|----------|---------|
| **Before** | 5 min | pfm-platform: 479 commits, 5 months, 11 domains — the hard way |
| **The Bridge** | 3 min | lar-platform pipeline walkthrough — prompts → templates → platform |
| **After** | 5 min | tp-platform (5 days) + trn-platform (8 days) — the fast way |
| **What's Next** | 2 min | AI Author in trn-platform, capture-mcp, the generative cycle vision |

### Option C: "Live Build" (Most ambitious, ~25 min)

Start from a simple app, run it through lar-platform prompts live with Claude Code, show scaffolded output at each stage. Use trn-platform as the "completed" reference.

---

## How We Can Collaborate

1. **Script writing** — I can draft speaker notes for each segment, with exact file paths and commands to show
2. **Slide content** — Generate timeline diagrams, architecture comparisons, commit velocity charts
3. **Live demo prep** — Pre-stage the trn-platform in a demo-ready state, ensure AI Author flow works end-to-end
4. **Talking points** — Key stats, before/after comparisons, quotable insights
5. **Backup plan** — Pre-recorded terminal sessions (asciinema) in case live demo has issues

---

## Key Stats for the Demo

| Metric | pfm-platform | tp-platform | trn-platform |
|--------|-------------|-------------|-------------|
| Duration | 5 months | 5 days | 8 days (ongoing) |
| Commits | 479 | 25 | 80+ |
| Domains | 11 | 8 | 7 |
| Architecture | 3-layer | 3-layer | 4-layer |
| Backend | Supabase | Supabase | SQL Server |
| AI Authoring | No | No | Yes (ChatPanel) |
| Tests | 70+ RLS smoke | 125 unit | 28 integration |

## Files to Reference During Demo

- `pfm-platform/lar-platform/README.md` — the lar-platform overview
- `pfm-platform/lar-platform/prompts/` — the 11-prompt pipeline
- `pfm-platform/next-feature.md` — the narrative thread
- `pfm-platform/docs/pfm-platform/Home.md` — vault docs with Bridge Builder context
- `trn-platform/CLAUDE.md` — current architecture reference
- `je-pfm/` — blog posts (Layers of Resolution, Orchestrate)
