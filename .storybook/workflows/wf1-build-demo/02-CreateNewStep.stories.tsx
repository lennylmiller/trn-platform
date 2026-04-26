import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, TextField, Button, MenuItem, Select, FormControl, InputLabel,
  Card, CardContent, Stack, Alert,
} from '@mui/material';

const CreateNewStep = () => {
  const [saved, setSaved] = React.useState(false);
  const [form, setForm] = React.useState({
    label: '',
    type: 'sql' as const,
    category: 'setup' as const,
    command_text: '',
    description: '',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>Create New Step</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Fill out the step editor form and save to add a new reusable step to the library.
      </Typography>
      {saved && <Alert severity="success" sx={{ mb: 2 }}>Step created successfully!</Alert>}
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <TextField
              label="Label"
              fullWidth
              required
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={form.type} label="Type" onChange={(e) => setForm({ ...form, type: e.target.value as 'sql' | 'shell' | 'manual' })}>
                <MenuItem value="sql">SQL</MenuItem>
                <MenuItem value="shell">Shell</MenuItem>
                <MenuItem value="manual">Manual</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={form.category} label="Category" onChange={(e) => setForm({ ...form, category: e.target.value as string })}>
                <MenuItem value="setup">Setup</MenuItem>
                <MenuItem value="scenario">Scenario</MenuItem>
                <MenuItem value="sync">Sync</MenuItem>
                <MenuItem value="verify">Verify</MenuItem>
                <MenuItem value="utility">Utility</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <TextField
              label="Command Text"
              fullWidth
              multiline
              minRows={3}
              value={form.command_text}
              onChange={(e) => setForm({ ...form, command_text: e.target.value })}
              slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: 13 } } }}
            />
            <Button variant="contained" onClick={handleSave} disabled={!form.label}>
              Save Step
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Build Demo/02 Create New Step',
  component: CreateNewStep,
  tags: ['wf-1', 'domain-steps'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
