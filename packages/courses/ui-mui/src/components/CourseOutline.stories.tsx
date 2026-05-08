import type { Meta, StoryObj } from '@storybook/react';
import { CourseOutline } from './CourseOutline';
import { mockCourseDetail } from '../../../../../.storybook/mocks/mockData';

const meta: Meta<typeof CourseOutline> = {
  title: 'Domains/Courses/CourseOutline',
  component: CourseOutline,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 340, height: 620, border: '1px solid #d9dde3' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    lessons: mockCourseDetail.lessons,
    selectedLessonId: 101,
    selectedSlideId: 1002,
    onSelectLesson: () => {},
    onSelectSlide: () => {},
    onAddLesson: () => {},
    onAddSlide: () => {},
    onDeleteLesson: () => {},
    onDeleteSlide: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof CourseOutline>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    lessons: [],
    selectedLessonId: undefined,
    selectedSlideId: undefined,
  },
};

export const ReadOnly: Story = {
  args: {
    onAddLesson: undefined,
    onAddSlide: undefined,
    onDeleteLesson: undefined,
    onDeleteSlide: undefined,
  },
};
