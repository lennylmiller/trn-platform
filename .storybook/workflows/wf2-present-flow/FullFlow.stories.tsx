import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography, Stepper, Step, StepLabel, StepContent, Button, Paper } from '@mui/material';

const workflowSteps = [
  { label: 'Select Flow', description: 'Pick the flow you want to present from the flow library.' },
  { label: 'Start Presentation', description: 'Enter run mode. The audience sees step progress and live output.' },
  { label: 'Step Through With Pauses', description: 'Execution pauses at configured points. Continue when ready.' },
  { label: 'View Results', description: 'Review execution results, display query output, and timing.' },
];

const PresentFlowFullFlow = () => {
  const [activeStep, setActiveStep] = React.useState(0);

  return (
    <Box sx={{ p: 3, maxWidth: 700 }}>
      <Typography variant="h5" gutterBottom>Workflow 2: Present a Flow</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        End-to-end workflow for running a training flow as a live presentation.
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
          <Typography variant="subtitle1" fontWeight={600}>Presentation complete!</Typography>
          <Button onClick={() => setActiveStep(0)} sx={{ mt: 1 }} variant="outlined" color="inherit">Reset</Button>
        </Paper>
      )}
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Present Flow/Full Flow',
  component: PresentFlowFullFlow,
  tags: ['wf-2'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
