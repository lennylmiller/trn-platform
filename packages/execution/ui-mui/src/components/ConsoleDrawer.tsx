import React, { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConsoleLine {
  line: string;
  stream: 'stdout' | 'stderr';
  timestamp: Date;
}

export interface ConsoleDrawerProps {
  open: boolean;
  onClose: () => void;
  lines: ConsoleLine[];
  onClear?: () => void;
  anchor?: 'bottom' | 'right';
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const CONSOLE_BG = '#1e1e1e';
const STDOUT_COLOR = '#e0e0e0';
const STDERR_COLOR = '#ef5350';
const TIMESTAMP_COLOR = '#616161';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A terminal-style drawer that displays streaming output lines.
 * stdout lines render in light gray; stderr lines in red.
 * Auto-scrolls to the bottom when new lines arrive.
 */
export function ConsoleDrawer({
  open,
  onClose,
  lines = [],
  onClear,
  anchor = 'bottom',
}: ConsoleDrawerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new lines arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines.length]);

  const drawerWidth = anchor === 'right' ? 520 : '100%';
  const drawerHeight = anchor === 'bottom' ? 360 : '100%';

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: drawerWidth,
          height: drawerHeight,
          bgcolor: CONSOLE_BG,
          color: STDOUT_COLOR,
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1, borderBottom: '1px solid #333' }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#90caf9' }}
        >
          Console Output
        </Typography>
        <Stack direction="row" spacing={0.5}>
          {onClear && (
            <IconButton
              size="small"
              onClick={onClear}
              title="Clear console"
              sx={{ color: '#757575', '&:hover': { color: '#e0e0e0' } }}
            >
              <DeleteSweepIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={onClose}
            title="Close console"
            sx={{ color: '#757575', '&:hover': { color: '#e0e0e0' } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      {/* Output Area */}
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          px: 2,
          py: 1,
          fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", monospace',
          fontSize: '0.8rem',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {lines.length === 0 && (
          <Typography
            variant="body2"
            sx={{ color: '#616161', fontFamily: 'monospace', fontStyle: 'italic' }}
          >
            Waiting for output...
          </Typography>
        )}
        {lines.map((entry, idx) => (
          <Box
            key={idx}
            component="div"
            sx={{
              color: entry.stream === 'stderr' ? STDERR_COLOR : STDOUT_COLOR,
              display: 'flex',
              gap: 1.5,
            }}
          >
            <Box
              component="span"
              sx={{ color: TIMESTAMP_COLOR, flexShrink: 0, userSelect: 'none' }}
            >
              {formatTime(entry.timestamp)}
            </Box>
            <Box component="span">{entry.line}</Box>
          </Box>
        ))}
      </Box>
    </Drawer>
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
