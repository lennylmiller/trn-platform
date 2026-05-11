import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { CourseEditor } from './CourseEditor';
import { mockCourseDetail } from '../../../../../.storybook/mocks/mockData';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

const meta: Meta<typeof CourseEditor> = {
  title: 'Domains/Courses/CourseEditor',
  component: CourseEditor,
  decorators: [
    (Story) => (
      <QueryClientProvider client={createQueryClient()}>
        <div style={{ height: 820 }}>
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  tags: ['autodocs'],
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/courses/42', () =>
          HttpResponse.json(mockCourseDetail),
        ),
      ],
    },
  },
  args: {
    courseId: 42,
    onExit: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof CourseEditor>;

export const Default: Story = {};

export const EmptyCourse: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/courses/42', () =>
          HttpResponse.json({ ...mockCourseDetail, lessons: [] }),
        ),
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/courses/42', () =>
          HttpResponse.json({ message: 'Failed to load course' }, { status: 500 }),
        ),
      ],
    },
  },
};
