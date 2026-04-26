import type { Meta, StoryObj } from '@storybook/react';
import { CompositionRunPage } from './CompositionRunPage';
import type { CompositionBlock } from '@trn-platform/shared';

const narrativeBlock: CompositionBlock = {
  block_id: 1,
  composition_id: 1,
  seq: 1,
  block_type: 'narrative',
  content: 'Data synchronization is the process of establishing consistency among data from a source to a target data storage and vice versa, continuously harmonizing the data over time.\n\nThis is a fundamental concept in modern distributed systems where multiple services need to maintain consistent views of shared data.',
  technical_content: null,
  flow_id: null,
  ref_composition_id: null,
  heading: 'What is Data Synchronization?',
  presenter_notes: 'Start by asking the audience about their experience with data sync issues.',
  flow_name: null,
  flow_description: null,
  flow_step_count: null,
  ref_composition_title: null,
  ref_composition_kind: null,
};

const flowBlock: CompositionBlock = {
  ...narrativeBlock,
  block_id: 2,
  seq: 2,
  block_type: 'flow',
  content: null,
  heading: 'Run the Sync Demo',
  flow_id: 10,
  flow_name: 'Database Sync Flow',
  flow_description: 'Demonstrates a full sync cycle between source and target databases.',
  flow_step_count: 7,
  presenter_notes: 'Walk through each step, pausing after the conflict resolution step.',
};

const noteBlock: CompositionBlock = {
  ...narrativeBlock,
  block_id: 3,
  seq: 3,
  block_type: 'note',
  content: null,
  heading: 'Check Sync Status',
  technical_content: "SELECT s.source_table, s.target_table, s.last_sync_at,\n       s.records_synced, s.status\nFROM sync_log s\nWHERE s.created_at > DATEADD(hour, -1, GETDATE())\nORDER BY s.created_at DESC;",
  presenter_notes: null,
};

const compositionBlock: CompositionBlock = {
  ...narrativeBlock,
  block_id: 4,
  seq: 4,
  block_type: 'composition',
  content: null,
  heading: 'Deep Dive',
  ref_composition_id: 5,
  ref_composition_title: 'Conflict Resolution Strategies',
  ref_composition_kind: 'tutorial',
  presenter_notes: 'Only drill in if the audience wants more detail on conflict resolution.',
};

const meta: Meta<typeof CompositionRunPage> = {
  title: 'Compositions/CompositionRunPage',
  component: CompositionRunPage,
  tags: ['autodocs'],
  args: {
    onNext: () => {},
    onPrev: () => {},
    onDrillIn: () => {},
    onDrillOut: () => {},
    onRunFlow: () => {},
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CompositionRunPage>;

export const NarrativeBlock: Story = {
  args: {
    title: 'Data Synchronization Overview',
    kind: 'story',
    currentBlock: narrativeBlock,
    currentBlockIndex: 0,
    totalBlocks: 4,
    isFirst: true,
    isLast: false,
    canDrillOut: false,
  },
};

export const FlowBlock: Story = {
  args: {
    title: 'Data Synchronization Overview',
    kind: 'story',
    currentBlock: flowBlock,
    currentBlockIndex: 1,
    totalBlocks: 4,
    isFirst: false,
    isLast: false,
    canDrillOut: false,
  },
};

export const NoteBlock: Story = {
  args: {
    title: 'Data Synchronization Overview',
    kind: 'story',
    currentBlock: noteBlock,
    currentBlockIndex: 2,
    totalBlocks: 4,
    isFirst: false,
    isLast: false,
    canDrillOut: false,
  },
};

export const NestedComposition: Story = {
  args: {
    title: 'Conflict Resolution Strategies',
    kind: 'tutorial',
    currentBlock: {
      ...narrativeBlock,
      heading: 'Understanding Conflicts',
      content: 'When two systems modify the same record, a conflict occurs. This tutorial covers three strategies for resolving such conflicts.',
    },
    currentBlockIndex: 0,
    totalBlocks: 6,
    isFirst: true,
    isLast: false,
    canDrillOut: true,
  },
};

export const FirstBlock: Story = {
  args: {
    title: 'Data Synchronization Overview',
    kind: 'story',
    currentBlock: narrativeBlock,
    currentBlockIndex: 0,
    totalBlocks: 4,
    isFirst: true,
    isLast: false,
    canDrillOut: false,
  },
};

export const LastBlock: Story = {
  args: {
    title: 'Data Synchronization Overview',
    kind: 'story',
    currentBlock: compositionBlock,
    currentBlockIndex: 3,
    totalBlocks: 4,
    isFirst: false,
    isLast: true,
    canDrillOut: false,
  },
};
