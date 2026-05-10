/**
 * Tool filtering and guardrails for the chat service.
 *
 * The MCP server exposes 30+ tools. The chat service (browser-facing)
 * should only expose a safe subset. This module filters tools and
 * validates tool calls before execution.
 */
import type Anthropic from '@anthropic-ai/sdk';

/**
 * Tools allowed in the chat service.
 * Everything else from the MCP server is filtered out.
 */
const ALLOWED_TOOLS = new Set([
  // SQL tools (with read-only guard applied at validation time)
  'explore_schema',
  'run_sql',
  'qc_train',

  // Course CRUD
  'list_courses',
  'get_course',
  'create_course',
  'add_course_lesson',
  'add_course_block',
  'build_course_content',
  'update_course',

  // Templates
  'list_templates',
  'get_template',
  'apply_template',
]);

/**
 * Filter MCP tools to only those safe for browser-facing chat.
 * Strips out step/flow/composition/story tools.
 */
export function filterToolsForChat(allTools: Anthropic.Tool[]): Anthropic.Tool[] {
  return allTools.filter((t) => ALLOWED_TOOLS.has(t.name));
}

/**
 * Validate a tool call before execution.
 * Returns null if valid, or an error message string if blocked.
 */
export function validateToolCall(
  name: string,
  input: Record<string, unknown>,
): string | null {
  // SQL read-only guard
  if (name === 'run_sql') {
    const sql = ((input.sql as string) ?? '').trim();
    const firstWord = sql.split(/\s/)[0]?.toUpperCase() ?? '';
    if (!['SELECT', 'WITH'].includes(firstWord)) {
      return `Blocked: The chat service only allows SELECT queries. You tried to run a ${firstWord} statement. Use course CRUD tools to modify data.`;
    }
  }

  return null; // Valid
}
