import type { SqlResult } from '@trn-platform/shared';
import { getPool } from '@trn-platform/shared/db';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StepRow {
  flow_step_id: number;
  step_id: number;
  label: string;
  type: 'shell' | 'sql' | 'manual';
  command_text: string | null;
  description: string | null;
  presenter_notes: string | null;
  pause_after: boolean;
  seq: number;
}

export interface FlowRow {
  flow_id: number;
  name: string;
  description: string | null;
}

// ---------------------------------------------------------------------------
// qc_core — Raw SQL Execution
// ---------------------------------------------------------------------------

/**
 * Execute arbitrary SQL against the qc_core database.
 * Returns column names, row data, and affected row count.
 */
export async function executeSql(sql: string): Promise<SqlResult> {
  const pool = await getPool('qc_core');
  const result = await pool.request().query(sql);

  const columns = result.recordset?.columns
    ? Object.keys(result.recordset.columns)
    : [];

  return {
    columns,
    rows: result.recordset ?? [],
    rowCount: result.rowsAffected[0] ?? 0,
  };
}

// ---------------------------------------------------------------------------
// qc_training — Step & Flow Lookups
// ---------------------------------------------------------------------------

/**
 * Load a single step from step_library by step_id for execution.
 */
export async function getStepForExecution(stepId: number): Promise<StepRow | null> {
  const pool = await getPool('qc_training');
  const result = await pool
    .request()
    .input('stepId', stepId)
    .query(
      `SELECT
         sl.step_id,
         sl.label,
         sl.type,
         sl.command_text,
         sl.description,
         NULL AS presenter_notes,
         0 AS pause_after,
         0 AS seq,
         0 AS flow_step_id
       FROM step_library sl
       WHERE sl.step_id = @stepId`,
    );

  const row = result.recordset[0];
  return row ? (row as StepRow) : null;
}

/**
 * Load a flow and all its ordered steps for execution.
 */
export async function getFlowForExecution(
  flowId: number,
): Promise<{ flow: FlowRow; steps: StepRow[] } | null> {
  const pool = await getPool('qc_training');

  // Get flow metadata
  const flowResult = await pool
    .request()
    .input('flowId', flowId)
    .query('SELECT flow_id, name, description FROM flow WHERE flow_id = @flowId');

  const flow = flowResult.recordset[0] as FlowRow | undefined;
  if (!flow) return null;

  // Get ordered steps via flow_step join
  const stepsResult = await pool
    .request()
    .input('flowId', flowId)
    .query(
      `SELECT
         fs.flow_step_id,
         fs.step_id,
         sl.label,
         sl.type,
         sl.command_text,
         sl.description,
         fs.presenter_notes,
         fs.pause_after,
         fs.seq
       FROM flow_step fs
       INNER JOIN step_library sl ON sl.step_id = fs.step_id
       WHERE fs.flow_id = @flowId
       ORDER BY fs.seq`,
    );

  return {
    flow,
    steps: stepsResult.recordset as StepRow[],
  };
}

// ---------------------------------------------------------------------------
// qc_core — Training Status
// ---------------------------------------------------------------------------

/**
 * Query qc_core for training status: check key tables for data presence.
 */
export async function getTrainingStatus() {
  const pool = await getPool('qc_core');

  const [members, pcp, qcap, claim, referral] = await Promise.all([
    pool.request().query('SELECT TOP 10 * FROM member'),
    pool.request().query('SELECT TOP 10 * FROM pcp'),
    pool.request().query('SELECT TOP 10 * FROM qcap'),
    pool.request().query('SELECT TOP 10 * FROM claim'),
    pool.request().query('SELECT TOP 10 * FROM referral'),
  ]);

  const hasData =
    members.recordset.length > 0 ||
    pcp.recordset.length > 0 ||
    qcap.recordset.length > 0 ||
    claim.recordset.length > 0 ||
    referral.recordset.length > 0;

  return {
    exists: hasData,
    members: members.recordset as Record<string, string>[],
    pcp: pcp.recordset as Record<string, string>[],
    qcap: qcap.recordset as Record<string, string>[],
    claim: claim.recordset as Record<string, string>[],
    referral: referral.recordset as Record<string, string>[],
  };
}
