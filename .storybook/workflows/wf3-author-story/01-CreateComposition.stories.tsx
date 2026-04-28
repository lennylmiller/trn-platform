import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from 'storybook/test';

function CreateComposition() {
  return (
    <div style={{ padding: '2rem', border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center' }}>
      <h3>UC-COMP-2: Create Composition</h3>
      <p style={{ color: '#666' }}>Component: CompositionListTab (packages/compositions/ui-mui)</p>
      <p style={{ color: '#999', fontSize: '0.875rem' }}>Will be wired to real component in implementation phase</p>
    </div>
  );
}

const meta = {
  title: 'Workflows/WF3 Author Story/01 Create Composition',
  component: CreateComposition,
  tags: ['wf-author-story', 'domain-compositions', 'tier-core'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof CreateComposition>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('1. Click "+ New" button', async () => { /* TODO */ });
    await step('2. Select kind (story/tutorial/module) from dropdown', async () => { /* TODO */ });
    await step('3. Enter title (required)', async () => { /* TODO */ });
    await step('4. Enter description (optional)', async () => { /* TODO */ });
    await step('5. System validates with CompositionCreateSchema', async () => { /* TODO */ });
    await step('6. POST /api/v2/compositions', async () => { /* TODO */ });
    await step('7. Composition appears in list', async () => { /* TODO */ });
  },
};
