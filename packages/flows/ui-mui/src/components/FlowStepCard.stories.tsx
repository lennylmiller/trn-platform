import type { Meta, StoryObj } from '@storybook/react';
import { FlowStepCard } from './FlowStepCard';
import type { FlowStep } from '@trn-platform/shared';

const baseFlowStep: FlowStep = {
  flow_step_id: 101,
  flow_id: 1,
  step_id: 10,
  seq: 1,
  pause_after: false,
  presenter_notes: null,
  visible_in_execution: true,
  override_display_queries: null,
  label: 'Run Database Migration',
  type: 'shell',
  category: 'setup',
  command_text: 'dotnet ef database update',
  description: 'Applies all pending EF migrations.',
  display_queries: null,
};

const meta: Meta<typeof FlowStepCard> = {
  title: 'Domains/Flows/FlowStepCard',
  component: FlowStepCard,
  tags: ['autodocs'],
  args: {
    index: 0,
    onSelect: () => {},
    onRemove: () => {},
    onEdit: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof FlowStepCard>;

export const ShellStep: Story = {
  args: {
    step: baseFlowStep,
    index: 0,
  },
};

export const SqlStep: Story = {
  args: {
    step: {
      ...baseFlowStep,
      flow_step_id: 102,
      step_id: 11,
      seq: 2,
      label: 'Seed Reference Data',
      type: 'sql',
      category: 'setup',
      command_text: "INSERT INTO ref_data VALUES ('A', 'Alpha');",
      description: 'Seeds reference data tables with initial values.',
    },
    index: 1,
  },
};

export const ManualStep: Story = {
  args: {
    step: {
      ...baseFlowStep,
      flow_step_id: 103,
      step_id: 12,
      seq: 3,
      label: 'Verify Report Output',
      type: 'manual',
      category: 'verify',
      command_text: null,
      description: 'Manually verify the generated report matches expected layout.',
    },
    index: 2,
  },
};

export const WithPause: Story = {
  args: {
    step: {
      ...baseFlowStep,
      flow_step_id: 104,
      step_id: 13,
      seq: 4,
      label: 'Run Sync Procedure',
      type: 'sql',
      category: 'sync',
      pause_after: true,
      command_text: 'EXEC sp_SyncTraining',
      description: 'Synchronizes data from source to training.',
    },
    index: 3,
  },
};

export const WithNotes: Story = {
  args: {
    step: {
      ...baseFlowStep,
      flow_step_id: 105,
      step_id: 14,
      seq: 5,
      label: 'Validate Output Tables',
      type: 'sql',
      category: 'verify',
      presenter_notes:
        'Make sure to highlight the record count difference before and after the sync. This is a key talking point for the training session.',
    },
    index: 4,
  },
};
