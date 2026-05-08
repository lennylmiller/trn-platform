import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DoItInQcSlide } from './DoItInQcSlide';
import { mockCourseSlides } from '../../../../../../.storybook/mocks/mockData';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

const meta: Meta<typeof DoItInQcSlide> = {
  title: 'Domains/Courses/Slides/DoItInQcSlide',
  component: DoItInQcSlide,
  decorators: [
    (Story) => (
      <QueryClientProvider client={createQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  tags: ['autodocs'],
  args: {
    slide: mockCourseSlides[3]!,
  },
};

export default meta;
type Story = StoryObj<typeof DoItInQcSlide>;

export const Default: Story = {};
