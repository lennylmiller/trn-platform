import type { Meta, StoryObj } from '@storybook/react';
import { FlowCard } from './FlowCard';
import type { FlowListItem } from '@trn-platform/shared';

const baseFlow: FlowListItem = {
  flow_id: 1,
  name: 'Database Setup Flow',
  description: 'Initializes the database schema and seeds reference data for the training environment.',
  is_seed: false,
  step_count: 5,
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-02-10T14:30:00Z',
};

const meta: Meta<typeof FlowCard> = {
  title: 'Flows/FlowCard',
  component: FlowCard,
  tags: ['autodocs'],
  args: {
    onOpenDev: () => {},
    onPresent: () => {},
    onDelete: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof FlowCard>;

export const Default: Story = {
  args: {
    flow: baseFlow,
  },
};

export const WithDescription: Story = {
  args: {
    flow: {
      ...baseFlow,
      description:
        'This is a comprehensive flow that sets up the entire training environment including database schema creation, reference data seeding, user provisioning, and post-setup validation checks. It covers all edge cases and prerequisites.',
    },
  },
};

export const ManySteps: Story = {
  args: {
    flow: {
      ...baseFlow,
      flow_id: 2,
      name: 'Full Training Pipeline',
      step_count: 15,
      description: 'End-to-end training pipeline with all setup, scenario, and verification steps.',
    },
  },
};

export const NoSteps: Story = {
  args: {
    flow: {
      ...baseFlow,
      flow_id: 3,
      name: 'Empty Flow (Draft)',
      step_count: 0,
      description: null,
    },
  },
};
