# Bridge Builder: Content Plan

> Compositions + Animated Shorts — the full content strategy for presenting the lar-platform / Bridge Builder story.

**Date:** 2026-04-29
**Status:** Compositions seeded. Animated shorts scripted. Ready for production.

---

## Overview

Two complementary delivery channels tell the Bridge Builder story:

1. **Compositions** — Live, interactive presentations delivered through TRN-Platform's composition system (narrative blocks + flow blocks + notes + nested compositions). The presenter walks an audience through the arc with live SQL demos.
2. **Animated Shorts** — 8 short-form videos produced via NotebookLM audio generation + animation overlay. Standalone, shareable, designed to drive interest to the live presentation.

Both channels follow the same 6-act narrative arc.

---

## The 6-Act Narrative Arc

| Act | Title | Emotion | Pacing | Demos |
|-----|-------|---------|--------|-------|
| 1 | The Spaghetti Point | Anxiety, recognition | Fast | 0 |
| 2 | Layers of Resolution | Curiosity | Slow | 0 |
| 3 | PFM: 148 Components | Confidence | Moderate | 0 |
| 4 | The lar-platform Pipeline | "How does it work?" | Moderate | 1 |
| 5 | Two Proofs | Excitement → "Aha!" | High energy | 3 |
| 6 | Bridge Builder: The Product | Inspiration | Moderate | 0 |

**The climax** is Act 5, where the audience realizes the platform is presenting its own origin story. The "Composition Self-Query" demo queries the database row for the composition currently being displayed.

---

## Channel 1: Compositions (Live Presentation)

### Artifacts

| File | Purpose |
|------|---------|
| `server/db/migrations/001_bridge_builder_seed.sql` | Seed migration: 9 steps, 3 flows, 7 compositions, 42 blocks |
| `.storybook/mocks/mockData.ts` | Mock data for Storybook rendering (14 steps, 6 flows, 10 compositions) |
| `.storybook/mocks/handlers.ts` | MSW handlers updated for composition detail lookup by ID |

### Composition Hierarchy

```
Module: "The Bridge Builder Story: From Vibe Code to Platform Architecture" (ID 10)
├── [narrative] Welcome & Session Overview
├── [composition] → Act 1: "The Spaghetti Point" (ID 4, story)
│   ├── [narrative] The Promise of Vibe Coding
│   ├── [narrative] Month 3: The Wall
│   ├── [note] The Numbers (Gartner stats)
│   └── [narrative] What Went Wrong?
├── [composition] → Act 2: "Layers of Resolution" (ID 5, story)
│   ├── [narrative] The Thesis
│   ├── [note] The Four Layers (diagram)
│   ├── [narrative] Components: The Atoms
│   ├── [narrative] Workflow Stories: The Molecules
│   ├── [narrative] Pages and Customer Forks
│   └── [note] Architecture Rule: Never Skip a Layer
├── [composition] → Act 3: "PFM-Platform: 148 Components" (ID 6, tutorial)
│   ├── [narrative] The Origin: JE-PFM
│   ├── [narrative] 11 Domains, Zero Cross-Talk
│   ├── [note] PFM Domain Map (table)
│   ├── [narrative] What HooksAI Became
│   └── [narrative] The Realization
├── [composition] → Act 4: "The lar-platform Pipeline" (ID 7, tutorial)
│   ├── [narrative] What Is lar-platform?
│   ├── [note] The 10 Prompts (numbered list)
│   ├── [narrative] Input to Output
│   ├── [note] Pipeline Example (trip planner)
│   ├── [flow] Live: Environment Reset (flow 3)
│   └── [narrative] This Platform Was Generated
├── [composition] → Act 5: "Two Proofs" (ID 8, story)
│   ├── [narrative] The Proof Strategy
│   ├── [narrative] Proof 1: Trip Planner
│   ├── [narrative] Proof 2: Training Platform
│   ├── [flow] Live: New Hire Onboarding (flow 1)
│   ├── [note] Architecture Comparison (table)
│   ├── [flow] Live: Claims Processing (flow 2)
│   ├── [flow] Live: Composition Self-Query (flow 5) ← THE CLIMAX
│   └── [narrative] The Self-Referential Moment
├── [composition] → Act 6: "Bridge Builder: The Product" (ID 9, story)
│   ├── [narrative] From Tool to Product
│   ├── [note] The POC Sequence (roadmap)
│   ├── [narrative] The $4.7B Opportunity
│   ├── [narrative] The Spaghetti Point, Revisited
│   └── [narrative] The Thesis, Restated
└── [narrative] Closing & Discussion
```

