-- ============================================================================
-- Bridge Builder Story: Seed Migration
-- Creates the full 6-act composition hierarchy with supporting steps and flows
-- ============================================================================

-- ============================================================================
-- NEW STEPS (for 3 new demonstration flows)
-- ============================================================================

SET IDENTITY_INSERT step_library ON;

INSERT INTO step_library (step_id, label, type, category, command_text, description, display_queries, is_seed)
VALUES
  -- Flow: Platform Architecture Explorer
  (6, 'List training tables', 'sql', 'verify',
   'SELECT name FROM sys.tables WHERE type = ''U'' ORDER BY name;',
   'Lists all user tables in the qc_training database.',
   '[{"label":"Tables","sql":"SELECT name FROM sys.tables WHERE type = ''U'' ORDER BY name"}]',
   1),

  (7, 'Show schema details', 'sql', 'verify',
   'SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME IN (''composition'',''composition_block'',''flow'',''flow_step'',''step_library'') ORDER BY TABLE_NAME, ORDINAL_POSITION;',
   'Shows column details for the core platform tables.',
   '[{"label":"Schema","sql":"SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME IN (''composition'',''composition_block'',''flow'',''flow_step'',''step_library'') ORDER BY TABLE_NAME, ORDINAL_POSITION"}]',
   1),

  (8, 'Count compositions', 'sql', 'verify',
   'SELECT c.title, c.kind, COUNT(cb.block_id) AS blocks FROM composition c LEFT JOIN composition_block cb ON c.composition_id = cb.composition_id GROUP BY c.composition_id, c.title, c.kind ORDER BY c.title;',
   'Shows all compositions with their block counts.',
   '[{"label":"Compositions","sql":"SELECT c.title, c.kind, COUNT(cb.block_id) AS blocks FROM composition c LEFT JOIN composition_block cb ON c.composition_id = cb.composition_id GROUP BY c.composition_id, c.title, c.kind ORDER BY c.title"}]',
   1),

  -- Flow: Composition Self-Query
  (9, 'Find Bridge Builder composition', 'sql', 'scenario',
   'SELECT composition_id, kind, title, description, is_seed, created_at FROM composition WHERE title LIKE ''%Bridge Builder%'';',
   'Queries the composition table to find the Bridge Builder presentation module.',
   '[{"label":"Bridge Builder","sql":"SELECT composition_id, kind, title, description FROM composition WHERE title LIKE ''%Bridge Builder%''"}]',
   1),

  (10, 'Show composition blocks', 'sql', 'verify',
   'SELECT cb.seq, cb.block_type, cb.heading, CASE WHEN cb.flow_id IS NOT NULL THEN f.name WHEN cb.ref_composition_id IS NOT NULL THEN rc.title ELSE LEFT(cb.content, 60) END AS preview FROM composition_block cb LEFT JOIN flow f ON cb.flow_id = f.flow_id LEFT JOIN composition rc ON cb.ref_composition_id = rc.composition_id WHERE cb.composition_id = (SELECT TOP 1 composition_id FROM composition WHERE title LIKE ''%Bridge Builder%'') ORDER BY cb.seq;',
   'Shows the block structure of the Bridge Builder module with previews.',
   '[{"label":"Blocks","sql":"SELECT cb.seq, cb.block_type, cb.heading FROM composition_block cb WHERE cb.composition_id = (SELECT TOP 1 composition_id FROM composition WHERE title LIKE ''%Bridge Builder%'') ORDER BY cb.seq"}]',
   1),

  (11, 'Self-reference moment', 'manual', 'verify',
   'PAUSE',
   'Presenter points out: you are looking at the data structure that is currently driving this presentation.',
   NULL,
   1),

  -- Flow: Domain Layer Verification
  (12, 'Training layer counts', 'sql', 'verify',
   'SELECT ''steps'' AS entity, COUNT(*) AS total FROM step_library UNION ALL SELECT ''flows'', COUNT(*) FROM flow UNION ALL SELECT ''compositions'', COUNT(*) FROM composition UNION ALL SELECT ''blocks'', COUNT(*) FROM composition_block;',
   'Counts all entities in the qc_training database.',
   '[{"label":"Training Counts","sql":"SELECT ''steps'' AS entity, COUNT(*) AS total FROM step_library UNION ALL SELECT ''flows'', COUNT(*) FROM flow UNION ALL SELECT ''compositions'', COUNT(*) FROM composition"}]',
   1),

  (13, 'Core reference counts', 'sql', 'verify',
   'SELECT ''members'' AS entity, COUNT(*) AS total FROM qc_core.dbo.member UNION ALL SELECT ''claims'', COUNT(*) FROM qc_core.dbo.claim UNION ALL SELECT ''referrals'', COUNT(*) FROM qc_core.dbo.referral;',
   'Counts entities in the qc_core production reference database.',
   '[{"label":"Core Counts","sql":"SELECT ''members'' AS entity, COUNT(*) AS total FROM qc_core.dbo.member UNION ALL SELECT ''claims'', COUNT(*) FROM qc_core.dbo.claim"}]',
   1),

  (14, 'Relationship graph', 'sql', 'verify',
   'SELECT f.name AS flow_name, COUNT(DISTINCT fs.step_id) AS steps, (SELECT COUNT(*) FROM composition_block cb WHERE cb.flow_id = f.flow_id) AS referenced_by_blocks FROM flow f LEFT JOIN flow_step fs ON f.flow_id = fs.flow_id GROUP BY f.flow_id, f.name ORDER BY f.name;',
   'Shows which flows reference which steps and which composition blocks reference which flows.',
   '[{"label":"Flow Graph","sql":"SELECT f.name, COUNT(DISTINCT fs.step_id) AS steps FROM flow f LEFT JOIN flow_step fs ON f.flow_id = fs.flow_id GROUP BY f.flow_id, f.name"}]',
   1);

