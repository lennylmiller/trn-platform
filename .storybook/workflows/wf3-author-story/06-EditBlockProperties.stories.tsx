import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, TextField, Card, CardContent, Stack, Chip, Divider, Button, Alert,
} from '@mui/material';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';

const EditBlockProperties = () => {
  const [saved, setSaved] = React.useState(false);
  const [heading, setHeading] = React.useState('Hands-On: Database Setup');
  const [notes, setNotes] = React.useState('Run this flow live, pausing at step 2.');

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>Edit Block Properties</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Modify the heading and presenter notes for a block. Each block type has specific editable properties.
      </Typography>
      {saved && <Alert severity="success" sx={{ mb: 2 }}>Block properties saved.</Alert>}
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Chip label="2" size="small" variant="outlined" />
            <PlaylistPlayIcon color="secondary" />
            <Chip label="Flow Block" size="small" color="secondary" variant="outlined" />
            <Typography variant="caption" color="text.secondary">New Hire Onboarding Demo (3 steps)</Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2}>
            <TextField label="Heading" fullWidth value={heading} onChange={(e) => setHeading(e.target.value)} />
            <TextField
              label="Presenter Notes"
              fullWidth
              multiline
              minRows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              helperText="Visible only to the presenter during run mode."
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
  title: 'Workflows/Author Story/06 Edit Block Properties',
  component: EditBlockProperties,
  tags: ['wf-3', 'domain-compositions'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
