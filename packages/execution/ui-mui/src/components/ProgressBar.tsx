import React from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ExecutionStatus } from '@trn-platform/shared';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProgressBarProps {
  current: number;
  total: number;
  status: ExecutionStatus;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Displays execution progress as a labeled linear progress bar.
 * Shows "Step {current} of {total}" and adjusts color by status.
 */
export function ProgressBar({ current, total, status }: ProgressBarProps) {
  const percent = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const isComplete = status === 'complete';
  const isPaused = status === 'paused';

  const progressColor: 'primary' | 'success' | 'warning' | 'inherit' = isComplete
    ? 'success'
    : isPaused
      ? 'warning'
      : 'primary';

  return (
    <Stack spacing={0.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Step {current} of {total}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {Math.round(percent)}%
        </Typography>
      </Stack>

      <Box sx={{ width: '100%' }}>
        <LinearProgress
          variant="determinate"
          value={percent}
          color={progressColor}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              transition: 'transform 0.4s ease',
            },
          }}
        />
      </Box>

      {/* Step indicator dots */}
      {total <= 20 && total > 0 && (
        <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ mt: 0.5 }}>
          {Array.from({ length: total }, (_, i) => {
            let dotColor: string;
            if (i < current) {
              dotColor = isComplete ? '#4caf50' : '#1976d2';
            } else if (i === current && status === 'running') {
              dotColor = '#90caf9';
            } else if (i === current && isPaused) {
              dotColor = '#ff9800';
            } else {
              dotColor = '#e0e0e0';
            }

            return (
              <Box
                key={i}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: dotColor,
                  transition: 'background-color 0.3s ease',
                }}
              />
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