SET IDENTITY_INSERT step_library OFF;
GO

-- ============================================================================
-- NEW FLOWS
-- ============================================================================

SET IDENTITY_INSERT flow ON;

INSERT INTO flow (flow_id, name, description, is_seed)
VALUES
  (4, 'Platform Architecture Explorer',
   'Queries the platform''s own database schema to reveal the composition/flow/step architecture.',
   1),
  (5, 'Composition Self-Query',
   'Queries the composition table to show the Bridge Builder presentation''s own data — the meta-moment made tangible.',
   1),
  (6, 'Domain Layer Verification',
   'Demonstrates the dual-database architecture by querying across qc_training and qc_core.',
   1);

SET IDENTITY_INSERT flow OFF;
GO

-- ============================================================================
-- NEW FLOW STEPS
-- ============================================================================

SET IDENTITY_INSERT flow_step ON;

INSERT INTO flow_step (flow_step_id, flow_id, step_id, seq, pause_after, presenter_notes, visible_in_execution, override_display_queries)
VALUES
  -- Platform Architecture Explorer (flow 4)
  (4,  4, 6,  1, 0, 'Point out the tables that match the 4-layer architecture: step_library, flow, flow_step, composition, composition_block.', 1, NULL),
  (5,  4, 7,  2, 1, 'Pause here. Walk through the column types — INT IDENTITY PKs, NVARCHAR for Unicode, seq for ordering.', 1, NULL),
  (6,  4, 8,  3, 0, 'The audience sees all compositions including the one currently being presented.', 1, NULL),

  -- Composition Self-Query (flow 5)
  (7,  5, 9,  1, 0, 'The query finds the module row. Point out the kind, title, and is_seed fields.', 1, NULL),
  (8,  5, 10, 2, 1, 'Pause. The audience is looking at the block structure of the presentation they are watching.', 1, NULL),
  (9,  5, 11, 3, 0, 'This is the climax. Say: "You are looking at the data structure driving this presentation right now."', 1, NULL),

  -- Domain Layer Verification (flow 6)
  (10, 6, 12, 1, 0, 'Training database: steps, flows, compositions — the platform content.', 1, NULL),
  (11, 6, 13, 2, 1, 'Pause. Core database: members, claims, referrals — the production reference data. Two databases, one platform.', 1, NULL),
  (12, 6, 14, 3, 0, 'The relationship graph shows how flows connect to steps and how compositions connect to flows.', 1, NULL);

SET IDENTITY_INSERT flow_step OFF;
GO

-- ============================================================================
-- CHILD COMPOSITIONS (Acts 1-6)
-- ============================================================================

SET IDENTITY_INSERT composition ON;

INSERT INTO composition (composition_id, kind, title, description, is_seed)
VALUES
  (4,  'story',    'The Spaghetti Point',
   'Why vibe-coded apps fail at month 3 — the industry data, the emotional pain, and why this problem matters now.',
   1),

  (5,  'story',    'Layers of Resolution',
   'The theoretical insight: software complexity resolves in layers, from components to customer forks.',
   1),

  (6,  'tutorial', 'PFM-Platform: 148 Components, One Architecture',
   'How the personal finance platform proved the Layers of Resolution thesis at scale: 11 domains, 148 components, strict 3-layer architecture.',
   1),

  (7,  'tutorial', 'The lar-platform Pipeline',
   'The 10-prompt pipeline that decomposes a monolith into a platform. How lar-platform extracts the architecture pattern into a reusable toolkit.',
   1),

  (8,  'story',    'Two Proofs: Trip Planner & Training Platform',
   'The three-tier proof strategy: Easy (Trip Planner), Moderate (PFM), Complex (Health Insurance). Two proofs are complete.',
   1),

  (9,  'story',    'Bridge Builder: The Product',
   'The product vision: from developer tool to SaaS platform. The POC sequence and the future of AI-assisted architecture.',
   1),

  -- Top-level module
  (10, 'module',   'The Bridge Builder Story: From Vibe Code to Platform Architecture',
   'A meta-narrative presentation using the training platform to tell the story of how the platform ecosystem itself was built.',
   1);

SET IDENTITY_INSERT composition OFF;
GO

-- ============================================================================
-- COMPOSITION BLOCKS
-- ============================================================================

SET IDENTITY_INSERT composition_block ON;

-- --------------------------------------------------------------------------
-- Act 1: The Spaghetti Point (composition_id = 4)
-- --------------------------------------------------------------------------

