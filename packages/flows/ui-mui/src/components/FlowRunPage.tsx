import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { useFlowPresenter } from '@trn-platform/flows-feature';
import type { PresenterState } from '@trn-platform/flows-feature';
import { STEP_TYPE_COLORS, STEP_CATEGORY_LABELS } from '@trn-platform/shared';

export interface FlowRunPageProps {
  flowId: number;
  onAbort?: () => void;
}

function ContinueButtonLabel({ state }: { state: PresenterState }) {
  switch (state) {
    case 'idle':
      return 'Start';
    case 'paused':
      return 'Resume';
    case 'complete':
      return 'Done';
    default:
      return 'Continue';
  }
}

export function FlowRunPage({ flowId, onAbort }: FlowRunPageProps) {
  const presenter = useFlowPresenter({ flowId });
  const [notesExpanded, setNotesExpanded] = useState(true);

  const { flow, currentStep, currentIndex, totalSteps, state, isLoading, isError, error } = presenter;

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400
        }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Failed to load flow: {error?.message ?? 'Unknown error'}
      </Alert>
    );
  }

  if (!flow) {
    return (
      <Alert severity="warning" sx={{ m: 3 }}>
        Flow not found.
      </Alert>
    );
  }

  const progressPercent = totalSteps > 0 ? ((currentIndex + 1) / totalSteps) * 100 : 0;
  const typeColor = currentStep ? STEP_TYPE_COLORS[currentStep.type] ?? '#757575' : '#757575';

  const displayQueries =
    currentStep?.override_display_queries ?? currentStep?.display_queries ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }} noWrap>
            {flow.name}
          </Typography>
          {state !== 'idle' && (
            <Chip
              label={`Step ${currentIndex + 1} of ${totalSteps}`}
              size="small"
              variant="outlined"
              sx={{ mr: 1 }}
            />
          )}
          {state === 'paused' && (
            <Chip label="PAUSED" size="small" color="warning" sx={{ mr: 1 }} />
          )}
          {state === 'complete' && (
            <Chip label="COMPLETE" size="small" color="success" sx={{ mr: 1 }} />
          )}
        </Toolbar>
        {state !== 'idle' && (
          <LinearProgress
            variant="determinate"
            value={state === 'complete' ? 100 : progressPercent}
            sx={{ height: 3 }}
          />
        )}
      </AppBar>
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', p: 4 }}>
        {state === 'idle' ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h4" gutterBottom>
              {flow.name}
            </Typography>
            {flow.description && (
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  mb: 3,
                  maxWidth: 600,
                  mx: 'auto'
                }}>
                {flow.description}
              </Typography>
            )}
            <Typography
              variant="body2"
              sx={{
                color: "text.disabled",
                mb: 4
              }}>
              {totalSteps} step{totalSteps !== 1 ? 's' : ''} in this flow
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrowIcon />}
              onClick={presenter.start}
              disabled={totalSteps === 0}
            >
              Start Presentation
            </Button>
          </Box>
        ) : state === 'complete' ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h4" gutterBottom>
              Presentation Complete
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                mb: 4
              }}>
              All {totalSteps} steps have been presented.
            </Typography>
            <Stack direction="row" spacing={2} sx={{
              justifyContent: "center"
            }}>
              <Button variant="outlined" onClick={presenter.reset}>
                Start Over
              </Button>
              <Button variant="contained" onClick={onAbort}>
                Exit
              </Button>
            </Stack>
          </Box>
        ) : currentStep ? (
          <Box sx={{ maxWidth: 800, width: '100%' }}>
            <Paper variant="outlined" sx={{ p: 4, borderLeft: `5px solid ${typeColor}` }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: "center",
                  mb: 2
                }}>
                <Chip
                  label={currentStep.type}
                  size="small"
                  sx={{
                    bgcolor: typeColor,
                    color: '#fff',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                  }}
                />
                <Chip
                  label={STEP_CATEGORY_LABELS[currentStep.category] ?? currentStep.category}
                  size="small"
                  variant="outlined"
                />
              </Stack>

              <Typography variant="h5" gutterBottom sx={{
                fontWeight: 600
              }}>
                {currentStep.label}
              </Typography>

              {currentStep.description && (
                <Typography
                  variant="body1"
                  sx={{
                    color: "text.secondary",
                    mb: 2
                  }}>
                  {currentStep.description}
                </Typography>
              )}

              {currentStep.command_text && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mt: 2,
                    bgcolor: 'grey.50',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    whiteSpace: 'pre-wrap',
                    overflowX: 'auto',
                  }}
                >
                  {currentStep.command_text}
                </Paper>
              )}

              {/* Display Queries */}
              {displayQueries.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Display Queries
                  </Typography>
                  <Stack spacing={1.5}>
                    {displayQueries.map((dq, i) => (
                      <Box key={i}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: "text.secondary"
                          }}>
                          {dq.label}
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1.5,
                            bgcolor: 'grey.50',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {dq.sql}
                        </Paper>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </Paper>

            {/* Presenter Notes */}
            {currentStep.presenter_notes && (
              <Paper variant="outlined" sx={{ mt: 2 }}>
                <Box
                  onClick={() => setNotesExpanded(!notesExpanded)}
                  sx={{
                    px: 2,
                    py: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    bgcolor: 'grey.50',
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  <Typography variant="subtitle2" sx={{
                    color: "text.secondary"
                  }}>
                    Presenter Notes
                  </Typography>
                  {notesExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </Box>
                <Collapse in={notesExpanded}>
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
                      {currentStep.presenter_notes}
                    </Typography>
                  </Box>
                </Collapse>
              </Paper>
            )}
          </Box>
        ) : null}
      </Box>
      {/* Bottom Navigation Bar */}
      {state !== 'idle' && state !== 'complete' && (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} sx={{
            justifyContent: "center"
          }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<StopIcon />}
              onClick={() => {
                presenter.abort();
                onAbort?.();
              }}
            >
              Abort
            </Button>
            <Button
              variant="outlined"
              startIcon={<NavigateBeforeIcon />}
              onClick={presenter.prev}
              disabled={presenter.isFirstStep}
            >
              Previous
            </Button>
            <Button
              variant="contained"
              endIcon={<NavigateNextIcon />}
              onClick={presenter.next}
            >
              <ContinueButtonLabel state={state} />
            </Button>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
