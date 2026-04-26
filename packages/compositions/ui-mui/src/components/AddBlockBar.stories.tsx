import type { Meta, StoryObj } from '@storybook/react';
import { AddBlockBar } from './AddBlockBar';

const meta: Meta<typeof AddBlockBar> = {
  title: 'Compositions/AddBlockBar',
  component: AddBlockBar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AddBlockBar>;

export const Default: Story = {
  args: {},
};
