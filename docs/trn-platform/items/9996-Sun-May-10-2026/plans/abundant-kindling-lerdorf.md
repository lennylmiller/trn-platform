# The Bridge Builder Story: Composition Narrative Arc

## Context

The trn-platform's composition system (narrative blocks + flow blocks + notes + nested compositions) is the delivery vehicle for telling the lar-platform / Bridge Builder evolution story. The user wants to author a set of compositions whose *content* walks a presenter through the journey from "vibe-coded apps hit a wall at month 3" to "Bridge Builder decomposes monoliths into platforms where features are spoken into existence."

This is a **meta-narrative**: the training platform presents its own origin story. The climax is when the audience realizes the thing doing the presenting IS the thing being presented.

---

## Composition Hierarchy

### Top-Level Module: "The Bridge Builder Story"

**Kind:** `module` | **is_seed:** `true`

| seq | type | heading | target |
|-----|------|---------|--------|
| 1 | narrative | "Welcome & Session Overview" | Opening framing (~45-60 min session) |
| 2 | composition | "Act 1: The Problem" | → Story: "The Spaghetti Point" |
| 3 | composition | "Act 2: The Insight" | → Story: "Layers of Resolution" |
| 4 | composition | "Act 3: The Proof" | → Tutorial: "PFM-Platform: 148 Components" |
| 5 | composition | "Act 4: The Extraction" | → Tutorial: "The lar-platform Pipeline" |
| 6 | composition | "Act 5: The Test" | → Story: "Two Proofs: Trip Planner & Training Platform" |
| 7 | composition | "Act 6: The Vision" | → Story: "Bridge Builder: The Product" |
| 8 | narrative | "Closing & Discussion" | Wrap-up, Q&A, resource links |

---

## Act-by-Act Block Sequences

### Act 1 — Story: "The Spaghetti Point"
*Pure narrative. No demos. Fast, punchy. Sets up the problem.*

| seq | type | heading | content direction | presenter_notes |
|-----|------|---------|-------------------|-----------------|
| 1 | narrative | "The Promise of Vibe Coding" | AI-assisted dev excitement. Ship in hours. Every dev is 10x. | "Start energetic. Let them feel the optimism before we break it." |
| 2 | narrative | "Month 3: The Wall" | Gartner data: 45% security vulns, 2500% defect increase. Features that took 10 min now take 2 hrs. | "Pause after the 2500% stat. Let it land." |
| 3 | note | "The Numbers" | Formatted Gartner stats, LOC metrics, time-to-fix curves | — |
| 4 | narrative | "What Went Wrong?" | No separation of concerns, no domain boundaries, no contracts. AI generates code but has no concept of architectural coherence. | "Transition: 'What if the AI could be taught architecture?'" |

### Act 2 — Story: "Layers of Resolution"
*Pure theory. Slow, deliberate. The intellectual core.*

| seq | type | heading | content direction |
|-----|------|---------|-------------------|
| 1 | narrative | "The Thesis" | Software complexity resolves in layers. Each layer has different rules, audiences, rates of change. |
| 2 | note | "The Four Layers" | Diagram: Components → Workflow Stories → Pages → Customer Forks. Annotated with ownership, change frequency. |
| 3 | narrative | "Components: The Atoms" | Small, testable, domain-scoped. Strict dependency rules: data-access → feature → ui. |
| 4 | narrative | "Workflow Stories: The Molecules" | Compose components into user journeys. The unit of business value. Foreshadow trn-platform's composition system. |
| 5 | narrative | "Pages and Customer Forks" | Pages are thin orchestrators. Forks let different customers see different stories without changing components. |
| 6 | note | "Architecture Rule: Never Skip a Layer" | Dependency rules in code form. Real tsconfig/package.json from trn-platform as examples. |

### Act 3 — Tutorial: "PFM-Platform: 148 Components"
*Confidence building. Moderate pace. No demos yet.*

| seq | type | heading | content direction |
|-----|------|---------|-------------------|
| 1 | narrative | "The Origin: JE-PFM" | SaaS starter (Next.js + Supabase). Generic but useful. Could we build something domain-rich on it? |
| 2 | narrative | "11 Domains, Zero Cross-Talk" | 148 components across 11 financial domains. No domain imports from another domain. All sharing through shared package. |
| 3 | note | "PFM Domain Map" | All 11 domains with component counts. Package dependency graph showing each domain depends only on shared. |
| 4 | narrative | "What HooksAI Became" | HooksAI → Sinew. CLI for AI-powered automation. The hands that build the platform. |
| 5 | narrative | "The Realization" | At 148 components, the pattern emerged: every domain follows the same structure. If consistent → extractable → automatable → productizable. | 

