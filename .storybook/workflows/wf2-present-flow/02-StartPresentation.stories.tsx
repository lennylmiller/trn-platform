import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, Card, CardContent, Stack, Chip, LinearProgress, Button, Divider, Paper,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { mockFlowDetail } from '../../mocks/mockData';
import { STEP_TYPE_COLORS } from '@trn-platform/shared';

const StartPresentation = () => {
  const [started, setStarted] = React.useState(false);

  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h5" gutterBottom>Start Presentation</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter run mode for the selected flow. The presentation view shows step progress and console output.
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">{mockFlowDetail.name}</Typography>
          <Typography variant="body2" color="text.secondary">{mockFlowDetail.description}</Typography>
          <Chip label={`${mockFlowDetail.steps.length} steps`} size="small" sx={{ mt: 1 }} />
        </CardContent>
      </Card>

      {!started ? (
        <Button variant="contained" size="large" startIcon={<PlayArrowIcon />} onClick={() => setStarted(true)}>
          Begin Presentation
        </Button>
      ) : (
        <>
          <LinearProgress variant="determinate" value={33} sx={{ mb: 2, borderRadius: 1, height: 8 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Step 1 of {mockFlowDetail.steps.length} running...</Typography>
          <Stack spacing={1}>
            {mockFlowDetail.steps.map((step, i) => (
              <Paper key={step.flow_step_id} variant="outlined" sx={{ p: 2, borderLeft: 4, borderColor: i === 0 ? 'primary.main' : 'divider' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={step.seq} size="small" variant="outlined" />
                  <Chip label={step.type} size="small" sx={{ bgcolor: STEP_TYPE_COLORS[step.type], color: '#fff', fontSize: 11 }} />
                  <Typography variant="body2" fontWeight={i === 0 ? 600 : 400}>{step.label}</Typography>
                  {step.pause_after && <Chip label="Pause" size="small" color="warning" variant="outlined" />}
                </Stack>
                {i === 0 && (
                  <Paper sx={{ mt: 1, p: 1.5, bgcolor: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace', fontSize: 12 }}>
                    Executing: {step.command_text}
                  </Paper>
                )}
              </Paper>
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Present Flow/02 Start Presentation',
  component: StartPresentation,
  tags: ['wf-2', 'domain-execution'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
