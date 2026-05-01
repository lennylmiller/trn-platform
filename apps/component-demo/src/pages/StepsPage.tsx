import { useState } from 'react';
import { Box } from '@mui/material';
import { StepListTab, StepEditorModal } from '@trn-platform/steps-ui-mui';
import { useDeleteStep } from '@trn-platform/steps-data-access';
import type { Step } from '@trn-platform/shared';

export default function StepsPage() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<Step | undefined>(undefined);
  const deleteStep = useDeleteStep();

  const handleStepClick = (step: Step) => {
    setSelectedStep(step);
    setEditorOpen(true);
  };

  const handleClose = () => {
    setEditorOpen(false);
    setSelectedStep(undefined);
  };

  const handleDelete = () => {
    if (selectedStep && window.confirm(`Delete "${selectedStep.label}"? This cannot be undone.`)) {
      deleteStep.mutate(selectedStep.step_id, { onSuccess: handleClose });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <StepListTab onStepClick={handleStepClick} />
      <StepEditorModal
        open={editorOpen}
        onClose={handleClose}
        step={selectedStep}
        onDelete={selectedStep ? handleDelete : undefined}
      />
    </Box>
  );
}
