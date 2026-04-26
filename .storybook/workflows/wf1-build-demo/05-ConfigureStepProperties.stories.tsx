import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, Card, CardContent, Stack, Switch, FormControlLabel, TextField, Divider, Chip,
} from '@mui/material';
import { STEP_TYPE_COLORS } from '@trn-platform/shared';

const ConfigureStepProperties = () => {
  const [pauseAfter, setPauseAfter] = React.useState(true);
  const [visible, setVisible] = React.useState(true);
  const [notes, setNotes] = React.useState('Pause here to discuss the member schema with the audience.');

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>Configure Step Properties</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure per-step properties within a flow: pause points, presenter notes, and visibility.
      </Typography>
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Chip label="2" size="small" variant="outlined" />
            <Chip label="sql" size="small" sx={{ bgcolor: STEP_TYPE_COLORS.sql, color: '#fff' }} />
            <Typography variant="subtitle1" fontWeight={600}>Load member seed data</Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2}>
            <FormControlLabel
              control={<Switch checked={pauseAfter} onChange={(e) => setPauseAfter(e.target.checked)} />}
              label="Pause after this step"
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: -1.5, ml: 6 }}>
              Execution will pause after this step completes, waiting for the presenter to continue.
            </Typography>
            <FormControlLabel
              control={<Switch checked={visible} onChange={(e) => setVisible(e.target.checked)} />}
              label="Visible in execution"
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: -1.5, ml: 6 }}>
              When unchecked, this step runs silently without showing output to the audience.
            </Typography>
            <TextField
              label="Presenter Notes"
              fullWidth
              multiline
              minRows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              helperText="Notes visible only to the presenter during execution."
            />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Build Demo/05 Configure Step Properties',
  component: ConfigureStepProperties,
  tags: ['wf-1', 'domain-flows'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
