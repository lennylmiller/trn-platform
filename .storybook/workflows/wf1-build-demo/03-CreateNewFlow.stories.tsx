import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography, TextField, Button, Card, CardContent, Stack, Alert } from '@mui/material';

const CreateNewFlow = () => {
  const [created, setCreated] = React.useState(false);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleCreate = () => {
    setCreated(true);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>Create New Flow</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create an empty flow that you can populate with steps from the library.
      </Typography>
      {created ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          Flow &quot;{name}&quot; created! Proceed to add steps.
        </Alert>
      ) : (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <TextField
                label="Flow Name"
                fullWidth
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., New Hire Onboarding Demo"
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                minRows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this flow demonstrate?"
              />
              <Button variant="contained" onClick={handleCreate} disabled={!name}>
                Create Flow
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Build Demo/03 Create New Flow',
  component: CreateNewFlow,
  tags: ['wf-1', 'domain-flows'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
