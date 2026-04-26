import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography, TextField, Button, Card, CardContent, Stack, Chip, Alert } from '@mui/material';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';

const AddNoteBlock = () => {
  const [added, setAdded] = React.useState(false);
  const [heading, setHeading] = React.useState('Technical Note: Indexing');
  const [technicalContent, setTechnicalContent] = React.useState('');

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>Add Note Block</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add technical notes that provide deep-dive context. Notes appear in a distinct callout style during presentation.
      </Typography>
      {added && <Alert severity="success" sx={{ mb: 2 }}>Note block added to composition.</Alert>}
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <StickyNote2Icon sx={{ color: '#9c27b0' }} />
            <Chip label="Note" size="small" sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2' }} />
          </Stack>
          <Stack spacing={2}>
            <TextField label="Heading" fullWidth value={heading} onChange={(e) => setHeading(e.target.value)} />
            <TextField
              label="Technical Content"
              fullWidth
              multiline
              minRows={5}
              value={technicalContent}
              onChange={(e) => setTechnicalContent(e.target.value)}
              placeholder="The `member` table uses a composite index on (last_name, first_name)..."
              slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: 13 } } }}
            />
            <TextField label="Presenter Notes (optional)" fullWidth multiline minRows={2} />
            <Button variant="contained" onClick={() => setAdded(true)} disabled={!heading}>Add Note Block</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Author Story/04 Add Note Block',
  component: AddNoteBlock,
  tags: ['wf-3', 'domain-compositions'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
