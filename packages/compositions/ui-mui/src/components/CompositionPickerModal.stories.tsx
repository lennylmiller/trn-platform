import type { Meta, StoryObj } from '@storybook/react';
import { CompositionPickerModal } from './CompositionPickerModal';

const meta: Meta<typeof CompositionPickerModal> = {
  title: 'Compositions/CompositionPickerModal',
  component: CompositionPickerModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof CompositionPickerModal>;

export const Default: Story = {
  args: {
    open: true,
    onClose: () => {},
    onSelect: () => {},
  },
};

export const FilteredByKind: Story = {
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
