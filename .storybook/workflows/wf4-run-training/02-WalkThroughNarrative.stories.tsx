import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography, Paper, Button, Stack, Chip, LinearProgress } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';

const WalkThroughNarrative = () => {
  const [currentBlock, setCurrentBlock] = React.useState(0);
  const narrativeContent = [
    {
      heading: 'Introduction',
      content: 'Welcome to QC Training.\n\nThis tutorial walks new hires through the core claims processing workflow. By the end, you will understand how member data flows through the system from enrollment to adjudication.',
    },
    {
      heading: 'What You Will Learn',
      content: 'In this session we will cover:\n\n1. Database setup and initialization\n2. Member data loading and verification\n3. Claims adjudication pipeline\n4. Reporting and status queries',
    },
  ];

  const block = narrativeContent[currentBlock];

  return (
    <Box sx={{ p: 3, maxWidth: 700 }}>
      <Typography variant="h5" gutterBottom>Walk Through Narrative</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Read through narrative blocks in the composition. Navigate between blocks using the controls below.
      </Typography>
      <LinearProgress variant="determinate" value={((currentBlock + 1) / narrativeContent.length) * 100} sx={{ mb: 2, borderRadius: 1, height: 6 }} />
      <Chip label={`Block ${currentBlock + 1} of ${narrativeContent.length}`} size="small" sx={{ mb: 2 }} />

      <Paper variant="outlined" sx={{ p: 3, minHeight: 200 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <ArticleIcon color="primary" />
          <Typography variant="h6">{block.heading}</Typography>
        </Stack>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{block.content}</Typography>
      </Paper>

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button variant="outlined" disabled={currentBlock === 0} onClick={() => setCurrentBlock((c) => c - 1)}>
          Previous
        </Button>
        <Button variant="contained" disabled={currentBlock === narrativeContent.length - 1} onClick={() => setCurrentBlock((c) => c + 1)}>
          Next
        </Button>
      </Stack>
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Run Training/02 Walk Through Narrative',
  component: WalkThroughNarrative,
  tags: ['wf-4', 'domain-compositions'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
