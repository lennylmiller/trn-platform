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
  // Step CRUD tools (via Express API)
  // -------------------------------------------------------------------------

  server.tool(
    'list_steps',
    'List all steps in the step library, optionally filtered by category and/or story',
    {
      category: z.string().optional().describe('Filter by category: setup, scenario, sync, verify, utility'),
      story: z.string().optional().describe('Filter by story: garcia, miller, or omit for all'),
    },
    async ({ category, story }) => {
      const searchParams = new URLSearchParams();
      if (category) searchParams.set('category', category);
      if (story) searchParams.set('story', story);
      const qs = searchParams.toString();
      const params = qs ? `?${qs}` : '';
      const steps = await apiFetch<unknown[]>(`/api/v2/steps${params}`);
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(steps, null, 2),
        }],
      };
    },
  );

  server.tool(
    'get_step',
    'Get a single step by ID with full details including command_text and display_queries',
    {
      stepId: z.number().describe('The step_id to retrieve'),
    },
    async ({ stepId }) => {
      const step = await apiFetch<unknown>(`/api/v2/steps/${stepId}`);
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(step, null, 2),
        }],
      };
    },
  );

  server.tool(
    'create_step',
    'Create a new step in the step library',
    {
      label: z.string().describe('Human-readable step name'),
      type: z.enum(['shell', 'sql', 'manual']).describe('Step type'),
      category: z.enum(['setup', 'scenario', 'sync', 'verify', 'utility']).describe('Step category'),
      command_text: z.string().optional().describe('The shell command or SQL to execute'),
      description: z.string().optional().describe('User-facing description'),
      display_queries: z.string().optional().describe('JSON array of {label, sql} objects for result display'),
      story: z.string().optional().describe('Story grouping: garcia, miller, or omit for common'),
    },
    async ({ label, type, category, command_text, description, display_queries, story }) => {
      const body: Record<string, unknown> = { label, type, category };
      if (command_text) body.command_text = command_text;
      if (description) body.description = description;
      if (display_queries) {
        body.display_queries = JSON.parse(display_queries);
      }
      if (story) body.story = story;

      const step = await apiFetch<unknown>('/api/v2/steps', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(step, null, 2),
        }],
      };
    },
  );

  server.tool(
    'update_step',
    'Update an existing step by ID',
    {
      stepId: z.number().describe('The step_id to update'),
      label: z.string().optional().describe('New label'),
      type: z.enum(['shell', 'sql', 'manual']).optional().describe('New type'),
      category: z.enum(['setup', 'scenario', 'sync', 'verify', 'utility']).optional().describe('New category'),
      command_text: z.string().optional().describe('New command text'),
      description: z.string().optional().describe('New description'),
      display_queries: z.string().optional().describe('New display queries JSON'),
      story: z.string().optional().describe('Story grouping: garcia, miller, or omit to keep current'),
    },
    async ({ stepId, label, type, category, command_text, description, display_queries, story }) => {
      const body: Record<string, unknown> = {};
      if (label !== undefined) body.label = label;
      if (type !== undefined) body.type = type;
      if (category !== undefined) body.category = category;
      if (command_text !== undefined) body.command_text = command_text;
      if (description !== undefined) body.description = description;
      if (display_queries !== undefined) {
        body.display_queries = JSON.parse(display_queries);
      }
      if (story !== undefined) body.story = story;

      const step = await apiFetch<unknown>(`/api/v2/steps/${stepId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(step, null, 2),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Execution tool
  // -------------------------------------------------------------------------

  server.tool(
    'run_step',
    'Execute a step by ID. Kicks off execution and returns the execution ID. Output streams via SSE.',
    {
      stepId: z.number().describe('The step_id to execute'),
    },
    async ({ stepId }) => {
      const result = await apiFetch<{ executionId: string; stepId: number; type: string }>(
        `/api/v2/execute/step/${stepId}`,
        { method: 'POST' },
      );
      return {
        content: [{
          type: 'text' as const,
          text: `Execution started: ${JSON.stringify(result, null, 2)}\n\nNote: Output streams via SSE at /api/v2/execute/events. Check the console in the QC Training app for live output.`,
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Browse tools (via Express API)
  // -------------------------------------------------------------------------

  server.tool(
    'list_flows',
    'List all flows',
    {},
    async () => {
      const flows = await apiFetch<unknown[]>('/api/v2/flows');
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(flows, null, 2),
        }],
      };
    },
  );

  server.tool(
    'list_compositions',
    'List all compositions',
    {},
    async () => {
      const compositions = await apiFetch<unknown[]>('/api/v2/compositions');
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(compositions, null, 2),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Story tools (via Express API)
  // -------------------------------------------------------------------------

  server.tool(
    'list_stories',
    'List all stories with their status (draft, planning, authoring, review, complete)',
    {},
    async () => {
      const stories = await apiFetch<unknown[]>('/api/v2/stories');
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(stories, null, 2),
        }],
      };
    },
  );

  server.tool(
    'get_story',
    'Get a story by ID with its full plan (ordered list of plan items with status)',
    {
      storyId: z.number().describe('The story_id to retrieve'),
    },
    async ({ storyId }) => {
      const story = await apiFetch<unknown>(`/api/v2/stories/${storyId}`);
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(story, null, 2),
        }],
      };
    },
  );

  server.tool(
    'create_story',
    'Create a new story (training narrative). Provide a short identifier, title, and description.',
    {
      story_ud: z.string().describe('Short identifier (e.g. "miller", "johnson"). Used to tag steps.'),
      title: z.string().describe('Display title (e.g. "Miller Family")'),
      description: z.string().optional().describe('The narrative premise'),
    },
    async ({ story_ud, title, description }) => {
      const story = await apiFetch<unknown>('/api/v2/stories', {
        method: 'POST',
        body: JSON.stringify({ story_ud, title, description }),
      });
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(story, null, 2),
        }],
      };
    },
  );

  server.tool(
    'update_story',
    'Update a story (status, title, description, or link flow/composition)',
    {
      storyId: z.number().describe('The story_id to update'),
      status: z.string().optional().describe('New status: draft, planning, authoring, review, complete'),
      title: z.string().optional().describe('New title'),
      description: z.string().optional().describe('New description'),
      flow_id: z.number().optional().describe('Link the produced flow'),
      composition_id: z.number().optional().describe('Link the produced composition'),
    },
    async ({ storyId, ...updates }) => {
      const body: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(updates)) {
        if (v !== undefined) body[k] = v;
      }
      const story = await apiFetch<unknown>(`/api/v2/stories/${storyId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(story, null, 2),
        }],
      };
    },
  );

  server.tool(
    'add_plan_items',
    'Add plan items to a story. Each item is a blueprint for a step to author.',
    {
      storyId: z.number().describe('The story_id to add items to'),
      items: z.string().describe('JSON array of plan items: [{seq, act?, title, description?, tables_involved?: string[]}]'),
    },
    async ({ storyId, items }) => {
      const parsed = JSON.parse(items) as unknown[];
      const result = await apiFetch<unknown>(`/api/v2/stories/${storyId}/plan`, {
        method: 'POST',
        body: JSON.stringify(parsed),
      });
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    },
  );

  server.tool(
    'update_plan_item',
    'Update a plan item (change status, link a step_id, update description)',
    {
      storyId: z.number().describe('The story_id'),
      planItemId: z.number().describe('The plan_item_id to update'),
      status: z.string().optional().describe('New status: pending, in_progress, done, skipped'),
      step_id: z.number().optional().describe('Link to a created step'),
      title: z.string().optional().describe('Updated title'),
      description: z.string().optional().describe('Updated description'),
    },
    async ({ storyId, planItemId, ...updates }) => {
      const body: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(updates)) {
        if (v !== undefined) body[k] = v;
      }
      const item = await apiFetch<unknown>(`/api/v2/stories/${storyId}/plan/${planItemId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(item, null, 2),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Course tools (via Express API)
  // -------------------------------------------------------------------------

  server.tool(
    'list_courses',
    'List all training courses with section and slide counts',
    {},
    async () => {
      const courses = await apiFetch<unknown[]>('/api/v2/courses');
      return { content: [{ type: 'text' as const, text: JSON.stringify(courses, null, 2) }] };
    },
  );

  server.tool(
    'get_course',
    'Get a course by ID with all sections and slides',
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
    },
    async ({ title, description, category }) => {
      const course = await apiFetch<unknown>('/api/v2/courses', {
        method: 'POST',
        body: JSON.stringify({ title, description, category }),
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(course, null, 2) }] };
    },
  );

  server.tool(
    'add_course_section',
    'Add a section (chapter/act) to a course',
    {
      courseId: z.number().describe('The course_id'),
      seq: z.number().describe('Order within the course (1, 2, 3...)'),
      title: z.string().describe('Section title'),
      description: z.string().optional().describe('Section description'),
    },
    async ({ courseId, seq, title, description }) => {
      const section = await apiFetch<unknown>(`/api/v2/courses/${courseId}/sections`, {
        method: 'POST',
        body: JSON.stringify({ seq, title, description }),
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(section, null, 2) }] };
    },
  );

  server.tool(
    'add_course_slide',
    'Add a slide to a course section. slide_type determines which fields are used.',
    {
      courseId: z.number().describe('The course_id'),
      sectionId: z.number().describe('The section_id'),
      slide: z.string().describe('JSON object with slide fields: {seq, slide_type, title?, content?, sql_text?, sql_label?, verify_mode?, expected_json?, quiz_question?, quiz_options?, quiz_answer?, quiz_explanation?, hints?, presenter_notes?, image_url?}'),
    },
    async ({ courseId, sectionId, slide }) => {
      const parsed = JSON.parse(slide) as Record<string, unknown>;
      const result = await apiFetch<unknown>(`/api/v2/courses/${courseId}/sections/${sectionId}/slides`, {
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

  return server;
}
