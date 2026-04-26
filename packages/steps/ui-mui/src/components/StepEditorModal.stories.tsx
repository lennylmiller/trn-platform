import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { StepEditorModal } from './StepEditorModal';
import type { Step } from '@trn-platform/shared';

const existingStep: Step = {
  step_id: 1,
  label: 'Run Database Migration',
  type: 'shell',
  category: 'setup',
  command_text: 'dotnet ef database update',
  description: 'Applies all pending EF migrations.',
  display_queries: [
    { label: 'Migration History', sql: 'SELECT * FROM __EFMigrationsHistory' },
  ],
  is_seed: false,
  created_at: '2026-01-15T10:00:00Z',
  updated_at: null,
};

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

const meta: Meta<typeof StepEditorModal> = {
  title: 'Steps/StepEditorModal',
  component: StepEditorModal,
  decorators: [
    (Story) => (
      <QueryClientProvider client={createQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  tags: ['autodocs'],
  args: {
    open: true,
    onClose: () => {},
  },
  parameters: {
    msw: {
      handlers: [
        http.post('*/api/v2/steps', async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ step_id: 99, ...body, is_seed: false, created_at: new Date().toISOString(), updated_at: null });
        }),
        http.put('*/api/v2/steps/:id', async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ ...existingStep, ...body, updated_at: new Date().toISOString() });
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StepEditorModal>;

export const CreateNew: Story = {
  args: {
    step: undefined,
  },
};

export const EditExisting: Story = {
  args: {
    step: existingStep,
  },
};

export const ValidationError: Story = {
  args: {
    step: undefined,
  },
};
