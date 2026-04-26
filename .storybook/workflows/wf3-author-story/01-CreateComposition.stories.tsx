import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, TextField, Button, Card, CardContent, Stack, MenuItem, Select, FormControl, InputLabel, Alert,
} from '@mui/material';

const CreateComposition = () => {
  const [created, setCreated] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [kind, setKind] = React.useState('tutorial');
  const [description, setDescription] = React.useState('');

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>Create Composition</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Start a new story, tutorial, or module. Compositions combine narrative blocks, embedded flows, and technical notes into a structured training experience.
      </Typography>
      {created ? (
        <Alert severity="success">Composition &quot;{title}&quot; created! Add blocks to build your content.</Alert>
      ) : (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <TextField label="Title" fullWidth required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Claims Processing Deep Dive" />
              <FormControl fullWidth>
                <InputLabel>Kind</InputLabel>
                <Select value={kind} label="Kind" onChange={(e) => setKind(e.target.value)}>
                  <MenuItem value="story">Story</MenuItem>
                  <MenuItem value="tutorial">Tutorial</MenuItem>
                  <MenuItem value="module">Module</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Description" fullWidth multiline minRows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
              <Button variant="contained" onClick={() => setCreated(true)} disabled={!title}>Create Composition</Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Author Story/01 Create Composition',
  component: CreateComposition,
  tags: ['wf-3', 'domain-compositions'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
