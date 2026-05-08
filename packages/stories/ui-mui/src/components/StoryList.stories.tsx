import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { StoryList } from './StoryList';
import { mockStories } from '../../../../../.storybook/mocks/mockData';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

const meta: Meta<typeof StoryList> = {
  title: 'Domains/Stories/StoryList',
  component: StoryList,
  decorators: [
    (Story) => (
      <QueryClientProvider client={createQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  tags: ['autodocs'],
  args: {
    onStoryClick: () => {},
    onNewStory: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof StoryList>;

export const Default: Story = {};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/stories', () => HttpResponse.json([])),
      ],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/stories', async () => {
          await new Promise((resolve) => setTimeout(resolve, 999999));
          return HttpResponse.json(mockStories);
        }),
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/stories', () =>
          HttpResponse.json({ message: 'Failed to load story list' }, { status: 500 }),
        ),
      ],
    },
  },
};
