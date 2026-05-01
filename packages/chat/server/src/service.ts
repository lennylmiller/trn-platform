/**
 * Chat service — orchestrates Claude API conversations with tool execution.
 *
 * Implements the agentic loop: send messages → if tool_use → execute → continue.
 * All tool execution happens server-side. Max 5 tool rounds.
 */
import Anthropic from '@anthropic-ai/sdk';
import { CHAT_TOOLS, executeTool } from './tools.js';
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

const MAX_TOOL_ROUNDS = 5;

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

/**
 * Run a chat conversation with tool execution.
 *
 * @param messages - Conversation history
 * @param context - Optional domain-specific context
 * @param systemPromptHint - Optional hint appended to the system prompt
 */
export async function chat(
  messages: ChatMessage[],
  context?: Record<string, unknown>,
  systemPromptHint?: string,
): Promise<ChatResult> {
  const anthropic = getClient();
  const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514';
  const toolCalls: ToolCallRecord[] = [];

  // Build system prompt with context
  let hint = systemPromptHint ?? '';
  if (context && Object.keys(context).length > 0) {
    hint += `\n\nUser's current context: ${JSON.stringify(context)}`;
  }
  const systemPrompt = buildSystemPrompt(hint || undefined);

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
      tools: CHAT_TOOLS,
      messages: apiMessages,
    });

    // Check for tool use
    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    );

    if (toolUseBlocks.length === 0 || response.stop_reason === 'end_turn') {
      // Final response — extract text
      const textBlocks = response.content.filter(
        (b): b is Anthropic.TextBlock => b.type === 'text',
      );
      const responseText = textBlocks.map((b) => b.text).join('\n');
      return { response: responseText, toolCalls };
    }

    // Execute tools and continue
    apiMessages.push({ role: 'assistant', content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const toolBlock of toolUseBlocks) {
      let result: string;
      try {
        result = await executeTool(
          toolBlock.name,
          toolBlock.input as Record<string, unknown>,
        );
      } catch (err) {
        result = `Error: ${err instanceof Error ? err.message : String(err)}`;
      }

      toolCalls.push({
        tool: toolBlock.name,
        input: toolBlock.input as Record<string, unknown>,
        result,
      });

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolBlock.id,
        content: result,
      });
    }

    apiMessages.push({ role: 'user', content: toolResults });
  }

  // Exceeded max rounds — return what we have
  return {
    response: 'I reached the maximum number of tool calls. Here is what I found so far.',
    toolCalls,
  };
}
