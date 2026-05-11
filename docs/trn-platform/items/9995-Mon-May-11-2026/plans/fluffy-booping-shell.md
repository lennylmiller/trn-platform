# Expanded Seed Content Library

## Context

The current seed-compositions.sql has one Story, one Tutorial, and one Module — all monolithic. The walkthrough document has 6 distinct Acts covering 6 domains, each with narrative prose, ER diagrams, SQL walkthroughs, and reference tables. These should be broken into **granular, reusable pieces** at every level of the hierarchy so they can be mixed and matched.

Source: `training/QC-Training/QC-Core-Insurance-Walkthrough.md`

---

## New Seed Steps (SQL type)

These are query steps — `type = 'sql'` — that run exploratory SQL against qc_core. They complement the existing shell steps (setup, teardown, scenario, sync, verify) by letting presenters show data interactively.

| # | Label | Category | SQL (summary) |
|---|-------|----------|---------------|
| 1 | Walk enrollment chain | utility | The 10-table join from member through benefit_framework for Garcia-TRAIN |
| 2 | Find PCP and IPA | utility | Member to PCP with provider_ud and IPA prefix |
| 3 | Audit QCAP codes | utility | Show all QCAP result codes for Garcia-TRAIN with status |
| 4 | View claim adjudication | utility | TRAIN-CLM-001 with procedure codes, charges, adjudication amounts |
| 5 | Check referral | utility | TRAIN-REF-001 with status, visit limits, dates |
| 6 | Walk group chain | utility | Claim to employer group (the 6-table join) |
| 7 | Walk eligibility chain | utility | Member to PCP (the 5-table join) |

These go in **seed-steps.sql** (appended after existing shell steps).

---

## New Seed Flows

Composed from existing + new steps. Each focuses on one domain so they can be referenced individually from Stories and Modules.

| # | Flow Name | Steps (in order) |
|---|-----------|------------------|
| 1 | Enrollment Explorer | Reset to defaults > Walk enrollment chain > (pause) |
| 2 | PCP & IPA Explorer | Walk enrollment chain > Find PCP and IPA > (pause) |
| 3 | QCAP Sync: NEW Scenario | Reset to defaults > Scenario: NEW > Audit QCAP codes > Sync preview > Sync commit > Audit QCAP codes > (pause) |
| 4 | QCAP Sync: CHANGED Scenario | Scenario: CHANGED > Find PCP and IPA > Audit QCAP codes > Sync preview > Sync commit > Audit QCAP codes > (pause) |
| 5 | Claims Deep Dive | View claim adjudication > Walk group chain > (pause) |
| 6 | Referral Check | Check referral > (pause) |

These go in **seed-flows.sql** (appended after existing flows).

---

## Granular Stories (one per Act)

Instead of one monolithic story, break into 6 per-Act stories. Each is a self-contained narrative with optional flow blocks that run the relevant queries.

