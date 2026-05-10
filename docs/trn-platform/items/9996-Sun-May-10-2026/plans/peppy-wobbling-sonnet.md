# Plan: Align trn-platform Storybook with Layers of Resolution

## Context

trn-platform's Storybook was scaffolded with workflow stories that render full interactive MUI components — but per the Layers of Resolution thesis (proven in pfm-platform and documented in je-pfm blogs), **workflow stories should be use case specification placeholders**, not UI implementations. Pages are the materialized output of workflow specs. Domain stories showcase components in isolation.

The three-tier Storybook hierarchy:
- **Workflows** — Use case spec placeholders + paired MDX documentation. No real UI. Define WHAT pages should do.
- **Pages** — Real component compositions generated/built FROM workflow specs. The materialized output.
- **Domains** — Individual component stories under a `Domains/` parent node.

Current trn-platform problems:
1. Workflow stories render full interactive components (should be spec placeholders)
2. Domain stories use flat titles (`Steps/StepCard`) instead of `Domains/Steps/StepCard`
3. storySort is minimal — needs full nested ordering
4. No MDX use case documentation paired with workflow stories
5. Workflow naming doesn't use WF-numbering (`Build Demo` vs `WF1 Build Demo`)

---

## Changes

### 1. Rewrite all 34 workflow stories as spec placeholders

Each workflow story becomes a simple placeholder component showing use case metadata, paired with an MDX file containing the full use case specification.

**Pattern (from pfm-platform):**
```tsx
// 01-BrowseStepLibrary.stories.tsx
function BrowseStepLibraryPlaceholder() {
  return (
    <div style={{ padding: '2rem', border: '2px dashed #ccc', borderRadius: 8, maxWidth: 600 }}>
      <h3>UC-STEP-1: Browse Step Library</h3>
      <p><strong>Actor:</strong> User</p>
      <p><strong>Trigger:</strong> Navigate to Steps tab</p>
      <p><strong>Components:</strong> StepListTab (packages/steps/ui-mui)</p>
      <p><strong>Data:</strong> useSteps, useStepFilters</p>
      <p style={{ color: '#999', fontStyle: 'italic' }}>
        Will be wired to real component in implementation phase
      </p>
    </div>
  );
}
```

**Paired MDX file:**
```mdx
// 01-BrowseStepLibrary.mdx
import { Canvas, Meta } from '@storybook/blocks';
import * as Stories from './01-BrowseStepLibrary.stories';

<Meta of={Stories} />

## UC-STEP-1: Browse Step Library

**Actor:** User
**Precondition:** User is on the training platform
**Trigger:** User navigates to Steps tab

### Main Flow
1. System loads step library from qc_training database
2. System displays steps grouped by category (setup, scenario, sync, verify, utility)
3. User can filter by category via chip selection
4. User can search by typing in the search field
5. Matching steps display with label, type chip, category chip, and description

### Alternate Flows
- **AF-1 — No steps match:** System shows "No steps match your filters" message
- **AF-2 — API error:** System shows error alert with retry option

### Postcondition
User sees filtered list of available steps

### Data
- **Schema:** StepSchema, StepListItemSchema
- **Hook:** useSteps(category?)
- **Feature:** useStepFilters, useGroupedSteps

### Stories
`StepListTab.stories.tsx` — Default, Empty, FilteredByCategory, SearchResults, Loading, Error
```

**Files to rewrite (34 story files + 34 new MDX files):**

`.storybook/workflows/wf1-build-demo/` (6 + FullFlow):
- 01-BrowseStepLibrary → UC-STEP-1
- 02-CreateNewStep → UC-STEP-4
- 03-CreateNewFlow → UC-FLOW-2
- 04-AddStepsToFlow → UC-FLOW-5
- 05-ConfigureStepProperties → UC-FLOW-8
- 06-TestRunFlow → UC-EXEC-2
- FullFlow (chains all)

`.storybook/workflows/wf2-present-flow/` (4 + FullFlow):
- 01-SelectFlow → UC-FLOW-1
- 02-StartPresentation → UC-FLOW-9
- 03-StepThroughWithPauses → UC-EXEC-3/4
- 04-ViewResults → UC-EXEC-7
- FullFlow

`.storybook/workflows/wf3-author-story/` (7 + FullFlow):
- 01-CreateComposition → UC-COMP-2
- 02-AddNarrativeBlock → UC-COMP-5
- 03-AddFlowBlock → UC-COMP-9
- 04-AddNoteBlock → UC-COMP-5 (note variant)
- 05-ReorderBlocks → UC-COMP-7
- 06-EditBlockProperties → UC-COMP-8
- 07-PreviewComposition → UC-COMP-11
- FullFlow

`.storybook/workflows/wf4-run-training/` (5 + FullFlow):
- 01-SelectComposition → UC-COMP-1
- 02-WalkThroughNarrative → UC-COMP-11
- 03-ExecuteEmbeddedFlow → UC-EXEC-2
- 04-ViewSqlResults → UC-EXEC-6
- 05-CompleteSession → UC-COMP-11 (completion)
- FullFlow

`.storybook/workflows/wf5-manage-steps/` (4 + FullFlow):
- 01-ViewStepLibrary → UC-STEP-1
- 02-EditStep → UC-STEP-5
- 03-TestStep → UC-EXEC-1
- 04-DeleteStep → UC-STEP-6
- FullFlow

