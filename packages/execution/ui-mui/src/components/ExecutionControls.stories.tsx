import type { Meta, StoryObj } from '@storybook/react';
import { ExecutionControls } from './ExecutionControls';

const meta: Meta<typeof ExecutionControls> = {
  title: 'Execution/ExecutionControls',
  component: ExecutionControls,
  tags: ['autodocs'],
  args: {
    onStart: () => {},
    onResume: () => {},
    onAbort: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof ExecutionControls>;

export const Idle: Story = {
  args: {
    status: 'idle',
  },
};

export const Running: Story = {
  args: {
    status: 'running',
  },
};

export const Paused: Story = {
  args: {
    status: 'paused',
  },
};

export const Complete: Story = {
  args: {
    status: 'complete',
  },
};

export const Disabled: Story = {
  args: {
    status: 'running',
    disabled: true,
  },
};
