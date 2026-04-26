import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, Card, CardContent, Stack, Chip, Button, Paper,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { mockSteps } from '../../mocks/mockData';
import { STEP_TYPE_COLORS } from '@trn-platform/shared';

const TestStep = () => {
  const step = mockSteps[3]; // Verify claim counts
  const [executed, setExecuted] = React.useState(false);

  return (
    <Box sx={{ p: 3, maxWidth: 700 }}>
      <Typography variant="h5" gutterBottom>Test Step</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Execute a single step in isolation to verify it works correctly before adding it to a flow.
      </Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Chip label={step.type} size="small" sx={{ bgcolor: STEP_TYPE_COLORS[step.type], color: '#fff' }} />
            <Typography variant="subtitle1" fontWeight={600}>{step.label}</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{step.description}</Typography>
          <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace', fontSize: 12 }}>
            {step.command_text}
          </Paper>
        </CardContent>
      </Card>

      {!executed ? (
        <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => setExecuted(true)}>
          Execute Step
        </Button>
      ) : (
        <Stack spacing={2}>
          <Card variant="outlined" sx={{ borderColor: 'success.main' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <CheckCircleIcon color="success" />
                <Typography variant="subtitle2">Execution Successful (750ms)</Typography>
              </Stack>
              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace', fontSize: 12 }}>
                {'> SELECT COUNT(*) AS claim_count FROM qc_core.dbo.claim WHERE status = 1;\n\nclaim_count\n-----------\n320\n\n(1 row affected)'}
              </Paper>
            </CardContent>
          </Card>

          {step.display_queries && step.display_queries.length > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Display Queries</Typography>
                {step.display_queries.map((dq, i) => (
                  <Box key={i} sx={{ mb: 1 }}>
                    <Chip label={dq.label} size="small" color="info" sx={{ mb: 0.5 }} />
                    <Paper variant="outlined" sx={{ p: 1, bgcolor: '#f5f5f5', fontFamily: 'monospace', fontSize: 11 }}>
                      {dq.sql}
                    </Paper>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          <Button variant="outlined" onClick={() => setExecuted(false)}>Run Again</Button>
        </Stack>
      )}
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Manage Steps/03 Test Step',
  component: TestStep,
  tags: ['wf-5', 'domain-steps', 'domain-execution'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
