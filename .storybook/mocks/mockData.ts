import type { Step, StepListItem } from '@trn-platform/shared';
import type { FlowListItem, FlowDetail, FlowStep } from '@trn-platform/shared';
import type { CompositionListItem, CompositionDetail, CompositionBlock } from '@trn-platform/shared';
import type { TrainingStatus, SqlResult } from '@trn-platform/shared';

// ============================================================================
// STEPS
// ============================================================================

export const mockSteps: Step[] = [
  {
    step_id: 1,
    label: 'Create training database',
    type: 'sql',
    category: 'setup',
    command_text: "IF DB_ID('qc_training') IS NULL CREATE DATABASE qc_training;",
    description: 'Creates the qc_training database if it does not already exist.',
    display_queries: [{ label: 'Verify DB', sql: "SELECT name FROM sys.databases WHERE name = 'qc_training'" }],
    is_seed: true,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    step_id: 2,
    label: 'Load member seed data',
    type: 'sql',
    category: 'scenario',
    command_text: "INSERT INTO qc_training.dbo.member (member_id, first_name, last_name) VALUES (1, 'Jane', 'Doe');",
    description: 'Inserts a baseline member record for training scenarios.',
    display_queries: [{ label: 'Member count', sql: 'SELECT COUNT(*) AS cnt FROM qc_training.dbo.member' }],
    is_seed: true,
    created_at: '2026-01-15T10:05:00Z',
    updated_at: '2026-01-15T10:05:00Z',
  },
  {
    step_id: 3,
    label: 'Run qc-train.sh sync',
    type: 'shell',
    category: 'sync',
    command_text: 'bash /opt/qc/qc-train.sh sync --all',
    description: 'Runs the qc-train shell script to synchronize training data from production snapshots.',
    display_queries: null,
    is_seed: false,
    created_at: '2026-02-01T08:30:00Z',
    updated_at: '2026-03-10T14:20:00Z',
  },
  {
    step_id: 4,
    label: 'Verify claim counts',
    type: 'sql',
    category: 'verify',
    command_text: 'SELECT COUNT(*) AS claim_count FROM qc_core.dbo.claim WHERE status = 1;',
    description: 'Verifies the expected number of active claims exist after sync.',
    display_queries: [
      { label: 'Active claims', sql: "SELECT COUNT(*) AS cnt FROM qc_core.dbo.claim WHERE status = 1" },
      { label: 'Denied claims', sql: "SELECT COUNT(*) AS cnt FROM qc_core.dbo.claim WHERE status = 3" },
    ],
    is_seed: true,
    created_at: '2026-02-01T09:00:00Z',
    updated_at: '2026-02-01T09:00:00Z',
  },
  {
    step_id: 5,
    label: 'Reset training environment',
    type: 'shell',
    category: 'utility',
    command_text: 'bash /opt/qc/qc-train.sh reset --confirm',
    description: 'Drops and recreates the training database to a clean state.',
    display_queries: null,
    is_seed: false,
    created_at: '2026-03-01T12:00:00Z',
    updated_at: '2026-03-01T12:00:00Z',
  },
];

export const mockStepListItems: StepListItem[] = mockSteps.map(
  ({ step_id, label, type, category, description, is_seed, created_at, updated_at }) => ({
    step_id,
    label,
    type,
    category,
    description,
    is_seed,
    created_at,
    updated_at,
  }),
);

// ============================================================================
// FLOWS
// ============================================================================

const mockFlowSteps: FlowStep[] = [
  {
    flow_step_id: 1,
    flow_id: 1,
    step_id: 1,
    seq: 1,
    pause_after: false,
    presenter_notes: 'Database should be created quickly.',
    visible_in_execution: true,
    override_display_queries: null,
    label: 'Create training database',
    type: 'sql',
    category: 'setup',
    command_text: "IF DB_ID('qc_training') IS NULL CREATE DATABASE qc_training;",
    description: 'Creates the qc_training database if it does not already exist.',
    display_queries: [{ label: 'Verify DB', sql: "SELECT name FROM sys.databases WHERE name = 'qc_training'" }],
  },
  {
    flow_step_id: 2,
    flow_id: 1,
    step_id: 2,
    seq: 2,
    pause_after: true,
    presenter_notes: 'Pause here to discuss the member schema with the audience.',
    visible_in_execution: true,
    override_display_queries: null,
    label: 'Load member seed data',
    type: 'sql',
    category: 'scenario',
    command_text: "INSERT INTO qc_training.dbo.member (member_id, first_name, last_name) VALUES (1, 'Jane', 'Doe');",
    description: 'Inserts a baseline member record for training scenarios.',
    display_queries: [{ label: 'Member count', sql: 'SELECT COUNT(*) AS cnt FROM qc_training.dbo.member' }],
  },
  {
    flow_step_id: 3,
    flow_id: 1,
    step_id: 4,
    seq: 3,
    pause_after: false,
    presenter_notes: null,
    visible_in_execution: true,
    override_display_queries: null,
    label: 'Verify claim counts',
    type: 'sql',
    category: 'verify',
    command_text: 'SELECT COUNT(*) AS claim_count FROM qc_core.dbo.claim WHERE status = 1;',
    description: 'Verifies the expected number of active claims exist after sync.',
    display_queries: [
      { label: 'Active claims', sql: "SELECT COUNT(*) AS cnt FROM qc_core.dbo.claim WHERE status = 1" },
    ],
  },
];

