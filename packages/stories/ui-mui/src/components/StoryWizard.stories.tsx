import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StoryWizard } from './StoryWizard';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

const meta: Meta<typeof StoryWizard> = {
  title: 'Domains/Stories/StoryWizard',
  component: StoryWizard,
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
    onComplete: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof StoryWizard>;

export const Open: Story = {};
