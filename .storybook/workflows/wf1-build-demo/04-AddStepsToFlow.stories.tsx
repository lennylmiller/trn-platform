import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from 'storybook/test';

function AddStepsToFlowPlaceholder() {
  return (
    <div style={{ padding: '2rem', border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center' }}>
      <h3>UC-FLOW-5: Add Steps to Flow</h3>
      <p style={{ color: '#666' }}>Components: FlowTimeline, StepLibrary (packages/flows/ui-mui, packages/steps/ui-mui)</p>
      <p style={{ color: '#999', fontSize: '0.875rem' }}>
        Will be wired to real component in implementation phase
      </p>
    </div>
  );
}

const meta = {
  title: 'Workflows/WF1 Build Demo/04 Add Steps to Flow',
  component: AddStepsToFlowPlaceholder,
  tags: ['wf-build', 'domain-flows', 'domain-steps', 'tier-core'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AddStepsToFlowPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('1. User opens flow in dev mode', async () => {
      // TODO: wire to real component
    });
    await step('2. System shows FlowTimeline (center) + StepLibrary (sidebar)', async () => {
      // TODO: wire to real component
    });
    await step('3. User selects a step from StepLibrary', async () => {
      // TODO: wire to real component
    });
    await step('4. System adds step to FlowTimeline at next seq position', async () => {
      // TODO: wire to real component
    });
    await step('5. Step appears with label, type chip, and sequence number', async () => {
      // TODO: wire to real component
    });
    await step('6. User can repeat to add more steps', async () => {
      // TODO: wire to real component
    });
  },
};
