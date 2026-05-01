import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from 'storybook/test';

function TestStep() {
  return (
    <div style={{ padding: '2rem', border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center' }}>
      <h3>UC-EXEC-1: Execute Single Step</h3>
      <p style={{ color: '#666' }}>Components: ConsoleDrawer + ExecutionControls (packages/execution/ui-mui)</p>
      <p style={{ color: '#999', fontSize: '0.875rem' }}>Will be wired to real component in implementation phase</p>
    </div>
  );
}

const meta = {
  title: 'Workflows/WF5 Manage Steps/03 Test Step',
  component: TestStep,
  tags: ['wf-manage-steps', 'domain-steps', 'tier-core'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TestStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('1. User clicks "Test" on step', async () => { /* TODO */ });
    await step('2. POST /api/v2/execute/step/:stepId', async () => { /* TODO */ });
    await step('3. Shell type: child process spawns, stdout/stderr stream via SSE', async () => { /* TODO */ });
    await step('4. SQL type: query runs against qc_core, results shown', async () => { /* TODO */ });
    await step('5. Manual type: system pauses, shows instructions', async () => { /* TODO */ });
    await step('6. Console drawer shows output', async () => { /* TODO */ });
  },
};
