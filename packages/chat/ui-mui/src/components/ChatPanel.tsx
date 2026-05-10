import { useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BuildIcon from '@mui/icons-material/Build';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import SendIcon from '@mui/icons-material/Send';
import WidthWideIcon from '@mui/icons-material/WidthWide';
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
  /** Called after each assistant response */
  onResponse?: () => void;
  /** Called for each tool call in a response */
  onToolCall?: (tool: string, input: Record<string, unknown>, result: string) => void;
  /** If provided, chat history persists to localStorage */
  persistKey?: string;
  /** Collapse the panel (hide it) */
  onCollapse?: () => void;
  /** Expand to wide/full mode */
  onResize?: (size: 'default' | 'wide' | 'full') => void;
  /** Current size mode */
  size?: 'default' | 'wide' | 'full';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChatPanel({ context, systemPromptHint, onResponse, onToolCall, persistKey, onCollapse, onResize, size = 'default' }: ChatPanelProps) {
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
  const isExpanded = size === 'wide' || size === 'full';

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
      setInput(data.refinedPrompt);
      setMode('act');
      // Auto-expand to wide so the user can comfortably read the refined prompt
      if (size === 'default' && onResize) onResize('wide');
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : 'Plan failed');
    } finally {
      setIsPlanning(false);
    }
  }, [input, isPlanning, size, onResize]);

  const handleSend = () => {
    if (!input.trim() || isLoading || isPlanning) return;
    if (mode === 'plan') { void handlePlan(); return; }
    send(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const cycleSize = () => {
    if (!onResize) return;
    if (size === 'default') onResize('wide');
    else if (size === 'wide') onResize('full');
    else onResize('default');
  };

  const busy = isLoading || isPlanning;
  const maxInputRows = size === 'full' ? 20 : size === 'wide' ? 12 : mode === 'plan' ? 8 : 4;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 0.75,
          borderBottom: 1,
          borderColor: 'divider',
          minHeight: 40,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          AI Assistant
        </Typography>
        <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
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
          {onResize && (
            <Tooltip title={size === 'default' ? 'Widen' : size === 'wide' ? 'Full width' : 'Default width'}>
              <IconButton size="small" onClick={cycleSize}>
                {size === 'full' ? <CloseFullscreenIcon sx={{ fontSize: 16 }} /> : size === 'wide' ? <OpenInFullIcon sx={{ fontSize: 16 }} /> : <WidthWideIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            </Tooltip>
          )}
          {onCollapse && (
            <Tooltip title="Collapse panel">
              <IconButton size="small" onClick={onCollapse}>
                <ChevronRightIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Clear conversation">
            <IconButton size="small" onClick={reset}>
              <DeleteSweepIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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

        {toolCalls.length > 0 && (
          <Box sx={{ mt: 1, mb: 1 }}>
            {toolCalls.map((tc, idx) => (
              <ToolCallCard key={idx} toolCall={tc} />
            ))}
          </Box>
        )}

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">Building...</Typography>
          </Box>
        )}

        {isPlanning && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <CircularProgress size={16} color="secondary" />
            <Typography variant="body2" color="secondary">We're refining your prompt...</Typography>
          </Box>
        )}

        {(error || planError) && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>{error || planError}</Typography>
        )}
      </Box>

      {/* Mode hint */}
      {mode === 'plan' && isCourseAuthoring && (
        <Box sx={{ px: 2, py: 0.5, bgcolor: 'secondary.50', borderTop: 1, borderColor: 'secondary.200' }}>
          <Typography variant="caption" color="secondary.main">
            Plan mode — your rough idea will be sent to Claude Code for refinement.
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
          maxRows={maxInputRows}
          fullWidth
          size="small"
          disabled={busy}
          slotProps={{
            input: {
              sx: { fontSize: isExpanded ? '0.95rem' : '0.875rem' },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!input.trim() || busy}
          color={mode === 'plan' ? 'secondary' : 'primary'}
          sx={{ minWidth: 44, px: 1, alignSelf: 'flex-end' }}
        >
          {mode === 'plan' ? <AutoFixHighIcon fontSize="small" /> : <SendIcon fontSize="small" />}
        </Button>
      </Stack>
    </Box>
  );
}
