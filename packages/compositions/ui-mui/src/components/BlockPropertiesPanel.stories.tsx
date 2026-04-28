import type { Meta, StoryObj } from '@storybook/react';
import { BlockPropertiesPanel } from './BlockPropertiesPanel';
import type { CompositionBlock } from '@trn-platform/shared';

const narrativeBlock: CompositionBlock = {
  block_id: 1,
  composition_id: 1,
  seq: 1,
  block_type: 'narrative',
  content: 'In this section we explore the core concepts of data synchronization.',
  technical_content: null,
  flow_id: null,
  ref_composition_id: null,
  heading: 'Introduction',
  presenter_notes: 'Remember to explain the three pillars of sync.',
  flow_name: null,
  flow_description: null,
  flow_step_count: null,
  ref_composition_title: null,
  ref_composition_kind: null,
};

const meta: Meta<typeof BlockPropertiesPanel> = {
  title: 'Domains/Compositions/BlockPropertiesPanel',
  component: BlockPropertiesPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof BlockPropertiesPanel>;

export const NarrativeBlock: Story = {
  args: {
    block: narrativeBlock,
  },
};

export const FlowBlock: Story = {
  args: {
    block: {
      ...narrativeBlock,
      block_id: 2,
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
      ...narrativeBlock,
      block_id: 3,
      block_type: 'note',
      content: null,
      technical_content: 'SELECT * FROM sync_log ORDER BY created_at DESC',
      heading: 'Verify Sync Status',
    },
  },
};

export const CompositionRefBlock: Story = {
  args: {
    block: {
      ...narrativeBlock,
      block_id: 4,
      block_type: 'composition',
      content: null,
      ref_composition_id: 5,
      ref_composition_title: 'Database Fundamentals',
      ref_composition_kind: 'tutorial',
    },
  },
};

export const NoBlockSelected: Story = {
  args: {
    block: null,
  },
};
