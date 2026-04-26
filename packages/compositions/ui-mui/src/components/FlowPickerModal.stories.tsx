import type { Meta, StoryObj } from '@storybook/react';
import { FlowPickerModal } from './FlowPickerModal';

const meta: Meta<typeof FlowPickerModal> = {
  title: 'Compositions/FlowPickerModal',
  component: FlowPickerModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof FlowPickerModal>;

export const Default: Story = {
  args: {
    open: true,
    onClose: () => {},
    onSelect: () => {},
  },
};

export const Empty: Story = {
  args: {
    open: true,
    onClose: () => {},
    onSelect: () => {},
  },
};

export const WithSearch: Story = {
  args: {
    open: true,
    onClose: () => {},
    onSelect: () => {},
  },
};
