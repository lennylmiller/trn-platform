import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, Card, CardContent, Stack, Button, LinearProgress, Chip, Paper,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import { STEP_TYPE_COLORS } from '@trn-platform/shared';

const steps = [
  { label: 'Create training database', type: 'sql', status: 'complete' as const },
  { label: 'Load member seed data', type: 'sql', status: 'paused' as const },
  { label: 'Verify claim counts', type: 'sql', status: 'pending' as const },
];

const consoleLines = [
  { time: '10:00:01', text: '[step 1] CREATE DATABASE qc_training', stream: 'stdout' },
  { time: '10:00:01', text: '[step 1] Database created successfully.', stream: 'stdout' },
  { time: '10:00:02', text: '[step 1] Display query: Verify DB', stream: 'stdout' },
  { time: '10:00:02', text: '  name: qc_training', stream: 'stdout' },
  { time: '10:00:02', text: '[step 1] Complete (120ms)', stream: 'stdout' },
  { time: '10:00:03', text: '[step 2] INSERT INTO member ...', stream: 'stdout' },
  { time: '10:00:03', text: '[step 2] 1 row affected', stream: 'stdout' },
  { time: '10:00:03', text: '[step 2] PAUSED - waiting for presenter', stream: 'stderr' },
];

const TestRunFlow = () => {
  const [running, setRunning] = React.useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Test Run Flow</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Execute the flow and observe console output. The flow pauses at step 2 for the presenter.
      </Typography>
      <Stack direction="row" spacing={3}>
        {/* Step progress */}
        <Box sx={{ width: 300 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Steps</Typography>
          <Stack spacing={1}>
            {steps.map((s, i) => (
              <Card key={i} variant="outlined" sx={{ borderColor: s.status === 'paused' ? 'warning.main' : undefined }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {s.status === 'complete' && <CheckCircleIcon color="success" fontSize="small" />}
                    {s.status === 'paused' && <PauseCircleIcon color="warning" fontSize="small" />}
                    {s.status === 'pending' && <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid', borderColor: 'divider' }} />}
                    <Chip label={s.type} size="small" sx={{ bgcolor: STEP_TYPE_COLORS[s.type], color: '#fff', fontSize: 11 }} />
                    <Typography variant="body2" sx={{ fontWeight: s.status === 'paused' ? 600 : 400 }}>{s.label}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
          {!running ? (
            <Button variant="contained" startIcon={<PlayArrowIcon />} sx={{ mt: 2 }} fullWidth onClick={() => setRunning(true)}>
              Run Flow
            </Button>
          ) : (
            <Button variant="outlined" color="warning" sx={{ mt: 2 }} fullWidth onClick={() => setRunning(false)}>
              Continue Past Pause
            </Button>
          )}
        </Box>

        {/* Console output */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Console Output</Typography>
          {running && <LinearProgress sx={{ mb: 1 }} />}
          <Paper
            variant="outlined"
            sx={{
              bgcolor: '#1e1e1e', color: '#d4d4d4', p: 2, fontFamily: 'monospace', fontSize: 12,
              minHeight: 300, maxHeight: 400, overflow: 'auto',
            }}
          >
            {running ? consoleLines.map((line, i) => (
              <Box key={i} sx={{ color: line.stream === 'stderr' ? '#f48771' : '#d4d4d4' }}>
                <Box component="span" sx={{ color: '#6a9955', mr: 1 }}>{line.time}</Box>
                {line.text}
              </Box>
            )) : (
              <Typography sx={{ color: '#6a9955', fontFamily: 'monospace', fontSize: 12 }}>
                Click &quot;Run Flow&quot; to start execution...
              </Typography>
            )}
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Build Demo/06 Test Run Flow',
  component: TestRunFlow,
  tags: ['wf-1', 'domain-execution'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
