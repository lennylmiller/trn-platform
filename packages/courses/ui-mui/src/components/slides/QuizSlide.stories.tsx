import type { Meta, StoryObj } from '@storybook/react';
import { QuizSlide } from './QuizSlide';
import { mockCourseSlides } from '../../../../../../.storybook/mocks/mockData';

const meta: Meta<typeof QuizSlide> = {
  title: 'Domains/Courses/Slides/QuizSlide',
  component: QuizSlide,
  tags: ['autodocs'],
  args: {
    slide: mockCourseSlides[2]!,
  },
};

export default meta;
type Story = StoryObj<typeof QuizSlide>;

export const Default: Story = {};
