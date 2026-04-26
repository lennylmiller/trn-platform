import React from 'react';
import { Box } from '@mui/material';
import { StepListTab, StepEditorModal } from '@trn-platform/steps-ui-mui';

export default function StepsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <StepListTab />
      <StepEditorModal />
    </Box>
  );
}