### Act 4 — Tutorial: "The lar-platform Pipeline"
*"How does it work?" First live demo. Moderate pace.*

| seq | type | heading | content direction |
|-----|------|---------|-------------------|
| 1 | narrative | "What Is lar-platform?" | Not a framework — a toolkit. 10 prompts, schemas, templates, examples. Teaches AI how to decompose a domain. The recipe, not the kitchen. |
| 2 | note | "The 10 Prompts" | Numbered list: Domain Discovery → Entity Extraction → Use-Case Generation → Workflow Discovery → Component Catalog → Pages Catalog → Test Strategy → Infra Scaffold → Storybook Composition → SaaS Shell |
| 3 | narrative | "Input to Output" | Plain English in → decomposition map → monorepo scaffold → documentation. AI constrained by architecture, not freed from it. |
| 4 | note | "Pipeline Example" | Input: "A trip planning app with itineraries, destinations, activities, budgets" → Output: domain list, entity schemas, package structure. tp-platform's actual genesis. |
| 5 | **flow** | "Live: Environment Reset" | **Existing flow 3.** Reset training env. Audience sees SSE streaming, step execution. First live demo. |
| 6 | narrative | "This Platform Was Generated" | Reveal: trn-platform was generated by lar-platform. The compositions system, flow engine, step library — all from the pipeline. |

### Act 5 — Story: "Two Proofs"
*Excitement, "aha!" High energy, 2-3 live demos.*

| seq | type | heading | content direction |
|-----|------|---------|-------------------|
| 1 | narrative | "The Proof Strategy" | One platform = project. Two = pattern. Three = product. Easy (TP, 8 domains), Moderate (PFM, 11 domains), Complex (Health Insurance, future). |
| 2 | narrative | "Proof 1: Trip Planner" | 8 domains, Supabase, generated entirely from lar-platform. Architecture held. Components composable. Tests passed. |
| 3 | narrative | "Proof 2: Training Platform" | Different backend (SQL Server + Express). Extended to 4-layer. Different domain (training/execution). If the pipeline works here, it works anywhere. |
| 4 | **flow** | "Live: New Hire Onboarding" | **Existing flow 1.** Full 3-step flow: create DB, load members, verify claims. Pause at step 2 to discuss member schema. |
| 5 | note | "Architecture Comparison" | Side-by-side: TP (8 domains, Supabase, 3-layer) vs TRN (4 domains, SQL Server, 4-layer). Same pipeline, different targets. Shared DNA: pnpm, MUI, TanStack Query, Storybook, Vitest. |
| 6 | **flow** | "Live: Claims Processing" | **Existing flow 2.** 5-step claims flow. Let it run — the point is volume and complexity. |
| 7 | **flow** | "Live: Composition Self-Query" | **New flow (see below).** Queries the composition table to show THIS presentation's own data. The meta-moment made tangible. |
| 8 | narrative | "The Self-Referential Moment" | The platform is presenting its own origin story. The composition system, the flow engine, the step library — all generated by the pipeline. The audience is inside the proof. |

### Act 6 — Story: "Bridge Builder: The Product"
*Inspiration. Forward momentum. No demos — pure vision.*

| seq | type | heading | content direction |
|-----|------|---------|-------------------|
| 1 | narrative | "From Tool to Product" | The pipeline works for us. Bridge Builder makes it work for everyone. Describe your domain → get a production-grade platform back. |
| 2 | note | "The POC Sequence" | 1. Domain Decomposer ✅ → 2. AI Chat → 3. Sinew Orchestration → 4. Red Pencil → 5. Domain Evolution → 6. Bridge Builder SaaS |
| 3 | narrative | "The $4.7B Opportunity" | Vibe coding market at 38% CAGR. Unlike modernization services (Orafox, Baytech), Bridge Builder doesn't rewrite — it decomposes. |
| 4 | narrative | "The Spaghetti Point, Revisited" | Full circle to Act 1. At month 3, the app hits the wall. Now there's an answer: run Bridge Builder. Decompose. Generate. Migrate feature by feature. |
| 5 | narrative | "The Thesis, Restated" | Vibe coding creates; platform architecture sustains. Bridge Builder bridges the gap. Two proofs complete, third in progress. |

