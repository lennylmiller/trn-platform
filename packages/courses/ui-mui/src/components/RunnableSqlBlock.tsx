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
import RestoreIcon from '@mui/icons-material/Restore';
import { useExecuteSql } from '@trn-platform/courses-data-access';

export interface RunnableSqlBlockProps {
  sql: string;
  label?: string;
  database?: string;
}

/**
 * An editable, runnable SQL block with inline results.
 * The learner can modify the query and re-run it.
 */
export function RunnableSqlBlock({ sql: originalSql, label }: RunnableSqlBlockProps) {
  const [currentSql, setCurrentSql] = useState(originalSql);
  const executeSql = useExecuteSql();
  const isModified = currentSql !== originalSql;

  const handleRun = () => {
    const trimmed = currentSql.trim();
    if (!trimmed) return;
    executeSql.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleRun();
    }
  };

  return (
    <Box sx={{ my: 2, border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
      {/* Header */}
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          px: 2,
          py: 1,
          bgcolor: '#1e1e1e',
          borderBottom: '1px solid #333',
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontFamily: 'monospace', color: '#90caf9', fontWeight: 700, flex: 1 }}
        >
          {label ?? 'SQL'} {isModified && '(modified)'}
        </Typography>
        {isModified && (
          <Button
            size="small"
            startIcon={<RestoreIcon />}
            onClick={() => setCurrentSql(originalSql)}
            sx={{ color: '#757575', textTransform: 'none', mr: 1 }}
          >
            Reset
          </Button>
        )}
        <Button
          size="small"
          variant="contained"
          startIcon={executeSql.isPending ? <CircularProgress size={14} color="inherit" /> : <PlayArrowIcon />}
          onClick={handleRun}
          disabled={!currentSql.trim() || executeSql.isPending}
          sx={{ textTransform: 'none' }}
        >
          Run
        </Button>
      </Stack>

      {/* SQL Editor */}
      <TextField
        value={currentSql}
        onChange={(e) => setCurrentSql(e.target.value)}
        onKeyDown={handleKeyDown}
        multiline
        fullWidth
        variant="standard"
        slotProps={{
          input: {
            disableUnderline: true,
            sx: {
              fontFamily: '"Cascadia Code", "Fira Code", monospace',
              fontSize: '0.85rem',
              lineHeight: 1.6,
              p: 2,
              bgcolor: '#1e1e1e',
              color: '#e0e0e0',
            },
          },
        }}
      />

      {/* Error */}
      {executeSql.isError && (
        <Alert severity="error" variant="filled" sx={{ borderRadius: 0 }}>
          {executeSql.error.message}
        </Alert>
      )}

      {/* Results */}
      {executeSql.data && (
        <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
          {executeSql.data.rows.length > 0 ? (
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {executeSql.data.columns.map((col) => (
                      <TableCell
                        key={col}
                        sx={{ fontWeight: 700, bgcolor: '#fafafa', whiteSpace: 'nowrap', fontSize: '0.8rem' }}
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
                            maxWidth: 250,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {formatCell(row[col])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>
              Query returned 0 rows.
            </Typography>
          )}
          <Typography variant="caption" sx={{ color: 'text.secondary', px: 2, py: 0.5, display: 'block' }}>
            {executeSql.data.rowCount} row(s) &middot; {executeSql.data.columns.length} column(s) &middot; Ctrl+Enter to run
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
