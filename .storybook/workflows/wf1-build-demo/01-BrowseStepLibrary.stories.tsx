import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from 'storybook/test';

function BrowseStepLibraryPlaceholder() {
  return (
    <div style={{ padding: '2rem', border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center' }}>
      <h3>UC-STEP-1: Browse Step Library</h3>
      <p style={{ color: '#666' }}>Component: StepListTab (packages/steps/ui-mui)</p>
      <p style={{ color: '#999', fontSize: '0.875rem' }}>
        Will be wired to real component in implementation phase
      </p>
    </div>
  );
}

const meta = {
  title: 'Workflows/WF1 Build Demo/01 Browse Step Library',
  component: BrowseStepLibraryPlaceholder,
  tags: ['wf-build', 'domain-steps', 'tier-core'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof BrowseStepLibraryPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('1. System loads step library from qc_training.step_library', async () => {
      // TODO: wire to real component
    });
    await step('2. System displays steps grouped by category (setup, scenario, sync, verify, utility)', async () => {
      // TODO: wire to real component
    });
    await step('3. User clicks a category chip to filter', async () => {
      // TODO: wire to real component
    });
    await step('4. User types in search field to filter by label/description', async () => {
      // TODO: wire to real component
    });
    await step('5. System shows matching steps with label, type chip (colored), category chip, description', async () => {
      // TODO: wire to real component
    });
  },
};
