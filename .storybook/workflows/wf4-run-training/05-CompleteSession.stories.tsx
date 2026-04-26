import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, Card, CardContent, Stack, Chip, Paper, Button, Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import { mockCompositionDetail } from '../../mocks/mockData';
import { BLOCK_TYPE_LABELS } from '@trn-platform/shared';

const CompleteSession = () => (
  <Box sx={{ p: 3, maxWidth: 700 }}>
    <Typography variant="h5" gutterBottom>Complete Session</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      The training session is complete. Review what was covered and export or restart.
    </Typography>

    <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.light', color: 'success.contrastText', textAlign: 'center' }}>
      <CheckCircleIcon sx={{ fontSize: 48, mb: 1 }} />
      <Typography variant="h6" fontWeight={600}>Session Complete!</Typography>
      <Typography variant="body2">{mockCompositionDetail.title}</Typography>
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
        <Stack alignItems="center">
          <Typography variant="h5" fontWeight={700}>3</Typography>
          <Typography variant="caption">Blocks</Typography>
        </Stack>
        <Stack alignItems="center">
          <Typography variant="h5" fontWeight={700}>1</Typography>
          <Typography variant="caption">Flow Executed</Typography>
        </Stack>
        <Stack alignItems="center">
          <Typography variant="h5" fontWeight={700}>3</Typography>
          <Typography variant="caption">Steps Run</Typography>
        </Stack>
      </Stack>
    </Paper>

    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Blocks Completed</Typography>
    <Stack spacing={1} sx={{ mb: 3 }}>
      {mockCompositionDetail.blocks.map((block) => (
        <Card key={block.block_id} variant="outlined">
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleIcon color="success" fontSize="small" />
              <Chip label={block.seq} size="small" variant="outlined" />
              <Chip label={BLOCK_TYPE_LABELS[block.block_type]} size="small" variant="outlined" />
              <Typography variant="body2">{block.heading ?? 'Untitled block'}</Typography>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>

    <Divider sx={{ mb: 2 }} />
    <Stack direction="row" spacing={2}>
      <Button variant="contained">Start New Session</Button>
      <Button variant="outlined">Return to Library</Button>
    </Stack>
  </Box>
);

const meta: Meta = {
  title: 'Workflows/Run Training/05 Complete Session',
  component: CompleteSession,
  tags: ['wf-4', 'domain-compositions', 'domain-execution'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