INSERT INTO composition_block (block_id, composition_id, seq, block_type, heading, content, technical_content, flow_id, ref_composition_id, presenter_notes)
VALUES
  (4, 4, 1, 'narrative', 'The Promise of Vibe Coding',
   '# The Promise of Vibe Coding

Every developer becomes 10x. Ship in hours, not months. The CEO demos at the all-hands. The investor pitch writes itself. Twitter threads go viral: "I built this entire app in a weekend with AI."

The excitement is real. AI-assisted development has unlocked a new creative velocity. Ideas that used to die in the backlog now ship before lunch. Prototypes that took sprints take sessions. The gap between imagining software and having software has never been smaller.

This is the honeymoon phase. And it is spectacular.',
   NULL, NULL, NULL,
   'Start energetic. This is the honeymoon. Let the audience feel the optimism before we break it.'),

  (5, 4, 2, 'narrative', 'Month 3: The Wall',
   '# Month 3: The Wall

Then something shifts. A feature that used to take 10 minutes now takes 2 hours. Not because the AI got worse — because the codebase got tangled. Every change touches three files you didn''t expect. Every fix introduces a regression somewhere else.

The numbers tell the story: **Gartner reports that 45% of AI-generated code contains security vulnerabilities.** Defect rates increase by **2,500%** compared to architecturally governed code. The codebase doesn''t just slow down — it fights back.

This is the Spaghetti Point. And nearly every vibe-coded application hits it.',
   NULL, NULL, NULL,
   'This is the emotional turn. Pause after the 2500% stat. Let it land.'),

  (6, 4, 3, 'note', 'The Numbers',
   NULL,
   '┌─────────────────────────────────────────────────────────┐
│  The Spaghetti Point — By the Numbers                   │
├─────────────────────────────────────────────────────────┤
│  Vibe coding market size (2026):    $4.7B               │
│  Market CAGR:                       38%                  │
│  AI-generated code with vulns:      45%  (Gartner)      │
│  Defect increase vs governed code:  2,500%  (Gartner)   │
│  Typical LOC at month 3:           40-80K               │
│  Avg time-to-fix at month 1:        12 min              │
│  Avg time-to-fix at month 3:        2.4 hrs             │
│  Dependency graph edges at month 3: 800+                 │
│  Files touched per feature change:  8-15                 │
└─────────────────────────────────────────────────────────┘',
   NULL, NULL, NULL),

  (7, 4, 4, 'narrative', 'What Went Wrong?',
   '# What Went Wrong?

No separation of concerns. No domain boundaries. No component contracts. Everything depends on everything. A single change cascades through the entire codebase.

AI is extraordinary at generating code. But it has no concept of architectural coherence. It doesn''t know that the billing module shouldn''t import from the user profile component. It doesn''t enforce layering. It doesn''t maintain boundaries.

The code works on day one. By month three, it works against you.

**What if the AI could be taught architecture?**',
   NULL, NULL, NULL,
   'Transition question at the end sets up Act 2. Pause before moving on.');

-- --------------------------------------------------------------------------
-- Act 2: Layers of Resolution (composition_id = 5)
-- --------------------------------------------------------------------------