export const mockFlowListItems: FlowListItem[] = [
  {
    flow_id: 1,
    name: 'New Hire Onboarding Demo',
    description: 'Full onboarding walkthrough: create DB, load members, verify claims.',
    is_seed: true,
    step_count: 3,
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-03-15T08:30:00Z',
  },
  {
    flow_id: 2,
    name: 'Claims Processing Overview',
    description: 'Demonstrates the end-to-end claims adjudication pipeline.',
    is_seed: true,
    step_count: 5,
    created_at: '2026-02-10T14:00:00Z',
    updated_at: '2026-02-10T14:00:00Z',
  },
  {
    flow_id: 3,
    name: 'Environment Reset',
    description: 'Quick reset flow to return training DB to baseline.',
    is_seed: false,
    step_count: 2,
    created_at: '2026-03-01T12:00:00Z',
    updated_at: '2026-03-01T12:00:00Z',
  },
];

export const mockFlowDetail: FlowDetail = {
  flow_id: 1,
  name: 'New Hire Onboarding Demo',
  description: 'Full onboarding walkthrough: create DB, load members, verify claims.',
  is_seed: true,
  created_at: '2026-01-20T10:00:00Z',
  updated_at: '2026-03-15T08:30:00Z',
  steps: mockFlowSteps,
};

// ============================================================================
// COMPOSITIONS
// ============================================================================

const mockBlocks: CompositionBlock[] = [
  {
    block_id: 1,
    composition_id: 1,
    seq: 1,
    block_type: 'narrative',
    content: '# Welcome to QC Training\n\nThis tutorial walks new hires through the core claims processing workflow. By the end, you will understand how member data flows through the system.',
    technical_content: null,
    flow_id: null,
    ref_composition_id: null,
    heading: 'Introduction',
    presenter_notes: 'Set expectations: 30 min session.',
    flow_name: null,
    flow_description: null,
    flow_step_count: null,
    ref_composition_title: null,
    ref_composition_kind: null,
  },
  {
    block_id: 2,
    composition_id: 1,
    seq: 2,
    block_type: 'flow',
    content: null,
    technical_content: null,
    flow_id: 1,
    ref_composition_id: null,
    heading: 'Hands-On: Database Setup',
    presenter_notes: 'Run this flow live, pausing at step 2.',
    flow_name: 'New Hire Onboarding Demo',
    flow_description: 'Full onboarding walkthrough.',
    flow_step_count: 3,
    ref_composition_title: null,
    ref_composition_kind: null,
  },
  {
    block_id: 3,
    composition_id: 1,
    seq: 3,
    block_type: 'note',
    content: null,
    technical_content: 'The `member` table uses a composite index on (last_name, first_name) for fast lookups during adjudication.',
    flow_id: null,
    ref_composition_id: null,
    heading: 'Technical Note: Indexing',
    presenter_notes: null,
    flow_name: null,
    flow_description: null,
    flow_step_count: null,
    ref_composition_title: null,
    ref_composition_kind: null,
  },
];

export const mockCompositionListItems: CompositionListItem[] = [
  {
    composition_id: 1,
    kind: 'tutorial',
    title: 'New Hire Onboarding',
    description: 'Complete onboarding tutorial for new QC analysts.',
    is_seed: true,
    block_count: 3,
    flow_count: 1,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-03-20T15:00:00Z',
  },
  {
    composition_id: 2,
    kind: 'story',
    title: 'Claims Deep Dive',
    description: 'Interactive story exploring claims adjudication edge cases.',
    is_seed: true,
    block_count: 7,
    flow_count: 2,
    created_at: '2026-02-15T09:00:00Z',
    updated_at: '2026-02-15T09:00:00Z',
  },
  {
    composition_id: 3,
    kind: 'module',
    title: 'QC Environment Administration',
    description: 'Module covering database admin tasks for training environments.',
    is_seed: false,
    block_count: 5,
    flow_count: 1,
    created_at: '2026-03-05T11:00:00Z',
    updated_at: '2026-03-05T11:00:00Z',
  },
];

export const mockCompositionDetail: CompositionDetail = {
  composition_id: 1,
  kind: 'tutorial',
  title: 'New Hire Onboarding',
  description: 'Complete onboarding tutorial for new QC analysts.',
  is_seed: true,
  created_at: '2026-02-01T10:00:00Z',
  updated_at: '2026-03-20T15:00:00Z',
  blocks: mockBlocks,
};

// ============================================================================
// EXECUTION
// ============================================================================

export const mockTrainingStatus: TrainingStatus = {
  exists: true,
  members: [
    { count: '150', status: 'active' },
    { count: '12', status: 'inactive' },
  ],
  pcp: [{ count: '45', network: 'in-network' }],
  qcap: [{ count: '8', plan: 'standard' }],
  claim: [
    { count: '320', status: 'approved' },
    { count: '15', status: 'denied' },
    { count: '42', status: 'pending' },
  ],
  referral: [{ count: '28', type: 'specialist' }],
};

export const mockSqlResult: SqlResult = {
  columns: ['member_id', 'first_name', 'last_name', 'status'],
  rows: [
    { member_id: 1, first_name: 'Jane', last_name: 'Doe', status: 'active' },
    { member_id: 2, first_name: 'John', last_name: 'Smith', status: 'active' },
    { member_id: 3, first_name: 'Alice', last_name: 'Johnson', status: 'inactive' },
  ],
  rowCount: 3,
};
