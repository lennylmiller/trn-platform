import type { Step, StepCreate, StepUpdate } from '@trn-platform/shared';
import { getPool } from '@trn-platform/shared/db';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseDisplayQueries(raw: string | null | undefined): Step['display_queries'] {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as NonNullable<Step['display_queries']>;
  } catch {
    return null;
  }
}

function mapRow(row: Record<string, unknown>): Step {
  return {
    step_id: row.step_id as number,
    label: row.label as string,
    type: row.type as Step['type'],
    category: row.category as Step['category'],
    command_text: (row.command_text as string) ?? null,
    description: (row.description as string) ?? null,
    display_queries: parseDisplayQueries(row.display_queries as string | null),
    is_seed: Boolean(row.is_seed),
    story: (row.story as string) ?? null,
    created_at: (row.created_at as string) ?? null,
    updated_at: (row.updated_at as string) ?? null,
  };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function listSteps(category?: string, story?: string): Promise<Step[]> {
  const pool = await getPool('qc_training');
  let query = 'SELECT * FROM step_library';
  const conditions: string[] = [];
  const request = pool.request();

  if (category) {
    conditions.push('category = @category');
    request.input('category', category);
  }
  if (story) {
    conditions.push('story = @story');
    request.input('story', story);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ' ORDER BY label';
  const result = await request.query(query);
  return result.recordset.map(mapRow);
}

export async function getStep(id: number): Promise<Step | null> {
  const pool = await getPool('qc_training');
  const result = await pool
    .request()
    .input('id', id)
    .query('SELECT * FROM step_library WHERE step_id = @id');

  const row = result.recordset[0];
  return row ? mapRow(row) : null;
}

export async function createStep(input: StepCreate): Promise<Step> {
  const pool = await getPool('qc_training');
  const displayQueriesJson = input.display_queries
    ? JSON.stringify(input.display_queries)
    : null;

  const result = await pool
    .request()
    .input('label', input.label)
    .input('type', input.type)
    .input('category', input.category)
    .input('command_text', input.command_text ?? null)
    .input('description', input.description ?? null)
    .input('display_queries', displayQueriesJson)
    .input('story', input.story ?? null)
    .query(
      `INSERT INTO step_library (label, type, category, command_text, description, display_queries, story)
       OUTPUT INSERTED.*
       VALUES (@label, @type, @category, @command_text, @description, @display_queries, @story)`,
    );

  return mapRow(result.recordset[0]);
}

export async function updateStep(id: number, updates: StepUpdate): Promise<Step | null> {
  const pool = await getPool('qc_training');

  // Build SET clause dynamically from provided fields
  const setClauses: string[] = [];
  const request = pool.request().input('id', id);

  if (updates.label !== undefined) {
    setClauses.push('label = @label');
    request.input('label', updates.label);
  }
  if (updates.type !== undefined) {
    setClauses.push('type = @type');
    request.input('type', updates.type);
  }
  if (updates.category !== undefined) {
    setClauses.push('category = @category');
    request.input('category', updates.category);
  }
  if (updates.command_text !== undefined) {
    setClauses.push('command_text = @command_text');
    request.input('command_text', updates.command_text ?? null);
  }
  if (updates.description !== undefined) {
    setClauses.push('description = @description');
    request.input('description', updates.description ?? null);
  }
  if (updates.display_queries !== undefined) {
    setClauses.push('display_queries = @display_queries');
    request.input(
      'display_queries',
      updates.display_queries ? JSON.stringify(updates.display_queries) : null,
    );
  }
  if (updates.story !== undefined) {
    setClauses.push('story = @story');
    request.input('story', updates.story ?? null);
  }

  if (setClauses.length === 0) {
    return getStep(id);
  }

  setClauses.push('updated_at = SYSUTCDATETIME()');

  const result = await request.query(
    `UPDATE step_library SET ${setClauses.join(', ')} OUTPUT INSERTED.* WHERE step_id = @id`,
  );

  const row = result.recordset[0];
  return row ? mapRow(row) : null;
}

export async function deleteStep(id: number): Promise<{ deleted: boolean; error?: string }> {
  const pool = await getPool('qc_training');

  // Check for flow_step references
  const refs = await pool
    .request()
    .input('id', id)
    .query('SELECT COUNT(*) AS cnt FROM flow_step WHERE step_id = @id');

  const refCount = refs.recordset[0].cnt as number;
  if (refCount > 0) {
    return {
      deleted: false,
      error: `Step is referenced by ${refCount} flow step(s). Remove those references first.`,
    };
  }

  const result = await pool
    .request()
    .input('id', id)
    .query('DELETE FROM step_library WHERE step_id = @id');

  return { deleted: (result.rowsAffected[0] ?? 0) > 0 };
}
