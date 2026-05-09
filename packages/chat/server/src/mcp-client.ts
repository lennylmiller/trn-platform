/**
 * MCP Client — connects the chat service to the trn-platform MCP server.
 *
 * Spawns the MCP server as a child process over stdio, then provides:
 * - getMcpTools(): returns tool definitions in Anthropic format
 * - callMcpTool(name, input): executes a tool and returns the text result
 *
 * Lazy initialization: the MCP server is spawned on first use and reused.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type Anthropic from '@anthropic-ai/sdk';
import path from 'node:path';

let client: Client | null = null;
let cachedTools: Anthropic.Tool[] | null = null;

/**
 * Get or create the MCP client connection.
 * Spawns the MCP server as a child process on first call.
 */
async function getClient(): Promise<Client> {
  if (client) return client;

  // Use process.cwd() — server-dev.cjs always runs from the project root.
  // import.meta.dirname is undefined when loaded via tsx/cjs.
  const projectRoot = process.cwd();
  const envPath = path.join(projectRoot, '.env');

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['tsx', path.join(projectRoot, 'packages/mcp-server/src/index.ts')],
    env: {
      ...process.env,
      DOTENV_CONFIG_PATH: envPath,
    },
  });

  client = new Client({
    name: 'chat-service',
    version: '0.1.0',
  });

  await client.connect(transport);
  console.log('[mcp-client] Connected to trn-platform MCP server');

  return client;
}

/**
 * Get all MCP tools converted to Anthropic Tool format.
 * Cached after first call — tool definitions don't change at runtime.
 */
export async function getMcpTools(): Promise<Anthropic.Tool[]> {
  if (cachedTools) return cachedTools;

  const c = await getClient();
  const result = await c.listTools();

  cachedTools = result.tools.map((tool) => ({
    name: tool.name,
    description: tool.description ?? '',
    input_schema: {
      type: 'object' as const,
      properties: (tool.inputSchema as Record<string, unknown>).properties ?? {},
      required: ((tool.inputSchema as Record<string, unknown>).required ?? []) as string[],
    },
  }));

  console.log(`[mcp-client] Loaded ${cachedTools.length} tools`);
  return cachedTools;
}

/**
 * Call an MCP tool and return the text result.
 */
export async function callMcpTool(
  name: string,
  input: Record<string, unknown>,
): Promise<string> {
  const c = await getClient();

  const result = await c.callTool({
    name,
    arguments: input,
  });

  // Extract text from MCP response content array
  const textParts = (result.content as Array<{ type: string; text?: string }>)
    .filter((c) => c.type === 'text' && c.text)
    .map((c) => c.text!);

  if (result.isError) {
    return `Error: ${textParts.join('\n') || 'Unknown MCP tool error'}`;
  }

  return textParts.join('\n') || '';
}

/**
 * Disconnect the MCP client and kill the child process.
 */
export async function closeMcpClient(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    cachedTools = null;
    console.log('[mcp-client] Disconnected');
  }
}