`.storybook/workflows/standalone/` (3):
- ViewTrainingStatus → UC-EXEC-8
- RunSqlQuery → UC-EXEC-6
- BrandingPage (theme showcase — keep as-is, this one is real UI)

### 2. Fix workflow title naming to WF-numbering

Change story titles from short names to WF-numbered convention:
- `Workflows/Build Demo/...` → `Workflows/WF1 Build Demo/...`
- `Workflows/Present Flow/...` → `Workflows/WF2 Present Flow/...`
- `Workflows/Author Story/...` → `Workflows/WF3 Author Story/...`
- `Workflows/Run Training/...` → `Workflows/WF4 Run Training/...`
- `Workflows/Manage Steps/...` → `Workflows/WF5 Manage Steps/...`

Same for Pages:
- `Pages/Build Demo/...` → `Pages/WF1 Build Demo/...`
- etc.

### 3. Fix domain story titles to use `Domains/` prefix

All domain component stories need title prefix changed:

- `Steps/StepCard` → `Domains/Steps/StepCard`
- `Steps/StepListTab` → `Domains/Steps/StepListTab`
- `Flows/FlowCard` → `Domains/Flows/FlowCard`
- `Compositions/CompositionCard` → `Domains/Compositions/CompositionCard`
- `Execution/ConsoleDrawer` → `Domains/Execution/ConsoleDrawer`
- (all ~24 domain story files)

### 4. Update storySort with full nested ordering

Replace minimal storySort in preview.tsx with explicit ordering:

```typescript
storySort: {
  order: [
    'Workflows', [
      'WF1 Build Demo',
      'WF2 Present Flow',
      'WF3 Author Story',
      'WF4 Run Training',
      'WF5 Manage Steps',
      'Standalone',
    ],
    'Pages', [
      'WF1 Build Demo',
      'WF2 Present Flow',
      'WF3 Author Story',
      'WF4 Run Training',
      'WF5 Manage Steps',
    ],
    'Domains', [
      'Steps',
      'Flows',
      'Compositions',
      'Execution',
    ],
  ],
},
```

### 5. Update page story titles to match WF-numbering

Page stories also need WF-numbered folder names:
- `Pages/Build Demo/Step Library Page` → `Pages/WF1 Build Demo/Step Library Page`
- `Pages/Present Flow/Flow Presenter Page` → `Pages/WF2 Present Flow/Flow Presenter Page`
- etc.

---

## Files Modified

**Workflow stories rewritten (34 files):**
- `.storybook/workflows/wf1-build-demo/*.stories.tsx` (7 files)
- `.storybook/workflows/wf2-present-flow/*.stories.tsx` (5 files)
- `.storybook/workflows/wf3-author-story/*.stories.tsx` (8 files)
- `.storybook/workflows/wf4-run-training/*.stories.tsx` (6 files)
- `.storybook/workflows/wf5-manage-steps/*.stories.tsx` (5 files)
- `.storybook/workflows/standalone/*.stories.tsx` (3 files)

**MDX files created (31 new — FullFlows and BrandingPage don't need MDX):**
- `.storybook/workflows/wf1-build-demo/*.mdx` (6 files)
- `.storybook/workflows/wf2-present-flow/*.mdx` (4 files)
- `.storybook/workflows/wf3-author-story/*.mdx` (7 files)
- `.storybook/workflows/wf4-run-training/*.mdx` (5 files)
- `.storybook/workflows/wf5-manage-steps/*.mdx` (4 files)
- `.storybook/workflows/standalone/*.mdx` (2 files — ViewTrainingStatus, RunSqlQuery)
- BrandingPage stays as real UI (theme showcase)

**Domain story titles fixed (~24 files):**
- `packages/steps/ui-mui/src/components/*.stories.tsx`
- `packages/flows/ui-mui/src/components/*.stories.tsx`
- `packages/compositions/ui-mui/src/components/*.stories.tsx`
- `packages/execution/ui-mui/src/components/*.stories.tsx`

**Page story titles fixed (8 files):**
- `.storybook/pages/wf1-build-demo/*.stories.tsx`
- `.storybook/pages/wf2-present-flow/*.stories.tsx`
- `.storybook/pages/wf3-author-story/*.stories.tsx`
- `.storybook/pages/wf4-run-training/*.stories.tsx`
- `.storybook/pages/wf5-manage-steps/*.stories.tsx`

**Preview config updated (1 file):**
- `.storybook/preview.tsx` — storySort with full nested ordering

**Total: ~34 rewrites + ~31 new MDX files + ~32 title fixes + 1 config update = ~98 file changes**

---

## Verification

1. `rm -rf node_modules/.cache && npx storybook dev -p 6008` — Storybook starts clean
2. Sidebar shows: Workflows (WF1-5 + Standalone) → Pages (WF1-5) → Domains (Steps, Flows, Compositions, Execution)
3. Workflow stories render as placeholder boxes with use case metadata (no real UI)
4. MDX docs display when clicking "Docs" tab on workflow stories
5. Page stories render real domain components (StepListTab, FlowRunPage, etc.)
6. Domain stories render individual component showcases under Domains/
7. `pnpm test:storybook` — all stories render without errors
