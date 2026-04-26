import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Chip, IconButton, Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { mockStepListItems } from '../../mocks/mockData';
import { STEP_TYPE_COLORS, STEP_CATEGORY_LABELS } from '@trn-platform/shared';

const ViewStepLibrary = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h5" gutterBottom>View Step Library</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Browse all steps in the library with management actions: edit, test, or delete.
    </Typography>
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Label</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Seed</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockStepListItems.map((step) => (
            <TableRow key={step.step_id} hover>
              <TableCell>{step.step_id}</TableCell>
              <TableCell>{step.label}</TableCell>
              <TableCell>
                <Chip label={step.type} size="small" sx={{ bgcolor: STEP_TYPE_COLORS[step.type], color: '#fff', fontSize: 11 }} />
              </TableCell>
              <TableCell>
                <Chip label={STEP_CATEGORY_LABELS[step.category]} size="small" variant="outlined" />
              </TableCell>
              <TableCell>{step.is_seed ? 'Yes' : 'No'}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="info"><PlayArrowIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" disabled={step.is_seed}><DeleteIcon fontSize="small" /></IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

const meta: Meta = {
  title: 'Workflows/Manage Steps/01 View Step Library',
  component: ViewStepLibrary,
  tags: ['wf-5', 'domain-steps'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
