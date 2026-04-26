import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Execution/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 400, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Start: Story = {
  args: {
    current: 0,
    total: 8,
    status: 'running',
  },
};

export const Middle: Story = {
  args: {
    current: 3,
    total: 8,
    status: 'running',
  },
};

export const NearEnd: Story = {
  args: {
    current: 7,
    total: 8,
    status: 'running',
  },
};

export const Complete: Story = {
  args: {
    current: 8,
    total: 8,
    status: 'complete',
  },
};
