import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { StoryPlanView } from './StoryPlanView';
import { mockStoryDetails } from '../../../../../.storybook/mocks/mockData';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

const meta: Meta<typeof StoryPlanView> = {
  title: 'Domains/Stories/StoryPlanView',
  component: StoryPlanView,
  decorators: [
    (Story) => (
      <QueryClientProvider client={createQueryClient()}>
        <div style={{ height: 620, maxWidth: 860 }}>
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  tags: ['autodocs'],
  args: {
    storyId: 1,
    onBack: () => {},
    onPlanItemClick: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof StoryPlanView>;

export const WithPlanItems: Story = {};

export const EmptyPlan: Story = {
  args: {
    storyId: 2,
  },
};

export const NotFound: Story = {
  args: {
    storyId: 999,
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/stories/999', () =>
          HttpResponse.json({ message: 'Story not found' }, { status: 404 }),
        ),
      ],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/stories/1', async () => {
          await new Promise((resolve) => setTimeout(resolve, 999999));
          return HttpResponse.json(mockStoryDetails[1]);
        }),
      ],
    },
  },
};
