import type { Meta, StoryObj } from '@storybook/react';
import { PlanItemCard } from './PlanItemCard';
import { mockStoryPlanItems } from '../../../../../.storybook/mocks/mockData';

const meta: Meta<typeof PlanItemCard> = {
  title: 'Domains/Stories/PlanItemCard',
  component: PlanItemCard,
  tags: ['autodocs'],
  args: {
    onClick: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PlanItemCard>;

export const DoneWithStep: Story = {
  args: {
    item: mockStoryPlanItems[0]!,
  },
};

export const InProgress: Story = {
  args: {
    item: mockStoryPlanItems[1]!,
  },
};

export const Pending: Story = {
  args: {
    item: mockStoryPlanItems[2]!,
  },
};

export const Skipped: Story = {
  args: {
    item: mockStoryPlanItems[3]!,
  },
};
