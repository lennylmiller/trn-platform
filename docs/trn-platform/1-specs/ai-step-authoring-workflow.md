# AI Step Authoring Workflow

## Purpose

Step authoring in QC Training should become an AI-assisted workflow, not a manual form-filling task. Many existing steps began as shell scripts or SQL snippets created during real operational work. The platform should preserve that organic authoring style while converting each useful action into durable training objects: steps, flows, compositions, presenter notes, display queries, and validation checks.

The immediate motivating scenario is creating a new journey such as the Miller Family Journey for Lenny, Ryan, Devin, and Naomi, similar to the earlier Maria family journey. That work will likely require new SQL, new verification queries, story structure, and flow sequencing. AI should help create those assets inside the QC Training application.

## Core Idea

A step is a reusable, executable teaching unit. It has three meanings:

- **Intent:** what the step is trying to accomplish.
- **Mechanism:** how the step accomplishes it: `shell`, `sql`, or `manual`.
- **Presentation:** what the trainer or learner should see, through description, display queries, and flow-level presenter notes.

Authoring a step means converting an operational move into something the platform can teach, execute, observe, reuse, and explain.

## Authoring Workflow

1. **Intent capture**
   The user describes the goal in natural language, for example: “Create the Miller Family Journey for Lenny, Ryan, Devin, Naomi, similar to Maria’s family journey.”

2. **Clarifying questions**
   AI asks only the questions needed to avoid bad assumptions: what business scenario the family demonstrates, which QC entities are involved, whether data should be created or only inspected, and whether the result must be rerunnable.

3. **Journey draft**
   AI proposes a high-level training outline, such as setup, verification, scenario action, learner observation, and final validation.

4. **Step plan**
   AI breaks the journey into candidate steps. Example candidates:
   - Create Miller family members
   - Assign Miller PCP relationships
   - Insert Miller claims or referrals
   - Verify Miller household records
   - Show Miller journey summary
   - Pause for trainer explanation

5. **SQL, shell, or manual draft**
   AI drafts the command text, description, category, and display queries for each candidate step.

6. **Review and simulation**
   The user reviews the structured drafts before anything is published. The system should highlight assumptions, destructive SQL, missing display queries, and rerun risks.

7. **Publish**
   Approved drafts become real platform objects: `step_library` rows, `flow` rows, `flow_step` rows, and optionally `composition` / `composition_block` rows.

## Proposed Domain Objects

AI authoring should create drafts before mutating production training objects.

```ts
AuthoringSession {
  session_id: number;
  title: string;
  goal: string;
  status: 'drafting' | 'reviewing' | 'approved' | 'published';
}

AuthoringMessage {
  message_id: number;
  session_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

StepDraft {
  draft_id: number;
  session_id: number;
  label: string;
  type: 'shell' | 'sql' | 'manual';
  category: 'setup' | 'scenario' | 'sync' | 'verify' | 'utility';
  command_text?: string | null;
  description?: string | null;
  display_queries?: Array<{ label: string; sql: string }> | null;
  status: 'draft' | 'approved' | 'rejected' | 'published';
  validation_notes?: string | null;
}
```

Related draft objects should eventually include `FlowDraft`, `FlowStepDraft`, and `CompositionDraft`.

## Product Experience

The QC Training app should expose an Authoring Workspace rather than a generic chatbot.

The left side should contain the conversation: the user describes the journey, answers AI questions, and asks for revisions.

The right side should contain structured outputs: proposed steps, generated SQL, display queries, flow sequence, presenter notes, warnings, and publish controls.

Useful actions include:

- Approve step draft
- Edit step draft
- Test SQL
- Regenerate display queries
- Split one large draft into multiple atomic steps
- Assemble approved steps into a flow
- Publish flow into a composition

## Authoring Rules

AI should follow these rules:

- Create drafts first; never publish directly.
- Prefer idempotent SQL where possible.
- Separate setup steps from verification steps.
- Every data-changing step should have a display or verification query.
- Use `manual` steps for trainer explanation and human judgment.
- Put reusable mechanics in the base step.
- Put story-specific guidance in `flow_step.presenter_notes`.
- Warn before destructive SQL or schema changes.
- Explain assumptions about databases, tables, identifiers, and family/member data.
- Ask before inventing business data that affects the scenario.

## Step Quality Checklist

Before publishing a step, confirm:

- The label names the outcome.
- The category reflects the teaching purpose.
- The command is safe to run in the intended environment.
- Required databases, tables, files, or environment variables are clear.
- The step is atomic enough to reuse.
- The description explains why the step exists.
- Display queries prove what changed or what should be observed.
- Flow-specific narration is kept out of the base step.

## Implementation Direction

The clean model is:

```txt
Conversation
  -> Authoring Session
    -> Step Drafts
    -> Flow Draft
    -> Composition Draft
      -> Publish
        -> step_library
        -> flow
        -> flow_step
        -> composition
        -> composition_block
```

The first useful vertical slice should be small:

1. Add an AI Authoring Workspace.
2. Let the user describe a journey goal.
3. Have AI return structured `StepDraft` objects.
4. Let the user edit and approve one draft.
5. Publish the approved draft into `step_library`.

After that, extend the workflow to assemble approved step drafts into flows and compositions.
