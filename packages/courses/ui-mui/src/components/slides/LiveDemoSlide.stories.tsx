import type { Meta, StoryObj } from '@storybook/react';
import { LiveDemoSlide } from './LiveDemoSlide';
import { mockCourseSlides } from '../../../../../../.storybook/mocks/mockData';

const meta: Meta<typeof LiveDemoSlide> = {
  title: 'Domains/Courses/Slides/LiveDemoSlide',
  component: LiveDemoSlide,
  tags: ['autodocs'],
  args: {
    slide: mockCourseSlides[1]!,
  },
};

export default meta;
type Story = StoryObj<typeof LiveDemoSlide>;

export const Default: Story = {};