INSERT INTO composition_block (block_id, composition_id, seq, block_type, heading, content, technical_content, flow_id, ref_composition_id, presenter_notes)
VALUES
  (8, 5, 1, 'narrative', 'The Thesis',
   '# Layers of Resolution

Software complexity doesn''t resolve all at once. It resolves in layers — like focusing a lens.

Each layer has different rules. Different audiences. Different rates of change. A UI component changes weekly. A domain schema changes monthly. A platform architecture changes yearly.

The insight: if you respect these layers — if you let each one own its concerns and connect to the others through explicit contracts — complexity becomes manageable at any scale.',
   NULL, NULL, NULL,
   'This is the intellectual core. Go slow here. The audience needs to internalize the layering concept.'),

  (9, 5, 2, 'note', 'The Four Layers',
   NULL,
   '┌─────────────────────────────────────────────────────────┐
│  Layers of Resolution                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Layer 4: Customer Forks                                │
│    Owner: Customer success  │  Changes: per customer    │
│    Config that lets different tenants see different      │
│    stories on different pages.                          │
│                                                         │
│  Layer 3: Pages                                         │
│    Owner: Product team  │  Changes: per release         │
│    Thin orchestrators arranging workflow stories.        │
│                                                         │
│  Layer 2: Workflow Stories                               │
│    Owner: Domain experts  │  Changes: per sprint        │
│    User journeys composing components into business      │
│    value. The unit of training delivery.                 │
│                                                         │
│  Layer 1: Components                                    │
│    Owner: Engineers  │  Changes: per PR                  │
│    Small, testable, domain-scoped building blocks.      │
│    Strict dependency rules: data-access → feature → ui  │
│                                                         │
└─────────────────────────────────────────────────────────┘',
   NULL, NULL, NULL),

  (10, 5, 3, 'narrative', 'Components: The Atoms',
   '# Components: The Atoms

Components are small, testable, and domain-scoped. They know nothing about the page they live on. They have strict dependency rules:

**data-access → feature → ui**

A UI component can import from its domain''s feature layer. A feature hook can import from its domain''s data-access layer. But never the reverse. Never across domains. Never skipping layers.

This is what makes components composable. Like atoms combining into molecules — the rules of combination are what create emergent complexity from simple parts.',
   NULL, NULL, NULL,
   'Draw the chemistry analogy: atoms → molecules → cells. Each level has its own rules.'),

  (11, 5, 4, 'narrative', 'Workflow Stories: The Molecules',
   '# Workflow Stories: The Molecules

Workflow stories compose components into user journeys. They are the unit of business value.

A story like "new hire onboarding" is not a page — it is a narrative thread that might span multiple pages and invoke multiple executable flows. It has a beginning (context), a middle (hands-on practice), and an end (verification).

Sound familiar? That is exactly what the composition system in this training platform does. Narrative blocks for context. Flow blocks for hands-on execution. Note blocks for technical depth. Compositions within compositions for modular reuse.',
   NULL, NULL, NULL,
   'This is where trn-platform''s composition system maps directly to the theory. Foreshadow Act 5.'),

  (12, 5, 5, 'narrative', 'Pages and Customer Forks',
   '# Pages and Customer Forks

Pages are thin orchestrators. They arrange workflow stories into a layout. They don''t contain business logic — they compose it from the layers below.

Customer forks are the top layer: configuration that lets different customers see different stories on different pages without changing the underlying components. One component library. Many customer experiences.

This resolves the eternal product question: "But every customer wants something different." They do. The forks handle it. The components stay shared.',
   NULL, NULL, NULL,
   'This resolves the "every customer is different" objection.'),

  (13, 5, 6, 'note', 'Architecture Rule: Never Skip a Layer',
   NULL,
   '// From trn-platform''s CLAUDE.md — enforced in the real codebase:

// Critical Dependency Rules:
// - Never skip layers (ui-mui must not import data-access directly)
// - Never import across sibling domains
// - All shared types/schemas live in packages/shared/
// - Import by package name, never relative paths across packages

// Package structure per domain:
packages/{domain}/
  ├── data-access/    // TanStack Query hooks wrapping API
  ├── feature/        // Business logic orchestrating data-access
  ├── server/         // Express routes + raw SQL (4th layer)
  └── ui-mui/         // MUI components + Storybook stories

// Example: compositions domain
import { useCompositions } from ''@trn-platform/compositions-data-access'';
import { useCompositionEditor } from ''@trn-platform/compositions-feature'';
// ui-mui imports feature, feature imports data-access
// NEVER: ui-mui imports data-access directly',
   NULL, NULL,
   'Reference CLAUDE.md''s Critical Dependency Rules section. This is enforced in the real codebase.');

-- --------------------------------------------------------------------------
-- Act 3: PFM-Platform: 148 Components (composition_id = 6)
-- --------------------------------------------------------------------------

INSERT INTO composition_block (block_id, composition_id, seq, block_type, heading, content, technical_content, flow_id, ref_composition_id, presenter_notes)
VALUES
  (14, 6, 1, 'narrative', 'The Origin: JE-PFM',
   '# The Origin: JE-PFM

It started with a SaaS starter template. JE-PFM: Next.js, Supabase, Stripe, i18n — all the pieces a modern SaaS needs. Generic. Useful. But generic.

The question was simple: could we build something domain-rich on this foundation? Not just a template with placeholder content, but a real platform with real financial domains — accounts, transactions, budgets, goals — each with its own data layer, business logic, and UI?

The answer shaped everything that followed.',
   NULL, NULL, NULL,
   'Brief history. Don''t dwell — the audience cares about the architecture, not the timeline.'),

  (15, 6, 2, 'narrative', '11 Domains, Zero Cross-Talk',
   '# 11 Domains, Zero Cross-Talk

PFM-Platform grew to **11 financial domains**: accounts, transactions, budgets, goals, expenses, imports, alerts, notifications, partners, tags, users.

Each domain is a self-contained package with its own data-access, feature, and UI layers. **No domain imports from another domain.** All sharing goes through the shared package — Zod schemas, TypeScript types, constants.

148 components. 33 published npm packages. And they **never** import across domain boundaries. The architecture isn''t just a guideline — it''s enforced by package boundaries and import rules.',
   NULL, NULL, NULL,
   'Emphasize: 148 components and they NEVER import across domain boundaries. This is the scale proof.'),

  (16, 6, 3, 'note', 'PFM Domain Map',
   NULL,
   '┌──────────────────────────────────────────────────────┐
│  PFM-Platform: 11 Domains, 148 Components            │
├──────────────┬───────────────────────────────────────┤
│  Domain      │  Components  │  Packages              │
├──────────────┼──────────────┼────────────────────────┤
│  accounts    │     18       │  da / feature / ui-mui │
│  transactions│     22       │  da / feature / ui-mui │
│  budgets     │     14       │  da / feature / ui-mui │
│  goals       │     12       │  da / feature / ui-mui │
│  expenses    │     16       │  da / feature / ui-mui │
│  imports     │      8       │  da / feature / ui-mui │
│  alerts      │     10       │  da / feature / ui-mui │
│  notifications│    11       │  da / feature / ui-mui │
│  partners    │     13       │  da / feature / ui-mui │
│  tags        │      9       │  da / feature / ui-mui │
│  users       │     15       │  da / feature / ui-mui │
├──────────────┼──────────────┼────────────────────────┤
│  TOTAL       │    148       │  33 packages + shared  │
└──────────────┴──────────────┴────────────────────────┘

Every domain depends only on @pfm-platform/shared.
No cross-domain imports. Ever.',
   NULL, NULL, NULL),

  (17, 6, 4, 'narrative', 'What HooksAI Became',
   '# What HooksAI Became

Alongside the platform, a CLI tool was evolving. **HooksAI** (now being renamed **Sinew**) started as a filesystem watcher that triggered AI-powered automation.

It grew into something more: the orchestration backbone for the entire development workflow. It generates components. Runs validations. Chains prompts into pipelines. It is the hands that build the platform — the connective tissue between human intent and platform output.

If the Layers of Resolution thesis is the theory, Sinew is the engine that makes it practical.',
   NULL, NULL, NULL,
   'HooksAI → Sinew rename. This tool is what makes AI-assisted architecture possible.'),

  (18, 6, 5, 'narrative', 'The Realization',
   '# The Realization

At 148 components, a pattern emerged: **every domain follows the same structure.**

The same data-access hooks wrapping the same API patterns. The same feature hooks orchestrating the same business logic shapes. The same UI components following the same MUI + Emotion conventions. The same Storybook stories. The same test patterns.

If the structure is consistent, it can be **extracted.** If it can be extracted, it can be **automated.** If it can be automated, it can be a **product.**

That realization created lar-platform.',
   NULL, NULL, NULL,
   'This is the "aha moment" seed. Plant it here, harvest it in Act 5.');

