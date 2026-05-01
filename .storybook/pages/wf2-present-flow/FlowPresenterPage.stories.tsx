import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import { FlowRunPage } from '@trn-platform/flows-ui-mui';

const FlowPresenterPage = () => (
  <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
    <FlowRunPage flowId={1} />
  </Box>
);

const meta: Meta = {
  title: 'Pages/WF2 Present Flow/Flow Presenter Page',
  component: FlowPresenterPage,
  parameters: { layout: 'fullscreen' },
  tags: ['page', 'wf-2', 'domain-flows', 'domain-execution'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
