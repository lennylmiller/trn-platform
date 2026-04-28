let _sql: typeof import('mssql') | null = null;
function getSql() {
  if (!_sql) {
    // Use globalThis.require if available (CJS), otherwise createRequire (ESM)
    const req = typeof require !== 'undefined'
      ? require
      : (() => { const { createRequire } = require('module'); return createRequire(import.meta.url); })();
    _sql = req('mssql') as typeof import('mssql');
  }
  return _sql;
}
const sql = new Proxy({} as typeof import('mssql'), {
  get: (_, prop) => (getSql() as any)[prop],
});
import { getPool } from '@trn-platform/shared/db';
import type { FlowCreate, FlowUpdate, FlowStepCreate, FlowStepUpdate } from '@trn-platform/shared';

// ============================================================================
// FLOW QUERIES
// ============================================================================

export async function listFlows() {
  const pool = await getPool('qc_training');
  const result = await pool.request().query(`
    SELECT f.*,
           (SELECT COUNT(*) FROM flow_step WHERE flow_id = f.flow_id) AS step_count
    FROM flow f
    ORDER BY f.updated_at DESC, f.flow_id DESC
  `);
  return result.recordset;
}

export async function getFlow(id: number) {
  const pool = await getPool('qc_training');

  const flowResult = await pool
    .request()
    .input('id', sql.Int, id)
    .query('SELECT * FROM flow WHERE flow_id = @id');

  if (flowResult.recordset.length === 0) return null;

  const stepsResult = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      SELECT fs.flow_step_id, fs.flow_id, fs.step_id, fs.seq,
             fs.pause_after, fs.presenter_notes,
             fs.visible_in_execution, fs.override_display_queries,
             sl.label, sl.type, sl.category,
             sl.command_text, sl.description, sl.display_queries
      FROM flow_step fs
      LEFT JOIN step_library sl ON sl.step_id = fs.step_id
      WHERE fs.flow_id = @id
      ORDER BY fs.seq
    `);

  const flow = flowResult.recordset[0]!;
  return {
    ...flow,
    steps: stepsResult.recordset.map(parseFlowStepRow),
  };
}

export async function createFlow(input: FlowCreate) {
  const pool = await getPool('qc_training');
  const result = await pool
    .request()
    .input('name', sql.NVarChar, input.name)
    .input('description', sql.NVarChar, input.description ?? null)
    .query(`
      INSERT INTO flow (name, description)
      OUTPUT INSERTED.*
      VALUES (@name, @description)
    `);
  return result.recordset[0]!;
}

export async function updateFlow(id: number, updates: FlowUpdate) {
  const pool = await getPool('qc_training');

  const setClauses: string[] = [];
  const request = pool.request().input('id', sql.Int, id);

  if (updates.name !== undefined) {
    setClauses.push('name = @name');
    request.input('name', sql.NVarChar, updates.name);
  }
  if (updates.description !== undefined) {
    setClauses.push('description = @description');
    request.input('description', sql.NVarChar, updates.description);
  }

  if (setClauses.length === 0) return null;

  setClauses.push('updated_at = SYSUTCDATETIME()');

  const result = await request.query(`
    UPDATE flow SET ${setClauses.join(', ')}
    OUTPUT INSERTED.*
    WHERE flow_id = @id
  `);
  return result.recordset[0] ?? null;
}

export async function deleteFlow(id: number) {
  const pool = await getPool('qc_training');

  // Check for composition_block references
  const refCheck = await pool
    .request()
    .input('id', sql.Int, id)
    .query('SELECT COUNT(*) AS cnt FROM composition_block WHERE flow_id = @id');

  const count = refCheck.recordset[0]?.cnt ?? 0;
  if (count > 0) {
    throw new Error(`Cannot delete flow: ${count} composition block(s) reference it`);
  }

  // Delete child flow_steps first, then the flow
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    await transaction.request().input('id', sql.Int, id).query(
      'DELETE FROM flow_step WHERE flow_id = @id'
    );
    const result = await transaction.request().input('id', sql.Int, id).query(
      'DELETE FROM flow WHERE flow_id = @id'
    );
    await transaction.commit();
    return result.rowsAffected[0]! > 0;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

// ============================================================================
// FLOW STEP QUERIES
// ============================================================================

export async function replaceFlowSteps(
  flowId: number,
  steps: FlowStepCreate[],
) {
  const pool = await getPool('qc_training');
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    // Delete existing steps
    await transaction
      .request()
      .input('flowId', sql.Int, flowId)
      .query('DELETE FROM flow_step WHERE flow_id = @flowId');

    // Insert new steps with sequential ordering
    const inserted = [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]!;
      const result = await transaction
        .request()
        .input('flowId', sql.Int, flowId)
        .input('stepId', sql.Int, step.step_id)
        .input('seq', sql.Int, i + 1)
        .input('pauseAfter', sql.Bit, step.pause_after ?? false)
        .input('presenterNotes', sql.NVarChar, step.presenter_notes ?? null)
        .input('visibleInExecution', sql.Bit, step.visible_in_execution ?? true)
        .input(
          'overrideDisplayQueries',
          sql.NVarChar,
          step.override_display_queries
            ? JSON.stringify(step.override_display_queries)
            : null,
        )
        .query(`
          INSERT INTO flow_step
            (flow_id, step_id, seq, pause_after, presenter_notes,
             visible_in_execution, override_display_queries)
          OUTPUT INSERTED.*
          VALUES
            (@flowId, @stepId, @seq, @pauseAfter, @presenterNotes,
             @visibleInExecution, @overrideDisplayQueries)
        `);
      inserted.push(result.recordset[0]!);
    }

    // Touch the parent flow's updated_at
    await transaction
      .request()
      .input('flowId', sql.Int, flowId)
      .query('UPDATE flow SET updated_at = SYSUTCDATETIME() WHERE flow_id = @flowId');

    await transaction.commit();
    return inserted;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

export async function addFlowStep(flowId: number, data: FlowStepCreate) {
  const pool = await getPool('qc_training');

  // Determine next seq
  const seqResult = await pool
    .request()
    .input('flowId', sql.Int, flowId)
    .query('SELECT ISNULL(MAX(seq), 0) + 1 AS next_seq FROM flow_step WHERE flow_id = @flowId');

  const nextSeq = seqResult.recordset[0]!.next_seq as number;

  const result = await pool
    .request()
    .input('flowId', sql.Int, flowId)
    .input('stepId', sql.Int, data.step_id)
    .input('seq', sql.Int, nextSeq)
    .input('pauseAfter', sql.Bit, data.pause_after ?? false)
    .input('presenterNotes', sql.NVarChar, data.presenter_notes ?? null)
    .input('visibleInExecution', sql.Bit, data.visible_in_execution ?? true)
    .input(
      'overrideDisplayQueries',
      sql.NVarChar,
      data.override_display_queries
        ? JSON.stringify(data.override_display_queries)
        : null,
    )
    .query(`
      INSERT INTO flow_step
        (flow_id, step_id, seq, pause_after, presenter_notes,
         visible_in_execution, override_display_queries)
      OUTPUT INSERTED.*
      VALUES
        (@flowId, @stepId, @seq, @pauseAfter, @presenterNotes,
         @visibleInExecution, @overrideDisplayQueries)
    `);

  return result.recordset[0]!;
}

export async function updateFlowStep(flowStepId: number, updates: FlowStepUpdate) {
  const pool = await getPool('qc_training');

  const setClauses: string[] = [];
  const request = pool.request().input('id', sql.Int, flowStepId);

  if (updates.step_id !== undefined) {
    setClauses.push('step_id = @stepId');
    request.input('stepId', sql.Int, updates.step_id);
  }
  if (updates.pause_after !== undefined) {
    setClauses.push('pause_after = @pauseAfter');
    request.input('pauseAfter', sql.Bit, updates.pause_after);
  }
  if (updates.presenter_notes !== undefined) {
    setClauses.push('presenter_notes = @presenterNotes');
    request.input('presenterNotes', sql.NVarChar, updates.presenter_notes);
  }
  if (updates.visible_in_execution !== undefined) {
    setClauses.push('visible_in_execution = @visibleInExecution');
    request.input('visibleInExecution', sql.Bit, updates.visible_in_execution);
  }
  if (updates.override_display_queries !== undefined) {
    setClauses.push('override_display_queries = @overrideDisplayQueries');
    request.input(
      'overrideDisplayQueries',
      sql.NVarChar,
      updates.override_display_queries
        ? JSON.stringify(updates.override_display_queries)
        : null,
    );
  }

  if (setClauses.length === 0) return null;

  const result = await request.query(`
    UPDATE flow_step SET ${setClauses.join(', ')}
    OUTPUT INSERTED.*
    WHERE flow_step_id = @id
  `);
  return result.recordset[0] ?? null;
}

export async function deleteFlowStep(flowStepId: number) {
  const pool = await getPool('qc_training');
  const result = await pool
    .request()
    .input('id', sql.Int, flowStepId)
    .query('DELETE FROM flow_step WHERE flow_step_id = @id');
  return result.rowsAffected[0]! > 0;
}

// ============================================================================
// HELPERS
// ============================================================================

function parseFlowStepRow(row: Record<string, unknown>) {
  return {
    ...row,
    override_display_queries: parseJson(row.override_display_queries),
    display_queries: parseJson(row.display_queries),
  };
}

function parseJson(value: unknown): unknown {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value ?? null;
}
