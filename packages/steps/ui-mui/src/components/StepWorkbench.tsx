import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import TerminalIcon from '@mui/icons-material/Terminal';
import StorageIcon from '@mui/icons-material/Storage';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import type { Step, ExecutionStatus } from '@trn-platform/shared';
import { useStep } from '@trn-platform/steps-data-access';
import { useStepRunner } from '@trn-platform/execution-feature';
import type { OutputLine } from '@trn-platform/execution-feature';
import { ChatPanel } from '@trn-platform/chat-ui-mui';
import { StepFormPanel } from './StepFormPanel';
import { SqlScratchPad } from './SqlScratchPad';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StepWorkbenchProps {
  /** Optional step ID to load on mount. */
  initialStepId?: number;
}

// ---------------------------------------------------------------------------
// Console styles
// ---------------------------------------------------------------------------

const CONSOLE_BG = '#1e1e1e';
const STDOUT_COLOR = '#e0e0e0';
const STDERR_COLOR = '#ef5350';
const TIMESTAMP_COLOR = '#616161';

const STATUS_CHIP: Record<ExecutionStatus, { label: string; color: 'default' | 'primary' | 'warning' | 'success' }> = {
  idle: { label: 'Idle', color: 'default' },
  running: { label: 'Running', color: 'primary' },
  paused: { label: 'Paused', color: 'warning' },
  complete: { label: 'Complete', color: 'success' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Full-page step authoring workbench.
 *
 * Left panel: step form with picker, fields, and save/new buttons.
 * Right panel: tabbed — Console Output and SQL Scratch Pad each get full height.
 */
export function StepWorkbench({ initialStepId }: StepWorkbenchProps) {
  const [activeStepId, setActiveStepId] = useState<number | undefined>(initialStepId);
  const { data: loadedStep } = useStep(activeStepId);
  const { run, abort, state } = useStepRunner();

  const [rightTab, setRightTab] = useState(0);
  const [consoleLines, setConsoleLines] = useState<OutputLine[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync console lines from execution state
  useEffect(() => {
    setConsoleLines(state.outputLines);
  }, [state.outputLines]);

  // Auto-scroll console
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [consoleLines.length]);

  // Switch to console tab when a run starts
  useEffect(() => {
    if (state.status === 'running') {
      setRightTab(0);
    }
  }, [state.status]);

  const handleSaved = (saved: Step) => {
    setActiveStepId(saved.step_id);
  };

  const handleNew = () => {
    setActiveStepId(undefined);
  };

  const handleStepSelected = (step: Step) => {
    setActiveStepId(step.step_id);
  };

  const handleRun = () => {
    if (activeStepId) {
      run(activeStepId);
    }
  };

  const handleClearConsole = () => {
    setConsoleLines([]);
  };

  const chip = STATUS_CHIP[state.status];
  const canRun = !!activeStepId && (state.status === 'idle' || state.status === 'complete');
  const canAbort = state.status === 'running' || state.status === 'paused';

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left Panel — Step Form */}
      <Box
        sx={{
          width: '40%',
          minWidth: 340,
          maxWidth: 520,
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Step Workbench
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create, edit, and test-run steps
          </Typography>
        </Box>
        <StepFormPanel
          step={loadedStep}
          onSaved={handleSaved}
          onNew={handleNew}
          onStepSelected={handleStepSelected}
        />
      </Box>

      {/* Right Panel — Tabbed: Console / SQL Scratch Pad */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar: execution controls + tabs */}
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            px: 2,
            borderBottom: 1,
            borderColor: 'divider',
            minHeight: 48,
          }}
        >
          {/* Execution controls */}
          <Chip
            label={chip.label}
            color={chip.color}
            size="small"
            variant="filled"
            sx={{ fontWeight: 600, minWidth: 72, justifyContent: 'center' }}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<PlayArrowIcon />}
            disabled={!canRun}
            onClick={handleRun}
            sx={{ ml: 1.5 }}
          >
            Run Step
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<StopIcon />}
            disabled={!canAbort}
            onClick={abort}
            sx={{ ml: 1 }}
          >
            Abort
          </Button>

          {state.error && (
            <Typography variant="body2" color="error" sx={{ ml: 1.5, flex: 1 }} noWrap>
              {state.error}
            </Typography>
          )}

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Right-panel tabs */}
          <Tabs
            value={rightTab}
            onChange={(_e, v: number) => setRightTab(v)}
            sx={{
              minHeight: 48,
              '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 600 },
            }}
          >
            <Tab icon={<TerminalIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Console" />
            <Tab icon={<StorageIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="SQL Pad" />
            <Tab icon={<SmartToyIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="AI Chat" />
          </Tabs>
        </Stack>

        {/* Tab content — each fills the remaining height */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          {/* Console tab */}
          {rightTab === 0 && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Stack
                direction="row"
                sx={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  py: 0.5,
                  bgcolor: CONSOLE_BG,
                  borderBottom: '1px solid #333',
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#90caf9' }}
                >
                  Console Output
                </Typography>
                <Button
                  size="small"
                  startIcon={<DeleteSweepIcon />}
                  onClick={handleClearConsole}
                  sx={{ color: '#757575', '&:hover': { color: '#e0e0e0' }, textTransform: 'none' }}
                >
                  Clear
                </Button>
              </Stack>
              <Box
                ref={scrollRef}
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  bgcolor: CONSOLE_BG,
                  px: 2,
                  py: 1,
                  fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", monospace',
                  fontSize: '0.8rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {consoleLines.length === 0 && (
                  <Typography
                    variant="body2"
                    sx={{ color: '#616161', fontFamily: 'monospace', fontStyle: 'italic' }}
                  >
                    {activeStepId ? 'Click "Run Step" to test...' : 'Save a step first, then run it here.'}
                  </Typography>
                )}
                {consoleLines.map((entry, idx) => (
                  <Box
                    key={idx}
                    component="div"
                    sx={{
                      color: entry.stream === 'stderr' ? STDERR_COLOR : STDOUT_COLOR,
                      display: 'flex',
                      gap: 1.5,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ color: TIMESTAMP_COLOR, flexShrink: 0, userSelect: 'none' }}
                    >
                      {formatTime(entry.timestamp)}
                    </Box>
                    <Box component="span">{entry.line}</Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* SQL Scratch Pad tab */}
          {rightTab === 1 && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <SqlScratchPad />
            </Box>
          )}

          {/* AI Chat tab */}
          {rightTab === 2 && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <ChatPanel
                context={{ activeStepId, activeStep: loadedStep }}
                systemPromptHint="You are helping the user author a training step in the Step Workbench."
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
