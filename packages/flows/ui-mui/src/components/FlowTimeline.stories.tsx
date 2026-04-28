import type { Meta, StoryObj } from '@storybook/react';
import { FlowTimeline } from './FlowTimeline';
import type { FlowStep } from '@trn-platform/shared';

function makeStep(overrides: Partial<FlowStep> & { flow_step_id: number; seq: number; label: string }): FlowStep {
  return {
    flow_id: 1,
    step_id: overrides.flow_step_id,
    pause_after: false,
    presenter_notes: null,
    visible_in_execution: true,
    override_display_queries: null,
    type: 'shell',
    category: 'setup',
    command_text: null,
    description: null,
    display_queries: null,
    ...overrides,
  };
}

const fiveSteps: FlowStep[] = [
  makeStep({ flow_step_id: 1, seq: 1, label: 'Create Schema', type: 'sql', category: 'setup' }),
  makeStep({ flow_step_id: 2, seq: 2, label: 'Run Migrations', type: 'shell', category: 'setup' }),
  makeStep({ flow_step_id: 3, seq: 3, label: 'Seed Data', type: 'sql', category: 'scenario' }),
  makeStep({ flow_step_id: 4, seq: 4, label: 'Sync Environments', type: 'shell', category: 'sync' }),
  makeStep({ flow_step_id: 5, seq: 5, label: 'Verify Output', type: 'manual', category: 'verify' }),
];

const meta: Meta<typeof FlowTimeline> = {
  title: 'Domains/Flows/FlowTimeline',
  component: FlowTimeline,
  tags: ['autodocs'],
  args: {
    onSelectStep: () => {},
    onRemoveStep: () => {},
    onEditStep: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof FlowTimeline>;

export const Default: Story = {
  args: {
    steps: fiveSteps,
  },
};

export const SingleStep: Story = {
  args: {
    steps: [fiveSteps[0]!],
  },
};

export const WithPauses: Story = {
  args: {
    steps: [
      fiveSteps[0]!,
      { ...fiveSteps[1]!, pause_after: true },
      fiveSteps[2]!,
      { ...fiveSteps[3]!, pause_after: true },
      fiveSteps[4]!,
    ],
  },
};

export const Empty: Story = {
  args: {
    steps: [],
  },
};