-- --------------------------------------------------------------------------
-- Act 4: The lar-platform Pipeline (composition_id = 7)
-- --------------------------------------------------------------------------

INSERT INTO composition_block (block_id, composition_id, seq, block_type, heading, content, technical_content, flow_id, ref_composition_id, presenter_notes)
VALUES
  (19, 7, 1, 'narrative', 'What Is lar-platform?',
   '# What Is lar-platform?

lar-platform is not a framework. It is not a code generator. It is a **decomposition toolkit**: 10 sequential AI prompts, JSON schemas for validation, parameterized code templates, and annotated examples from the 148-component PFM platform.

It teaches AI how to decompose a domain into a layered architecture. It is the recipe, not the kitchen.

The name stands for **Layers of Resolution** — the thesis made operational. Give it a domain description in plain English, and the 10-prompt pipeline produces a production-grade, architecturally sound platform scaffold.',
   NULL, NULL, NULL,
   'Distinction matters: not a code generator, a decomposition pipeline. The AI is constrained by architecture, not freed from it.'),

  (20, 7, 2, 'note', 'The 10 Prompts',
   NULL,
   '┌─────────────────────────────────────────────────────────┐
│  The lar-platform Pipeline: 10 Sequential Prompts       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   1. Domain Discovery                                   │
│      Analyze app → identify cohesive business domains   │
│                                                         │
│   2. Entity Extraction                                  │
│      Domains → Zod schemas with validation rules        │
│                                                         │
│   3. Use-Case Generation                                │
│      Extract business workflows from entities           │
│                                                         │
│   4. Workflow Discovery                                 │
│      Map use cases to Storybook workflow stories        │
│                                                         │
│   5. Component Catalog Generation                       │
│      Machine-readable catalog of all components         │
│                                                         │
│   6. Pages Catalog Generation                           │
│      Map workflows to pages and component layouts       │
│                                                         │
│   7. Test Strategy                                      │
│      Define testing architecture per layer              │
│                                                         │
│   8. Infrastructure Scaffold                            │
│      CI/CD, database configs, build system              │
│                                                         │
│   9. Storybook Composition                              │
│      Workflow stories, page stories, MSW mocks          │
│                                                         │
│  10. SaaS Shell Scaffold                                │
│      Next.js + MakerKit + Turborepo starter             │
│                                                         │
│  Each prompt builds on the output of the previous one.  │
│  Sequential, not parallel. Constrained, not freeform.   │
└─────────────────────────────────────────────────────────┘',
   NULL, NULL, NULL),

  (21, 7, 3, 'narrative', 'Input to Output',
   '# How It Works: Input to Output

You give the pipeline a domain description in plain English.

**Prompt 1** identifies bounded contexts — the natural domain boundaries in your application. **Prompt 2** extracts entities and generates Zod schemas. **Prompt 3** maps business workflows. By **Prompt 6**, you have a full monorepo scaffold with typed packages. By **Prompt 10**, you have documentation, CI/CD, and a SaaS shell.

The AI does not improvise. It follows the pattern that was proven across 148 components and 11 domains. The architecture constrains the generation. That is the whole point.',
   NULL, NULL, NULL,
   'Key insight: the AI is constrained by the architecture, not freed from it. This is the opposite of vibe coding.'),

  (22, 7, 4, 'note', 'Pipeline Example',
   NULL,
   'INPUT:
  "A trip planning application where users create trips with
   itineraries, add destinations and activities, manage budgets
   per trip, coordinate with travel members, and track fuel
   costs for road trips."

OUTPUT (Prompt 1 — Domain Discovery):
  ┌────────────────┬──────────────────────────────────────┐
  │ Domain         │ Bounded Context                      │
  ├────────────────┼──────────────────────────────────────┤
  │ trips          │ Trip lifecycle, metadata, sharing     │
  │ itinerary      │ Day-by-day plans, scheduling          │
  │ parks          │ Destinations, attractions, amenities  │
  │ budget         │ Per-trip budgets, expense tracking     │
  │ members        │ Travel companions, roles, invites     │
  │ fuel           │ Road trip fuel costs, stops, MPG      │
  │ todos          │ Pre-trip checklists, assignments       │
  │ vehicles       │ Vehicle profiles, maintenance          │
  └────────────────┴──────────────────────────────────────┘

  This is tp-platform''s actual genesis.
  8 domains → 18 packages → 125 tests → generated.',
   NULL, NULL, NULL),

  (23, 7, 5, 'flow', 'Live Demo: Environment Reset',
   NULL, NULL, 3, NULL,
   'This is the first live demo. Let the audience see SSE streaming, step execution, and the console output. The point: this working platform has real executable infrastructure — all built from the pipeline.'),

  (24, 7, 6, 'narrative', 'This Platform Was Generated',
   '# This Platform Was Generated by the Pipeline

Here is the reveal: **the trn-platform you are looking at right now was generated by lar-platform.**

The compositions system you are watching this presentation in. The flow execution engine that just reset the environment. The step library. The Express API. The TanStack Query hooks. The MUI components. The Storybook stories.

All of it came from the 10-prompt pipeline, adapted from the 3-layer Supabase pattern (PFM, TP) to a 4-layer SQL Server + Express pattern (TRN).

The pipeline didn''t just generate code. It generated the platform that is now presenting its own origin story.',
   NULL, NULL, NULL,
   'This is a key meta-narrative moment. Let the self-referential nature sink in. The tool is demonstrating itself.');

