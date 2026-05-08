import type { Meta, StoryObj } from '@storybook/react';
import { SlideEditorForm } from './SlideEditorForm';
import { mockCourseSlides } from '../../../../../.storybook/mocks/mockData';

const meta: Meta<typeof SlideEditorForm> = {
  title: 'Domains/Courses/SlideEditorForm',
  component: SlideEditorForm,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 420, height: 720, border: '1px solid #d9dde3' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    onSave: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof SlideEditorForm>;

export const Narrative: Story = {
  args: {
    slide: mockCourseSlides[0]!,
  },
};

export const Quiz: Story = {
  args: {
    slide: mockCourseSlides[2]!,
  },
};

export const DoItInQcSaving: Story = {
  args: {
    slide: mockCourseSlides[3]!,
    isSaving: true,
  },
};
