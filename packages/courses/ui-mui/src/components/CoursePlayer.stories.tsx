import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { CoursePlayer } from './CoursePlayer';
import { mockCourseDetail } from '../../../../../.storybook/mocks/mockData';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

const meta: Meta<typeof CoursePlayer> = {
  title: 'Domains/Courses/CoursePlayer',
  component: CoursePlayer,
  decorators: [
    (Story) => (
      <QueryClientProvider client={createQueryClient()}>
        <div style={{ height: 760 }}>
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  tags: ['autodocs'],
  args: {
    courseId: 42,
    onExit: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof CoursePlayer>;

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

export const NotFound: Story = {
  args: {
    courseId: 999,
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v2/courses/999', () =>
          HttpResponse.json({ message: 'Course not found' }, { status: 404 }),
        ),
      ],
    },
  },
};