-- --------------------------------------------------------------------------
-- Act 5: Two Proofs (composition_id = 8)
-- --------------------------------------------------------------------------

INSERT INTO composition_block (block_id, composition_id, seq, block_type, heading, content, technical_content, flow_id, ref_composition_id, presenter_notes)
VALUES
  (25, 8, 1, 'narrative', 'The Proof Strategy',
   '# The Proof Strategy

One platform is a project. Two platforms are a pattern. Three platforms are a product.

The three-tier proof strategy:
- **Easy:** TP-Platform (Trip Planner) — 8 domains, Supabase backend
- **Moderate:** PFM-Platform (Personal Finance) — 11 domains, 148 components, Supabase
- **Complex:** QC/Health Insurance — regulated, compliance-heavy (future)

If the pipeline can generate platforms across different domains, different backends, and different complexity levels — it''s not a tool. It''s a product.',
   NULL, NULL, NULL,
   'Frame this as a scientific approach: hypothesis, experiment, replication. Three proofs at increasing difficulty.'),

  (26, 8, 2, 'narrative', 'Proof 1: Trip Planner',
   '# Proof 1: Trip Planner (TP-Platform)

TP-Platform was the first test. **8 domains** (trips, itineraries, parks, budgets, members, fuel, todos, vehicles), Supabase backend, generated entirely from the lar-platform pipeline.

The results:
- 18 packages in strict 3-layer architecture
- 125 tests passing
- 35+ Storybook stories across all domains
- 5 workflow stories with 19 steps
- Navy + Amber theme with semantic tokens

The architecture held. The components were composable. The tests passed. The pipeline works.',
   NULL, NULL, NULL,
   'Quick win energy. Don''t over-explain — the audience should feel momentum building.'),

  (27, 8, 3, 'narrative', 'Proof 2: Training Platform',
   '# Proof 2: Training Platform (TRN-Platform)

TRN-Platform was the harder test. Three things changed:

**Different backend:** SQL Server + Express instead of Supabase. Raw parameterized SQL instead of a cloud client. This meant extending from 3 layers to **4 layers** — adding a dedicated server package per domain.

**Different domain:** Training and execution, not CRUD. Server-Sent Events for real-time streaming. Pause/resume mechanics for instructor-led delivery. Compositions with drill-in/drill-out navigation.

**Different complexity:** The execution engine manages SSE connections, step orchestration, and flow state — far more stateful than standard CRUD.

If the pipeline works here, it works anywhere. And you are sitting inside the proof.',
   NULL, NULL, NULL,
   'Build the self-referential moment. They are inside the proof right now.'),

  (28, 8, 4, 'flow', 'Live Demo: New Hire Onboarding',
   NULL, NULL, 1, NULL,
   'This is the showstopper demo. Run the full 3-step flow live. Pause at step 2 (member seed data). Discuss the member schema — INT IDENTITY PK, NVARCHAR columns, the indexing strategy. Show the display query results. Then continue to step 3 (verify claims). The audience is watching a generated platform execute real SQL against a real database.'),

  (29, 8, 5, 'note', 'Architecture Comparison',
   NULL,
   '┌──────────────────────────────────────────────────────────┐
│  Two Platforms, One Pipeline                             │
├──────────────┬────────────────────┬──────────────────────┤
│              │  TP-Platform       │  TRN-Platform        │
├──────────────┼────────────────────┼──────────────────────┤
│  Domains     │  8                 │  4                   │
│  Backend     │  Supabase          │  SQL Server+Express  │
│  Layers      │  3 (da/feat/ui)    │  4 (server/da/f/ui)  │
│  UI          │  MUI 7             │  MUI 9               │
│  Real-time   │  Supabase Realtime │  SSE streams         │
│  Auth        │  Supabase Auth     │  Express middleware   │
│  Tests       │  125               │  Growing             │
│  Stories     │  35+               │  All components      │
├──────────────┼────────────────────┴──────────────────────┤
│  Shared DNA  │  pnpm · React 19 · TanStack Query 5      │
│              │  TypeScript strict · Vitest · Storybook   │
│              │  Zod · Emotion · tsup · changesets        │
└──────────────┴───────────────────────────────────────────┘

Same pipeline. Different targets. Same architecture.',
   NULL, NULL, NULL),

  (30, 8, 6, 'flow', 'Live Demo: Claims Processing',
   NULL, NULL, 2, NULL,
   'Shorter demo. Let the 5-step flow run without pausing on every step. The point is volume and complexity — this is a multi-step production-grade flow with SQL verification at each stage.'),

  (31, 8, 7, 'flow', 'Live Demo: Composition Self-Query',
   NULL, NULL, 5, NULL,
   'THIS IS THE CLIMAX. The flow queries the composition table and returns the row for the Bridge Builder module. Then it shows the block structure. The audience watches the platform query the data that defines the presentation they are currently watching. Pause at step 2. Let the self-reference sink in.'),

  (32, 8, 8, 'narrative', 'The Self-Referential Moment',
   '# The Self-Referential Moment

You have been watching a **presentation system** (compositions) that orchestrates **executable demos** (flows) that manipulate **real data** (steps against SQL Server).

This presentation system was itself **generated by the pipeline** it is telling you about.

The compositions you are navigating through. The blocks that structure each act. The flow execution engine that just queried its own database. The step library that stores SQL commands. Every layer — server, data-access, feature, UI — was scaffolded by the lar-platform pipeline and refined into production code.

**The platform is presenting its own origin story. You are inside the proof.**',
   NULL, NULL, NULL,
   'THIS is the aha moment. Pause. Let it sink in. The platform is building itself. Give the audience 10 seconds of silence.');

