# Workbench Rethink: Ideation Session

**Date:** 2026-05-10
**Branch:** `experiment/10-workbench-rethink`
**Goal:** Step back from what was built, research what works in comparable products, and decide what the workbench should actually be.

---

## Where We Are

### What exists (merged to main)

The foundation is solid. We have:

- **7 domains** with 4-layer architecture, SQL Server dual-database, TanStack Query, MUI, Storybook
- **Course data model**: courses > lessons > blocks (with slide wrapper), supporting block types: narrative, reference, live_demo, sql_challenge, quiz, do_it_in_qc, screenshot_task
- **3-panel editor**: outline (left), canvas (center), editor/chat/drafts (right)
- **MDXEditor** with 6 registered JSX components for document-first slides
- **AI chat panel** with MCP tools (build_course_content, explore_schema, run_sql, etc.)
- **SQL validation** at build time (SET FMTONLY ON catches bad tables/columns)
- **Template system** with parameter substitution
- **Draft documents** for AI-generated course outlines

### What's aspirational (documented but not built)

- Visual slide composer (drag blocks + images into layouts)
- Theme/branding system
- AI conversational state machine that guides authors through phases
- Document ingestion (PDF/text -> course structure)
- Screenshot capture pipeline (Scribe-like)
- Data flow visualization across lessons
- Seed SQL suggestion engine

### The core tension

The original plan tried to build a **general-purpose authoring tool** (like Articulate Rise) that also has **lab verification** (like Instruqt) and **AI assistance** (like Gamma). That's three products in one. We need to pick the one thing we do that nobody else does and build outward from there.

---

## Research: What Works Elsewhere

### The "Do It Then Verify It" Pattern (Instruqt)

**This is us.** Instruqt's model:
- A **track** contains **challenges**
- Each challenge has lifecycle scripts: **setup** (prepare environment) / **check** (verify the learner did it) / **solve** (auto-complete for stuck learners) / **cleanup** (reset state)
- Verification = run a script, exit code 0 = pass, non-zero = fail with hint

**Mapped to our domain:**
| Instruqt | TRN Platform |
|----------|-------------|
| Track | Course |
| Challenge | Lesson |
| Setup script | `seed_sql` |
| Check script | `sql_text` + `verify_mode` + `expected_json` |
| Solve script | `seed_sql` (the "Seed It For Me" button) |
| Cleanup script | Not yet implemented |

We already have this architecture. The gap is that our SQL is AI-generated garbage that doesn't match the real schema. The fix isn't more UI -- it's better content generation that uses `explore_schema` before writing SQL.

### Block-Based Assembly (Articulate Rise)

Rise's insight: authors don't design from scratch. They assemble from a library of **content blocks** -- text, image, interaction, knowledge check. Each block is self-contained. The author's job is choosing the right block type and filling it in.

**Our blocks already do this.** But we have 7 block types and no library of pre-built examples. A "block library" or "insert from template" would be more useful than a visual drag-drop composer.

### AI as Draft Partner, Not Author (Gamma Agent)

Gamma's model: AI generates a **first draft** of structure and content, then the author refines conversationally. The AI is a research partner and ghostwriter, not an autonomous author.

**What works:** "Here are 3 draft outlines, pick one" -> eliminates blank-page paralysis
**What's gimmicky:** AI that tries to write final copy. For us, AI-generated SQL that doesn't match the schema is actively harmful.

**Our approach should be:** AI generates structure and narrative. SQL comes from schema exploration + verification against the real database. Never ship SQL the validator hasn't cleared.

### Capture-to-Courseware (Scribe/Guidde)

The emerging pattern: SME does the work, capture tool records it, system generates a course from the recording.

**For us:** A QC administrator sets up a new client in the QC desktop app. While doing so, a tool captures their clicks/screens AND monitors the SQL Server tables for new rows. The result: a course that says "Do this in QC" with screenshots AND verification SQL derived from what actually changed.

This is the "capture pipeline" from the AI authoring vision. It's compelling but requires external tooling (Snagit/capture-mcp/hooksai). **Park it** as a future enhancement -- don't let it block the core workbench.

### Schema-Aware Content (Our Unique Advantage)

