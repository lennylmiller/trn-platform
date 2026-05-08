import type { Meta, StoryObj } from '@storybook/react';
import { AddLessonDialog } from './AddLessonDialog';

const meta: Meta<typeof AddLessonDialog> = {
  title: 'Domains/Courses/AddLessonDialog',
  component: AddLessonDialog,
  tags: ['autodocs'],
  args: {
    open: true,
    onClose: () => {},
    onAdd: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof AddLessonDialog>;

export const Open: Story = {};