-- --------------------------------------------------------------------------
-- Act 6: Bridge Builder: The Product (composition_id = 9)
-- --------------------------------------------------------------------------

INSERT INTO composition_block (block_id, composition_id, seq, block_type, heading, content, technical_content, flow_id, ref_composition_id, presenter_notes)
VALUES
  (33, 9, 1, 'narrative', 'From Tool to Product',
   '# From Tool to Product

The pipeline works for us. But it should work for everyone.

**Bridge Builder** is the product vision: a SaaS platform where you describe your domain in plain English and get a production-grade, architecturally sound platform back. Not vibe code that unravels at month 3. Platform code that scales with your business.

The pipeline that generated PFM-Platform (11 domains), TP-Platform (8 domains), and TRN-Platform (4 domains) becomes the engine of a product. Your domain in, your platform out.',
   NULL, NULL, NULL,
   'Shift from retrospective to forward-looking. Energy goes up here. This is the pitch.'),

  (34, 9, 2, 'note', 'The POC Sequence',
   NULL,
   '┌─────────────────────────────────────────────────────────┐
│  Bridge Builder: POC Sequence                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  POC 1: Domain Decomposer  ✅ COMPLETE                  │
│    Prompt-based domain analysis. Proven on TP-Platform.  │
│                                                         │
│  POC 2: AI Chat Trip Planner                            │
│    Conversational domain refinement. Fixed UI,           │
│    speak data changes.                                   │
│                                                         │
│  POC 2.5: Sinew Orchestration                           │
│    File watchers, chained workflows, permission gates.   │
│    The automation backbone.                              │
│                                                         │
│  POC 3: Red Pencil                                      │
│    UI composition + bidirectional generative cycle.      │
│    Architectural review and correction, live.            │
│                                                         │
│  POC 3.5: Domain Evolution                              │
│    Schema migration and versioning.                      │
│    Pipeline can evolve platforms, not just create them.  │
│                                                         │
│  POC 4: Bridge Builder SaaS                             │
│    GitHub integration. Worktree pattern for customer     │
│    forks. The full product.                              │
│                                                         │
└─────────────────────────────────────────────────────────┘',
   NULL, NULL, NULL),

  (35, 9, 3, 'narrative', 'The $4.7B Opportunity',
   '# The $4.7B Opportunity

The vibe coding market is growing at **38% CAGR**. Every month, thousands of developers and entrepreneurs ship AI-generated apps — and hit the Spaghetti Point three months later.

Current solutions don''t solve the real problem:
- **Modernization services** (Orafox, Baytech) rewrite monoliths — expensive, slow, risky
- **AI code assistants** (Copilot, Cursor) generate more code — but more code isn''t the answer
- **Platform engineering tools** assume you already have a platform

Bridge Builder occupies a unique position: it **decomposes** rather than rewrites. It takes what you''ve built and gives it architecture. The spaghetti becomes a platform.',
   NULL, NULL, NULL,
   'Market positioning. Bridge Builder is not competing with code generators — it is the antidote to them.'),

  (36, 9, 4, 'narrative', 'The Spaghetti Point, Revisited',
   '# The Spaghetti Point, Revisited

Return to where we started. Month 3. The vibe-coded app has hit the wall. Features are slow. Bugs cascade. The team is afraid to touch the codebase.

But now there is an answer.

Run Bridge Builder against the monolith. The pipeline identifies domains. Extracts entities. Maps workflows. Scaffolds a layered architecture. You migrate feature by feature — not a rewrite, a decomposition.

The spaghetti unwinds into a platform. The AI that created the complexity now resolves it — because now the AI has been taught architecture.',
   NULL, NULL, NULL,
   'Full circle to Act 1. The problem now has a solution. The emotional arc completes.'),

  (37, 9, 5, 'narrative', 'The Thesis, Restated',
   '# The Thesis, Restated

**Vibe coding creates. Platform architecture sustains. Bridge Builder bridges the gap.**

Features are spoken into existence, but they land in a structure that can grow. Components compose into workflow stories. Stories compose into pages. Pages fork for customers.

The Layers of Resolution thesis is not a theory. It is a proven pipeline with **two working proofs** and a **third in progress**:
- 148 components across 11 financial domains (PFM)
- 8 domains generated for trip planning (TP)
- 4 domains with a 4-layer SQL Server architecture (TRN)

The platform you have been watching was generated by the pipeline it described. That is the proof. And it is just the beginning.',
   NULL, NULL, NULL,
   'End strong. This is the closing statement before Q&A. Let the words land.');

