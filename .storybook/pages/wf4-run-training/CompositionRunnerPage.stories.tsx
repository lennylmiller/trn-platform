import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import { CompositionRunPage } from '@trn-platform/compositions-ui-mui';
import { mockCompositionDetail } from '../../mocks/mockData';

const CompositionRunnerPage = () => {
  const blocks = mockCompositionDetail.blocks;
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentBlock = blocks[currentIndex];

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CompositionRunPage
        title={mockCompositionDetail.title}
        kind={mockCompositionDetail.kind}
        currentBlock={currentBlock}
        currentBlockIndex={currentIndex}
        totalBlocks={blocks.length}
        isFirst={currentIndex === 0}
        isLast={currentIndex >= blocks.length - 1}
        canDrillOut={false}
        onNext={() => setCurrentIndex((i) => Math.min(i + 1, blocks.length - 1))}
        onPrev={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
        onRunFlow={(flowId) => console.log('Run flow:', flowId)}
      />
    </Box>
  );
};

const meta: Meta = {
  title: 'Pages/WF4 Run Training/Composition Runner Page',
  component: CompositionRunnerPage,
  parameters: { layout: 'fullscreen' },
  tags: ['page', 'wf-4', 'domain-compositions', 'domain-execution'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
