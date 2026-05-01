import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import { StepListTab } from '@trn-platform/steps-ui-mui';

const StepLibraryPage = () => (
  <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
    <StepListTab />
  </Box>
);

const meta: Meta = {
  title: 'Pages/WF1 Build Demo/Step Library Page',
  component: StepLibraryPage,
  parameters: { layout: 'fullscreen' },
  tags: ['page', 'wf-1', 'domain-steps'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
