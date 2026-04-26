import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FlowStep } from '@trn-platform/shared';
import { FlowStepCard } from './FlowStepCard';

export interface FlowTimelineProps {
  steps: FlowStep[];
  selectedStepId?: number;
  onSelectStep?: (flowStepId: number) => void;
  onRemoveStep?: (flowStepId: number) => void;
  onEditStep?: (flowStepId: number) => void;
}

export function FlowTimeline({
  steps,
  selectedStepId,
  onSelectStep,
  onRemoveStep,
  onEditStep,
}: FlowTimelineProps) {
  if (!steps || steps.length === 0) {
    return (
      <Box
        sx={{
          py: 6,
          textAlign: 'center',
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No steps in this flow yet.
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
          Add steps from the step library to build your flow.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Vertical connecting line */}
      <Box
        sx={{
          position: 'absolute',
          left: 30,
          top: 24,
          bottom: 24,
          width: 2,
          bgcolor: 'divider',
          zIndex: 0,
        }}
      />

      <Stack spacing={1} sx={{ position: 'relative', zIndex: 1 }}>
        {steps.map((step, index) => (
          <FlowStepCard
            key={step.flow_step_id}
            step={step}
            index={index}
            selected={selectedStepId === step.flow_step_id}
            onSelect={onSelectStep}
            onRemove={onRemoveStep}
            onEdit={onEditStep}
          />
        ))}
      </Stack>
    </Box>
  );
}
