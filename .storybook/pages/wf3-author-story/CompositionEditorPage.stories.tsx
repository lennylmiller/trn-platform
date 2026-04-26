import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Stack, Typography } from '@mui/material';
import { CompositionBlockCard, BlockPropertiesPanel, AddBlockBar } from '@trn-platform/compositions-ui-mui';

const CompositionEditorPage = () => (
  <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant="h6">Composition Editor</Typography>
    </Box>
    <Stack direction="row" sx={{ flex: 1, overflow: 'hidden' }}>
      {/* Block list */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <CompositionBlockCard />
        <Box sx={{ mt: 2 }}>
          <AddBlockBar />
        </Box>
      </Box>
      {/* Properties panel */}
      <Box sx={{ width: 320, borderLeft: 1, borderColor: 'divider', overflow: 'auto' }}>
        <BlockPropertiesPanel />
      </Box>
    </Stack>
  </Box>
);

const meta: Meta = {
  title: 'Pages/Author Story/Composition Editor Page',
  component: CompositionEditorPage,
  parameters: { layout: 'fullscreen' },
  tags: ['page', 'wf-3', 'domain-compositions'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
