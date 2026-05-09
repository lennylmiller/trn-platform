/**
 * Tool definitions and executors for the chat service.
 * Uses shared tool executors for schema/SQL, and API proxy for course CRUD.
 */
import type Anthropic from '@anthropic-ai/sdk';
import { exploreSchema, runSql, qcTrain } from '@trn-platform/shared/tools';
import { apiFetch } from './api-client.js';

// ---------------------------------------------------------------------------
// Tool Definitions (Anthropic format)
// ---------------------------------------------------------------------------

export const CHAT_TOOLS: Anthropic.Tool[] = [
  {
    name: 'explore_schema',
    description: 'List all tables in qc_core/qc_training, or describe a specific table (columns, PKs, types)',
    input_schema: {
      type: 'object' as const,
      properties: {
        table: { type: 'string', description: 'Table name to describe. Omit to list all tables.' },
        database: { type: 'string', description: 'Database: "qc_core" (default) or "qc_training"' },
      },
      required: [],
    },
  },
  {
    name: 'run_sql',
    description: 'Execute a SQL query against qc_core or qc_training and return results',
    input_schema: {
      type: 'object' as const,
      properties: {
        sql: { type: 'string', description: 'The SQL query to execute' },
        database: { type: 'string', description: 'Database: "qc_core" (default) or "qc_training"' },
      },
      required: ['sql'],
    },
  },
  {
    name: 'qc_train',
    description: 'Run a qc-train.sh command (setup, teardown, reset, status, verify, scenario, sync)',
    input_schema: {
      type: 'object' as const,
      properties: {
        command: { type: 'string', description: 'Command to run, e.g. "status", "verify qcap", "scenario new"' },
      },
      required: ['command'],
    },
  },

  // -------------------------------------------------------------------------
  // Course CRUD tools
  // -------------------------------------------------------------------------

  {
    name: 'get_course',
    description: 'Get a course by ID with all lessons and slides. Always call this first to see existing structure before adding content.',
    input_schema: {
      type: 'object' as const,
      properties: {
        courseId: { type: 'number', description: 'The course_id to retrieve' },
      },
      required: ['courseId'],
    },
  },
  {
    name: 'list_courses',
    description: 'List all training courses with lesson and slide counts',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'add_course_lesson',
    description: 'Add a lesson (chapter) to a course. Lessons contain slides.',
    input_schema: {
      type: 'object' as const,
      properties: {
        courseId: { type: 'number', description: 'The course_id' },
        seq: { type: 'number', description: 'Order within the course (0-based)' },
        title: { type: 'string', description: 'Lesson title' },
        description: { type: 'string', description: 'Brief description of what this lesson covers' },
      },
      required: ['courseId', 'seq', 'title'],
    },
  },
  {
    name: 'add_course_slide',
    description: `Add a slide to a course lesson. The slide JSON object must include: seq (0-based), slide_type, and type-specific fields.

Slide types and their key fields:
- narrative: title, content (markdown)
- reference: title, content (markdown)
- live_demo: title, content, sql_text, sql_label
- sql_challenge: title, content (the prompt), sql_text (the answer), hints (string array)
- quiz: quiz_question, quiz_options (string array), quiz_answer (0-based index), quiz_explanation
- do_it_in_qc: title, content, sql_text, sql_label, verify_mode ("auto"|"show"), expected_json, seed_sql, seed_label
- screenshot_task: title, content`,
    input_schema: {
      type: 'object' as const,
      properties: {
        courseId: { type: 'number', description: 'The course_id' },
        lessonId: { type: 'number', description: 'The lesson_id to add the slide to' },
        slide: { type: 'string', description: 'JSON object with slide fields: {seq, slide_type, title?, content?, sql_text?, sql_label?, quiz_question?, quiz_options?, quiz_answer?, quiz_explanation?, hints?, presenter_notes?}' },
      },
      required: ['courseId', 'lessonId', 'slide'],
    },
  },
  {
    name: 'build_course_content',
    description: `Build an entire course's lessons and slides in ONE call. This replaces all existing lessons/slides. Use this instead of calling add_course_lesson and add_course_slide individually.

The content parameter is a JSON string containing an array of lessons, each with a slides array:
{
  "lessons": [
    {
      "title": "Lesson Title",
      "description": "What this lesson covers",
      "slides": [
        { "slide_type": "narrative", "title": "...", "content": "markdown..." },
        { "slide_type": "live_demo", "title": "...", "content": "...", "sql_text": "SELECT ...", "sql_label": "Demo" },
        { "slide_type": "quiz", "quiz_question": "...", "quiz_options": ["A","B","C","D"], "quiz_answer": 1, "quiz_explanation": "..." }
      ]
    }
  ]
}`,
    input_schema: {
      type: 'object' as const,
      properties: {
        courseId: { type: 'number', description: 'The course_id to build content for' },
        content: { type: 'string', description: 'JSON string with { lessons: [{ title, description?, slides: [{ slide_type, title?, content?, ... }] }] }' },
      },
      required: ['courseId', 'content'],
    },
  },
  {
    name: 'update_course',
    description: 'Update a course (title, description, category, status)',
    input_schema: {
      type: 'object' as const,
      properties: {
        courseId: { type: 'number', description: 'The course_id to update' },
        title: { type: 'string', description: 'New title' },
        description: { type: 'string', description: 'New description' },
        category: { type: 'string', description: 'Category (e.g., implementation, operations, walkthrough, database)' },
        status: { type: 'string', description: 'Status: draft, published, or archived' },
        track_id: { type: 'number', description: 'Track ID to assign the course to' },
      },
      required: ['courseId'],
    },
  },
];

