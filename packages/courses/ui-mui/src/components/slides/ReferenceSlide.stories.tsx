import type { Meta, StoryObj } from '@storybook/react';
import { ReferenceSlide } from './ReferenceSlide';
import { mockCourseSlides } from '../../../../../../.storybook/mocks/mockData';

const meta: Meta<typeof ReferenceSlide> = {
  title: 'Domains/Courses/Slides/ReferenceSlide',
  component: ReferenceSlide,
  tags: ['autodocs'],
  args: {
    slide: mockCourseSlides[4]!,
  },
};

export default meta;
type Story = StoryObj<typeof ReferenceSlide>;

export const Default: Story = {};
