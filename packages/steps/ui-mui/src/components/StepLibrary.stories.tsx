import type { Meta, StoryObj } from '@storybook/react';
import { StepLibrary } from './StepLibrary';
import type { Step } from '@trn-platform/shared';

const mockSteps: Step[] = [
  {
    step_id: 1,
    label: 'Run Database Migration',
    type: 'shell',
    category: 'setup',
    command_text: 'dotnet ef database update',
    description: 'Applies all pending EF migrations.',
    display_queries: null,
    is_seed: false,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: null,
  },
  {
    step_id: 2,
    label: 'Seed Reference Data',
    type: 'sql',
    category: 'setup',
    command_text: "INSERT INTO ref_data VALUES ('A', 'Alpha');",
    description: 'Seeds reference data tables.',
    display_queries: [{ label: 'Count', sql: 'SELECT COUNT(*) FROM ref_data' }],
    is_seed: true,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: null,
  },
  {
    step_id: 3,
    label: 'Verify Report Output',
    type: 'manual',
    category: 'verify',
    command_text: null,
    description: 'Manually verify the generated report.',
    display_queries: null,
    is_seed: false,
    created_at: '2026-01-16T10:00:00Z',
    updated_at: null,
  },
  {
    step_id: 4,
    label: 'Sync Training Data',
    type: 'sql',
    category: 'sync',
    command_text: 'EXEC sp_SyncTraining',
    description: 'Synchronizes data from source to training environment.',
    display_queries: null,
    is_seed: false,
    created_at: '2026-01-17T10:00:00Z',
    updated_at: null,
  },
  {
    step_id: 5,
    label: 'Clear Temp Tables',
    type: 'sql',
    category: 'utility',
    command_text: 'TRUNCATE TABLE temp_staging;',
    description: 'Clears temporary staging tables before import.',
    display_queries: null,
    is_seed: false,
    created_at: '2026-01-18T10:00:00Z',
    updated_at: null,
  },
];

const meta: Meta<typeof StepLibrary> = {
  title: 'Steps/StepLibrary',
  component: StepLibrary,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 280, border: '1px solid #e0e0e0', borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StepLibrary>;

export const Default: Story = {
  args: {
    steps: mockSteps,
  },
};

export const Empty: Story = {
  args: {
    steps: [],
  },
};

export const Filtered: Story = {
  args: {
    steps: mockSteps.filter((s) => s.type === 'sql'),
  },
};
