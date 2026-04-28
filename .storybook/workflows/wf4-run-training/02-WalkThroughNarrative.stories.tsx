import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from 'storybook/test';

function WalkThroughNarrative() {
  return (
    <div style={{ padding: '2rem', border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center' }}>
      <h3>UC-COMP-11: Present (narrative focus)</h3>
      <p style={{ color: '#666' }}>Component: CompositionRunPage (packages/compositions/ui-mui)</p>
      <p style={{ color: '#999', fontSize: '0.875rem' }}>Will be wired to real component in implementation phase</p>
    </div>
  );
}

const meta = {
  title: 'Workflows/WF4 Run Training/02 Walk Through Narrative',
  component: WalkThroughNarrative,
  tags: ['wf-run-training', 'domain-compositions', 'tier-core'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof WalkThroughNarrative>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('1. Composition loads with all blocks', async () => { /* TODO */ });
    await step('2. First narrative block displays story content', async () => { /* TODO */ });
    await step('3. Heading shown if set', async () => { /* TODO */ });
    await step('4. Presenter notes available (collapsible)', async () => { /* TODO */ });
    await step('5. User clicks Next to advance', async () => { /* TODO */ });
    await step('6. Progress shows "Block N of M"', async () => { /* TODO */ });
    await step('7. Narrative blocks show markdown-formatted prose', async () => { /* TODO */ });
  },
};
