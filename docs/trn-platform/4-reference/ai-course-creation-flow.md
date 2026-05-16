# How AI Creates a Course — The Complete Flow

This is a reference document, not an implementation plan.

## The Big Picture

There are **two paths** to create a course with AI:

**Path A: Freeform** — AI generates the full lesson/slide structure from scratch based on your prompt
**Path B: Template** — AI picks a template (YAML file), substitutes parameters, applies it to the course

Both paths end at the same place: `buildCourseContent()` writes lessons + blocks to the database.

## Step-by-Step Flow

### 1. User Creates a Course

Either through the QC Training app UI (Create Course button) or the AI can do it via the `create_course` MCP tool.

**What happens:** `POST /api/v2/courses` → inserts a row in the `course` table → returns `{ course_id: 1055, title: "Claims & Adjudication", ... }`

The course exists but has **zero lessons, zero blocks**. It's an empty shell.

### 2. CourseEditor Opens, Auto-Opens AI Chat

When `CourseEditor` detects `course.lessons.length === 0`, it automatically opens the AI chat panel on the right. The user sees the empty outline on the left and the chat on the right.

**File:** `packages/courses/ui-mui/src/components/CourseEditor.tsx` (lines 68-72)

### 3. User Tells the AI What to Build

The user types something like: *"Create a course about claims adjudication for the Borgia-TRAIN family"*

This message goes through:
- `ChatPanel` → `useChatSession().send()` → `POST /api/v2/chat`
- Chat server builds a system prompt with course-authoring context
- Chat server loads **all MCP tools** from the MCP server (26 tools)
- Claude receives the message + tools and decides what to do

### 4. The AI Calls MCP Tools

Claude typically calls tools in this order:

#### 4a. (Optional) List/Get Templates
```
list_templates → GET /api/v2/courses/templates
```
Returns the available YAML templates:
- `implementation.yaml` — walk through setting up a QC domain (parameters: topic, family, tables, actor)
- `walkthrough.yaml` — story-driven journey through a process

```
get_template("implementation") → GET /api/v2/courses/templates/implementation
```
Returns the full YAML structure with `{{topic}}`, `{{family}}`, `{{tables}}` placeholders.

#### 4b. (Path B) Apply Template
```
apply_template(courseId, "implementation", { topic: "Claims", family: "Borgia-TRAIN", tables: "claim, claim_procedure" })
→ POST /api/v2/courses/{id}/apply-template
```
**What happens in `applyTemplate()`** (`packages/courses/server/src/templates.ts`):
1. Load YAML template
2. Replace all `{{param}}` placeholders with provided values
3. Delete existing lessons (cascade)
4. For each lesson in template: INSERT `course_lesson`
5. For each slide in lesson: INSERT `course_slide` with markdown content
6. **Note:** This path creates slides with document-first content (markdown), NOT course_blocks

#### 4c. (Path A) Build Course Content — THE MAIN PATH
```
build_course_content(courseId, '{"lessons": [...]}')
→ POST /api/v2/courses/{id}/build
```
The AI sends a JSON string with the **entire course structure**:
```json
{
  "lessons": [
    {
      "title": "What Is a Claim?",
      "description": "Introduction to claims in QC",
      "slides": [
        {
          "block_type": "narrative",
          "title": "The Claim Table",
          "content": "A **claim** is a formal request..."
        },
        {
          "block_type": "live_demo",
          "title": "Query Claims",
          "content": "Let's look at actual claims...",
          "sql_text": "SELECT TOP 10 * FROM claim WHERE claim_ud LIKE '%TRAIN%'",
          "sql_label": "Training Claims"
        },
        {
          "block_type": "quiz",
          "quiz_question": "What column uniquely identifies a claim?",
          "quiz_options": ["claim_id", "claim_ud", "claim_number", "claim_key"],
          "quiz_answer": 0,
          "quiz_explanation": "claim_id is the INT IDENTITY primary key"
        }
      ]
    }
  ]
}
```

**What happens in `buildCourseContent()`** (`packages/courses/server/src/queries.ts:425-516`):
1. DELETE all existing `course_lesson` rows (cascade deletes blocks, slides, elements)
2. For each lesson:
   - INSERT `course_lesson` → get `lesson_id`
3. For each block in the lesson:
   - INSERT `course_block` with all typed fields (block_type, content, sql_text, quiz_question, etc.) → get `block_id`
   - Auto-create a `course_slide` wrapper → get `slide_id`
   - INSERT `course_slide_element` linking block to slide
   - If `image_url` exists, add a second element for the image
4. Run SQL validation (`validateCourseBlocksSql`) — returns warnings for bad SQL
5. UPDATE `course.updated_at`

### 5. UI Refreshes

The chat response callback invalidates the TanStack Query cache:
```
queryClient.invalidateQueries(coursesKeys.detail(courseId))
```
The outline re-fetches the course and renders the new lesson/block tree.

## Templates: What They Are

Templates are YAML files in `packages/courses/templates/`. They define a **skeleton** with placeholder content:

```yaml
# implementation.yaml
name: Implementation Course
parameters:
  - name: topic
    description: The domain area
  - name: tables
    description: Comma-separated QC table list
lessons:
  - title: "Introduction to {{topic}}"
    slides:
      - title: "What Is {{topic}}?"
        content: "Overview of {{topic}} in the QC system..."
      - title: "Key Tables"
        content: "<Placeholder type='diagram' label='{{topic}} ER Diagram'/>"
```

**Templates create document-first slides** (course_slide with markdown content) rather than typed course_blocks. This is a different path than `build_course_content` which creates course_blocks.

## The Two Data Models (the confusion)

| Created by | Table | Model |
|-----------|-------|-------|
| `build_course_content` (AI freeform) | `course_block` | Typed fields: block_type, sql_text, quiz_question, etc. |
| `apply_template` | `course_slide` | Markdown content with embedded component tags |
| `build_course_content` (auto) | `course_slide` | Auto-created wrapper around each block |

When `build_course_content` runs, it creates BOTH: a `course_block` (the data) AND a `course_slide` wrapper (for layout). The block holds the typed fields; the slide is a thin container.

When `apply_template` runs, it only creates `course_slide` rows with markdown content — no `course_block` rows.

The `EditableBlockRenderer` we built works with `course_block` data. Template-generated courses with only `course_slide` data would need the MDX/markdown path.

## Available MCP Tools for Courses

| Tool | What it does |
|------|-------------|
| `create_course` | Create empty course shell |
| `list_courses` | List all courses |
| `get_course` | Get full course detail with lessons/blocks |
| `update_course` | Update course metadata |
| `build_course_content` | Replace all lessons/blocks in one call |
| `add_course_lesson` | Add a single lesson |
| `add_course_block` | Add a single block to a lesson |
| `list_templates` | List available YAML templates |
| `get_template` | Get a template's full structure |
| `apply_template` | Apply template with parameter substitution |
| `explore_schema` | List qc_core tables or describe a table's columns |
| `run_sql` | Execute SQL against qc_core or qc_training |
| `qc_train` | Run qc-train.sh commands (setup, teardown, verify) |
