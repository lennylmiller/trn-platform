import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Paper, Stack, Chip, CircularProgress,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { mockSqlResult } from '../../mocks/mockData';

const RunSqlQuery = () => {
  const [sql, setSql] = React.useState('SELECT member_id, first_name, last_name, status\nFROM qc_training.dbo.member\nWHERE status = \'active\'');
  const [running, setRunning] = React.useState(false);
  const [result, setResult] = React.useState<typeof mockSqlResult | null>(null);

  const handleRun = () => {
    setRunning(true);
    setResult(null);
    setTimeout(() => {
      setRunning(false);
      setResult(mockSqlResult);
    }, 800);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900 }}>
      <Typography variant="h5" gutterBottom>Run SQL Query</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Execute ad-hoc SQL queries against the training database (qc_training or qc_core).
      </Typography>

      <TextField
        fullWidth
        multiline
        minRows={4}
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        placeholder="Enter SQL query..."
        slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: 13 } } }}
        sx={{ mb: 2 }}
      />

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button variant="contained" startIcon={running ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />} onClick={handleRun} disabled={running || !sql.trim()}>
          {running ? 'Executing...' : 'Run Query'}
        </Button>
        {result && <Chip label={`${result.rowCount} rows returned`} size="small" color="success" />}
      </Stack>

      {result && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                {result.columns.map((col) => (
                  <TableCell key={col} sx={{ fontWeight: 700, fontSize: 12 }}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {result.rows.map((row, ri) => (
                <TableRow key={ri} sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  {result.columns.map((col) => (
                    <TableCell key={col} sx={{ fontSize: 12, fontFamily: 'monospace' }}>{String(row[col])}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Standalone/Run SQL Query',
  component: RunSqlQuery,
  tags: ['standalone', 'domain-execution'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