---

## New Flows to Create

### Flow: "Platform Architecture Explorer"
*Shows the platform's own database schema. Self-referential technical demo.*

| seq | step type | category | description |
|-----|-----------|----------|-------------|
| 1 | sql | verify | `SELECT name FROM sys.tables` — List all tables in qc_training |
| 2 | sql | verify | `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME IN ('composition','composition_block','flow','flow_step','step_library')` |
| 3 | sql | verify | `SELECT c.title, c.kind, COUNT(cb.block_id) as blocks FROM composition c LEFT JOIN composition_block cb ON ... GROUP BY ...` — Show all compositions including this one |

### Flow: "Composition Self-Query"
*The most powerful demo — queries the data driving the current presentation.*

| seq | step type | category | pause_after |
|-----|-----------|----------|-------------|
| 1 | sql | scenario | no | Query: `SELECT * FROM composition WHERE title LIKE '%Bridge Builder%'` |
| 2 | sql | verify | yes | Query: Join composition_block with flow references for this composition |
| 3 | manual | verify | no | Presenter: "You are looking at the data structure driving this presentation right now." |

### Flow: "Domain Layer Verification"
*Cross-database demo showing dual-database architecture.*

| seq | step type | category | pause_after |
|-----|-----------|----------|-------------|
| 1 | sql | verify | no | Query qc_training for step/flow/composition counts |
| 2 | sql | verify | yes | Query qc_core for member/claim/referral counts |
| 3 | sql | verify | no | Join: which flows reference which steps, which compositions reference which flows |

---

## Pacing & Emotional Arc

| Act | Emotion | Pace | Demos |
|-----|---------|------|-------|
| 1: Problem | Anxiety, recognition | Fast | 0 |
| 2: Insight | Curiosity | Slow | 0 |
| 3: Proof | Confidence | Moderate | 0 |
| 4: Extraction | "How?" | Moderate | 1 (Environment Reset) |
| 5: Test | Excitement → "Aha!" | High energy | 3 (Onboarding + Claims + Self-Query) |
| 6: Vision | Inspiration | Moderate | 0 |

**The "aha moment"** is Act 5, block 8. The audience has understood the problem, learned the theory, seen the proof, learned the method, watched live demos, and then realizes: the platform is presenting its own origin story.

---

## Implementation Sequence

### Phase 1: Create seed SQL migration
Single migration file in `server/migrations/` that inserts:
- 9 new steps in `step_library` (3 per new flow)
- 3 new flows in `flow` table
- 9 new flow_steps linking steps to flows
- 7 new compositions (1 module + 6 children)
- ~42 new composition_blocks with all narrative content, flow references, and composition references

### Phase 2: Update Storybook mock data
Extend `.storybook/mocks/mockData.ts` with matching mock data so compositions render in Storybook without a live database.

### Phase 3: Update MSW handlers if needed
Ensure `.storybook/mocks/handlers.ts` returns the new compositions in list/detail endpoints.

### Phase 4: Verify in Storybook
Run `pnpm storybook`, navigate to CompositionRunPage, select "The Bridge Builder Story" module, and walk through the full presentation to verify block rendering, flow embedding, and composition drill-in/drill-out.

### Phase 5: Verify against live database
Run `pnpm dev`, execute the migration (`pnpm db:migrate`), and test the full presentation with real SQL execution against SQL Server.

---

## Critical Files

| File | Role |
|------|------|
| `server/migrations/` (new file) | Seed data migration for all compositions, flows, steps |
| `.storybook/mocks/mockData.ts` | Mock data for Storybook rendering |
| `.storybook/mocks/handlers.ts` | MSW handlers for composition/flow endpoints |
| `packages/shared/src/schemas/composition.ts` | Zod schemas governing composition data |
| `packages/compositions/server/src/queries.ts` | SQL queries for composition CRUD |
| `packages/compositions/ui-mui/src/components/CompositionRunPage.tsx` | Presentation engine |
| `packages/compositions/feature/src/hooks/useCompositionPresenter.ts` | Drill-in/out navigation |
