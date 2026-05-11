# Plan: Client-Level CLAUDE.md Files + Product/Access Memory

## Context
The company has two products (**PCM** = older, **QC** = newer) and three remote access methods (**Citrix**, **RDC**, **RDC - Stargate**). Each client uses one product and one access method. Currently this info isn't captured anywhere. The user wants:

1. A **memory entry** documenting the two products and three access methods
2. A **CLAUDE.md at each client folder** (`clients/{Client}/CLAUDE.md`) with placeholders for product and access method that Lenny can fill in over time

## Changes

### 1. Save memory entry
Write `/home/nixos/.claude/projects/.../memory/reference_products_access.md` documenting:
- PCM (older product) vs QC (newer product)
- Citrix, RDC, RDC - Stargate access methods
- Client-level CLAUDE.md files are the place to find per-client mappings

Update `MEMORY.md` index.

### 2. Create client-level CLAUDE.md for all 24 clients

Create `clients/{Client}/CLAUDE.md` for each of the 24 client folders with this template:

```markdown
# {ClientName}

## Environment
- **Product**: <!-- PCM | QC -->
- **Remote Access**: <!-- Citrix | RDC | RDC - Stargate -->
- **Test Server**: <!-- e.g., ifl-sqltst01 -->
- **Production Server**: <!-- e.g., ifl-sqlprd01 -->

## Client Notes
<!-- Any client-specific context: contacts, quirks, time zones, etc. -->
```

**Client folders (24):**
Argus, ARML, Cayman, CHP, EOBTPA, GBS, GHL, Humana, IFL, Infinite, InnovAge, Lummi, OneHome, Oneida, PBM, Planstin, Qvera, Tatil, TBS, Texas Legal, Tivity, Trinity, UPHP, Verda

### 3. Update root CLAUDE.md
Add a note in the Conventions section that each client folder has a `CLAUDE.md` with product/access info.

## Verification
- `ls clients/*/CLAUDE.md` returns 24 files
- Each file has the placeholder template
- Memory entry saved and indexed
