# The Journey: Building the Bridge

**Demo Script — May 12, 2026 | ~20 minutes**
**Format:** Option A — Narrative Arc, 6 Segments

---

## Segment 1: The Problem (2 min)

### Speaker Notes

> Five months. 479 commits. Eleven financial domains — accounts, budgets, goals, transactions, imports, the works. Every single one built by hand.
>
> And here's the thing — by domain number four, I knew exactly what I was going to build for domain number five. Query key factory. TanStack hooks wrapping Supabase. Feature hooks for business logic. MUI components with co-located Storybook stories. Same shape, every time.
>
> The architecture was right. The repetition was the problem. Not because it was tedious — because it was a signal. If I can predict the output, the output can be generated.

### Screen: Terminal

```bash
# Show the 11-domain × 3-layer grid
ls /mnt/c/Users/lmiller/Documents/inner-agility.dev/pfm-platform/packages/
```

**What they see:** 13 directories — 11 domains + shared + component-demo. The visual density tells the story.

### Screen: Quick scroll

Open one domain to show the 3-layer pattern:

```bash
ls /mnt/c/Users/lmiller/Documents/inner-agility.dev/pfm-platform/packages/accounts/
# → data-access/  feature/  ui-mui/

ls /mnt/c/Users/lmiller/Documents/inner-agility.dev/pfm-platform/packages/goals/
# → data-access/  feature/  ui-mui/

ls /mnt/c/Users/lmiller/Documents/inner-agility.dev/pfm-platform/packages/transactions/
# → data-access/  feature/  ui-mui/
```

**Beat:** Pause. Let the repetition land visually.

### Transition

> "So I started writing it down."

---

## Segment 2: The Insight (3 min)

### Speaker Notes

> In late March, I published a blog post called "Layers of Resolution." The core idea: components alone aren't enough. A vocabulary is not a sentence.
>
> We had 148 components across 11 domains. But a component catalog doesn't tell you how to compose a page. You need four layers:
>
> - **Layer 1: Components** — the vocabulary. 148 UI pieces.
> - **Layer 2: Workflow Stories** — the sentences. 7 multi-step user journeys, 77 steps.
> - **Layer 3: Pages** — the paragraphs. Materialized compositions of components, driven by workflows.
> - **Layer 4: Customer Forks** — per-tenant customizations. Git diff IS the customization record.
>
> Then in April, the second post: "Orchestrate — The Engine That Closes the Generative Cycle." This is where it gets interesting.
>
> The generative cycle runs in two directions. Direction one: you write a workflow story, AI generates a page. Direction two: you edit a page, AI reverse-engineers the intent back into a workflow story. Each output becomes the next input, with quality gates in between.
>
> This isn't a single function call. It's a chain of events — it's orchestration.

### Screen: SVG Diagram

Display the Layers of Resolution architecture diagram:

```
File: je-pfm/apps/web/public/images/posts/layers-of-resolution.svg
```

**Call out:** The 4-layer stack with bidirectional arrows.

### Screen: SVG Diagram

Switch to the Orchestrate diagram:

```
File: je-pfm/apps/web/public/images/posts/orchestrate-generative-cycle.svg
```

**Call out:** Step A (AI Interprets) → Step B (Quality Gate) → Step C (Generate). Emphasize the quality gate — "Every component referenced in the story must exist in the catalog. Every hook must be exported from the correct domain package. The props interface must match TypeScript declarations."

### Transition

> "Two blog posts. A thesis. But a thesis without tooling is just an opinion. So we built the tooling."

---

## Segment 3: The Extraction (3 min)

### Speaker Notes

> April 12th. We extracted everything we'd learned into a single directory: lar-platform. Layers of Resolution, Platform tooling.
>
> Eleven sequential prompts. Each one takes the output of the previous one as input. It's a pipeline — you feed it a monolithic application, and it decomposes it into a layered platform.
>
> Here's the flow:
>
> **Prompt 01:** Domain Discovery — analyze source code, identify cohesive business domains.
> **Prompt 02:** Entity Extraction — produce Zod schemas for every entity type.
> **Prompt 03:** Use Case Generation — structured specs for every business operation.
> **Prompt 04:** Workflow Discovery — multi-step user journeys that span domains.
>
> Now you've got your architecture. Next, the connective tissue:
>
> **Prompt 05:** Component Catalog — a machine-readable JSON vocabulary of every UI component.
> **Prompt 06:** Pages Catalog — maps workflow steps to page routes to components.
>
> And then the engineering ecosystem:
>
> **Prompt 07:** Test strategy per layer. **08:** Infrastructure — CI, database, builds.
> **09:** Storybook composition — workflow stories, MSW mocks, dual-mode decorators.
> **Prompt 10:** SaaS shell — a production Next.js app consuming everything.
>
> Alongside the prompts: three JSON schemas for validation, and about eighty parameterized templates. The templates use placeholder syntax — swap in your platform name, your domain name, and you get production-ready code with tests.

