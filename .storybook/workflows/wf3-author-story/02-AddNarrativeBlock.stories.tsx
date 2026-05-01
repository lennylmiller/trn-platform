import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from 'storybook/test';

function AddNarrativeBlock() {
  return (
    <div style={{ padding: '2rem', border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center' }}>
      <h3>UC-COMP-5: Add Block (narrative type)</h3>
      <p style={{ color: '#666' }}>Components: AddBlockBar + CompositionBlockCard (packages/compositions/ui-mui)</p>
      <p style={{ color: '#999', fontSize: '0.875rem' }}>Will be wired to real component in implementation phase</p>
    </div>
  );
}

const meta = {
  title: 'Workflows/WF3 Author Story/02 Add Narrative Block',
  component: AddNarrativeBlock,
  tags: ['wf-author-story', 'domain-compositions', 'tier-core'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AddNarrativeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('1. User clicks "Narrative" button in AddBlockBar', async () => { /* TODO */ });
    await step('2. System appends narrative block at next seq', async () => { /* TODO */ });
    await step('3. User enters story content (markdown) in content field', async () => { /* TODO */ });
    await step('4. User optionally enters technical_content', async () => { /* TODO */ });
    await step('5. User sets heading', async () => { /* TODO */ });
    await step('6. POST /api/v2/compositions/:id/blocks', async () => { /* TODO */ });
  },
};
