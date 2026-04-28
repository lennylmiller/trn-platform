import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from 'storybook/test';

function SelectComposition() {
  return (
    <div style={{ padding: '2rem', border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center' }}>
      <h3>UC-COMP-1: List Compositions</h3>
      <p style={{ color: '#666' }}>Component: CompositionListTab (packages/compositions/ui-mui)</p>
      <p style={{ color: '#999', fontSize: '0.875rem' }}>Will be wired to real component in implementation phase</p>
    </div>
  );
}

const meta = {
  title: 'Workflows/WF4 Run Training/01 Select Composition',
  component: SelectComposition,
  tags: ['wf-run-training', 'domain-compositions', 'tier-core'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SelectComposition>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('1. System loads compositions from GET /api/v2/compositions', async () => { /* TODO */ });
    await step('2. Tabs display (Story/Tutorial/Module)', async () => { /* TODO */ });
    await step('3. User selects a tab to filter by kind', async () => { /* TODO */ });
    await step('4. CompositionCards show title, kind chip, block count, flow count', async () => { /* TODO */ });
    await step('5. User clicks "Present" on desired composition', async () => { /* TODO */ });
  },
};
