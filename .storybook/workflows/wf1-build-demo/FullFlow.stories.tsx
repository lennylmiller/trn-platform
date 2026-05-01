import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from 'storybook/test';

const workflowSteps = [
  { id: 'UC-STEP-1', title: 'Browse Step Library' },
  { id: 'UC-STEP-4', title: 'Create Step' },
  { id: 'UC-FLOW-2', title: 'Create Flow' },
  { id: 'UC-FLOW-5', title: 'Add Steps to Flow' },
  { id: 'UC-FLOW-8', title: 'Edit Flow Step Properties' },
  { id: 'UC-EXEC-2', title: 'Execute Flow' },
];

function BuildDemoFullFlowPlaceholder() {
  return (
    <div style={{ padding: '2rem', border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center' }}>
      <h3>WF1: Build Demo -- Full Flow</h3>
      <ol style={{ paddingLeft: '1.5rem', lineHeight: 2, textAlign: 'left' }}>
        {workflowSteps.map((s) => (
          <li key={s.id}><strong>{s.id}:</strong> {s.title}</li>
        ))}
      </ol>
      <p style={{ color: '#999', fontSize: '0.875rem' }}>
        Chains all WF1 use cases end-to-end. Will be wired to real components in implementation phase.
      </p>
    </div>
  );
}

const meta = {
  title: 'Workflows/WF1 Build Demo/Full Flow',
  component: BuildDemoFullFlowPlaceholder,
  tags: ['wf-build', 'tier-core'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof BuildDemoFullFlowPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('1. Browse step library', async () => {
      // TODO: wire to real component
    });
    await step('2. Create new step', async () => {
      // TODO: wire to real component
    });
    await step('3. Create new flow', async () => {
      // TODO: wire to real component
    });
    await step('4. Add steps to flow', async () => {
      // TODO: wire to real component
    });
    await step('5. Configure step properties', async () => {
      // TODO: wire to real component
    });
    await step('6. Test run the flow', async () => {
      // TODO: wire to real component
    });
  },
};
