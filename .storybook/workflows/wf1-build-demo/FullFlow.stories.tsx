import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography, Stepper, Step, StepLabel, StepContent, Button, Paper } from '@mui/material';

const workflowSteps = [
  { label: 'Browse Step Library', description: 'Search and filter reusable steps by type and category.' },
  { label: 'Create New Step', description: 'Author a new SQL, shell, or manual step with command text and display queries.' },
  { label: 'Create New Flow', description: 'Create an empty flow to organize steps into a presentation sequence.' },
  { label: 'Add Steps to Flow', description: 'Select steps from the library and arrange them in the flow timeline.' },
  { label: 'Configure Step Properties', description: 'Set pause points, presenter notes, and visibility for each flow step.' },
  { label: 'Test Run Flow', description: 'Execute the flow end-to-end, observing console output and pause behavior.' },
];

const BuildDemoFullFlow = () => {
  const [activeStep, setActiveStep] = React.useState(0);

  return (
    <Box sx={{ p: 3, maxWidth: 700 }}>
      <Typography variant="h5" gutterBottom>Workflow 1: Build a Demo</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Complete end-to-end workflow for building a training demo from scratch: author steps, compose a flow, configure properties, and test run it.
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
                {index > 0 && (
                  <Button size="small" onClick={() => setActiveStep(index - 1)}>Back</Button>
                )}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === workflowSteps.length && (
        <Paper sx={{ p: 3, mt: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Typography variant="subtitle1" fontWeight={600}>Demo build complete!</Typography>
          <Typography variant="body2">All steps finished. The flow is ready for presentation.</Typography>
          <Button onClick={() => setActiveStep(0)} sx={{ mt: 1 }} variant="outlined" color="inherit">
            Reset
          </Button>
        </Paper>
      )}
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Build Demo/Full Flow',
  component: BuildDemoFullFlow,
  tags: ['wf-1'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
