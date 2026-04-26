import type { Meta, StoryObj } from '@storybook/react';
import { ConsoleDrawer } from './ConsoleDrawer';
import type { ConsoleLine } from './ConsoleDrawer';

function makeLine(line: string, stream: 'stdout' | 'stderr' = 'stdout', offsetMs = 0): ConsoleLine {
  return {
    line,
    stream,
    timestamp: new Date(Date.now() + offsetMs),
  };
}

const meta: Meta<typeof ConsoleDrawer> = {
  title: 'Execution/ConsoleDrawer',
  component: ConsoleDrawer,
  tags: ['autodocs'],
  args: {
    open: true,
    onClose: () => {},
    onClear: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof ConsoleDrawer>;

export const Empty: Story = {
  args: {
    lines: [],
  },
};

export const WithOutput: Story = {
  args: {
    lines: [
      makeLine('$ dotnet ef database update', 'stdout', 0),
      makeLine('Build started...', 'stdout', 100),
      makeLine('Build succeeded.', 'stdout', 2000),
      makeLine('Applying migration "20260415_AddMemberTable"...', 'stdout', 2500),
      makeLine('WARNING: Column "legacy_id" has no default value', 'stderr', 3000),
      makeLine('Applying migration "20260415_SeedReferenceData"...', 'stdout', 4000),
      makeLine('Done.', 'stdout', 5000),
    ],
  },
};

export const ManyLines: Story = {
  args: {
    lines: Array.from({ length: 60 }, (_, i) => {
      const isErr = i % 7 === 0;
      return makeLine(
        isErr
          ? `[ERROR] Failed to process record ${i}: validation failed`
          : `[INFO] Processing record ${i + 1} of 60... OK`,
        isErr ? 'stderr' : 'stdout',
        i * 50,
      );
    }),
  },
};

export const StderrOnly: Story = {
  args: {
    lines: [
      makeLine('Error: Cannot connect to database server', 'stderr', 0),
      makeLine('  at SqlConnection.open (connection.ts:42)', 'stderr', 10),
      makeLine('  at Pool.acquire (pool.ts:88)', 'stderr', 20),
      makeLine('Caused by: ECONNREFUSED 127.0.0.1:1433', 'stderr', 30),
      makeLine('Retrying in 5 seconds...', 'stderr', 40),
    ],
  },
};
