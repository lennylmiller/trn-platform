/**
 * Chat service — orchestrates Claude API conversations with MCP tool execution.
 *
 * Implements the agentic loop: send messages → if tool_use → execute via MCP → continue.
 * Tools come from the trn-platform MCP server (single source of truth).
 * Guardrails (SQL read-only, tool filtering) applied via tool-filter.
 */
import Anthropic from '@anthropic-ai/sdk';
import { getMcpTools, callMcpTool } from './mcp-client.js';
import { filterToolsForChat, validateToolCall } from './tool-filter.js';
import { buildSystemPrompt } from './system-prompt.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ToolCallRecord {
  tool: string;
  input: Record<string, unknown>;
  result: string;
}

export interface ChatResult {
  response: string;
  toolCalls: ToolCallRecord[];
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

const MAX_TOOL_ROUNDS = 25;

let anthropicClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic();
  }
  return anthropicClient;
}

/**
 * Run a chat conversation with MCP-backed tool execution.
 */
export async function chat(
  messages: ChatMessage[],
  context?: Record<string, unknown>,
  systemPromptHint?: string,
): Promise<ChatResult> {
  const anthropic = getClient();
  const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514';
  const toolCalls: ToolCallRecord[] = [];
  let accumulatedText = '';

  // Build system prompt with context
  let hint = systemPromptHint ?? '';
  if (context && Object.keys(context).length > 0) {
    hint += `\n\nUser's current context: ${JSON.stringify(context)}`;
  }
  const systemPrompt = buildSystemPrompt(hint || undefined);

  // Get tools from MCP server, filtered for chat safety
  const allMcpTools = await getMcpTools();
  const chatTools = filterToolsForChat(allMcpTools);

  // Convert to Anthropic format
  const apiMessages: Anthropic.MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 16000,
      system: systemPrompt,
      tools: chatTools,
      messages: apiMessages,
    });

    // Extract any text from this response
    const textBlocks = response.content.filter(
      (b): b is Anthropic.TextBlock => b.type === 'text',
    );
    if (textBlocks.length > 0) {
      accumulatedText += textBlocks.map((b) => b.text).join('\n');
    }

    // Check for tool use
    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    );

    // If no tool calls, we're done
    if (toolUseBlocks.length === 0) {
      return { response: accumulatedText, toolCalls };
    }

    // If stop_reason is end_turn, execute tools then return
    const isFinalRound = response.stop_reason === 'end_turn';

    // Execute tools via MCP
    apiMessages.push({ role: 'assistant', content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const toolBlock of toolUseBlocks) {
      const input = toolBlock.input as Record<string, unknown>;

      // Apply guardrails
      const validationError = validateToolCall(toolBlock.name, input);
      let result: string;

      if (validationError) {
        result = validationError;
      } else {
        try {
          result = await callMcpTool(toolBlock.name, input);
        } catch (err) {
          result = `Error: ${err instanceof Error ? err.message : String(err)}`;
        }
      }

      toolCalls.push({ tool: toolBlock.name, input, result });

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolBlock.id,
        content: result,
      });
    }

    if (isFinalRound) {
      return { response: accumulatedText, toolCalls };
    }

    apiMessages.push({ role: 'user', content: toolResults });
  }

  // Exceeded max rounds
  return {
    response: accumulatedText || 'I used all available tool calls for this turn. Please send another message to continue.',
    toolCalls,
  };
}
