import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from 'storybook/test';

function ConfigureStepPropertiesPlaceholder() {
  return (
    <div style={{ padding: '2rem', border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center' }}>
      <h3>UC-FLOW-8: Edit Flow Step Properties</h3>
      <p style={{ color: '#666' }}>Component: PropertiesPanel (packages/flows/ui-mui)</p>
      <p style={{ color: '#999', fontSize: '0.875rem' }}>
        Will be wired to real component in implementation phase
      </p>
    </div>
  );
}

const meta = {
  title: 'Workflows/WF1 Build Demo/05 Configure Step Properties',
  component: ConfigureStepPropertiesPlaceholder,
  tags: ['wf-build', 'domain-flows', 'tier-core'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ConfigureStepPropertiesPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('1. User clicks a step in FlowTimeline', async () => {
      // TODO: wire to real component
    });
    await step('2. System shows PropertiesPanel with step details', async () => {
      // TODO: wire to real component
    });
    await step('3. User toggles pause_after switch', async () => {
      // TODO: wire to real component
    });
    await step('4. User toggles visible_in_execution switch', async () => {
      // TODO: wire to real component
    });
    await step('5. User edits presenter_notes text', async () => {
      // TODO: wire to real component
    });
    await step('6. System calls PUT /api/v2/flows/:id/steps/:stepId', async () => {
      // TODO: wire to real component
    });
    await step('7. Step updates in timeline', async () => {
      // TODO: wire to real component
    });
  },
};
