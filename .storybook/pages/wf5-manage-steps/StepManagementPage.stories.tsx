import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography } from '@mui/material';
import { StepListTab, StepEditorModal } from '@trn-platform/steps-ui-mui';

const StepManagementPage = () => (
  <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant="h6">Step Management</Typography>
    </Box>
    <Box sx={{ flex: 1, overflow: 'auto' }}>
      <StepListTab />
    </Box>
    <StepEditorModal />
  </Box>
);

const meta: Meta = {
  title: 'Pages/WF5 Manage Steps/Step Management Page',
  component: StepManagementPage,
  parameters: { layout: 'fullscreen' },
  tags: ['page', 'wf-5', 'domain-steps'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
