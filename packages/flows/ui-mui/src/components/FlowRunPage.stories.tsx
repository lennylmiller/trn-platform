import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { FlowRunPage } from './FlowRunPage';
import type { FlowDetail, FlowStep } from '@trn-platform/shared';

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

const mockFlowDetail: FlowDetail = {
  flow_id: 1,
  name: 'Database Setup Flow',
  description: 'Initializes the database schema and seeds reference data for the training environment.',
  is_seed: false,
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-02-10T14:30:00Z',
  steps: [
    makeStep({
      flow_step_id: 1,
      seq: 1,
      label: 'Create Schema',
      type: 'sql',
      category: 'setup',
      command_text: 'CREATE TABLE training_records (...);',
      description: 'Creates the primary schema for training records.',
    }),
    makeStep({
      flow_step_id: 2,
      seq: 2,
      label: 'Run Migrations',
      type: 'shell',
      category: 'setup',
      command_text: 'dotnet ef database update',
      description: 'Applies all pending Entity Framework migrations.',
      presenter_notes: 'Explain the migration strategy and show the EF migration history table.',
    }),
    makeStep({
      flow_step_id: 3,
      seq: 3,
      label: 'Seed Reference Data',
      type: 'sql',
      category: 'scenario',
      command_text: "INSERT INTO ref_data VALUES ('A', 'Alpha');",
      pause_after: true,
    }),
    makeStep({
      flow_step_id: 4,
      seq: 4,
      label: 'Sync Environments',
      type: 'shell',
      category: 'sync',
      command_text: 'EXEC sp_SyncTraining',
      display_queries: [
        { label: 'Record Count', sql: 'SELECT COUNT(*) FROM training_records' },
      ],
    }),
    makeStep({
      flow_step_id: 5,
      seq: 5,
      label: 'Verify Output',
      type: 'manual',
      category: 'verify',
      description: 'Manually verify the generated report matches expected layout and data.',
    }),
  ],
};

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

const meta: Meta<typeof FlowRunPage> = {
  title: 'Flows/FlowRunPage',
  component: FlowRunPage,
  decorators: [
    (Story) => (
      <QueryClientProvider client={createQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  tags: ['autodocs'],
  args: {
    flowId: 1,
    onAbort: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof FlowRunPage>;

export const Idle: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/flows/1', () => HttpResponse.json(mockFlowDetail)),
      ],
    },
  },
};

export const Running: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/flows/1', () => HttpResponse.json(mockFlowDetail)),
      ],
    },
  },
};

export const Paused: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/flows/1', () => HttpResponse.json(mockFlowDetail)),
      ],
    },
  },
};

export const Complete: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/flows/1', () => HttpResponse.json(mockFlowDetail)),
      ],
    },
  },
};
