import type { Meta, StoryObj } from '@storybook/react';
import { SqlResultsModal } from './SqlResultsModal';
import type { SqlResult } from '@trn-platform/shared';

const meta: Meta<typeof SqlResultsModal> = {
  title: 'Domains/Execution/SqlResultsModal',
  component: SqlResultsModal,
  tags: ['autodocs'],
  args: {
    open: true,
    onClose: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof SqlResultsModal>;

const defaultResult: SqlResult = {
  columns: ['member_id', 'first_name', 'last_name', 'dob', 'status'],
  rows: Array.from({ length: 10 }, (_, i) => ({
    member_id: 1000 + i,
    first_name: ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Hank', 'Ivy', 'Jack'][i],
    last_name: ['Smith', 'Jones', 'Brown', 'Wilson', 'Davis', 'Clark', 'Moore', 'Hall', 'Lee', 'King'][i],
    dob: `199${i}-0${(i % 9) + 1}-15`,
    status: i % 3 === 0 ? 'active' : 'inactive',
  })),
  rowCount: 10,
};

export const Default: Story = {
  args: {
    query: 'SELECT TOP 10 member_id, first_name, last_name, dob, status FROM member ORDER BY member_id',
    result: defaultResult,
  },
};

export const Empty: Story = {
  args: {
    query: "SELECT * FROM member WHERE status = 'deleted'",
    result: {
      columns: ['member_id', 'first_name', 'last_name', 'dob', 'status'],
      rows: [],
      rowCount: 0,
    },
  },
};

export const LargeResult: Story = {
  args: {
    query: 'SELECT * FROM claim WHERE claim_date > DATEADD(day, -30, GETDATE())',
    result: {
      columns: [
        'claim_id', 'member_id', 'provider_id', 'claim_date', 'service_date',
        'diagnosis_code', 'procedure_code', 'billed_amount', 'allowed_amount',
        'paid_amount', 'status', 'adjudication_date',
      ],
      rows: Array.from({ length: 25 }, (_, i) => ({
        claim_id: 50000 + i,
        member_id: 1000 + (i % 10),
        provider_id: 200 + (i % 5),
        claim_date: '2026-04-01',
        service_date: '2026-03-28',
        diagnosis_code: `Z${String(i % 99).padStart(2, '0')}.${i % 10}`,
        procedure_code: `9920${i % 5}`,
        billed_amount: (150 + i * 12.5).toFixed(2),
        allowed_amount: (120 + i * 10).toFixed(2),
        paid_amount: (96 + i * 8).toFixed(2),
        status: ['paid', 'denied', 'pending'][i % 3],
        adjudication_date: i % 3 === 2 ? null : '2026-04-10',
      })),
      rowCount: 25,
    },
  },
};

export const NoResult: Story = {
  args: {
    query: 'SELECT COUNT(*) AS total FROM referral',
    result: undefined,
  },
};
