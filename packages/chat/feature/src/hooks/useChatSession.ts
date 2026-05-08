import { useCallback, useEffect, useReducer } from 'react';
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
  | { type: 'RESET' }
  | { type: 'RESTORE'; messages: ChatMessage[]; toolCalls: ToolCallRecord[] };

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

    case 'RESTORE':
      return { ...initialState, messages: action.messages, toolCalls: action.toolCalls };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

function storageKey(persistKey: string): string {
  return `chat-session:${persistKey}`;
}

function saveToStorage(key: string, messages: ChatMessage[], toolCalls: ToolCallRecord[]) {
  try {
    localStorage.setItem(storageKey(key), JSON.stringify({ messages, toolCalls }));
  } catch { /* quota exceeded — ignore */ }
}

function loadFromStorage(key: string): { messages: ChatMessage[]; toolCalls: ToolCallRecord[] } | null {
  try {
    const raw = localStorage.getItem(storageKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.messages)) return parsed;
  } catch { /* corrupt — ignore */ }
  return null;
}

function clearStorage(key: string) {
  try { localStorage.removeItem(storageKey(key)); } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Manages a chat session: message history, loading state, and sends messages
 * to the chat API with optional context.
 *
 * If `persistKey` is provided, chat history is saved to localStorage and
 * restored on mount. Use the courseId or a stable identifier as the key.
 */
export function useChatSession(options?: {
  context?: Record<string, unknown>;
  systemPromptHint?: string;
  onResponse?: () => void;
  persistKey?: string;
}) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const sendMutation = useSendMessage();

  // Restore from localStorage on mount
  useEffect(() => {
    if (!options?.persistKey) return;
    const saved = loadFromStorage(options.persistKey);
    if (saved && saved.messages.length > 0) {
      dispatch({ type: 'RESTORE', messages: saved.messages, toolCalls: saved.toolCalls });
    }
  }, [options?.persistKey]);

  // Save to localStorage on state change
  useEffect(() => {
    if (!options?.persistKey) return;
    if (state.messages.length === 0) return;
    saveToStorage(options.persistKey, state.messages, state.toolCalls);
  }, [state.messages, state.toolCalls, options?.persistKey]);

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
            options?.onResponse?.();
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
    if (options?.persistKey) clearStorage(options.persistKey);
  }, [options?.persistKey]);

  return {
    messages: state.messages,
    toolCalls: state.toolCalls,
    isLoading: state.isLoading,
    error: state.error,
    send,
    reset,
  };
}
