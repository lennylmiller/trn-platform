import type { Meta, StoryObj } from '@storybook/react';
import { AddBlockDialog } from './AddBlockDialog';

const meta: Meta<typeof AddBlockDialog> = {
  title: 'Domains/Courses/AddSlideDialog',
  component: AddBlockDialog,
  tags: ['autodocs'],
  args: {
    open: true,
    onClose: () => {},
    onAdd: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof AddBlockDialog>;

export const Open: Story = {};
