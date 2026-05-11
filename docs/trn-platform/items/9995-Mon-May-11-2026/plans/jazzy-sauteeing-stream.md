# Plan: `/deploy-ticket` Skill

## Context

Lenny needs a repeatable way to publish production deliverables from a ticket to a private GitHub repo in the `PLEXISHealth` org. Today this is manual: copy files to a staging directory, create a repo, push. The skill automates the full flow with sensible defaults and optional precision overrides.

The staging directory (`client-development-tickets-staging/`) serves as the local mirror of what's on GitHub — folder names match repo names exactly.

## Skill Design

### Invocation
```
/deploy-ticket Trinity-RT-27633
```

### What it does
1. **Resolve source path**: `clients/Trinity/Trinity-RT-27633/production/` — client name parsed from first segment before first hyphen
2. **Auto-detect version**: If `production/` has `v1/`, `v2/`, etc., pick the highest `vN`. If files are directly in `production/`, use that.
3. **Generate descriptive repo name**: Read ticket context (Preamble.md, Working-Document.md, CLAUDE.md, folder name) to suggest a name like `Trinity-RT-27633-Journal-Entry-Detail`. Show to user for approval/tweaking.
4. **Filter files**: Copy everything **except** excluded extensions and folders (exclusion-based)
5. **Stage locally**: Create/update `client-development-tickets-staging/{repo-name}/` with the filtered files
6. **Create GitHub repo**: `gh repo create PLEXISHealth/{repo-name} --private` (skip if already exists)
7. **Push**: Init git in staging folder, commit, push to the repo

### Config Hierarchy (most specific wins)

```
CLI flags → ticket config → client config → global config
```

#### Global config: `.claude/skills/deploy-ticket/config.json`
```json
{
  "staging_root": "/mnt/c/Users/lmiller/Documents/client-development-tickets-staging",
  "github_org": "PLEXISHealth",
  "private": true,
  "exclude_extensions": [".bak", ".tmp"],
  "exclude_folders": ["results"]
}
```

#### Client override: `clients/{Client}/deploy-config.json` (optional, created as needed)
#### Ticket override: `clients/{Client}/{Ticket}/deploy-config.json` (optional, created as needed)

Each level can add/remove from the parent's excludes. Example:
```json
{
  "exclude_extensions_add": [".csv"],
  "exclude_extensions_remove": [],
  "exclude_folders_add": ["scratch"],
  "exclude_folders_remove": []
}
```

### CLI Override Flags (one-off adjustments)
- `--exclude *.csv` — add exclusion for this run
- `--include results/` — remove a folder from exclusion for this run
- `--files file1.sql file2.rpt` — explicit file list (bypasses all filtering)
- `--version v2` — override auto-detection of highest vN
- `--name My-Custom-Name` — override the auto-generated repo name

## Files to Create

### 1. `.claude/skills/deploy-ticket/SKILL.md`
The main skill definition. Workflow:

1. Parse ticket name argument, extract client prefix
2. Resolve `clients/{Client}/{Ticket}/production/` path, verify it exists
3. Auto-detect version (highest `vN` subfolder or root)
4. Load config chain: global → client → ticket
5. Apply CLI flag overrides
6. List files that will be deployed (post-filtering), show to user
7. Read ticket context files to auto-suggest descriptive repo name
8. Show proposed repo name, let user confirm/edit
9. Create staging directory `{staging_root}/{repo-name}/`
10. Copy filtered files to staging
11. `gh repo create PLEXISHealth/{repo-name} --private` (or confirm existing)
12. Init git, commit, push
13. Report: repo URL, files deployed, staging path

### 2. `.claude/skills/deploy-ticket/config.json`
Global defaults (exclusions, staging root, org name).

## Key Files Referenced
- `.claude/skills/send-production/SKILL.md` — existing skill, pattern to follow for structure
- `.claude/skills/new-ticket/SKILL.md` — existing skill, pattern for ticket path resolution
- `clients/*/CLAUDE.md` — client context for name generation
- `clients/*/*/Preamble.md` — ticket context for name generation
- `clients/*/*/Working-Document.md` — ticket context for name generation

## Verification
1. Run `/deploy-ticket Trinity-RT-27633` and confirm:
   - Correct source path resolved (`clients/Trinity/Trinity-RT-27633/production/V1/`)
   - Highest version auto-selected
   - Descriptive name generated (e.g., `Trinity-RT-27633-Journal-Entry-Detail`)
   - Files filtered (`.sql` + `.rpt` included, `results/` excluded)
   - Staging directory created with matching name
   - Private repo created in PLEXISHealth org
   - Files pushed successfully
2. Verify `gh repo view PLEXISHealth/{repo-name}` shows the correct files
3. Test with a ticket that has no version subfolders (e.g., `Verda-Report-Claim`)
4. Test CLI overrides (`--include results/`, `--files` explicit list)
