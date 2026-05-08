import type { Meta, StoryObj } from '@storybook/react';
import { AddSlideDialog } from './AddSlideDialog';

const meta: Meta<typeof AddSlideDialog> = {
  title: 'Domains/Courses/AddSlideDialog',
  component: AddSlideDialog,
  tags: ['autodocs'],
  args: {
    open: true,
    onClose: () => {},
    onAdd: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof AddSlideDialog>;

export const Open: Story = {};
