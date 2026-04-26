import type { Meta, StoryObj } from '@storybook/react';
import { PropertiesPanel } from './PropertiesPanel';
import type { FlowStep } from '@trn-platform/shared';

const baseStep: FlowStep = {
  flow_step_id: 101,
  flow_id: 1,
  step_id: 10,
  seq: 1,
  pause_after: false,
  presenter_notes: null,
  visible_in_execution: true,
  override_display_queries: null,
  label: 'Run Database Migration',
  type: 'shell',
  category: 'setup',
  command_text: 'dotnet ef database update',
  description: 'Applies all pending EF migrations.',
  display_queries: null,
};

const meta: Meta<typeof PropertiesPanel> = {
  title: 'Flows/PropertiesPanel',
  component: PropertiesPanel,
  tags: ['autodocs'],
  args: {
    onUpdate: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof PropertiesPanel>;

export const Default: Story = {
  args: {
    step: baseStep,
  },
};

export const WithNotes: Story = {
  args: {
    step: {
      ...baseStep,
      presenter_notes:
        'Explain the migration strategy and show the EF migration history table after execution.',
      pause_after: true,
    },
  },
};

export const WithOverrides: Story = {
  args: {
    step: {
      ...baseStep,
      override_display_queries: [
        { label: 'Migration Count', sql: 'SELECT COUNT(*) FROM __EFMigrationsHistory' },
        { label: 'Latest Migration', sql: 'SELECT TOP 1 * FROM __EFMigrationsHistory ORDER BY MigrationId DESC' },
      ],
    },
  },
};

export const NoStepSelected: Story = {
  args: {
    step: null,
  },
};
