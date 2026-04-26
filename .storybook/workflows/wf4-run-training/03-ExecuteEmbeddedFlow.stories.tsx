import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, Card, CardContent, Stack, Chip, Button, LinearProgress, Paper,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { mockFlowDetail } from '../../mocks/mockData';
import { STEP_TYPE_COLORS } from '@trn-platform/shared';

const ExecuteEmbeddedFlow = () => {
  const [stepIndex, setStepIndex] = React.useState(-1);
  const running = stepIndex >= 0;
  const complete = stepIndex >= mockFlowDetail.steps.length;

  return (
    <Box sx={{ p: 3, maxWidth: 700 }}>
      <Typography variant="h5" gutterBottom>Execute Embedded Flow</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        An inline flow is embedded in the composition. Execute it step by step during the training session.
      </Typography>

      <Card variant="outlined" sx={{ mb: 2, bgcolor: '#fff8e1' }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary">Embedded Flow</Typography>
          <Typography variant="h6">{mockFlowDetail.name}</Typography>
          {running && !complete && (
            <LinearProgress variant="determinate" value={((stepIndex + 1) / mockFlowDetail.steps.length) * 100} sx={{ mt: 1, borderRadius: 1, height: 6 }} />
          )}
        </CardContent>
      </Card>

      <Stack spacing={1}>
        {mockFlowDetail.steps.map((step, i) => (
          <Card key={step.flow_step_id} variant="outlined" sx={{ opacity: running && i > stepIndex ? 0.5 : 1 }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" spacing={1} alignItems="center">
                {running && i <= stepIndex ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid', borderColor: 'divider' }} />
                )}
                <Chip label={step.seq} size="small" variant="outlined" />
                <Chip label={step.type} size="small" sx={{ bgcolor: STEP_TYPE_COLORS[step.type], color: '#fff', fontSize: 11 }} />
                <Typography variant="body2">{step.label}</Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Box sx={{ mt: 2 }}>
        {!running && (
          <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => setStepIndex(0)}>
            Run Flow
          </Button>
        )}
        {running && !complete && (
          <Button variant="contained" onClick={() => setStepIndex((i) => i + 1)}>
            Execute Next Step
          </Button>
        )}
        {complete && (
          <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Typography variant="subtitle2">All steps complete! Continue to the next block.</Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Run Training/03 Execute Embedded Flow',
  component: ExecuteEmbeddedFlow,
  tags: ['wf-4', 'domain-execution', 'domain-flows'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
