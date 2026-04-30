import type { Meta, StoryObj } from '@storybook/react';
import { StepWorkbench } from './StepWorkbench';

const meta: Meta<typeof StepWorkbench> = {
  title: 'Steps/StepWorkbench',
  component: StepWorkbench,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithInitialStep: Story = {
  args: {
    initialStepId: 1,
  },
};
