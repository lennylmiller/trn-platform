import type { Meta, StoryObj } from '@storybook/react';
import { ToolCallCard } from './ToolCallCard';

const meta: Meta<typeof ToolCallCard> = {
  title: 'Domains/Chat/ToolCallCard',
  component: ToolCallCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 680 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ToolCallCard>;

export const ExploreSchema: Story = {
  args: {
    toolCall: {
      tool: 'explore_schema',
      input: { table: 'family_eligibility' },
      result: 'family_eligibility\nfamily_eligibility_member\nfamily_eligibility_member_benefit_plan',
    },
  },
};

export const CourseTool: Story = {
  args: {
    toolCall: {
      tool: 'get_course',
      input: { courseId: 42 },
      result: JSON.stringify({
        course_id: 42,
        title: 'Implementation Essentials: Family Enrollment',
        lessons: ['Enrollment Data Trail', 'Coverage Verification'],
      }, null, 2),
    },
  },
};

export const LongResult: Story = {
  args: {
    toolCall: {
      tool: 'run_sql',
      input: { sql: 'SELECT * FROM family_eligibility_member_benefit_plan' },
      result: Array.from({ length: 60 }, (_, idx) => `row ${idx + 1}: member_id=${1000 + idx}, status=active`).join('\n'),
    },
  },
};
