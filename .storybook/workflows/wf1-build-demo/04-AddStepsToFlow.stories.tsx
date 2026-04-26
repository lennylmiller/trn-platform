import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, Card, CardContent, Stack, Chip, IconButton, Divider, Paper, Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { mockStepListItems } from '../../mocks/mockData';
import { STEP_TYPE_COLORS } from '@trn-platform/shared';

interface TimelineStep {
  step_id: number;
  label: string;
  type: string;
  seq: number;
}

const AddStepsToFlow = () => {
  const [timeline, setTimeline] = React.useState<TimelineStep[]>([]);

  const addStep = (step: (typeof mockStepListItems)[0]) => {
    setTimeline((prev) => [
      ...prev,
      { step_id: step.step_id, label: step.label, type: step.type, seq: prev.length + 1 },
    ]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Add Steps to Flow</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select steps from the library (left) to add them to the flow timeline (right).
      </Typography>
      <Stack direction="row" spacing={3}>
        {/* Step Library */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Available Steps</Typography>
          <Stack spacing={1}>
            {mockStepListItems.map((step) => (
              <Card key={step.step_id} variant="outlined" sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={step.type} size="small" sx={{ bgcolor: STEP_TYPE_COLORS[step.type], color: '#fff', fontSize: 11 }} />
                      <Typography variant="body2">{step.label}</Typography>
                    </Stack>
                    <IconButton size="small" onClick={() => addStep(step)} color="primary">
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Flow Timeline */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Flow Timeline ({timeline.length} steps)
          </Typography>
          {timeline.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed' }}>
              <Typography color="text.secondary">Click + to add steps from the library</Typography>
            </Paper>
          ) : (
            <Stack spacing={1}>
              {timeline.map((ts, i) => (
                <Card key={`${ts.step_id}-${i}`} variant="outlined">
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <DragIndicatorIcon fontSize="small" color="disabled" />
                      <Chip label={ts.seq} size="small" variant="outlined" />
                      <Chip label={ts.type} size="small" sx={{ bgcolor: STEP_TYPE_COLORS[ts.type], color: '#fff', fontSize: 11 }} />
                      <Typography variant="body2">{ts.label}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
          {timeline.length > 0 && (
            <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => setTimeline([])}>
              Clear All
            </Button>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Build Demo/04 Add Steps to Flow',
  component: AddStepsToFlow,
  tags: ['wf-1', 'domain-flows', 'domain-steps'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
