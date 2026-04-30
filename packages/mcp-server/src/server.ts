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

  return server;
}
