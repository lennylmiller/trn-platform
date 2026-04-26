import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, TextField, Button, Card, CardContent, Stack, MenuItem, Select, FormControl, InputLabel, Alert, Chip,
} from '@mui/material';
import { mockSteps } from '../../mocks/mockData';
import { STEP_TYPE_COLORS } from '@trn-platform/shared';

const EditStep = () => {
  const step = mockSteps[1]; // Load member seed data
  const [saved, setSaved] = React.useState(false);
  const [label, setLabel] = React.useState(step.label);
  const [description, setDescription] = React.useState(step.description ?? '');
  const [commandText, setCommandText] = React.useState(step.command_text ?? '');

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>Edit Step</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Modify an existing step. Changes are saved back to the step library.
      </Typography>
      {saved && <Alert severity="success" sx={{ mb: 2 }}>Step updated successfully!</Alert>}
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Chip label={`ID: ${step.step_id}`} size="small" variant="outlined" />
            <Chip label={step.type} size="small" sx={{ bgcolor: STEP_TYPE_COLORS[step.type], color: '#fff' }} />
            {step.is_seed && <Chip label="Seed" size="small" color="info" />}
          </Stack>
          <Stack spacing={2}>
            <TextField label="Label" fullWidth value={label} onChange={(e) => setLabel(e.target.value)} />
            <TextField label="Description" fullWidth multiline minRows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            <TextField
              label="Command Text"
              fullWidth
              multiline
              minRows={3}
              value={commandText}
              onChange={(e) => setCommandText(e.target.value)}
              slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: 13 } } }}
            />
            <Button variant="contained" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}>
              Save Changes
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Manage Steps/02 Edit Step',
  component: EditStep,
  tags: ['wf-5', 'domain-steps'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
