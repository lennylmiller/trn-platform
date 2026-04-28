import type { Meta, StoryObj } from '@storybook/react';
import { StepCard } from './StepCard';
import type { Step } from '@trn-platform/shared';

const baseStep: Step = {
  step_id: 1,
  label: 'Run Database Migration',
  type: 'shell',
  category: 'setup',
  command_text: 'dotnet ef database update',
  description: 'Applies all pending Entity Framework migrations to the target database.',
  display_queries: null,
  is_seed: false,
  created_at: '2026-01-15T10:00:00Z',
  updated_at: null,
};

const meta: Meta<typeof StepCard> = {
  title: 'Domains/Steps/StepCard',
  component: StepCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StepCard>;

export const Default: Story = {
  args: {
    step: baseStep,
  },
};

export const SqlStep: Story = {
  args: {
    step: {
      ...baseStep,
      step_id: 2,
      label: 'Seed Reference Data',
      type: 'sql',
      category: 'setup',
      command_text: "INSERT INTO ref_data (code, name) VALUES ('A', 'Alpha');",
      description: 'Seeds the reference data tables with initial values.',
    },
  },
};

export const ManualStep: Story = {
  args: {
    step: {
      ...baseStep,
      step_id: 3,
      label: 'Verify Report Output',
      type: 'manual',
      category: 'verify',
      command_text: null,
      description: 'Manually verify that the generated report matches the expected layout and data.',
    },
  },
};

export const WithDescription: Story = {
  args: {
    step: {
      ...baseStep,
      description:
        'This is a longer description that should be truncated after two lines. It contains detailed information about what the step does, including edge cases and prerequisites that need to be met before execution.',
    },
  },
};

export const WithDisplayQueries: Story = {
  args: {
    step: {
      ...baseStep,
      step_id: 4,
      label: 'Insert Training Records',
      type: 'sql',
      category: 'scenario',
      display_queries: [
        { label: 'Record Count', sql: 'SELECT COUNT(*) FROM training_records' },
        { label: 'Latest Record', sql: 'SELECT TOP 1 * FROM training_records ORDER BY created_at DESC' },
      ],
    },
  },
};
