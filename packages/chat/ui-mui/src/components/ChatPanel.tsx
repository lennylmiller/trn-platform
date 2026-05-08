import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SendIcon from '@mui/icons-material/Send';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useChatSession } from '@trn-platform/chat-feature';
import { MessageBubble } from './MessageBubble';
import { ToolCallCard } from './ToolCallCard';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatPanelProps {
  /** Domain-specific context sent with each message */
  context?: Record<string, unknown>;
  /** Optional hint appended to the system prompt */
  systemPromptHint?: string;
  /** Called after each assistant response (useful for invalidating queries after AI creates content) */
  onResponse?: () => void;
  /** Called for each tool call in a response — use to detect specific tool executions */
  onToolCall?: (tool: string, input: Record<string, unknown>, result: string) => void;
  /** If provided, chat history persists to localStorage under this key */
  persistKey?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Full chat panel with message list, tool call display, and input.
 * Designed to be embedded as a tab in domain workbenches.
 */
export function ChatPanel({ context, systemPromptHint, onResponse, onToolCall, persistKey }: ChatPanelProps) {
  const { messages, toolCalls, isLoading, error, send, reset } = useChatSession({
    context,
    persistKey,
    onToolCall,
    systemPromptHint,
    onResponse,
  });
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, toolCalls.length]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    send(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          AI Assistant
        </Typography>
        <IconButton size="small" onClick={reset} title="Clear conversation">
          <DeleteSweepIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* Messages */}
      <Box ref={scrollRef} sx={{ flex: 1, overflow: 'auto', px: 2, py: 1.5 }}>
        {messages.length === 0 && !isLoading && (
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontStyle: 'italic', textAlign: 'center', mt: 4 }}
          >
            {systemPromptHint?.startsWith('course-authoring')
              ? 'Describe what you want to teach and I\'ll build the lessons and slides.'
              : 'Ask me to help write SQL, explore the schema, create steps, or run qc-train commands.'}
          </Typography>
        )}

        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}

        {/* Tool calls — shown after the last assistant message */}
        {toolCalls.length > 0 && (
          <Box sx={{ mt: 1, mb: 1 }}>
            {toolCalls.map((tc, idx) => (
              <ToolCallCard key={idx} toolCall={tc} />
            ))}
          </Box>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              Thinking...
            </Typography>
          </Box>
        )}

        {/* Error */}
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Box>

      {/* Input */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider' }}
      >
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={systemPromptHint?.startsWith('course-authoring')
            ? 'Describe what to teach...'
            : 'Ask about the schema, write SQL, create steps...'}
          multiline
          maxRows={4}
          fullWidth
          size="small"
          disabled={isLoading}
          slotProps={{
            input: {
              sx: { fontSize: '0.875rem' },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          sx={{ minWidth: 44, px: 1 }}
        >
          <SendIcon fontSize="small" />
        </Button>
      </Stack>
    </Box>
  );
}
