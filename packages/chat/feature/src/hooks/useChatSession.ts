import { useCallback, useReducer } from 'react';
import { useSendMessage } from '@trn-platform/chat-data-access';
import type { ChatMessage, ToolCallRecord } from '@trn-platform/chat-data-access';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface ChatSessionState {
  messages: ChatMessage[];
  toolCalls: ToolCallRecord[];
  isLoading: boolean;
  error?: string;
}

type ChatAction =
  | { type: 'ADD_USER_MESSAGE'; content: string }
  | { type: 'ADD_ASSISTANT_MESSAGE'; content: string; toolCalls: ToolCallRecord[] }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'RESET' };

const initialState: ChatSessionState = {
  messages: [],
  toolCalls: [],
  isLoading: false,
  error: undefined,
};

function chatReducer(state: ChatSessionState, action: ChatAction): ChatSessionState {
  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, { role: 'user', content: action.content }],
        error: undefined,
      };

    case 'ADD_ASSISTANT_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, { role: 'assistant', content: action.content }],
        toolCalls: [...state.toolCalls, ...action.toolCalls],
        isLoading: false,
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };

    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Manages a chat session: message history, loading state, and sends messages
 * to the chat API with optional context.
 */
export function useChatSession(options?: {
  context?: Record<string, unknown>;
  systemPromptHint?: string;
}) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const sendMutation = useSendMessage();

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      dispatch({ type: 'ADD_USER_MESSAGE', content: trimmed });
      dispatch({ type: 'SET_LOADING', loading: true });

      const allMessages: ChatMessage[] = [
        ...state.messages,
        { role: 'user' as const, content: trimmed },
      ];

      sendMutation.mutate(
        {
          messages: allMessages,
          context: options?.context,
          systemPromptHint: options?.systemPromptHint,
        },
        {
          onSuccess: (data) => {
            dispatch({
              type: 'ADD_ASSISTANT_MESSAGE',
              content: data.response,
              toolCalls: data.toolCalls,
            });
          },
          onError: (err) => {
            dispatch({ type: 'SET_ERROR', error: err.message });
          },
        },
      );
    },
    [state.messages, sendMutation, options?.context, options?.systemPromptHint],
  );

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    messages: state.messages,
    toolCalls: state.toolCalls,
    isLoading: state.isLoading,
    error: state.error,
    send,
    reset,
  };
}
