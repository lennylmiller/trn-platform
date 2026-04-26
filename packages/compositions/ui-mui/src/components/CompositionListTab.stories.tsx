import type { Meta, StoryObj } from '@storybook/react';
import { CompositionListTab } from './CompositionListTab';

const meta: Meta<typeof CompositionListTab> = {
  title: 'Compositions/CompositionListTab',
  component: CompositionListTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof CompositionListTab>;

export const Stories: Story = {
  args: {},
};

export const Tutorials: Story = {
  args: {},
};

export const Modules: Story = {
  args: {},
};

export const Empty: Story = {
  args: {},
};

export const Loading: Story = {
  args: {},
};

export const Error: Story = {
  args: {},
};
