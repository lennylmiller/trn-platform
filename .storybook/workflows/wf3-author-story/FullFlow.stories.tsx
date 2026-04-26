import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography, Stepper, Step, StepLabel, StepContent, Button, Paper } from '@mui/material';

const workflowSteps = [
  { label: 'Create Composition', description: 'Start a new story, tutorial, or module with a title and kind.' },
  { label: 'Add Narrative Block', description: 'Add prose content providing context and explanation.' },
  { label: 'Add Flow Block', description: 'Pick and embed a flow for hands-on execution during presentation.' },
  { label: 'Add Note Block', description: 'Add technical notes with code or schema details.' },
  { label: 'Reorder Blocks', description: 'Drag to reorder blocks into the desired presentation sequence.' },
  { label: 'Edit Block Properties', description: 'Set headings, presenter notes, and block-specific settings.' },
  { label: 'Preview Composition', description: 'See the full composition as it will appear in run mode.' },
];

const AuthorStoryFullFlow = () => {
  const [activeStep, setActiveStep] = React.useState(0);

  return (
    <Box sx={{ p: 3, maxWidth: 700 }}>
      <Typography variant="h5" gutterBottom>Workflow 3: Author a Story</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        End-to-end workflow for authoring a composition: create it, add blocks of different types, reorder, configure, and preview.
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
          <Typography variant="subtitle1" fontWeight={600}>Story authored!</Typography>
          <Typography variant="body2">The composition is ready to be presented or shared.</Typography>
          <Button onClick={() => setActiveStep(0)} sx={{ mt: 1 }} variant="outlined" color="inherit">Reset</Button>
        </Paper>
      )}
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Author Story/Full Flow',
  component: AuthorStoryFullFlow,
  tags: ['wf-3'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
