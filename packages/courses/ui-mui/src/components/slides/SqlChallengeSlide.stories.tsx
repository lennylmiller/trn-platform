import type { Meta, StoryObj } from '@storybook/react';
import { SqlChallengeSlide } from './SqlChallengeSlide';
import { mockCourseSlides } from '../../../../../../.storybook/mocks/mockData';

const meta: Meta<typeof SqlChallengeSlide> = {
  title: 'Domains/Courses/Slides/SqlChallengeSlide',
  component: SqlChallengeSlide,
  tags: ['autodocs'],
  args: {
    slide: mockCourseSlides[5]!,
  },
};

export default meta;
type Story = StoryObj<typeof SqlChallengeSlide>;

export const Default: Story = {};
