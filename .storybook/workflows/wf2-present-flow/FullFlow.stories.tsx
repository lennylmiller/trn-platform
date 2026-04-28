import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from 'storybook/test';

const workflowSteps = [
  { id: 'UC-FLOW-1', title: 'Select Flow' },
  { id: 'UC-FLOW-9', title: 'Start Presentation' },
  { id: 'UC-EXEC-3/4', title: 'Step Through With Pauses' },
  { id: 'UC-EXEC-7', title: 'View Results' },
];

function PresentFlowFullFlowPlaceholder() {
  return (
    <div style={{ padding: '2rem', border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center' }}>
      <h3>WF2: Present Flow -- Full Flow</h3>
      <ol style={{ paddingLeft: '1.5rem', lineHeight: 2, textAlign: 'left' }}>
        {workflowSteps.map((s) => (
          <li key={s.id}><strong>{s.id}:</strong> {s.title}</li>
        ))}
      </ol>
      <p style={{ color: '#999', fontSize: '0.875rem' }}>
        Chains all WF2 use cases end-to-end. Will be wired to real components in implementation phase.
      </p>
    </div>
  );
}

const meta = {
  title: 'Workflows/WF2 Present Flow/Full Flow',
  component: PresentFlowFullFlowPlaceholder,
  tags: ['wf-present', 'tier-core'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof PresentFlowFullFlowPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('1. Select flow from list', async () => {
      // TODO: wire to real component
    });
    await step('2. Start presentation', async () => {
      // TODO: wire to real component
    });
    await step('3. Step through with pauses', async () => {
      // TODO: wire to real component
    });
    await step('4. View results', async () => {
      // TODO: wire to real component
    });
  },
};
