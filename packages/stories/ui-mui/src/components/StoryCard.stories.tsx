import type { Meta, StoryObj } from '@storybook/react';
import { StoryCard } from './StoryCard';
import { mockStories } from '../../../../../.storybook/mocks/mockData';

const meta: Meta<typeof StoryCard> = {
  title: 'Domains/Stories/StoryCard',
  component: StoryCard,
  tags: ['autodocs'],
  args: {
    onClick: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof StoryCard>;

export const Authoring: Story = {
  args: {
    story: mockStories[0]!,
  },
};

export const Planning: Story = {
  args: {
    story: mockStories[1]!,
  },
};

export const CompleteNoDescription: Story = {
  args: {
    story: mockStories[2]!,
  },
};
