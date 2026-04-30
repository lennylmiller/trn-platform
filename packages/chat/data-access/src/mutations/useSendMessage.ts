import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../client';

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

export interface ChatResponse {
  response: string;
  toolCalls: ToolCallRecord[];
}

export interface SendMessageParams {
  messages: ChatMessage[];
  context?: Record<string, unknown>;
  systemPromptHint?: string;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Send a message to the chat API and get a response with tool execution results.
 */
export function useSendMessage() {
  return useMutation<ChatResponse, Error, SendMessageParams>({
    mutationFn: async (params: SendMessageParams) => {
      return apiFetch<ChatResponse>('/api/v2/chat', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },
  });
}
