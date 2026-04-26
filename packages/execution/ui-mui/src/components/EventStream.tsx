import React, { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SSEEvent {
  type: string;
  data: unknown;
  timestamp: Date;
}

export interface EventStreamProps {
  events: SSEEvent[];
}

// ---------------------------------------------------------------------------
// Event type color map
// ---------------------------------------------------------------------------

const EVENT_COLORS: Record<string, { bg: string; fg: string }> = {
  'execution:start': { bg: '#e3f2fd', fg: '#1565c0' },
  'execution:complete': { bg: '#e8f5e9', fg: '#2e7d32' },
  'step:start': { bg: '#e3f2fd', fg: '#1976d2' },
  'step:output': { bg: '#f5f5f5', fg: '#616161' },
  'step:complete': { bg: '#e8f5e9', fg: '#388e3c' },
  'step:error': { bg: '#ffebee', fg: '#c62828' },
  'step:paused': { bg: '#fff3e0', fg: '#e65100' },
  'status:refresh': { bg: '#f3e5f5', fg: '#7b1fa2' },
};

const DEFAULT_COLOR = { bg: '#f5f5f5', fg: '#424242' };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Real-time event log showing SSE events with timestamps,
 * colored type chips, and a brief data summary.
 */
export function EventStream({ events = [] }: EventStreamProps) {
  const listRef = useRef<HTMLUListElement>(null);

  // Auto-scroll to latest event
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [events.length]);

  if (events.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2, fontStyle: 'italic' }}>
        No events yet. Start an execution to see events stream in.
      </Typography>
    );
  }

  return (
    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
      <List ref={listRef} dense disablePadding>
        {events.map((event, idx) => {
          const colors = EVENT_COLORS[event.type] ?? DEFAULT_COLOR;
          const summary = summarizeData(event.data);

          return (
            <ListItem
              key={idx}
              divider
              sx={{
                alignItems: 'flex-start',
                py: 0.75,
                '&:hover': { bgcolor: '#fafafa' },
              }}
            >
              {/* Timestamp */}
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  color: 'text.secondary',
                  minWidth: 70,
                  flexShrink: 0,
                  mt: 0.25,
                }}
              >
                {formatTime(event.timestamp)}
              </Typography>

              {/* Event type chip */}
              <Chip
                label={event.type}
                size="small"
                sx={{
                  mx: 1,
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  height: 22,
                  bgcolor: colors.bg,
                  color: colors.fg,
                  flexShrink: 0,
                }}
              />

              {/* Data summary */}
              <ListItemText
                primary={summary}
                primaryTypographyProps={{
                  variant: 'body2',
                  sx: {
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: 'text.primary',
                    wordBreak: 'break-word',
                  },
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function summarizeData(data: unknown): string {
  if (data === null || data === undefined) return '';
  if (typeof data === 'string') return data;
  if (typeof data !== 'object') return String(data);

  const obj = data as Record<string, unknown>;

  // Prefer meaningful fields for summary
  const parts: string[] = [];
  if (obj.label) parts.push(String(obj.label));
  if (obj.message) parts.push(String(obj.message));
  if (obj.line) parts.push(String(obj.line));
  if (obj.exitCode !== undefined) parts.push(`exit=${obj.exitCode}`);
  if (obj.stepId !== undefined) parts.push(`step=${obj.stepId}`);

  return parts.length > 0 ? parts.join(' | ') : JSON.stringify(data);
}