-- --------------------------------------------------------------------------
-- Top-Level Module: The Bridge Builder Story (composition_id = 10)
-- --------------------------------------------------------------------------

INSERT INTO composition_block (block_id, composition_id, seq, block_type, heading, content, technical_content, flow_id, ref_composition_id, presenter_notes)
VALUES
  (38, 10, 1, 'narrative', 'Welcome & Session Overview',
   '# The Bridge Builder Story
## From Vibe Code to Platform Architecture

Welcome to a presentation that is also a proof of concept.

Over the next 45-60 minutes, you will learn how AI-generated "vibe code" hits a wall at month 3 — and how a decomposition pipeline called **lar-platform** transforms monolithic apps into production-grade platform architectures.

**The meta-twist:** the training platform delivering this presentation was itself generated by the pipeline it describes. By the end, you''ll see the data structure of this very presentation queried from the database it lives in.

### Session Structure
1. **The Problem** — Why vibe-coded apps fail
2. **The Insight** — Layers of Resolution thesis
3. **The Proof** — 148 components across 11 domains
4. **The Extraction** — The 10-prompt pipeline
5. **The Test** — Two platforms, one pipeline
6. **The Vision** — Bridge Builder: the product',
   NULL, NULL, NULL,
   'Set the meta-narrative frame immediately. The audience should know they are inside the proof from minute one.'),

  (39, 10, 2, 'composition', 'Act 1: The Problem',
   NULL, NULL, NULL, 4,
   'The Spaghetti Point story. Pure narrative, no demos. Fast and punchy — about 8 minutes.'),

  (40, 10, 3, 'composition', 'Act 2: The Insight',
   NULL, NULL, NULL, 5,
   'Layers of Resolution theory. Slow and deliberate — about 10 minutes. The intellectual core.'),

  (41, 10, 4, 'composition', 'Act 3: The Proof',
   NULL, NULL, NULL, 6,
   'PFM-Platform story. Confidence building — about 8 minutes.'),

  (42, 10, 5, 'composition', 'Act 4: The Extraction',
   NULL, NULL, NULL, 7,
   'lar-platform pipeline tutorial. First live demo (Environment Reset) — about 10 minutes.'),

  (43, 10, 6, 'composition', 'Act 5: The Test',
   NULL, NULL, NULL, 8,
   'Two proofs + 3 live demos. High energy — about 15 minutes. The aha moment is here.'),

  (44, 10, 7, 'composition', 'Act 6: The Vision',
   NULL, NULL, NULL, 9,
   'Bridge Builder product vision. Inspirational close — about 8 minutes.'),

  (45, 10, 8, 'narrative', 'Closing & Discussion',
   '# Thank You

You have just experienced a platform presenting its own origin story.

The code that rendered these narrative blocks, executed those SQL flows, and navigated through nested compositions — all of it was generated by the pipeline described in Acts 3 and 4.

### Resources
- **lar-platform pipeline:** 10 prompts, schemas, templates, examples
- **PFM-Platform:** 11 domains, 148 components, strict 3-layer architecture
- **TP-Platform:** 8 domains, Supabase, generated proof
- **TRN-Platform:** 4 domains, SQL Server + Express, 4-layer architecture

### What''s Next
- POC 2: AI Chat Trip Planner
- POC 2.5: Sinew Orchestration
- POC 3: Red Pencil (UI composition)
- Bridge Builder SaaS launch

**Questions?**',
   NULL, NULL, NULL,
   'Open the floor for Q&A. Have the Composition Self-Query flow ready to re-run if anyone asks "wait, this is really querying itself?"');

SET IDENTITY_INSERT composition_block OFF;
GO
