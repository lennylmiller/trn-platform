import { useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BuildIcon from '@mui/icons-material/Build';
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
 * Supports Plan/Act mode toggle for Claude Code integration.
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
  const [mode, setMode] = useState<'act' | 'plan'>('act');
  const [isPlanning, setIsPlanning] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isCourseAuthoring = systemPromptHint?.startsWith('course-authoring');

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, toolCalls.length]);

  const handlePlan = useCallback(async () => {
    if (!input.trim() || isPlanning) return;
    setIsPlanning(true);
    setPlanError(null);

    try {
      const res = await fetch('/api/v2/chat/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: 'Plan request failed' }));
        throw new Error(body.message ?? `Plan failed: ${res.status}`);
      }

      const data = await res.json();
      // Replace input with the refined prompt — user can edit before sending
      setInput(data.refinedPrompt);
      // Auto-switch to Act mode so the next send executes
      setMode('act');
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : 'Plan failed');
    } finally {
      setIsPlanning(false);
    }
  }, [input, isPlanning]);

  const handleSend = () => {
    if (!input.trim() || isLoading || isPlanning) return;

    if (mode === 'plan') {
      void handlePlan();
      return;
    }

    send(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const busy = isLoading || isPlanning;

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
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          {isCourseAuthoring && (
            <ButtonGroup size="small" variant="outlined">
              <Button
                startIcon={<BuildIcon sx={{ fontSize: 14 }} />}
                variant={mode === 'act' ? 'contained' : 'outlined'}
                onClick={() => setMode('act')}
                sx={{ fontSize: '0.7rem', py: 0.25 }}
              >
                Act
              </Button>
              <Button
                startIcon={<AutoFixHighIcon sx={{ fontSize: 14 }} />}
                variant={mode === 'plan' ? 'contained' : 'outlined'}
                onClick={() => setMode('plan')}
                color={mode === 'plan' ? 'secondary' : 'primary'}
                sx={{ fontSize: '0.7rem', py: 0.25 }}
              >
                Plan
              </Button>
            </ButtonGroup>
          )}
          <IconButton size="small" onClick={reset} title="Clear conversation">
            <DeleteSweepIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      {/* Messages */}
      <Box ref={scrollRef} sx={{ flex: 1, overflow: 'auto', px: 2, py: 1.5 }}>
        {messages.length === 0 && !busy && (
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontStyle: 'italic', textAlign: 'center', mt: 4 }}
          >
            {isCourseAuthoring
              ? mode === 'plan'
                ? 'Describe your rough idea — Claude Code will refine it into a structured prompt.'
                : 'Describe what you want to teach and I\'ll build the lessons and slides.'
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
              Building...
            </Typography>
          </Box>
        )}

        {/* Planning indicator */}
        {isPlanning && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <CircularProgress size={16} color="secondary" />
            <Typography variant="body2" color="secondary">
              Claude Code is refining your prompt...
            </Typography>
          </Box>
        )}

        {/* Error */}
        {(error || planError) && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {error || planError}
          </Typography>
        )}
      </Box>

      {/* Mode hint */}
      {mode === 'plan' && isCourseAuthoring && (
        <Box sx={{ px: 2, py: 0.5, bgcolor: 'secondary.50', borderTop: 1, borderColor: 'secondary.200' }}>
          <Typography variant="caption" color="secondary.main">
            Plan mode — your rough idea will be sent to Claude Code for refinement. The result will appear as an editable draft.
          </Typography>
        </Box>
      )}

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
          placeholder={mode === 'plan'
            ? 'Type a rough idea for Claude Code to refine...'
            : isCourseAuthoring
              ? 'Describe what to teach...'
              : 'Ask about the schema, write SQL, create steps...'}
          multiline
          maxRows={mode === 'plan' ? 8 : 4}
          fullWidth
          size="small"
          disabled={busy}
          slotProps={{
            input: {
              sx: { fontSize: '0.875rem' },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!input.trim() || busy}
          color={mode === 'plan' ? 'secondary' : 'primary'}
          sx={{ minWidth: 44, px: 1 }}
        >
          {mode === 'plan' ? <AutoFixHighIcon fontSize="small" /> : <SendIcon fontSize="small" />}
        </Button>
      </Stack>
    </Box>
  );
}
