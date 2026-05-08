import type { Meta, StoryObj } from '@storybook/react';
import { NarrativeSlide } from './NarrativeSlide';
import { mockCourseSlides } from '../../../../../../.storybook/mocks/mockData';

const meta: Meta<typeof NarrativeSlide> = {
  title: 'Domains/Courses/Slides/NarrativeSlide',
  component: NarrativeSlide,
  tags: ['autodocs'],
  args: {
    slide: mockCourseSlides[0]!,
  },
};

export default meta;
type Story = StoryObj<typeof NarrativeSlide>;

export const Default: Story = {};
