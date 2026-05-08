import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { ChatPanel } from './ChatPanel';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

const meta: Meta<typeof ChatPanel> = {
  title: 'Domains/Chat/ChatPanel',
  component: ChatPanel,
  decorators: [
    (Story) => (
      <QueryClientProvider client={createQueryClient()}>
        <div style={{ height: 620, maxWidth: 420, border: '1px solid #d9dde3' }}>
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  tags: ['autodocs'],
  args: {
    context: { courseId: 42 },
    persistKey: 'storybook-chat-panel',
    onResponse: () => {},
    onToolCall: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof ChatPanel>;

export const StepAuthoringAssistant: Story = {};

export const CourseAuthoringAssistant: Story = {
  args: {
    systemPromptHint: 'course-authoring',
    persistKey: 'storybook-course-chat-panel',
  },
};

export const ErrorResponse: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('*/api/v2/chat', () =>
          HttpResponse.json({ message: 'Chat provider is unavailable' }, { status: 503 }),
        ),
      ],
    },
  },
};
