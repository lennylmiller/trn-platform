import type { Meta, StoryObj } from '@storybook/react';
import { ScreenshotTaskSlide } from './ScreenshotTaskSlide';
import { mockCourseSlides } from '../../../../../../.storybook/mocks/mockData';

const meta: Meta<typeof ScreenshotTaskSlide> = {
  title: 'Domains/Courses/Slides/ScreenshotTaskSlide',
  component: ScreenshotTaskSlide,
  tags: ['autodocs'],
  args: {
    slide: mockCourseSlides[6]!,
  },
};

export default meta;
type Story = StoryObj<typeof ScreenshotTaskSlide>;

export const Default: Story = {};