### Screen: Terminal walkthrough

```bash
# Show the lar-platform structure
ls pfm-platform/lar-platform/
# → examples/  prompts/  schemas/  templates/  README.md

# Show the prompt pipeline
ls pfm-platform/lar-platform/prompts/
# → 01-domain-discovery.md
#   01.5-brand-discovery.md
#   02-entity-extraction.md
#   03-use-case-generation.md
#   04-workflow-discovery.md
#   05-component-catalog-gen.md
#   06-pages-catalog-gen.md
#   07-test-strategy.md
#   08-infra-scaffold.md
#   09-storybook-composition.md
#   10-saas-shell-scaffold.md

# Show the template depth
ls pfm-platform/lar-platform/templates/
# → domain/  infra/  saas-shell/  shared/  storybook/

ls pfm-platform/lar-platform/templates/domain/
# → data-access/  feature/  server/  ui-mui/
```

**Beat:** Let the directory structure breathe. The audience should see the systematic nature.

### Optional: Quick peek at a prompt

```bash
# Show the opening of prompt 01
head -30 pfm-platform/lar-platform/prompts/01-domain-discovery.md
```

### Transition

> "Eleven prompts. Eighty templates. Three schemas. All extracted from five months of proven work. But does it actually work on something new? We tested it."

---

## Segment 4: The Proof (4 min)

### Speaker Notes

> We had a trip-planner app sitting around. A monolith. Nothing special — todos, trips, itineraries, parks, fuel stops, users.
>
> We ran it through the pipeline. Five days. Twenty-five commits. Here's what came out:
>
> Eight domains scaffolded — each with data-access, feature, and ui-mui layers. A hundred and twenty-five tests passing. Thirty-five Storybook stories. Five workflow journeys with nineteen steps. A working component-demo app with a real Supabase backend, seeded with test data.
>
> Let me put that in perspective.

### Screen: Side-by-side comparison

| | pfm-platform | tp-platform |
|---|---|---|
| **Duration** | 5 months | 5 days |
| **Commits** | 479 | 25 |
| **Domains** | 11 | 8 |
| **Tests** | 70+ RLS smoke | 125 unit |
| **Storybook** | 7 workflows | 5 workflows, 35 stories |
| **Architecture** | 3-layer | 3-layer (identical) |
| **Backend** | Supabase | Supabase |

### Speaker Notes (continued)

> Same architecture. Same patterns. Same test coverage philosophy. One hundredth the time.
>
> And the code isn't templated boilerplate — the prompts analyze the actual source application. The todos domain in tp-platform has different entities, different use cases, different workflows than anything in pfm-platform. The pipeline discovered them from the trip-planner source code.
>
> Five months of R&D distilled into five days of execution. That's what the bridge does.

### Screen: Terminal

```bash
# Show tp-platform has the same shape
ls /mnt/c/Users/lmiller/Documents/inner-agility.dev/tp-platform/packages/
```

### Transition

> "So the pipeline works for Supabase backends. But what if the target is SQL Server? What if we need a server layer? What if we want AI to help author content inside the platform itself? That's where we are right now."

---

## Segment 5: The Ecosystem (3 min)

### Speaker Notes

> While we were proving the pipeline, we were also building the ecosystem around it.
>
> **HooksAI** — our most mature project, about 500 commits going back to October 2025. It's a file system watcher that triggers AI agents. You drop a `.hook.md` file in a watched directory, and when files change, the hook fires with context. It has a Slack bot, MCP integration, a skills system, headless mode. Version 0.5.18. This is the runtime that could eventually power the generative cycle — Orchestrate, from the blog post, made real.
>
> **MCP Central** — created May 1st. A single source of truth for MCP server configuration. One canonical `servers.json` with variable placeholders, and projector scripts that render it for Claude Code, Gemini CLI, or Codex CLI. Because when you're working across six repos with multiple AI tools, config drift is real.
>
> **Capture MCP** — scaffolded May 3rd. An MCP server for AI-assisted screenshot processing. You take a screenshot with Snagit, and it uses Claude's vision to turn it into structured Obsidian notes — bug reports, lesson drafts, course captures. Triage proposes, human disposes — files land in a pending-review folder for confirmation.
>
> These aren't side projects. They're the infrastructure layer. HooksAI watches for changes. Capture MCP brings visual context. MCP Central keeps the config sane. Together, they feed the platforms.

