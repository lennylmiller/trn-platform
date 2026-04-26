import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, Card, CardContent, Stack, Chip, IconButton,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ArticleIcon from '@mui/icons-material/Article';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import { BLOCK_TYPE_LABELS } from '@trn-platform/shared';

const initialBlocks = [
  { id: 1, type: 'narrative' as const, heading: 'Introduction' },
  { id: 2, type: 'flow' as const, heading: 'Hands-On: Database Setup' },
  { id: 3, type: 'note' as const, heading: 'Technical Note: Indexing' },
];

const blockIcons: Record<string, React.ReactNode> = {
  narrative: <ArticleIcon fontSize="small" color="primary" />,
  flow: <PlaylistPlayIcon fontSize="small" color="secondary" />,
  note: <StickyNote2Icon fontSize="small" sx={{ color: '#9c27b0' }} />,
};

const blockColors: Record<string, string> = {
  narrative: '#e3f2fd',
  flow: '#fff3e0',
  note: '#f3e5f5',
};

const ReorderBlocks = () => {
  const [blocks, setBlocks] = React.useState(initialBlocks);

  const move = (index: number, direction: -1 | 1) => {
    const newBlocks = [...blocks];
    const target = index + direction;
    if (target < 0 || target >= newBlocks.length) return;
    [newBlocks[index], newBlocks[target]] = [newBlocks[target], newBlocks[index]];
    setBlocks(newBlocks);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>Reorder Blocks</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Drag or use the arrow buttons to reorder blocks in the composition. The sequence determines presentation order.
      </Typography>
      <Stack spacing={1.5}>
        {blocks.map((block, i) => (
          <Card key={block.id} variant="outlined" sx={{ bgcolor: blockColors[block.type] }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <DragIndicatorIcon fontSize="small" color="disabled" sx={{ cursor: 'grab' }} />
                <Chip label={i + 1} size="small" variant="outlined" />
                {blockIcons[block.type]}
                <Chip label={BLOCK_TYPE_LABELS[block.type]} size="small" variant="outlined" />
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>{block.heading}</Typography>
                <IconButton size="small" onClick={() => move(i, -1)} disabled={i === 0}>
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => move(i, 1)} disabled={i === blocks.length - 1}>
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Author Story/05 Reorder Blocks',
  component: ReorderBlocks,
  tags: ['wf-3', 'domain-compositions'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
