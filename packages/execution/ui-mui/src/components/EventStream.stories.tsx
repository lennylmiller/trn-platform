import type { Meta, StoryObj } from '@storybook/react';
import { EventStream } from './EventStream';
import type { SSEEvent } from './EventStream';

function makeEvent(type: string, data: unknown, offsetMs = 0): SSEEvent {
  return {
    type,
    data,
    timestamp: new Date(Date.now() + offsetMs),
  };
}

const meta: Meta<typeof EventStream> = {
  title: 'Domains/Execution/EventStream',
  component: EventStream,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 600, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EventStream>;

export const Empty: Story = {
  args: {
    events: [],
  },
};

export const SingleEvent: Story = {
  args: {
    events: [
      makeEvent('execution:start', { executionId: 'abc-123', message: 'Starting flow: Setup Environment' }),
    ],
  },
};

export const MultipleEvents: Story = {
  args: {
    events: [
      makeEvent('execution:start', { executionId: 'abc-123', message: 'Starting flow: Setup Environment' }, 0),
      makeEvent('step:start', { stepId: 1, label: 'Run Database Migration', type: 'shell' }, 100),
      makeEvent('step:output', { stepId: 1, line: 'Build started...', stream: 'stdout' }, 500),
      makeEvent('step:output', { stepId: 1, line: 'Build succeeded.', stream: 'stdout' }, 2000),
      makeEvent('step:output', { stepId: 1, line: 'Applying migration...', stream: 'stdout' }, 3000),
      makeEvent('step:complete', { stepId: 1, exitCode: 0 }, 4000),
      makeEvent('step:start', { stepId: 2, label: 'Seed Reference Data', type: 'sql' }, 4100),
      makeEvent('step:output', { stepId: 2, line: '15 row(s) affected', stream: 'stdout' }, 4500),
      makeEvent('step:complete', { stepId: 2, exitCode: 0 }, 4600),
      makeEvent('step:start', { stepId: 3, label: 'Verify Setup', type: 'manual' }, 4700),
      makeEvent('step:paused', { stepId: 3, label: 'Verify Setup', message: 'Manual step - waiting for user' }, 4800),
      makeEvent('execution:complete', { executionId: 'abc-123', message: 'Flow complete: Setup Environment' }, 10000),
    ],
  },
};

export const WithErrors: Story = {
  args: {
    events: [
      makeEvent('execution:start', { executionId: 'err-456', message: 'Starting flow: Load Claims' }, 0),
      makeEvent('step:start', { stepId: 10, label: 'Connect to Database', type: 'shell' }, 100),
      makeEvent('step:output', { stepId: 10, line: 'Connecting to qc_core...', stream: 'stdout' }, 500),
      makeEvent('step:output', { stepId: 10, line: 'Error: ECONNREFUSED 127.0.0.1:1433', stream: 'stderr' }, 2000),
      makeEvent('step:error', { stepId: 10, message: 'Process exited with code 1', exitCode: 1 }, 2500),
    ],
  },
};
