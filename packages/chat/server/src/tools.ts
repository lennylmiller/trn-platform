/**
 * Tool definitions and executors for the chat service.
 * Uses the same shared tool executors as the MCP server.
 */
import type Anthropic from '@anthropic-ai/sdk';
import { exploreSchema, runSql, qcTrain } from '@trn-platform/shared/tools';

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

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
