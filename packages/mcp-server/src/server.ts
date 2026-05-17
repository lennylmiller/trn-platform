/**
 * MCP Server for TRN Platform.
 *
 * Exposes tools for schema exploration, SQL execution, qc-train.sh commands,
 * and step/flow/composition CRUD via the Express API.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { exploreSchema, runSql, qcTrain } from '@trn-platform/shared/tools';
import { apiFetch } from './util/api-client.js';

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'trn-platform',
    version: '0.1.0',
  });

  // -------------------------------------------------------------------------
  // Direct SQL tools
  // -------------------------------------------------------------------------

  server.tool(
    'explore_schema',
    'List all tables in qc_core/qc_training, or describe a specific table (columns, PKs, types)',
    {
      table: z.string().optional().describe('Table name to describe. Omit to list all tables.'),
      database: z.string().optional().describe('Database name: "qc_core" (default) or "qc_training"'),
    },
    async ({ table, database }) => {
      const result = await exploreSchema({ table, database });
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.tool(
    'run_sql',
    'Execute a SQL query against qc_core or qc_training and return results',
    {
      sql: z.string().describe('The SQL query to execute'),
      database: z.string().optional().describe('Database name: "qc_core" (default) or "qc_training"'),
    },
    async ({ sql, database }) => {
      const result = await runSql(sql, database ?? 'qc_core');
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Shell wrapper tool
  // -------------------------------------------------------------------------

  server.tool(
    'qc_train',
    'Run a qc-train.sh command (setup, teardown, reset, status, verify, scenario, sync, etc.)',
    {
      command: z.string().describe('Command to run, e.g. "setup", "status", "verify qcap", "scenario new", "sync --preview"'),
    },
    async ({ command }) => {
      const output = await qcTrain(command);
      return { content: [{ type: 'text' as const, text: output }] };
    },
  );

  // -------------------------------------------------------------------------
  // Course tools (via Express API)
  // -------------------------------------------------------------------------

  server.tool(
    'list_courses',
    'List all training courses with lesson and slide counts',
    {},
    async () => {
      const courses = await apiFetch<unknown[]>('/api/v2/courses');
      return { content: [{ type: 'text' as const, text: JSON.stringify(courses, null, 2) }] };
    },
  );

  server.tool(
    'get_course',
    'Get a course by ID with all lessons and slides',
    { courseId: z.number().describe('The course_id to retrieve') },
    async ({ courseId }) => {
      const course = await apiFetch<unknown>(`/api/v2/courses/${courseId}`);
      return { content: [{ type: 'text' as const, text: JSON.stringify(course, null, 2) }] };
    },
  );

  server.tool(
    'create_course',
    'Create a new training course',
    {
      title: z.string().describe('Course title'),
      description: z.string().optional().describe('Course description'),
      category: z.string().optional().describe('Category: database, reports, enrollment, etc.'),
      track_id: z.number().optional().describe('Track ID to assign to'),
    },
    async ({ title, description, category, track_id }) => {
      const course = await apiFetch<unknown>('/api/v2/courses', {
        method: 'POST',
        body: JSON.stringify({ title, description, category, track_id }),
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(course, null, 2) }] };
    },
  );

  server.tool(
    'add_course_lesson',
    'Add a lesson (chapter/act) to a course',
    {
      courseId: z.number().describe('The course_id'),
      seq: z.number().describe('Order within the course (1, 2, 3...)'),
      title: z.string().describe('Lesson title'),
      description: z.string().optional().describe('Lesson description'),
    },
    async ({ courseId, seq, title, description }) => {
      const lesson = await apiFetch<unknown>(`/api/v2/courses/${courseId}/lessons`, {
        method: 'POST',
        body: JSON.stringify({ seq, title, description }),
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(lesson, null, 2) }] };
    },
  );

  server.tool(
    'add_course_block',
    'Add a slide to a course lesson. block_type determines which fields are used.',
    {
      courseId: z.number().describe('The course_id'),
      lessonId: z.number().describe('The lesson_id'),
      slide: z.string().describe('JSON object with slide fields: {seq, block_type, title?, content?, sql_text?, sql_label?, verify_mode?, expected_json?, quiz_question?, quiz_options?, quiz_answer?, quiz_explanation?, hints?, presenter_notes?, image_url?}'),
    },
    async ({ courseId, lessonId, slide }) => {
      const parsed = JSON.parse(slide) as Record<string, unknown>;
      const result = await apiFetch<unknown>(`/api/v2/courses/${courseId}/lessons/${lessonId}/slides`, {
        method: 'POST',
        body: JSON.stringify(parsed),
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'update_course',
    'Update a course (title, description, category, status)',
    {
      courseId: z.number().describe('The course_id to update'),
      title: z.string().optional().describe('New title'),
      description: z.string().optional().describe('New description'),
      category: z.string().optional().describe('New category'),
      status: z.string().optional().describe('New status: draft, published, archived'),
    },
    async ({ courseId, ...updates }) => {
      const body: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(updates)) {
        if (v !== undefined) body[k] = v;
      }
      const course = await apiFetch<unknown>(`/api/v2/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(course, null, 2) }] };
    },
  );

  server.tool(
    'build_course_content',
    'Build an entire course\'s lessons and slides in ONE call. Replaces all existing content. Pass a JSON string with the full structure.',
    {
      courseId: z.number().describe('The course_id to build content for'),
      content: z.string().describe('JSON string: { "lessons": [{ "title": "...", "description": "...", "slides": [{ "block_type": "narrative", "title": "...", "content": "..." }, ...] }] }'),
    },
    async ({ courseId, content }) => {
      let parsed: { lessons: unknown[] };
      try {
        parsed = JSON.parse(content);
      } catch (err) {
        return { content: [{ type: 'text' as const, text: `Error: Invalid JSON. ${err instanceof Error ? err.message : String(err)}` }] };
      }
      if (!parsed.lessons || !Array.isArray(parsed.lessons) || parsed.lessons.length === 0) {
        return { content: [{ type: 'text' as const, text: 'Error: content must contain a non-empty "lessons" array.' }] };
      }
      const result = await apiFetch<unknown>(`/api/v2/courses/${courseId}/build`, {
        method: 'POST',
        body: JSON.stringify({ lessons: parsed.lessons }),
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  // -------------------------------------------------------------------------
  // Template tools
  // -------------------------------------------------------------------------

  server.tool(
    'list_templates',
    'List available course templates with descriptions and parameters',
    {},
    async () => {
      const templates = await apiFetch<unknown[]>('/api/v2/courses/templates');
      return { content: [{ type: 'text' as const, text: JSON.stringify(templates, null, 2) }] };
    },
  );

  server.tool(
    'get_template',
    'Get a course template by name — returns the full YAML structure with lessons, slides, and placeholder tags',
    {
      templateName: z.string().describe('Template filename without extension (e.g., "implementation", "walkthrough")'),
    },
    async ({ templateName }) => {
      const template = await apiFetch<unknown>(`/api/v2/courses/templates/${templateName}`);
      return { content: [{ type: 'text' as const, text: JSON.stringify(template, null, 2) }] };
    },
  );

  server.tool(
    'apply_template',
    'Apply a course template to a course — creates lessons and slides with content and placeholder tags. Parameters like {{topic}} and {{family}} are substituted.',
    {
      courseId: z.number().describe('The course_id to apply the template to'),
      templateName: z.string().describe('Template name (e.g., "implementation", "walkthrough")'),
      parameters: z.string().describe('JSON object with parameter values: {"topic": "Claim Adjudication", "family": "Borgia-TRAIN", "tables": "claim, claim_procedure"}'),
    },
    async ({ courseId, templateName, parameters }) => {
      let params: Record<string, string> = {};
      try { params = JSON.parse(parameters); } catch { /* ignore */ }
      const result = await apiFetch<unknown>(`/api/v2/courses/${courseId}/apply-template`, {
        method: 'POST',
        body: JSON.stringify({ templateName, parameters: params }),
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  return server;
}
