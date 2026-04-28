import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from 'storybook/test';

function ViewStepLibrary() {
  return (
    <div style={{ padding: '2rem', border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center' }}>
      <h3>UC-STEP-1: Browse Step Library</h3>
      <p style={{ color: '#666' }}>Component: StepListTab (packages/steps/ui-mui)</p>
      <p style={{ color: '#999', fontSize: '0.875rem' }}>Will be wired to real component in implementation phase</p>
    </div>
  );
}

const meta = {
  title: 'Workflows/WF5 Manage Steps/01 View Step Library',
  component: ViewStepLibrary,
  tags: ['wf-manage-steps', 'domain-steps', 'tier-core'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ViewStepLibrary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('1. System loads steps from GET /api/v2/steps', async () => { /* TODO */ });
    await step('2. Steps grouped by category', async () => { /* TODO */ });
    await step('3. Category filter chips shown', async () => { /* TODO */ });
    await step('4. Search field for text filter', async () => { /* TODO */ });
    await step('5. Each step shows label, type chip (shell=blue, sql=orange, manual=purple), category, description', async () => { /* TODO */ });
  },
};