// ---------------------------------------------------------------------------
// Tool Executor
// ---------------------------------------------------------------------------

export async function executeTool(
  name: string,
  input: Record<string, unknown>,
): Promise<string> {
  switch (name) {
    case 'explore_schema':
      return exploreSchema({
        table: input.table as string | undefined,
        database: input.database as string | undefined,
      });

    case 'run_sql': {
      const result = await runSql(
        input.sql as string,
        (input.database as string) ?? 'qc_core',
      );
      return JSON.stringify(result, null, 2);
    }

    case 'qc_train':
      return qcTrain(input.command as string);

    // ----- Course CRUD -----

    case 'get_course': {
      const course = await apiFetch<unknown>(`/api/v2/courses/${input.courseId}`);
      return JSON.stringify(course, null, 2);
    }

    case 'list_courses': {
      const courses = await apiFetch<unknown[]>('/api/v2/courses');
      return JSON.stringify(courses, null, 2);
    }

    case 'add_course_lesson': {
      const lesson = await apiFetch<unknown>(`/api/v2/courses/${input.courseId}/lessons`, {
        method: 'POST',
        body: JSON.stringify({ seq: input.seq, title: input.title, description: input.description ?? null }),
      });
      return JSON.stringify(lesson, null, 2);
    }

    case 'add_course_slide': {
      const parsed = JSON.parse(input.slide as string) as Record<string, unknown>;
      const result = await apiFetch<unknown>(
        `/api/v2/courses/${input.courseId}/lessons/${input.lessonId}/slides`,
        { method: 'POST', body: JSON.stringify(parsed) },
      );
      return JSON.stringify(result, null, 2);
    }

    case 'build_course_content': {
      let parsed: { lessons: unknown[] };
      try {
        parsed = JSON.parse(input.content as string);
      } catch (parseErr) {
        return `Error: Invalid JSON in content parameter. Check for unescaped quotes or truncated output. Parse error: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`;
      }
      if (!parsed.lessons || !Array.isArray(parsed.lessons) || parsed.lessons.length === 0) {
        return 'Error: content must contain a non-empty "lessons" array. Example: {"lessons":[{"title":"...","slides":[...]}]}';
      }
      const result = await apiFetch<unknown>(`/api/v2/courses/${input.courseId}/build`, {
        method: 'POST',
        body: JSON.stringify({ lessons: parsed.lessons }),
      });
      return JSON.stringify(result, null, 2);
    }

    case 'update_course': {
      const updates: Record<string, unknown> = {};
      for (const key of ['title', 'description', 'category', 'status', 'track_id']) {
        if (input[key] !== undefined) updates[key] = input[key];
      }
      const course = await apiFetch<unknown>(`/api/v2/courses/${input.courseId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return JSON.stringify(course, null, 2);
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
