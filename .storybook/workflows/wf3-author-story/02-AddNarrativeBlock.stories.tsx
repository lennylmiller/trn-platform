import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, TextField, Button, Card, CardContent, Stack, Chip, Alert,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';

const AddNarrativeBlock = () => {
  const [added, setAdded] = React.useState(false);
  const [heading, setHeading] = React.useState('Introduction');
  const [content, setContent] = React.useState('');

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>Add Narrative Block</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add prose content to your composition. Narrative blocks provide context and explanation between hands-on flow blocks.
      </Typography>
      {added && <Alert severity="success" sx={{ mb: 2 }}>Narrative block added to composition.</Alert>}
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <ArticleIcon color="primary" />
            <Chip label="Narrative" size="small" color="primary" variant="outlined" />
          </Stack>
          <Stack spacing={2}>
            <TextField label="Heading" fullWidth value={heading} onChange={(e) => setHeading(e.target.value)} />
            <TextField
              label="Content (Markdown)"
              fullWidth
              multiline
              minRows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Welcome to QC Training&#10;&#10;This tutorial walks new hires through the core claims processing workflow..."
              slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: 13 } } }}
            />
            <TextField label="Presenter Notes (optional)" fullWidth multiline minRows={2} />
            <Button variant="contained" onClick={() => setAdded(true)} disabled={!heading}>Add Block</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Author Story/02 Add Narrative Block',
  component: AddNarrativeBlock,
  tags: ['wf-3', 'domain-compositions'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
