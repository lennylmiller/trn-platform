import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from 'storybook/test';

function SelectFlowPlaceholder() {
  return (
    <div style={{ padding: '2rem', border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center' }}>
      <h3>UC-FLOW-1: Select Flow</h3>
      <p style={{ color: '#666' }}>Component: FlowListTab (packages/flows/ui-mui)</p>
      <p style={{ color: '#999', fontSize: '0.875rem' }}>
        Will be wired to real component in implementation phase
      </p>
    </div>
  );
}

const meta = {
  title: 'Workflows/WF2 Present Flow/01 Select Flow',
  component: SelectFlowPlaceholder,
  tags: ['wf-present', 'domain-flows', 'tier-core'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SelectFlowPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('1. System loads flows from GET /api/v2/flows', async () => {
      // TODO: wire to real component
    });
    await step('2. System displays FlowCards with name, step count, description', async () => {
      // TODO: wire to real component
    });
    await step('3. User reviews available flows', async () => {
      // TODO: wire to real component
    });
    await step('4. User clicks "Present" on desired flow', async () => {
      // TODO: wire to real component
    });
  },
};
