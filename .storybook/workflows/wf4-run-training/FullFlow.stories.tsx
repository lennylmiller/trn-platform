import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography, Stepper, Step, StepLabel, StepContent, Button, Paper } from '@mui/material';

const workflowSteps = [
  { label: 'Select Composition', description: 'Pick a story, tutorial, or module to run.' },
  { label: 'Walk Through Narrative', description: 'Read narrative blocks providing context and explanation.' },
  { label: 'Execute Embedded Flow', description: 'Run inline flows hands-on during the session.' },
  { label: 'View SQL Results', description: 'See query results from display queries and ad-hoc SQL.' },
  { label: 'Complete Session', description: 'Finish and review what was covered.' },
];

const RunTrainingFullFlow = () => {
  const [activeStep, setActiveStep] = React.useState(0);

  return (
    <Box sx={{ p: 3, maxWidth: 700 }}>
      <Typography variant="h5" gutterBottom>Workflow 4: Run Training</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        End-to-end workflow for running a training session: select a composition, walk through narrative and flows, review results.
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
          <Typography variant="subtitle1" fontWeight={600}>Training complete!</Typography>
          <Button onClick={() => setActiveStep(0)} sx={{ mt: 1 }} variant="outlined" color="inherit">Reset</Button>
        </Paper>
      )}
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Run Training/Full Flow',
  component: RunTrainingFullFlow,
  tags: ['wf-4'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
