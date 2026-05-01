# Episode 2: "Zoom Levels"

**Duration:** 3–4 minutes
**Purpose:** Introduce the Layers of Resolution thesis as an elegant, intuitive idea.
**Maps to:** Act 2 — Layers of Resolution

---

## NOTEBOOKLM BRIEF

Create a 3–4 minute audio episode where two hosts explore a deceptively simple idea: software complexity resolves in layers, like adjusting a microscope. Start with the analogy — when you look at a biological system, you see different things at different zoom levels (cells, tissues, organs, organisms). Software works the same way, but most codebases don't respect these levels. Walk through the four layers: Components, Workflow Stories, Pages, Customer Forks. Each layer has its own audience, change rate, and rules. The key insight the hosts should discover: the magic isn't in any single layer — it's in the connective tissue between them. End by connecting this back to Episode 1: the spaghetti happens because vibe coding doesn't respect layers. Architecture IS the layers.

Tone: intellectual curiosity. Two people genuinely fascinated by a pattern they're seeing for the first time.

---

## SOURCE MATERIAL

### The Microscope Analogy

When a biologist adjusts a microscope, they see different structures at different magnifications. At 10x, they see tissue. At 100x, individual cells. At 1000x, organelles. Each zoom level reveals a different kind of organization, with different rules.

Software has the same property — but most codebases pretend it doesn't. They treat everything as if it exists at one zoom level. A button component and a page layout and a customer configuration all live in the same flat directory, imported the same way, changed by the same people.

The Layers of Resolution thesis says: respect the zoom levels.

### The Four Layers

**Layer 1: Components** (zoom level: close-up)
- Small, testable, domain-scoped building blocks
- Owned by engineers. Changed per pull request.
- Strict dependency rules: data-access hooks -> feature hooks -> UI components
- In a real platform: 148 components across 11 financial domains, each in its own package
- The rule: components never import across domain boundaries. An "accounts" component cannot import from "transactions." All sharing goes through a "shared" package.

**Layer 2: Workflow Stories** (zoom level: mid-range)
- Compose components into user journeys — the unit of business value
- Owned by domain experts and product designers. Changed per sprint.
- A workflow story like "new hire onboarding" spans multiple components and may invoke multiple executable flows
- In Storybook, workflow stories are documented as multi-step journeys: WF1 through WF5
- Stories have beginnings (context), middles (interaction), and ends (verification)

**Layer 3: Pages** (zoom level: wide)
- Thin orchestrators that arrange workflow stories into layouts
- Owned by the product team. Changed per release.
- Pages don't contain business logic. They compose it from the layers below.
- A page is a layout decision, not a logic decision.

**Layer 4: Customer Forks** (zoom level: panoramic)
- Configuration that lets different customers see different stories on different pages
- Owned by customer success. Changed per customer.
- One component library. Many customer experiences.
- Resolves the eternal "but every customer wants something different" problem.

### The Connective Tissue

The layers alone aren't enough. What makes the system work is the **connective tissue** between layers — machine-readable catalogs and schemas that make the coupling between layers explicit, testable, and traversable.

- A **component catalog** (JSON) describes every component's name, domain, props, and category
- A **pages catalog** (JSON) maps workflow stories to pages and component layouts
- **Zod schemas** validate data at every boundary
- **Package boundaries** enforce import rules — you can't accidentally break a layer contract

The connective tissue is what lets AI work with the system. An AI can read the component catalog, understand what building blocks exist, and compose them according to the workflow stories. Without the connective tissue, the AI is guessing. With it, the AI is constrained — and constraints produce coherence.

### The Rule: Never Skip a Layer

The most important rule in the entire architecture: **never skip a layer.**

- UI components can import from feature hooks. Feature hooks can import from data-access hooks. But UI components CANNOT import from data-access directly.
- This seems restrictive. It is. That's the point. The restriction creates predictability. When something breaks in the UI, you know the bug is in the UI or the feature layer — it can't be in the data layer because the UI doesn't touch it directly.

In a real codebase (trn-platform), this is enforced by:
- Package boundaries (separate npm packages per layer)
- TypeScript path aliases (imports by package name, never relative paths)
- The CLAUDE.md file that every AI tool reads before generating code

### Why Spaghetti Happens (Revisited)

The spaghetti from Episode 1 happens precisely because vibe coding doesn't respect layers. The AI generates code at one zoom level — "make this work." It doesn't know that the database call should be in the data-access package, the filtering logic in the feature package, and the display in the UI package.

Architecture IS the layers. Teaching AI architecture means teaching it to put things in the right layer, import from the right place, and never skip a level.

---

## KEY MOMENTS

