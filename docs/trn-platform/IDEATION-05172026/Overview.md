# Ticket Workflow Redesign -- Ideation

> Working folder: `IDEATION-05172026/`
> Shared between Obsidian (Lenny) and Claude Code (AI)
> Last touched: 2026-05-17

---

## The Human Story (v1)

The workflow starts with the human, not the tools. What does a day actually look like?

### Act 1: Morning -- "Where Was I? What's New?"

Actor gets to his computer. The first thing he does is figure out **where he left off** and **what's new overnight**. He checks:

- **Jira** -- any new tickets assigned? Any comments on open tickets?
- **Outlook** -- any replies from clients, from Kirk, from Derek, from Brian?
- **Teams** -- any pings, any discussions he was tagged in?

He's building a mental picture: *what needs my attention right now?*

### Act 2: Triage -- "Pick One, Gather Context"

He picks a ticket to focus on. Maybe it's new (needs intake), maybe it's in-flight (needs a response or the next dev step). Either way, he needs to **gather context** -- the ticket description, the email thread, what was said in Teams, what SQL he was working on last, what questions are still open.

This is the **snowball** -- starting from a ticket number and rolling through every source until you have enough context to act.

### Act 3: Work -- "Hands on Keyboard"

He remotes into Citrix (or works locally for Crystal Reports). He reads baseline SQL, writes development SQL, runs profiling, captures results. He pastes SSMS output back into markdown. He iterates.

This is where the `baseline/ -> development/ -> profiling/` folders earn their keep.

### Act 4: Communicate -- "Tell Someone"

He drafts an email -- to Brian, to the client, to Kirk/Derek. He captures what he learned, what he needs, what he's recommending. This might happen mid-work or at the end.

The `comms/` folder holds these drafts. Communication is not a side effect of work -- it's a first-class artifact of each transition.

### Act 5: Wrap -- "Close the Loop"

He updates his notes. He moves files to production if done. He commits. He might deploy via GitHub or email a zip. He shifts to the next ticket or closes the day.

`production/` gets populated. `/deploy-ticket` and `/send-production` fire.

---

## Open Questions

- [ ] Are these acts right? Missing any?
- [ ] Which acts hurt the most? (Where does context get lost, where does friction slow you down?)
- [ ] Does "snowball" resonate as the metaphor, or is there a better one?
- [ ] How do multi-ticket days work? (Parallel? Context-switch penalty?)

---

## Collaboration Pattern

This folder is a **shared ideation space**:

- **Lenny in Obsidian**: writes notes, sketches Excalidraw diagrams, rearranges thinking
- **Claude Code**: reads what Lenny wrote, reacts, adds sections, writes back to these files
- **Ping-pong**: Lenny says "read it" -- Claude catches up. Claude writes -- Lenny sees it in Obsidian.

### Current Working Document

> `IDEATION-05172026/Overview.md` (this file)

When new documents or drawings are added to this folder, mention them here so Claude knows to look.

### Excalidraw Drawings

*(none yet -- add them here and Claude will reference them)*

---

## Solution Tiers (To Be Designed)

### High Bar
*Full MCP integration: Jira + Outlook + Teams feeding into automated snowball. One command gathers everything.*

### Medium Bar
*Partial integration: use what's live now (Outlook MCP, Teams MCP) plus manual Jira paste. Semi-automated snowball.*

### Low Bar
*Human-driven with AI assist: Lenny gathers context manually, Claude helps organize and draft. Structured templates guide the process.*

---

## Notes

*(space for freeform thinking -- either of us can add here)*
