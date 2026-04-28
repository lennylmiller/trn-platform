import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { StepListTab, StepEditorModal } from '@trn-platform/steps-ui-mui';
import { FlowListTab } from '@trn-platform/flows-ui-mui';
import { CompositionListTab } from '@trn-platform/compositions-ui-mui';
import type { Step } from '@trn-platform/shared';

interface LandingPageProps {
  tab: 'steps' | 'flows' | 'compositions';
}

export default function LandingPage({ tab }: LandingPageProps) {
  const [editStep, setEditStep] = useState<Step | undefined>();
  const [editorOpen, setEditorOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      {tab === 'steps' && (
        <>
          <StepListTab
            onStepClick={(step) => {
              setEditStep(step);
              setEditorOpen(true);
            }}
          />
          <StepEditorModal
            open={editorOpen}
            onClose={() => {
              setEditorOpen(false);
              setEditStep(undefined);
            }}
            step={editStep}
          />
        </>
      )}

      {tab === 'flows' && (
        <FlowListTab
          onOpenDev={(flowId) => navigate(`/flows/dev/${flowId}`)}
          onPresent={(flowId) => navigate(`/flows/run/${flowId}`)}
        />
      )}

      {tab === 'compositions' && (
        <CompositionListTab
          onEdit={(id) => navigate(`/compositions/edit/${id}`)}
          onPresent={(id) => navigate(`/compositions/run/${id}`)}
        />
      )}
    </Box>
  );
}