| # | Story Title | Blocks |
|---|------------|--------|
| 1 | **Enrollment: "I Got My Insurance Card"** | narrative (Maria's story) > flow (Enrollment Explorer) > narrative (What Just Happened + Reading It Top-Down) |
| 2 | **Choosing a Doctor: "Who's My PCP?"** | narrative (Maria picks Rodriguez) > flow (PCP & IPA Explorer) > narrative (IPA prefix system explanation) |
| 3 | **The QCAP Sync: "Tagging Members"** | narrative (3 scenarios explained) > flow (QCAP Sync: NEW) > narrative (why it matters) |
| 4 | **The Referral: "I Need a Specialist"** | narrative (Maria's knee pain) > flow (Referral Check) > narrative (referral-to-claim link) |
| 5 | **The Claim: "The Doctor Bills Insurance"** | narrative (Maria visits Dr. Park) > flow (Claims Deep Dive) > narrative (adjudication math) |
| 6 | **Payment: "The Provider Gets Paid"** | narrative (payment run, EOB) > narrative (A/R side, business rules) |

Keep the existing **"The Garcia Family Story"** as the combined version (all 7 blocks), but now the individual Act stories can also be used standalone or cherry-picked into modules.

---

## Granular Tutorials (domain-specific)

Each tutorial focuses on one technical domain with ER diagrams, SQL, and reference material.

| # | Tutorial Title | Blocks |
|---|---------------|--------|
| 1 | **Enrollment Data Model** | note (enrollment ER diagram) > narrative (top-down walkthrough of tables) > note (enrollment SQL walkthrough) |
| 2 | **Provider & IPA Model** | note (PCP ER diagram) > note (IPA prefix table) > note (PCP SQL walkthrough) |
| 3 | **QCAP Sync Internals** | note (use case diagram + activity diagram) > narrative (anti-join pattern explanation) > note (3 scenario details) |
| 4 | **Claims & Adjudication** | note (claim ER diagram) > narrative (adjudication math with both lines) > note (business rules + claim SQL) |
| 5 | **Payment & Accounting** | note (payment ER diagram) > note (A/P tables + A/R side) > note (business rules) |

Keep the existing **"QC Core Technical Reference"** (join chains, guard clauses, glossary, tools) as-is — it's cross-cutting reference, not domain-specific.

---

## Modules

| # | Module Title | Blocks |
|---|-------------|--------|
| 1 | **QC Core Fundamentals** (existing, enhanced) | Welcome > Story: Garcia Family > Flow: Full QCAP Walkthrough > Flow: Idempotent Proof > Tutorial: QC Core Technical Reference > Next Steps |
| 2 | **Enrollment Deep Dive** | narrative intro > Story: Enrollment > Tutorial: Enrollment Data Model > Flow: Enrollment Explorer > narrative (exercises) |
| 3 | **QCAP Sync Mastery** | narrative intro > Story: QCAP Sync > Tutorial: QCAP Sync Internals > Flow: QCAP NEW > Flow: QCAP CHANGED > Story: Choosing a Doctor > narrative (exercises) |
| 4 | **Claims & Payment** | narrative intro > Story: The Claim > Tutorial: Claims & Adjudication > Flow: Claims Deep Dive > Story: Payment > Tutorial: Payment & Accounting > narrative (exercises) |

---

## Implementation

### Files to modify

| File | Changes |
|------|---------|
| `server/db/seed-steps.sql` | Append 7 new SQL-type steps after existing shell steps |
| `server/db/seed-flows.sql` | Append 6 new domain-specific flows |
| `server/db/seed-compositions.sql` | Rewrite: 6 granular stories + 5 tutorials + 4 modules (plus keep the combined originals) |

### Approach

1. Extend `seed-steps.sql` with the 7 SQL steps (each has the full query from the walkthrough as `command_text`, plus display_queries)
2. Extend `seed-flows.sql` with the 6 domain flows (referencing steps by label lookup, same pattern as existing)
3. Rewrite `seed-compositions.sql` to include all granular content while keeping the originals

### Content extraction rules

- Narrative prose from "The Real-World Story" sections -> `content` field
- ER diagrams, SQL walkthroughs, tables -> `technical_content` field
- "Try it now" prompts stay in story `content` as blockquotes
- SQL from "Try It Yourself" sections becomes both new Steps AND embedded in tutorial `technical_content`
- All seed rows use `is_seed = 1`

---

## Verification

1. `qc-train init` runs clean — all 3 seed files execute without error
2. Step tab: 7 new SQL-type steps appear under "utility" category
3. Flow tab: 6 new domain flows appear alongside existing 2
4. Story tab: 7 stories (1 combined + 6 per-Act)
5. Tutorial tab: 6 tutorials (1 cross-cutting reference + 5 domain-specific)
6. Module tab: 4 modules (1 fundamentals + 3 domain deep-dives)
7. Present any story — narrative renders, flow blocks execute
8. Present any module — composition blocks link to stories/tutorials, flow blocks execute
