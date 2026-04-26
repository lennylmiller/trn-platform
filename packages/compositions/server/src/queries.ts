import sql from 'mssql';
import { getPool } from '@trn-platform/shared/db';
import type {
  CompositionCreate,
  CompositionUpdate,
  BlockCreate,
  BlockUpdate,
} from '@trn-platform/shared';

// ============================================================================
// COMPOSITION QUERIES
// ============================================================================

export async function listCompositions(kind?: string) {
  const pool = await getPool('qc_training');
  const request = pool.request();

  let where = '';
  if (kind) {
    where = 'WHERE c.kind = @kind';
    request.input('kind', sql.NVarChar, kind);
  }

  const result = await request.query(`
    SELECT c.*,
           (SELECT COUNT(*) FROM composition_block WHERE composition_id = c.composition_id) AS block_count,
           (SELECT COUNT(*) FROM composition_block WHERE composition_id = c.composition_id AND flow_id IS NOT NULL) AS flow_count
    FROM composition c
    ${where}
    ORDER BY c.updated_at DESC, c.composition_id DESC
  `);

  return result.recordset;
}

export async function getComposition(id: number) {
  const pool = await getPool('qc_training');

  const compResult = await pool
    .request()
    .input('id', sql.Int, id)
    .query('SELECT * FROM composition WHERE composition_id = @id');

  if (compResult.recordset.length === 0) return null;

  const blocksResult = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      SELECT cb.*,
             f.name   AS flow_name,
             f.description AS flow_description,
             (SELECT COUNT(*) FROM flow_step WHERE flow_id = cb.flow_id) AS flow_step_count,
             ref.title AS ref_composition_title,
             ref.kind  AS ref_composition_kind
      FROM composition_block cb
      LEFT JOIN flow f ON f.flow_id = cb.flow_id
      LEFT JOIN composition ref ON ref.composition_id = cb.ref_composition_id
      WHERE cb.composition_id = @id
      ORDER BY cb.seq
    `);

  const composition = compResult.recordset[0]!;
  return {
    ...composition,
    blocks: blocksResult.recordset,
  };
}

export async function createComposition(input: CompositionCreate) {
  const pool = await getPool('qc_training');
  const result = await pool
    .request()
    .input('kind', sql.NVarChar, input.kind)
    .input('title', sql.NVarChar, input.title)
    .input('description', sql.NVarChar, input.description ?? null)
    .query(`
      INSERT INTO composition (kind, title, description)
      OUTPUT INSERTED.*
      VALUES (@kind, @title, @description)
    `);
  return result.recordset[0]!;
}

export async function updateComposition(id: number, updates: CompositionUpdate) {
  const pool = await getPool('qc_training');

  const setClauses: string[] = [];
  const request = pool.request().input('id', sql.Int, id);

  if (updates.kind !== undefined) {
    setClauses.push('kind = @kind');
    request.input('kind', sql.NVarChar, updates.kind);
  }
  if (updates.title !== undefined) {
    setClauses.push('title = @title');
    request.input('title', sql.NVarChar, updates.title);
  }
  if (updates.description !== undefined) {
    setClauses.push('description = @description');
    request.input('description', sql.NVarChar, updates.description);
  }

  if (setClauses.length === 0) return null;

  setClauses.push('updated_at = SYSUTCDATETIME()');

  const result = await request.query(`
    UPDATE composition SET ${setClauses.join(', ')}
    OUTPUT INSERTED.*
    WHERE composition_id = @id
  `);
  return result.recordset[0] ?? null;
}

export async function deleteComposition(id: number) {
  const pool = await getPool('qc_training');

  // Check for composition_block references pointing TO this composition
  const refCheck = await pool
    .request()
    .input('id', sql.Int, id)
    .query('SELECT COUNT(*) AS cnt FROM composition_block WHERE ref_composition_id = @id');

  const count = refCheck.recordset[0]?.cnt ?? 0;
  if (count > 0) {
    throw new Error(`Cannot delete composition: ${count} block(s) reference it`);
  }

  // Delete child blocks first, then the composition
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    await transaction
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM composition_block WHERE composition_id = @id');
    const result = await transaction
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM composition WHERE composition_id = @id');
    await transaction.commit();
    return result.rowsAffected[0]! > 0;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

// ============================================================================
// BLOCK QUERIES
// ============================================================================

export async function replaceBlocks(compositionId: number, blocks: BlockCreate[]) {
  const pool = await getPool('qc_training');
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    // Delete existing blocks
    await transaction
      .request()
      .input('compositionId', sql.Int, compositionId)
      .query('DELETE FROM composition_block WHERE composition_id = @compositionId');

    // Insert new blocks with sequential ordering
    const inserted = [];
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]!;
      const result = await transaction
        .request()
        .input('compositionId', sql.Int, compositionId)
        .input('seq', sql.Int, i + 1)
        .input('blockType', sql.NVarChar, block.block_type)
        .input('content', sql.NVarChar, block.content ?? null)
        .input('technicalContent', sql.NVarChar, block.technical_content ?? null)
        .input('flowId', sql.Int, block.flow_id ?? null)
        .input('refCompositionId', sql.Int, block.ref_composition_id ?? null)
        .input('heading', sql.NVarChar, block.heading ?? null)
        .input('presenterNotes', sql.NVarChar, block.presenter_notes ?? null)
        .query(`
          INSERT INTO composition_block
            (composition_id, seq, block_type, content, technical_content,
             flow_id, ref_composition_id, heading, presenter_notes)
          OUTPUT INSERTED.*
          VALUES
            (@compositionId, @seq, @blockType, @content, @technicalContent,
             @flowId, @refCompositionId, @heading, @presenterNotes)
        `);
      inserted.push(result.recordset[0]!);
    }

    // Touch the parent composition's updated_at
    await transaction
      .request()
      .input('compositionId', sql.Int, compositionId)
      .query('UPDATE composition SET updated_at = SYSUTCDATETIME() WHERE composition_id = @compositionId');

    await transaction.commit();
    return inserted;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

export async function addBlock(compositionId: number, data: BlockCreate) {
  const pool = await getPool('qc_training');

  // Determine next seq
  const seqResult = await pool
    .request()
    .input('compositionId', sql.Int, compositionId)
    .query(
      'SELECT ISNULL(MAX(seq), 0) + 1 AS next_seq FROM composition_block WHERE composition_id = @compositionId',
    );

  const nextSeq = seqResult.recordset[0]!.next_seq as number;

  const result = await pool
    .request()
    .input('compositionId', sql.Int, compositionId)
    .input('seq', sql.Int, nextSeq)
    .input('blockType', sql.NVarChar, data.block_type)
    .input('content', sql.NVarChar, data.content ?? null)
    .input('technicalContent', sql.NVarChar, data.technical_content ?? null)
    .input('flowId', sql.Int, data.flow_id ?? null)
    .input('refCompositionId', sql.Int, data.ref_composition_id ?? null)
    .input('heading', sql.NVarChar, data.heading ?? null)
    .input('presenterNotes', sql.NVarChar, data.presenter_notes ?? null)
    .query(`
      INSERT INTO composition_block
        (composition_id, seq, block_type, content, technical_content,
         flow_id, ref_composition_id, heading, presenter_notes)
      OUTPUT INSERTED.*
      VALUES
        (@compositionId, @seq, @blockType, @content, @technicalContent,
         @flowId, @refCompositionId, @heading, @presenterNotes)
    `);

  return result.recordset[0]!;
}

export async function updateBlock(blockId: number, updates: BlockUpdate) {
  const pool = await getPool('qc_training');

  const setClauses: string[] = [];
  const request = pool.request().input('id', sql.Int, blockId);

  if (updates.block_type !== undefined) {
    setClauses.push('block_type = @blockType');
    request.input('blockType', sql.NVarChar, updates.block_type);
  }
  if (updates.content !== undefined) {
    setClauses.push('content = @content');
    request.input('content', sql.NVarChar, updates.content);
  }
  if (updates.technical_content !== undefined) {
    setClauses.push('technical_content = @technicalContent');
    request.input('technicalContent', sql.NVarChar, updates.technical_content);
  }
  if (updates.flow_id !== undefined) {
    setClauses.push('flow_id = @flowId');
    request.input('flowId', sql.Int, updates.flow_id);
  }
  if (updates.ref_composition_id !== undefined) {
    setClauses.push('ref_composition_id = @refCompositionId');
    request.input('refCompositionId', sql.Int, updates.ref_composition_id);
  }
  if (updates.heading !== undefined) {
    setClauses.push('heading = @heading');
    request.input('heading', sql.NVarChar, updates.heading);
  }
  if (updates.presenter_notes !== undefined) {
    setClauses.push('presenter_notes = @presenterNotes');
    request.input('presenterNotes', sql.NVarChar, updates.presenter_notes);
  }

  if (setClauses.length === 0) return null;

  const result = await request.query(`
    UPDATE composition_block SET ${setClauses.join(', ')}
    OUTPUT INSERTED.*
    WHERE block_id = @id
  `);
  return result.recordset[0] ?? null;
}

export async function deleteBlock(blockId: number) {
  const pool = await getPool('qc_training');
  const result = await pool
    .request()
    .input('id', sql.Int, blockId)
    .query('DELETE FROM composition_block WHERE block_id = @id');
  return result.rowsAffected[0]! > 0;
}