No other course authoring tool has live access to the database schema it's teaching about. Our MCP server can:
- `explore_schema` to list tables and columns
- `run_sql` to test queries against real data
- `validate-sql` to catch errors before saving

This means our AI can generate SQL that's **provably correct** -- not hallucinated column names but verified queries. This is the moat. Build around it.

---

## Three Possible Directions

### Direction A: "Lab Builder" (Instruqt-inspired)

Focus entirely on the verification flow. The workbench is a tool for building **interactive labs** where every lesson is a challenge with setup/check/solve.

**Author workflow:**
1. Author names the course and describes the learning goal
2. AI explores the schema and proposes a lesson sequence (which tables, which operations, in what order)
3. For each lesson, AI generates:
   - Narrative instructions ("Go to QC > Client Setup > New Client")
   - Setup SQL (seed prerequisites)
   - Verification SQL (check the learner did it)
   - Hint text (if verification fails)
4. Author reviews, edits in MDX editor, runs "Test This Lesson" to validate the SQL chain
5. "Test Full Course" runs the entire sequence: seed > verify > seed > verify

**What changes:** Less emphasis on visual design, more on the SQL pipeline. The canvas shows a "data flow" view -- which tables each lesson touches, dependencies between lessons.

### Direction B: "Document-First Composer" (Markdoc/MDX-inspired)

The course IS a markdown document with embedded interactive blocks. No separate "block editor" -- everything lives in the document.

**Author workflow:**
1. Author writes or pastes markdown content
2. Author inserts custom blocks inline: `<LiveDemo sql="..." />`, `<DoItInQc instructions="..." verify="..." />`
3. MDX editor renders these as interactive widgets in preview
4. AI can generate entire document sections, including the custom blocks
5. Course player renders the document top-to-bottom with interactive stops

**What changes:** Kill the separate block editor form. Everything is in the MDXEditor. Block types become JSX components in the document. The outline becomes a document navigator (headings = lessons, custom blocks = slides within lessons).

### Direction C: "Guided Builder" (Conversational AI)

The AI is the primary interface. The workbench is a chat-first environment.

**Author workflow:**
1. Author opens a course and says "I want to teach benefit administration"
2. AI asks clarifying questions: "Which tables? Which scenario? Quick overview or deep dive?"
3. AI generates a draft, author reviews in the canvas
4. Author says "Lesson 3 needs a verification step for the benefit_plan table"
5. AI queries the schema, generates SQL, runs it through validation, and adds the block
6. Iterate until done

**What changes:** The canvas and outline become read-only previews. The chat panel is the primary authoring surface. The editor form only appears for fine-tuning individual fields.

---

## Questions for Ideation

1. **Who is the author?** A QC domain expert who knows the system? A training designer who doesn't know SQL? An AI that builds from schema + prompts? This determines everything.

2. **What's the atomic unit?** Is it a block (narrative/quiz/demo), a slide (visual composition), or a document (markdown with embedded components)? We currently have all three and they're confusing.

3. **Should AI generate SQL?** The experiment 9 courses had AI-generated SQL with fake column names. Is the fix better prompting + validation, or should SQL always be human-authored from schema exploration?

4. **How much visual design matters?** The workbench-ux-design spec envisions themes, layouts, side-by-side compositions. Is that needed for internal training, or is a clean document sufficient?

5. **What's the MVP for the May 12 demo?** What can we show that demonstrates the unique value -- schema-aware, verification-based, AI-assisted course building?

---

## Synthesis: What I'd Recommend (for discussion)

**Direction B+A hybrid: Document-first with lab verification built in.**

- The course is a markdown document (Direction B) with custom blocks for interactive labs (Direction A)
- Kill the separate block editor -- merge it into the MDX editor as JSX component properties
- AI generates documents using schema exploration, with SQL validation as a guardrail
- The outline is derived from the document structure (headings = lessons)
- Keep the 3-panel layout but simplify: outline | document editor | AI chat

This collapses the three models (blocks, slides, documents) into one: **the document IS the course**. No more confusion about which data model is in play.

The unique differentiator isn't visual design -- it's **schema-aware verification**. A course that says "Create a provider in QC" and then runs `SELECT * FROM provider WHERE provider_id = @expected` to confirm they did it. No other tool does this.

---

*This document is a starting point. Let's discuss and refine.*
