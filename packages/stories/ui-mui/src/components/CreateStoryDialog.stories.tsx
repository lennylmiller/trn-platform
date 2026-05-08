import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateStoryDialog } from './CreateStoryDialog';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

const meta: Meta<typeof CreateStoryDialog> = {
  title: 'Domains/Stories/CreateStoryDialog',
  component: CreateStoryDialog,
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
    onCreated: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof CreateStoryDialog>;

export const Open: Story = {};
