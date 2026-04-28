import type { Meta, StoryObj } from '@storybook/react';
import { CompositionBlockCard } from './CompositionBlockCard';
import type { CompositionBlock } from '@trn-platform/shared';

const baseBlock: CompositionBlock = {
  block_id: 1,
  composition_id: 1,
  seq: 1,
  block_type: 'narrative',
  content: 'In this section we introduce the concept of data synchronization between systems.',
  technical_content: null,
  flow_id: null,
  ref_composition_id: null,
  heading: null,
  presenter_notes: null,
  flow_name: null,
  flow_description: null,
  flow_step_count: null,
  ref_composition_title: null,
  ref_composition_kind: null,
};

const meta: Meta<typeof CompositionBlockCard> = {
  title: 'Domains/Compositions/CompositionBlockCard',
  component: CompositionBlockCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CompositionBlockCard>;

export const Narrative: Story = {
  args: {
    block: baseBlock,
  },
};

export const FlowBlock: Story = {
  args: {
    block: {
      ...baseBlock,
      block_id: 2,
      seq: 2,
      block_type: 'flow',
      content: null,
      flow_id: 10,
      flow_name: 'Database Migration Flow',
      flow_description: 'Applies all pending migrations',
      flow_step_count: 5,
    },
  },
};

export const NoteBlock: Story = {
  args: {
    block: {
      ...baseBlock,
      block_id: 3,
      seq: 3,
      block_type: 'note',
      content: null,
      technical_content: 'SELECT COUNT(*) FROM sync_log WHERE status = \'failed\' AND created_at > DATEADD(hour, -1, GETDATE())',
    },
  },
};

export const CompositionBlockType: Story = {
  args: {
    block: {
      ...baseBlock,
      block_id: 4,
      seq: 4,
      block_type: 'composition',
      content: null,
      ref_composition_id: 5,
      ref_composition_title: 'Database Fundamentals',
      ref_composition_kind: 'tutorial',
    },
  },
};

export const WithHeading: Story = {
  args: {
    block: {
      ...baseBlock,
      heading: 'Introduction to Sync Concepts',
    },
  },
};
