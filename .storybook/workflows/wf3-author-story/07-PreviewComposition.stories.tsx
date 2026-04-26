import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, Card, CardContent, Stack, Chip, Divider, Paper, Button,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { mockCompositionDetail } from '../../mocks/mockData';
import { BLOCK_TYPE_LABELS } from '@trn-platform/shared';

const blockIcons: Record<string, React.ReactNode> = {
  narrative: <ArticleIcon color="primary" />,
  flow: <PlaylistPlayIcon color="secondary" />,
  note: <StickyNote2Icon sx={{ color: '#9c27b0' }} />,
};

const PreviewComposition = () => (
  <Box sx={{ p: 3, maxWidth: 800 }}>
    <Typography variant="h5" gutterBottom>Preview Composition</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      Preview the composition as it will appear in run/presentation mode.
    </Typography>

    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">{mockCompositionDetail.title}</Typography>
            <Typography variant="body2" color="text.secondary">{mockCompositionDetail.description}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip label={mockCompositionDetail.kind} size="small" color="info" />
              <Chip label={`${mockCompositionDetail.blocks.length} blocks`} size="small" variant="outlined" />
            </Stack>
          </Box>
          <Button variant="contained" startIcon={<PlayArrowIcon />}>Present</Button>
        </Stack>
      </CardContent>
    </Card>

    <Stack spacing={2}>
      {mockCompositionDetail.blocks.map((block) => (
        <Card key={block.block_id} variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Chip label={block.seq} size="small" variant="outlined" />
              {blockIcons[block.block_type]}
              <Chip label={BLOCK_TYPE_LABELS[block.block_type]} size="small" variant="outlined" />
              {block.heading && <Typography variant="subtitle2" fontWeight={600}>{block.heading}</Typography>}
            </Stack>
            <Divider sx={{ my: 1 }} />
            {block.block_type === 'narrative' && (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{block.content}</Typography>
            )}
            {block.block_type === 'flow' && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fff8e1' }}>
                <Typography variant="body2" fontWeight={600}>{block.flow_name}</Typography>
                <Typography variant="caption" color="text.secondary">{block.flow_description}</Typography>
                <Chip label={`${block.flow_step_count} steps`} size="small" sx={{ ml: 1 }} />
              </Paper>
            )}
            {block.block_type === 'note' && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f3e5f5', fontFamily: 'monospace', fontSize: 13 }}>
                {block.technical_content}
              </Paper>
            )}
            {block.presenter_notes && (
              <Paper sx={{ mt: 1.5, p: 1, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Typography variant="caption" fontWeight={600}>Presenter Notes: </Typography>
                <Typography variant="caption">{block.presenter_notes}</Typography>
              </Paper>
            )}
          </CardContent>
        </Card>
      ))}
    </Stack>
  </Box>
);

const meta: Meta = {
  title: 'Workflows/Author Story/07 Preview Composition',
  component: PreviewComposition,
  tags: ['wf-3', 'domain-compositions'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
