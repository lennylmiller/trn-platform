import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import { FlowPickerModal } from '@trn-platform/compositions-ui-mui';

const FlowPickerPage = () => (
  <Box sx={{ height: '100vh', p: 3 }}>
    <FlowPickerModal
      open={true}
      onClose={() => {}}
      onSelect={(flowId) => console.log('Selected flow:', flowId)}
    />
  </Box>
);

const meta: Meta = {
  title: 'Pages/Author Story/Flow Picker Page',
  component: FlowPickerPage,
  parameters: { layout: 'fullscreen' },
  tags: ['page', 'wf-3', 'domain-compositions', 'domain-flows'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
