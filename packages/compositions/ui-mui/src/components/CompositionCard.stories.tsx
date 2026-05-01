import type { Meta, StoryObj } from '@storybook/react';
import { CompositionCard } from './CompositionCard';
import type { CompositionListItem } from '@trn-platform/shared';

const baseComposition: CompositionListItem = {
  composition_id: 1,
  kind: 'story',
  title: 'Getting Started with Data Sync',
  description: 'A walkthrough of the data synchronization process from initial setup to verification.',
  is_seed: false,
  block_count: 5,
  flow_count: 2,
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-20T14:30:00Z',
};

const meta: Meta<typeof CompositionCard> = {
  title: 'Domains/Compositions/CompositionCard',
  component: CompositionCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CompositionCard>;

export const StoryKind: Story = {
  name: 'Story',
  args: {
    composition: baseComposition,
  },
};

export const Tutorial: Story = {
  args: {
    composition: {
      ...baseComposition,
      composition_id: 2,
      kind: 'tutorial',
      title: 'Setting Up Your First Flow',
      description: 'Step-by-step tutorial for creating and running a basic flow.',
      block_count: 8,
      flow_count: 3,
    },
  },
};

export const Module: Story = {
  args: {
    composition: {
      ...baseComposition,
      composition_id: 3,
      kind: 'module',
      title: 'Advanced SQL Patterns',
      description: 'Comprehensive module covering CTEs, window functions, and recursive queries.',
      block_count: 12,
      flow_count: 5,
    },
  },
};

export const WithDescription: Story = {
  args: {
    composition: {
      ...baseComposition,
      description:
        'This is a very long description that should be truncated after three lines. It contains extensive details about the composition content, including the learning objectives, prerequisites, and expected outcomes for participants who complete all blocks in order.',
    },
  },
};

export const ManyBlocks: Story = {
  args: {
    composition: {
      ...baseComposition,
      title: 'Full Platform Onboarding',
      block_count: 42,
      flow_count: 15,
    },
  },
};