### New Demonstration Flows

| Flow | Purpose | Steps |
|------|---------|-------|
| Platform Architecture Explorer (ID 4) | Queries the platform's own schema | 3 SQL steps |
| Composition Self-Query (ID 5) | Queries the composition currently being presented | 2 SQL + 1 manual |
| Domain Layer Verification (ID 6) | Cross-database demo (qc_training + qc_core) | 3 SQL steps |

### Running It

**In Storybook (mock data):**
```bash
pnpm storybook
# Navigate to CompositionRunPage → select "The Bridge Builder Story"
```

**Against live database:**
```bash
pnpm db:migrate          # Runs 001_bridge_builder_seed.sql
pnpm dev                 # Server + Storybook
# Navigate to composition ID 10
```

---

## Channel 2: Animated Shorts (NotebookLM Videos)

### Artifacts

All scripts in `docs/trn-platform/1-specs/animated-shorts/`:

| File | Episode | Duration |
|------|---------|----------|
| `00-series-overview.md` | Series bible: design language, color palette, typography, visual vocabulary |
| `ep0-the-twist.md` | Teaser: "What if the platform presenting this story built itself?" | 90s |
| `ep1-the-wall.md` | The problem: vibe coding fails at month 3 | 3–4 min |
| `ep2-zoom-levels.md` | The thesis: Layers of Resolution | 3–4 min |
| `ep3-one-forty-eight.md` | The proof: 148 components, zero cross-domain imports | 3–4 min |
| `ep4-ten-prompts.md` | The method: the lar-platform pipeline | 3–4 min |
| `ep5-inside-the-proof.md` | The climax: self-referential meta-moment | 4–5 min |
| `ep6-speak-it.md` | The vision: Bridge Builder as product | 3–4 min |
| `ep7-the-arc.md` | Series recap: standalone shareable summary | 2–3 min |

### Per-Episode Structure

Each script contains 4 sections:

1. **NotebookLM Brief** — Direct instruction for audio generation (tone, pacing, discovery beats)
2. **Source Material** — Factual content for the AI hosts to draw from
3. **Key Moments** — Specific beats to hit (the "2500% pause," the "self-query punchline")
4. **Visual Storyboard** — Scene-by-scene animation direction (color, motion, text overlays)

### Visual Design Language

Six recurring visual metaphors:

| Metaphor | Visual | Represents |
|----------|--------|------------|
| Spaghetti | Tangled neon threads on dark background | Vibe code entropy |
| Layers | Horizontal glass planes stacking upward | Layers of Resolution |
| The Grid | Isometric package grid with domain labels | Monorepo architecture |
| The Pipeline | 10 glowing connected nodes | lar-platform prompts |
| The Mirror | Screen within screen within screen | Self-reference / recursion |
| The Bridge | Gold arch from chaos to order | Bridge Builder product |

### Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Background | Deep navy | `#0A1628` |
| Spaghetti | Hot pink / coral | `#FF6B6B` |
| Layer 1 (Components) | Electric blue | `#4ECDC4` |
| Layer 2 (Stories) | Amber | `#FFD93D` |
| Layer 3 (Pages) | Soft violet | `#A78BFA` |
| Layer 4 (Forks) | Mint green | `#6EE7B7` |
| Pipeline flow | White / silver | `#E2E8F0` |
| Accent / highlight | Gold | `#F59E0B` |
| Text | Off-white | `#F1F5F9` |

### Production Pipeline

```
Script (.md) → NotebookLM (audio generation) → Animation tool (visual overlay) → Final video
```

Feed each episode's **NotebookLM Brief + Source Material** sections into NotebookLM to generate the podcast-style audio. Use the **Visual Storyboard** section to guide animation production (Runway, Pika, or manual motion graphics).

---

## Cross-Channel Integration

The animated shorts and live compositions reinforce each other:

- **Pre-event:** Share Episode 0 (The Twist) and Episode 7 (The Arc) as teasers
- **During presentation:** The live composition IS the expanded version of the animated shorts
- **Post-event:** Share individual episode links as follow-ups mapped to what the audience saw live
- **Standalone:** Episode 7 (The Arc) works as a complete summary for cold audiences

The self-referential nature works in both channels: the animated shorts describe a platform that presents its own origin, and the live composition IS that platform presenting its own origin.
