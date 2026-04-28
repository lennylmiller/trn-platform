import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from 'storybook/test';

function AddFlowBlock() {
  return (
    <div style={{ padding: '2rem', border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center' }}>
      <h3>UC-COMP-9: Pick Flow for Block</h3>
      <p style={{ color: '#666' }}>Components: AddBlockBar + FlowPickerModal (packages/compositions/ui-mui)</p>
      <p style={{ color: '#999', fontSize: '0.875rem' }}>Will be wired to real component in implementation phase</p>
    </div>
  );
}

const meta = {
  title: 'Workflows/WF3 Author Story/03 Add Flow Block',
  component: AddFlowBlock,
  tags: ['wf-author-story', 'domain-compositions', 'tier-core'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AddFlowBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('1. Click "Flow" in AddBlockBar', async () => { /* TODO */ });
    await step('2. FlowPickerModal opens', async () => { /* TODO */ });
    await step('3. System loads flows from GET /api/v2/flows', async () => { /* TODO */ });
    await step('4. User searches/filters flows', async () => { /* TODO */ });
    await step('5. User selects a flow', async () => { /* TODO */ });
    await step('6. Modal closes, block added with flow_id reference', async () => { /* TODO */ });
    await step('7. Block shows flow name + step count', async () => { /* TODO */ });
  },
};
