import type { Meta, StoryObj } from '@storybook/react';
import { SlideRenderer } from './SlideRenderer';
import { mockCourseSlides } from '../../../../../.storybook/mocks/mockData';

const meta: Meta<typeof SlideRenderer> = {
  title: 'Domains/Courses/SlideRenderer',
  component: SlideRenderer,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 900, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SlideRenderer>;

export const Narrative: Story = {
  args: {
    slide: mockCourseSlides[0]!,
  },
};

export const LiveDemo: Story = {
  args: {
    slide: mockCourseSlides[1]!,
  },
};

export const Quiz: Story = {
  args: {
    slide: mockCourseSlides[2]!,
  },
};

export const DoItInQc: Story = {
  args: {
    slide: mockCourseSlides[3]!,
  },
};

export const Reference: Story = {
  args: {
    slide: mockCourseSlides[4]!,
  },
};

export const SqlChallenge: Story = {
  args: {
    slide: mockCourseSlides[5]!,
  },
};

export const ScreenshotTask: Story = {
  args: {
    slide: mockCourseSlides[6]!,
  },
};
