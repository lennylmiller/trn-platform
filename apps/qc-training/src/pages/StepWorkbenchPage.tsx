import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { StepWorkbench } from '@trn-platform/steps-ui-mui';

export default function StepWorkbenchPage() {
  const { stepId } = useParams<{ stepId?: string }>();
  const initialStepId = stepId ? Number(stepId) : undefined;

  return (
    <Box sx={{ height: 'calc(100vh - 64px)' }}>
      <StepWorkbench initialStepId={initialStepId} />
    </Box>
  );
}
