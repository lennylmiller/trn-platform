import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography, Stepper, Step, StepLabel, StepContent, Button, Paper } from '@mui/material';

const workflowSteps = [
  { label: 'View Step Library', description: 'Browse all steps with management actions.' },
  { label: 'Edit Step', description: 'Modify an existing step label, description, or command.' },
  { label: 'Test Step', description: 'Execute a single step in isolation to verify correctness.' },
  { label: 'Delete Step', description: 'Remove an unused step (seed steps are protected).' },
];

const ManageStepsFullFlow = () => {
  const [activeStep, setActiveStep] = React.useState(0);

  return (
    <Box sx={{ p: 3, maxWidth: 700 }}>
      <Typography variant="h5" gutterBottom>Workflow 5: Manage Steps</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        End-to-end workflow for managing the step library: browse, edit, test, and delete steps.
      </Typography>
      <Stepper activeStep={activeStep} orientation="vertical">
        {workflowSteps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
            <StepContent>
              <Typography variant="body2" sx={{ mb: 2 }}>{step.description}</Typography>
              <Box>
                <Button variant="contained" size="small" onClick={() => setActiveStep(index + 1)} sx={{ mr: 1 }}>
                  {index === workflowSteps.length - 1 ? 'Finish' : 'Continue'}
                </Button>
                {index > 0 && <Button size="small" onClick={() => setActiveStep(index - 1)}>Back</Button>}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === workflowSteps.length && (
        <Paper sx={{ p: 3, mt: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Typography variant="subtitle1" fontWeight={600}>Step management complete!</Typography>
          <Button onClick={() => setActiveStep(0)} sx={{ mt: 1 }} variant="outlined" color="inherit">Reset</Button>
        </Paper>
      )}
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Manage Steps/Full Flow',
  component: ManageStepsFullFlow,
  tags: ['wf-5'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
