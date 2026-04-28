import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, Paper, Stack, Chip, LinearProgress, Button,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

/**
 * Execution console page composing execution domain components.
 * Since execution ui-mui is not yet scaffolded, this page renders
 * a representative console + controls layout directly.
 */
const ExecutionConsolePage = () => {
  const [status, setStatus] = React.useState<'idle' | 'running' | 'paused' | 'complete'>('running');

  const consoleLines = [
    { time: '10:00:01', text: '[step 1] CREATE DATABASE qc_training', stream: 'stdout' as const },
    { time: '10:00:01', text: '[step 1] Database created successfully.', stream: 'stdout' as const },
    { time: '10:00:02', text: '[step 1] Complete (120ms)', stream: 'stdout' as const },
    { time: '10:00:03', text: '[step 2] INSERT INTO member ...', stream: 'stdout' as const },
    { time: '10:00:03', text: '[step 2] 1 row affected', stream: 'stdout' as const },
    { time: '10:00:03', text: '[step 2] PAUSED', stream: 'stderr' as const },
  ];

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6">Execution Console</Typography>
            <Chip
              label={status.toUpperCase()}
              size="small"
              color={status === 'running' ? 'primary' : status === 'paused' ? 'warning' : status === 'complete' ? 'success' : 'default'}
            />
          </Stack>
          {/* Controls */}
          <Stack direction="row" spacing={1}>
            {status === 'idle' && (
              <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => setStatus('running')}>Run</Button>
            )}
            {status === 'running' && (
              <Button variant="outlined" startIcon={<PauseIcon />} onClick={() => setStatus('paused')}>Pause</Button>
            )}
            {status === 'paused' && (
              <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => setStatus('running')}>Continue</Button>
            )}
            {status === 'complete' && (
              <Button variant="outlined" onClick={() => setStatus('idle')}>Reset</Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Progress bar */}
      {status === 'running' && <LinearProgress />}
      {status === 'paused' && <LinearProgress variant="determinate" value={66} color="warning" />}
      {status === 'complete' && <LinearProgress variant="determinate" value={100} color="success" />}

      {/* Console output */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Paper
          sx={{
            m: 2, p: 2, bgcolor: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace', fontSize: 12,
            minHeight: '100%', borderRadius: 2,
          }}
        >
          {consoleLines.map((line, i) => (
            <Box key={i} sx={{ color: line.stream === 'stderr' ? '#f48771' : '#d4d4d4', lineHeight: 1.8 }}>
              <Box component="span" sx={{ color: '#6a9955', mr: 1 }}>{line.time}</Box>
              {line.text}
            </Box>
          ))}
          {status === 'running' && (
            <Box sx={{ color: '#569cd6', mt: 1 }}>Executing...</Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

const meta: Meta = {
  title: 'Pages/WF4 Run Training/Execution Console Page',
  component: ExecutionConsolePage,
  parameters: { layout: 'fullscreen' },
  tags: ['page', 'wf-4', 'domain-execution'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
