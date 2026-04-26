import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, Card, CardContent, Stack, Chip, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, Paper, Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { mockSqlResult } from '../../mocks/mockData';

const ViewResults = () => (
  <Box sx={{ p: 3, maxWidth: 800 }}>
    <Typography variant="h5" gutterBottom>View Results</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Execution complete. Review the results of each step, including display query output.
    </Typography>

    <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
      All 3 steps completed successfully in 1.2s total.
    </Alert>

    <Stack spacing={2}>
      {['Create training database', 'Load member seed data', 'Verify claim counts'].map((label, i) => (
        <Card key={i} variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <CheckCircleIcon color="success" fontSize="small" />
              <Chip label={i + 1} size="small" variant="outlined" />
              <Typography variant="subtitle2">{label}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                {[120, 340, 750][i]}ms
              </Typography>
            </Stack>
            {i === 2 && (
              <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {mockSqlResult.columns.map((col) => (
                        <TableCell key={col} sx={{ fontWeight: 600, fontSize: 12 }}>{col}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockSqlResult.rows.map((row, ri) => (
                      <TableRow key={ri}>
                        {mockSqlResult.columns.map((col) => (
                          <TableCell key={col} sx={{ fontSize: 12 }}>{String(row[col])}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      ))}
    </Stack>
  </Box>
);

const meta: Meta = {
  title: 'Workflows/Present Flow/04 View Results',
  component: ViewResults,
  tags: ['wf-2', 'domain-execution'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
