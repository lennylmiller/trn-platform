import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from 'storybook/test';

function CreateNewFlowPlaceholder() {
  return (
    <div style={{ padding: '2rem', border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center' }}>
      <h3>UC-FLOW-2: Create Flow</h3>
      <p style={{ color: '#666' }}>Component: FlowListTab (packages/flows/ui-mui)</p>
      <p style={{ color: '#999', fontSize: '0.875rem' }}>
        Will be wired to real component in implementation phase
      </p>
    </div>
  );
}

const meta = {
  title: 'Workflows/WF1 Build Demo/03 Create New Flow',
  component: CreateNewFlowPlaceholder,
  tags: ['wf-build', 'domain-flows', 'tier-core'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof CreateNewFlowPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('1. User clicks "+ New Flow" button', async () => {
      // TODO: wire to real component
    });
    await step('2. System prompts for flow name and description', async () => {
      // TODO: wire to real component
    });
    await step('3. User enters name (required)', async () => {
      // TODO: wire to real component
    });
    await step('4. User enters description (optional)', async () => {
      // TODO: wire to real component
    });
    await step('5. System calls POST /api/v2/flows', async () => {
      // TODO: wire to real component
    });
    await step('6. Flow appears in list with 0 steps', async () => {
      // TODO: wire to real component
    });
  },
};
