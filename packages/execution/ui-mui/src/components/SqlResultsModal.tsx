import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import type { SqlResult } from '@trn-platform/shared';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SqlResultsModalProps {
  open: boolean;
  onClose: () => void;
  query?: string;
  result?: SqlResult;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Dialog displaying the results of a SQL query execution.
 * Shows the query text, a data table, and the row count.
 */
export function SqlResultsModal({ open, onClose, query, result }: SqlResultsModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>SQL Results</DialogTitle>
      <DialogContent dividers>
        {/* Query display */}
        {query && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              bgcolor: '#f5f5f5',
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              border: '1px solid #e0e0e0',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: 'block',
                mb: 0.5,
                fontFamily: 'inherit'
              }}>
              Query
            </Typography>
            {query}
          </Box>
        )}

        {/* Loading state */}
        {!result && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Results table */}
        {result && result.rows.length > 0 && (
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {result.columns.map((col) => (
                    <TableCell
                      key={col}
                      sx={{
                        fontWeight: 700,
                        bgcolor: '#fafafa',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {result.rows.map((row, rowIdx) => (
                  <TableRow key={rowIdx} hover>
                    {result.columns.map((col) => (
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
        )}

        {/* Empty result */}
        {result && result.rows.length === 0 && (
          <Typography
            sx={{
              color: "text.secondary",
              py: 3,
              textAlign: 'center'
            }}>
            Query returned 0 rows.
          </Typography>
        )}

        {/* Row count footer */}
        {result && (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mt: 1.5
            }}>
            {result.rowCount} row(s) affected &middot; {result.columns.length} column(s)
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
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
