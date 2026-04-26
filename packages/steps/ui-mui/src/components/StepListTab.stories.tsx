import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { StepListTab } from './StepListTab';
import type { Step } from '@trn-platform/shared';

const mockSteps: Step[] = [
  {
    step_id: 1,
    label: 'Run Database Migration',
    type: 'shell',
    category: 'setup',
    command_text: 'dotnet ef database update',
    description: 'Applies all pending EF migrations.',
    display_queries: null,
    is_seed: false,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: null,
  },
  {
    step_id: 2,
    label: 'Seed Reference Data',
    type: 'sql',
    category: 'setup',
    command_text: "INSERT INTO ref_data VALUES ('A', 'Alpha');",
    description: 'Seeds reference data tables.',
    display_queries: [{ label: 'Count', sql: 'SELECT COUNT(*) FROM ref_data' }],
    is_seed: true,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: null,
  },
  {
    step_id: 3,
    label: 'Verify Report Output',
    type: 'manual',
    category: 'verify',
    command_text: null,
    description: 'Manually verify the generated report.',
    display_queries: null,
    is_seed: false,
    created_at: '2026-01-16T10:00:00Z',
    updated_at: null,
  },
  {
    step_id: 4,
    label: 'Sync Training Data',
    type: 'sql',
    category: 'sync',
    command_text: 'EXEC sp_SyncTraining',
    description: 'Synchronizes data from source to training environment.',
    display_queries: null,
    is_seed: false,
    created_at: '2026-01-17T10:00:00Z',
    updated_at: null,
  },
];

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

const meta: Meta<typeof StepListTab> = {
  title: 'Steps/StepListTab',
  component: StepListTab,
  decorators: [
    (Story) => (
      <QueryClientProvider client={createQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StepListTab>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/steps', () => HttpResponse.json(mockSteps)),
      ],
    },
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/steps', () => HttpResponse.json([])),
      ],
    },
  },
};

export const FilteredByCategory: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/steps', () => HttpResponse.json(mockSteps)),
      ],
    },
  },
};

export const SearchResults: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/steps', () => HttpResponse.json(mockSteps)),
      ],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/steps', async () => {
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
        http.get('*/api/v2/steps', () =>
          HttpResponse.json({ message: 'Internal server error' }, { status: 500 }),
        ),
      ],
    },
  },
};
