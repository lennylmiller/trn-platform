import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Chip, Stack,
} from '@mui/material';
import { mockSqlResult } from '../../mocks/mockData';

const ViewSqlResults = () => (
  <Box sx={{ p: 3, maxWidth: 800 }}>
    <Typography variant="h5" gutterBottom>View SQL Results</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      See the results of display queries executed during the flow. Results are shown in a data grid.
    </Typography>

    <Stack spacing={3}>
      <Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Chip label="Display Query" size="small" color="info" />
          <Typography variant="subtitle2">Member Verification</Typography>
        </Stack>
        <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#1e1e1e', mb: 1.5, fontFamily: 'monospace', fontSize: 12, color: '#d4d4d4' }}>
          SELECT member_id, first_name, last_name, status FROM qc_training.dbo.member
        </Paper>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                {mockSqlResult.columns.map((col) => (
                  <TableCell key={col} sx={{ fontWeight: 700, fontSize: 12 }}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {mockSqlResult.rows.map((row, ri) => (
                <TableRow key={ri} sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  {mockSqlResult.columns.map((col) => (
                    <TableCell key={col} sx={{ fontSize: 12, fontFamily: 'monospace' }}>{String(row[col])}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {mockSqlResult.rowCount} rows returned
        </Typography>
      </Box>

      <Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Chip label="Display Query" size="small" color="info" />
          <Typography variant="subtitle2">Active Claims Count</Typography>
        </Stack>
        <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#1e1e1e', mb: 1.5, fontFamily: 'monospace', fontSize: 12, color: '#d4d4d4' }}>
          SELECT COUNT(*) AS cnt FROM qc_core.dbo.claim WHERE status = 1
        </Paper>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>cnt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>320</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>1 row returned</Typography>
      </Box>
    </Stack>
  </Box>
);

const meta: Meta = {
  title: 'Workflows/Run Training/04 View SQL Results',
  component: ViewSqlResults,
  tags: ['wf-4', 'domain-execution'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
