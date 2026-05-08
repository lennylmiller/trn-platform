import type { Meta, StoryObj } from '@storybook/react';
import { MessageBubble } from './MessageBubble';

const meta: Meta<typeof MessageBubble> = {
  title: 'Domains/Chat/MessageBubble',
  component: MessageBubble,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 620 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MessageBubble>;

export const User: Story = {
  args: {
    message: {
      role: 'user',
      content: 'Create a lesson that teaches family eligibility and PCP assignment.',
    },
  },
};

export const Assistant: Story = {
  args: {
    message: {
      role: 'assistant',
      content: 'I found the enrollment tables and drafted a lesson outline with a live SQL demo, a quiz, and a QC verification task.',
    },
  },
};

export const AssistantWithCode: Story = {
  args: {
    message: {
      role: 'assistant',
      content: 'Use `family_eligibility_member_benefit_plan` to validate the member coverage chain.',
    },
  },
};
