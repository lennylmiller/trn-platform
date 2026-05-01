import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useExecuteSql } from '@trn-platform/execution-feature';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Ad-hoc SQL scratch pad for the Step Workbench.
 * Lets the user write and run SQL against qc_core, with inline results.
 */
export function SqlScratchPad() {
  const [sql, setSql] = useState('');
  const executeSql = useExecuteSql();

  const handleRun = () => {
    const trimmed = sql.trim();
    if (!trimmed) return;
    executeSql.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* SQL Input + Run button */}
      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', px: 2, pt: 1.5 }}>
        <Box sx={{ flex: 1 }}>
        <TextField
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="SELECT TOP 10 * FROM members"
          multiline
          minRows={3}
          maxRows={6}
          fullWidth
          size="small"
          slotProps={{
            input: {
              sx: { fontFamily: 'monospace', fontSize: '0.8rem' },
            },
          }}
          helperText="Ctrl+Enter to run"
        />
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={executeSql.isPending ? <CircularProgress size={14} color="inherit" /> : <PlayArrowIcon />}
          onClick={handleRun}
          disabled={!sql.trim() || executeSql.isPending}
          sx={{ mt: 0.5, whiteSpace: 'nowrap' }}
        >
          Run SQL
        </Button>
      </Stack>

      {/* Error */}
      {executeSql.isError && (
        <Box sx={{ px: 2, pt: 1 }}>
          <Alert severity="error" variant="outlined" sx={{ py: 0 }}>
            {executeSql.error.message}
          </Alert>
        </Box>
      )}

      {/* Results */}
      {executeSql.data && (
        <Box sx={{ flex: 1, overflow: 'auto', px: 2, pt: 1, pb: 1 }}>
          {executeSql.data.rows.length > 0 ? (
            <TableContainer sx={{ maxHeight: '100%' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {executeSql.data.columns.map((col) => (
                      <TableCell
                        key={col}
                        sx={{ fontWeight: 700, bgcolor: '#fafafa', whiteSpace: 'nowrap' }}
                      >
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {executeSql.data.rows.map((row, rowIdx) => (
                    <TableRow key={rowIdx} hover>
                      {executeSql.data!.columns.map((col) => (
                        <TableCell
                          key={col}
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            whiteSpace: 'nowrap',
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {formatCellValue(row[col])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography sx={{ color: 'text.secondary', py: 1, textAlign: 'center' }}>
              Query returned 0 rows.
            </Typography>
          )}
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {executeSql.data.rowCount} row(s) &middot; {executeSql.data.columns.length} column(s)
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
