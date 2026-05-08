/**
 * Chat service — orchestrates Claude API conversations with tool execution.
 *
 * Implements the agentic loop: send messages → if tool_use → execute → continue.
 * All tool execution happens server-side.
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

const MAX_TOOL_ROUNDS = 25;

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
  let accumulatedText = '';

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

    // If stop_reason is end_turn, Claude is done — but we still execute any pending tools
    // and return the accumulated text
    const isFinalRound = response.stop_reason === 'end_turn';

    // Execute tools
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

    // If Claude said end_turn, return now with the accumulated text
    if (isFinalRound) {
      return { response: accumulatedText, toolCalls };
    }

    apiMessages.push({ role: 'user', content: toolResults });
  }

  // Exceeded max rounds — return accumulated text instead of generic message
  return {
    response: accumulatedText || 'I used all available tool calls for this turn. Please send another message to continue.',
    toolCalls,
  };
}
