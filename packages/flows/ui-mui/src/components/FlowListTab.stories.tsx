import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { FlowListTab } from './FlowListTab';
import type { FlowListItem } from '@trn-platform/shared';

const mockFlows: FlowListItem[] = [
  {
    flow_id: 1,
    name: 'Database Setup Flow',
    description: 'Initializes the database schema and seeds reference data.',
    is_seed: false,
    step_count: 5,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-02-10T14:30:00Z',
  },
  {
    flow_id: 2,
    name: 'Full Training Pipeline',
    description: 'End-to-end training pipeline with all setup, scenario, and verification steps.',
    is_seed: true,
    step_count: 12,
    created_at: '2026-01-20T08:00:00Z',
    updated_at: '2026-03-01T09:00:00Z',
  },
  {
    flow_id: 3,
    name: 'Quick Verify',
    description: null,
    is_seed: false,
    step_count: 2,
    created_at: '2026-02-01T11:00:00Z',
    updated_at: null,
  },
];

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

const meta: Meta<typeof FlowListTab> = {
  title: 'Flows/FlowListTab',
  component: FlowListTab,
  decorators: [
    (Story) => (
      <QueryClientProvider client={createQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  tags: ['autodocs'],
  args: {
    onNewFlow: () => {},
    onOpenDev: () => {},
    onPresent: () => {},
    onDelete: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof FlowListTab>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/flows', () => HttpResponse.json(mockFlows)),
      ],
    },
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/flows', () => HttpResponse.json([])),
      ],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/flows', async () => {
          await new Promise((resolve) => setTimeout(resolve, 999999));
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/flows', () =>
          HttpResponse.json({ message: 'Internal server error' }, { status: 500 }),
        ),
      ],
    },
  },
};