1. **The microscope analogy:** Natural, intuitive entry point. Everyone understands zoom levels.
2. **Layer 1 — the "148 components" stat:** This grounds the theory in real numbers
3. **The connective tissue insight:** This is the non-obvious part. The catalog IS the architecture.
4. **"Never skip a layer":** Say it like a mantra. This is the one rule.
5. **Connection to Episode 1:** "The spaghetti happens because there are no layers to respect"

---

## VISUAL STORYBOARD

### Scene 1: The Microscope (0:00–0:40)
**Visual:** A biological microscope adjusting zoom levels. 10x shows tissue patterns (organic, flowing). 100x shows individual cells (geometric, ordered). 1000x shows organelles (intricate internal structure). Each zoom level has its own visual language.
**Motion:** Smooth zoom transitions. Each level reveals more detail with different organization.
**Color:** Bio-inspired — greens, blues, organic tones. This shifts to the tech palette below.
**Transition:** The microscope view morphs into a code editor view. The "zoom levels" become software layers.

### Scene 2: Layer 1 — Components (0:40–1:15)
**Visual:** The Grid appears. Clean isometric view of a monorepo: 11 columns (domains), 3 rows (data-access, feature, ui-mui). Each cell is a small glowing cube. A counter in the corner: "148 components."
**Motion:** Camera orbits slowly. Individual cubes light up as they're mentioned. Lines connect cubes within a column (vertical = OK) but NEVER between columns (horizontal = forbidden). A red "X" flashes when a cross-domain connection is attempted.
**Color:** Electric blue (#4ECDC4) for all component cubes. Domain labels in off-white.
**Text overlay:** "Layer 1: Components — the building blocks"

### Scene 3: Layer 2 — Workflow Stories (1:15–1:50)
**Visual:** Camera pulls back. The 148 cubes are still visible but smaller. Above them, amber workflow paths appear — flowing lines that connect components across domains into user journeys. "WF1: Onboarding" traces a path through users → accounts → imports. "WF3: Monthly Review" traces through expenses → budgets → tags.
**Motion:** Workflow paths animate as flowing ribbons. They pick up components and string them into sequences.
**Color:** Amber (#FFD93D) for workflow paths. Components dim to silhouettes below.
**Text overlay:** "Layer 2: Workflow Stories — the user journeys"

### Scene 4: Layer 3 — Pages (1:50–2:15)
**Visual:** Camera pulls back further. The workflows are still visible as amber threads. Above them, rectangular frames appear — page layouts. Each frame contains arrangement zones where workflow stories slot in. A page is visibly thin — just a container, no logic of its own.
**Motion:** Workflow stories float up and dock into page frames. The pages are transparent — you can see the stories inside them.
**Color:** Soft violet (#A78BFA) for page frames. Workflows amber inside.
**Text overlay:** "Layer 3: Pages — thin orchestrators"

### Scene 5: Layer 4 — Customer Forks (2:15–2:40)
**Visual:** Camera at maximum zoom-out. The pages fan out into multiple copies — same structure, different configurations. Fork A shows workflows 1, 2, 3. Fork B shows workflows 1, 3, 5. Fork C shows a custom arrangement. All forks share the same component layer at the bottom.
**Motion:** Pages duplicate and diverge like branches on a tree. But the roots (Layer 1) remain unified.
**Color:** Mint green (#6EE7B7) for fork labels. The full color spectrum is now visible: blue → amber → violet → mint, bottom to top.
**Text overlay:** "Layer 4: Customer Forks — many experiences, one architecture"

### Scene 6: The Connective Tissue (2:40–3:10)
**Visual:** Camera swoops between layers. At each layer boundary, a thin luminous membrane appears — the connective tissue. Zooming into the membrane reveals JSON structure: component-catalog.json, pages-catalog.json, Zod schemas. Data flows through the membranes — typed, validated, traversable.
**Motion:** The membranes pulse with data flow. JSON snippets scroll through them like ticker tape.
**Color:** White/silver (#E2E8F0) for the membranes. Gold highlights on the JSON key names.
**Text overlay:** "The connective tissue — machine-readable, AI-traversable"

### Scene 7: Spaghetti Revisited (3:10–3:40)
**Visual:** Split screen. Left: the spaghetti from Episode 1 (tangled neon threads, no structure). Right: the layered architecture from this episode (clean horizontal planes, color-coded, connective tissue between). The same number of components exist in both — the difference is organization.
**Motion:** The spaghetti slowly untangles and re-organizes into the layered structure. Threads find their layer, find their domain, settle into place.
**Color:** Left: hot pink chaos. Right: the full spectrum palette, organized.
**Text overlay:** "Same code. Different architecture."
**Final text:** "The AI that creates must also be taught to organize."

### End Card
**Visual:** "THE BRIDGE BUILDER STORY" logo. "Episode 2: Zoom Levels." "Next: One Forty Eight."
