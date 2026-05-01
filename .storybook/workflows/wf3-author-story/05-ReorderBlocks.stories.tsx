import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from 'storybook/test';

function ReorderBlocks() {
  return (
    <div style={{ padding: '2rem', border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center' }}>
      <h3>UC-COMP-7: Reorder Blocks</h3>
      <p style={{ color: '#666' }}>Component: CompositionBlockCard (packages/compositions/ui-mui)</p>
      <p style={{ color: '#999', fontSize: '0.875rem' }}>Will be wired to real component in implementation phase</p>
    </div>
  );
}

const meta = {
  title: 'Workflows/WF3 Author Story/05 Reorder Blocks',
  component: ReorderBlocks,
  tags: ['wf-author-story', 'domain-compositions', 'tier-core'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ReorderBlocks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('1. User grabs drag handle on a block card', async () => { /* TODO */ });
    await step('2. User drags block up or down', async () => { /* TODO */ });
    await step('3. System resequences all blocks', async () => { /* TODO */ });
    await step('4. PUT /api/v2/compositions/:id/blocks with new order', async () => { /* TODO */ });
    await step('5. Blocks display in new sequence', async () => { /* TODO */ });
  },
};
