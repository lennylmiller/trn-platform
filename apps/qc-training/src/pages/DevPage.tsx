import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSteps } from '@trn-platform/steps-data-access';
import { useFlowBuilder } from '@trn-platform/flows-feature';
import { useFlowRunner } from '@trn-platform/execution-feature';
import { StepLibrary } from '@trn-platform/steps-ui-mui';
import { FlowTimeline, PropertiesPanel } from '@trn-platform/flows-ui-mui';
import { ConsoleDrawer, ExecutionControls } from '@trn-platform/execution-ui-mui';

export default function DevPage() {
  const { flowId: flowIdParam } = useParams<{ flowId: string }>();
  const flowId = Number(flowIdParam);
  const navigate = useNavigate();

  const builder = useFlowBuilder({ flowId });
  const { data: allSteps } = useSteps();
  const runner = useFlowRunner();

  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const [consoleOpen, setConsoleOpen] = useState(false);

  const selectedStep = builder.steps.find((s) => s.flow_step_id === selectedStepId) ?? null;

  if (builder.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (builder.isError) {
    return <Alert severity="error" sx={{ m: 3 }}>Failed to load flow: {builder.error?.message}</Alert>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}
      >
        <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate('/flows')}>
          Back
        </Button>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {builder.flow?.name ?? 'Flow'}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          size="small"
          startIcon={<SaveIcon />}
          disabled={!builder.isDirtyOrder || builder.isSaving}
          onClick={() => builder.saveOrder()}
        >
          Save Order
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<SlideshowIcon />}
          onClick={() => navigate(`/flows/run/${flowId}`)}
        >
          Present
        </Button>
        <ExecutionControls
          status={runner.state.status}
          onStart={() => {
            setConsoleOpen(true);
            runner.start(flowId);
          }}
          onResume={() => runner.resume()}
          onAbort={() => runner.abort()}
        />
      </Stack>
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Box sx={{ width: 280, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
          <StepLibrary
            steps={allSteps ?? []}
            onSelectStep={(step) =>
              builder.addStep({
                step_id: step.step_id,
                pause_after: false,
                visible_in_execution: true,
              })
            }
          />
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <FlowTimeline
            steps={builder.steps}
            selectedStepId={selectedStepId ?? undefined}
            onSelectStep={setSelectedStepId}
            onRemoveStep={(fsId) => builder.removeStep(fsId)}
          />
        </Box>
        <Box sx={{ width: 320, borderLeft: 1, borderColor: 'divider', overflow: 'auto' }}>
          <PropertiesPanel
            step={selectedStep}
            onUpdate={(updates) => {
              if (selectedStepId != null) {
                builder.updateStepProps(selectedStepId, updates);
              }
            }}
          />
        </Box>
      </Box>
      <ConsoleDrawer
        open={consoleOpen}
        onClose={() => setConsoleOpen(false)}
        lines={runner.state.outputLines}
        onClear={() => {}}
      />
    </Box>
  );
}
