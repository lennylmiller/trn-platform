import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import { StepWorkbench } from '@trn-platform/steps-ui-mui';

const StepWorkbenchPage = () => (
  <Box sx={{ height: '100vh' }}>
    <StepWorkbench />
  </Box>
);

const meta: Meta = {
  title: 'Pages/Step Workbench',
  component: StepWorkbenchPage,
  parameters: { layout: 'fullscreen' },
  tags: ['page', 'domain-steps'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