### Screen: Show the workspace

```bash
# The full inner-agility.dev workspace
ls /mnt/c/Users/lmiller/Documents/inner-agility.dev/
# → capture-mcp/  hooksai/  je-pfm/  mcp-central/
#   pfm-platform/  sandbox/  tp-platform/  trn-platform/
```

**Beat:** "Eight repos. One ecosystem."

### Transition

> "Which brings us to this week. The current sprint. And this is where it gets fun."

---

## Segment 6: The Frontier (5 min)

### Speaker Notes

> trn-platform. QC-Training rebuild. Started April 26th. Eighty-plus commits in eight days. This is the most intense sprint yet.
>
> Three things make this different from tp-platform.
>
> **First: four layers, not three.** We added an Express server layer because the backend is SQL Server, not Supabase. The architecture adapted:
>
> `server (Express 5) → data-access → feature → ui-mui → shared`
>
> Same domain decomposition. Same layer contracts. Different backend. The pipeline's patterns held — they're backend-agnostic.
>
> **Second: seven experiments in three days.** We ran numbered experiments — not sprints, experiments. Each one tested a specific capability:
>
> - Experiment 1: Course editor layout
> - Experiment 2: Slide editor
> - Experiment 3: Add/delete lessons
> - Experiment 4: Inline preview toggle
> - Experiment 5: Course tracks
> - Experiment 6: AI-assisted authoring — the ChatPanel
> - Experiment 7: Guided "New Course" flow with the AI Author
>
> Seven experiments. Each one built on the last. Each one pushed the architecture.
>
> **Third — and this is the big one — AI authoring.** Experiment 6 introduced the ChatPanel. It's an embedded AI interface inside the course editor. You type one prompt — "Build me an intro course on workplace safety" — and the AI builds the course structure. Lessons, blocks, content. It uses MCP tools to read the database schema, understand what's possible, and generate accordingly.

### Screen: Show trn-platform structure

```bash
# The 4-layer architecture
ls /mnt/c/Users/lmiller/Documents/inner-agility.dev/trn-platform/packages/
# → chat/  compositions/  courses/  execution/  flows/
#   mcp-server/  shared/  steps/  stories/
```

### Screen: Show the ChatPanel

Open in editor:
```
File: trn-platform/packages/chat/ui-mui/src/components/ChatPanel.tsx
```

**Call out:**
- `useChatSession` hook from `@trn-platform/chat-feature` — the 3-layer pattern in action
- `onToolCall` callback — MCP tool integration
- `systemPromptHint` — domain context injection
- Three resize modes (default/wide/full) — it lives inside the editor
- `MessageBubble` + `ToolCallCard` — you can see the AI's reasoning

### Speaker Notes (closing)

> Look at what happened here. We spent five months building pfm-platform by hand. We extracted the patterns into lar-platform. We proved the pipeline generates platforms in days. And now, in trn-platform, the platform itself has AI built into the product — not just the development process.
>
> The bridge goes both ways. AI helps us build the platform. And the platform helps users build with AI.
>
> That's the journey. From a single commit — "this is it" — on November 2nd, 2025, to an AI-assisted course authoring system, in six months.

---

## Closing (30 sec)

### Speaker Notes

> What's next? Bridge Builder becomes its own project — extracted from pfm-platform, standing on its own. The pipeline gets a CLI. The generative cycle closes — Orchestrate, from the blog post, wired to HooksAI, watching for changes and propagating them across layers.
>
> But that's the next demo. This one was about the journey so far.

**Beat:** Pause. Open for questions.

---

## Pre-Demo Checklist

- [ ] Terminal open to `/mnt/c/Users/lmiller/Documents/inner-agility.dev/`
- [ ] SVG diagrams pre-loaded in browser tabs:
  - `je-pfm/apps/web/public/images/posts/layers-of-resolution.svg`
  - `je-pfm/apps/web/public/images/posts/orchestrate-generative-cycle.svg`
- [ ] Editor open with `ChatPanel.tsx` ready to show
- [ ] Side-by-side comparison table ready (slide or markdown render)
- [ ] Font size bumped for terminal visibility
- [ ] All `ls` commands pre-tested to confirm expected output

## Backup: Pre-Recorded Commands

If live terminal feels risky, pre-record these with asciinema:

```bash
# Record a walkthrough
asciinema rec demo-walkthrough.cast

# Play it back at 2x
asciinema play -s 2 demo-walkthrough.cast
```

Key sequences to record:
1. `ls` across pfm-platform packages (Segment 1)
2. `ls` through lar-platform directory tree (Segment 3)
3. `ls` of tp-platform packages (Segment 4)
4. `ls` of trn-platform packages (Segment 6)
