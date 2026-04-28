import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Stack } from '@mui/material';
import { StepLibrary } from '@trn-platform/steps-ui-mui';
import { FlowTimeline, PropertiesPanel } from '@trn-platform/flows-ui-mui';

const FlowBuilderPage = () => (
  <Box sx={{ height: '100vh', display: 'flex' }}>
    {/* Step Library sidebar */}
    <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
      <StepLibrary />
    </Box>
    {/* Flow Timeline (center) */}
    <Box sx={{ flex: 1, overflow: 'auto' }}>
      <FlowTimeline />
    </Box>
    {/* Properties Panel (right) */}
    <Box sx={{ width: 320, borderLeft: 1, borderColor: 'divider', overflow: 'auto' }}>
      <PropertiesPanel />
    </Box>
  </Box>
);

const meta: Meta = {
  title: 'Pages/WF1 Build Demo/Flow Builder Page',
  component: FlowBuilderPage,
  parameters: { layout: 'fullscreen' },
  tags: ['page', 'wf-1', 'domain-steps', 'domain-flows'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
