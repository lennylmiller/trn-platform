import React from 'react';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import StopIcon from '@mui/icons-material/Stop';
import type { ExecutionStatus } from '@trn-platform/shared';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExecutionControlsProps {
  status: ExecutionStatus;
  onStart: () => void;
  onResume: () => void;
  onAbort: () => void;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Status chip colors
// ---------------------------------------------------------------------------

const STATUS_CHIP: Record<
  ExecutionStatus,
  { label: string; color: 'default' | 'primary' | 'warning' | 'success' }
> = {
  idle: { label: 'Idle', color: 'default' },
  running: { label: 'Running', color: 'primary' },
  paused: { label: 'Paused', color: 'warning' },
  complete: { label: 'Complete', color: 'success' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Button group for controlling execution lifecycle:
 * Start/Run, Continue (when paused), Abort, plus a status chip.
 */
export function ExecutionControls({
  status,
  onStart,
  onResume,
  onAbort,
  disabled = false,
}: ExecutionControlsProps) {
  const canStart = status === 'idle' || status === 'complete';
  const canResume = status === 'paused';
  const canAbort = status === 'running' || status === 'paused';
  const chip = STATUS_CHIP[status];

  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Chip
        label={chip.label}
        color={chip.color}
        size="small"
        variant="filled"
        sx={{ fontWeight: 600, minWidth: 80, justifyContent: 'center' }}
      />

      <Button
        variant="contained"
        color="primary"
        size="small"
        startIcon={<PlayArrowIcon />}
        disabled={disabled || !canStart}
        onClick={onStart}
      >
        Run
      </Button>

      <Button
        variant="contained"
        color="warning"
        size="small"
        startIcon={<SkipNextIcon />}
        disabled={disabled || !canResume}
        onClick={onResume}
      >
        Continue
      </Button>

      <Button
        variant="outlined"
        color="error"
        size="small"
        startIcon={<StopIcon />}
        disabled={disabled || !canAbort}
        onClick={onAbort}
      >
        Abort
      </Button>
    </Stack>
  );
}
