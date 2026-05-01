import type {
  Story, StoryCreate, StoryUpdate, StoryDetail,
  StoryPlanItem, PlanItemCreate, PlanItemUpdate,
} from '@trn-platform/shared';
import { getPool } from '@trn-platform/shared/db';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseJson(raw: string | null | undefined): unknown[] | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as unknown[]; } catch { return null; }
}

function mapStory(row: Record<string, unknown>): Story {
  return {
    story_id: row.story_id as number,
    story_ud: row.story_ud as string,
    title: row.title as string,
    description: (row.description as string) ?? null,
    status: row.status as Story['status'],
    flow_id: (row.flow_id as number) ?? null,
    composition_id: (row.composition_id as number) ?? null,
    created_at: (row.created_at as string) ?? null,
    updated_at: (row.updated_at as string) ?? null,
  };
}

function mapPlanItem(row: Record<string, unknown>): StoryPlanItem {
  return {
    plan_item_id: row.plan_item_id as number,
    story_id: row.story_id as number,
    seq: row.seq as number,
    act: (row.act as string) ?? null,
    title: row.title as string,
    description: (row.description as string) ?? null,
    tables_involved: parseJson(row.tables_involved as string) as string[] | null,
    status: row.status as StoryPlanItem['status'],
    step_id: (row.step_id as number) ?? null,
    created_at: (row.created_at as string) ?? null,
  };
}

// ---------------------------------------------------------------------------
// Story CRUD
// ---------------------------------------------------------------------------

export async function listStories(): Promise<Story[]> {
  const pool = await getPool('qc_training');
  const result = await pool.request().query(
    'SELECT * FROM story ORDER BY title',
  );
  return result.recordset.map(mapStory);
}

export async function getStory(id: number): Promise<StoryDetail | null> {
  const pool = await getPool('qc_training');

  const storyResult = await pool.request()
    .input('id', id)
    .query('SELECT * FROM story WHERE story_id = @id');

  const row = storyResult.recordset[0];
  if (!row) return null;

  const itemsResult = await pool.request()
    .input('storyId', id)
    .query('SELECT * FROM story_plan_item WHERE story_id = @storyId ORDER BY seq');

  return {
    ...mapStory(row),
    plan_items: itemsResult.recordset.map(mapPlanItem),
  };
}

export async function createStory(input: StoryCreate): Promise<Story> {
  const pool = await getPool('qc_training');
  const result = await pool.request()
    .input('story_ud', input.story_ud)
    .input('title', input.title)
    .input('description', input.description ?? null)
    .query(
      `INSERT INTO story (story_ud, title, description)
       OUTPUT INSERTED.*
       VALUES (@story_ud, @title, @description)`,
    );
  return mapStory(result.recordset[0]);
}

export async function updateStory(id: number, updates: StoryUpdate): Promise<Story | null> {
  const pool = await getPool('qc_training');
  const setClauses: string[] = [];
  const request = pool.request().input('id', id);

  if (updates.title !== undefined) {
    setClauses.push('title = @title');
    request.input('title', updates.title);
  }
  if (updates.description !== undefined) {
    setClauses.push('description = @description');
    request.input('description', updates.description ?? null);
  }
  if (updates.status !== undefined) {
    setClauses.push('status = @status');
    request.input('status', updates.status);
  }
  if (updates.flow_id !== undefined) {
    setClauses.push('flow_id = @flow_id');
    request.input('flow_id', updates.flow_id ?? null);
  }
  if (updates.composition_id !== undefined) {
    setClauses.push('composition_id = @composition_id');
    request.input('composition_id', updates.composition_id ?? null);
  }

  if (setClauses.length === 0) return getStory(id) as Promise<Story | null>;

  setClauses.push('updated_at = SYSUTCDATETIME()');
  const result = await request.query(
    `UPDATE story SET ${setClauses.join(', ')} OUTPUT INSERTED.* WHERE story_id = @id`,
  );
  const row = result.recordset[0];
  return row ? mapStory(row) : null;
}

export async function deleteStory(id: number): Promise<boolean> {
  const pool = await getPool('qc_training');
  // plan items cascade via ON DELETE CASCADE
  const result = await pool.request()
    .input('id', id)
    .query('DELETE FROM story WHERE story_id = @id');
  return (result.rowsAffected[0] ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// Plan Item CRUD
// ---------------------------------------------------------------------------

export async function addPlanItems(storyId: number, items: PlanItemCreate[]): Promise<StoryPlanItem[]> {
  const pool = await getPool('qc_training');
  const created: StoryPlanItem[] = [];

  for (const item of items) {
    const result = await pool.request()
      .input('storyId', storyId)
      .input('seq', item.seq)
      .input('act', item.act ?? null)
      .input('title', item.title)
      .input('description', item.description ?? null)
      .input('tables_involved', item.tables_involved ? JSON.stringify(item.tables_involved) : null)
      .query(
        `INSERT INTO story_plan_item (story_id, seq, act, title, description, tables_involved)
         OUTPUT INSERTED.*
         VALUES (@storyId, @seq, @act, @title, @description, @tables_involved)`,
      );
    created.push(mapPlanItem(result.recordset[0]));
  }

  return created;
}

export async function updatePlanItem(itemId: number, updates: PlanItemUpdate): Promise<StoryPlanItem | null> {
  const pool = await getPool('qc_training');
  const setClauses: string[] = [];
  const request = pool.request().input('id', itemId);

  if (updates.title !== undefined) {
    setClauses.push('title = @title');
    request.input('title', updates.title);
  }
  if (updates.description !== undefined) {
    setClauses.push('description = @description');
    request.input('description', updates.description ?? null);
  }
  if (updates.act !== undefined) {
    setClauses.push('act = @act');
    request.input('act', updates.act ?? null);
  }
  if (updates.tables_involved !== undefined) {
    setClauses.push('tables_involved = @tables_involved');
    request.input('tables_involved', updates.tables_involved ? JSON.stringify(updates.tables_involved) : null);
  }
  if (updates.status !== undefined) {
    setClauses.push('status = @status');
    request.input('status', updates.status);
  }
  if (updates.step_id !== undefined) {
    setClauses.push('step_id = @step_id');
    request.input('step_id', updates.step_id ?? null);
  }

  if (setClauses.length === 0) return null;

  const result = await request.query(
    `UPDATE story_plan_item SET ${setClauses.join(', ')} OUTPUT INSERTED.* WHERE plan_item_id = @id`,
  );
  const row = result.recordset[0];
  return row ? mapPlanItem(row) : null;
}

export async function deletePlanItem(itemId: number): Promise<boolean> {
  const pool = await getPool('qc_training');
  const result = await pool.request()
    .input('id', itemId)
    .query('DELETE FROM story_plan_item WHERE plan_item_id = @id');
  return (result.rowsAffected[0] ?? 0) > 0;
}
