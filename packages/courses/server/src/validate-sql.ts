/**
 * SQL validation for course content.
 * Uses SET FMTONLY ON to validate SQL against qc_core without executing it.
 */
import { getPool } from '@trn-platform/shared/db';

export interface SqlValidationResult {
  sql: string;
  valid: boolean;
  error?: string;
  /** Where this SQL came from (e.g. "Lesson 1 / Block 2 sql_text") */
  source?: string;
}

/**
 * Validate a single SQL statement against qc_core.
 * Uses SET FMTONLY ON so the query is compiled and metadata-resolved
 * but never executed. Catches invalid tables, columns, and syntax.
 */
export async function validateSql(
  sql: string,
  database: string = 'qc_core',
): Promise<SqlValidationResult> {
  const trimmed = sql.trim();
  if (!trimmed) {
    return { sql, valid: false, error: 'Empty SQL' };
  }

  const pool = await getPool(database);
  try {
    await pool.request().query(
      `SET FMTONLY ON;\n${trimmed}\nSET FMTONLY OFF;`,
    );
    return { sql, valid: true };
  } catch (err) {
    return {
      sql,
      valid: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Validate multiple SQL fields from course blocks.
 * Returns only the failures (empty array = all valid).
 */
export async function validateCourseBlocksSql(
  lessons: Array<{
    title: string;
    blocks?: Array<{
      block_type: string;
      title?: string | null;
      sql_text?: string | null;
      seed_sql?: string | null;
    }>;
    slides?: Array<{
      block_type: string;
      title?: string | null;
      sql_text?: string | null;
      seed_sql?: string | null;
    }>;
  }>,
): Promise<SqlValidationResult[]> {
  const checks: Array<{ sql: string; source: string }> = [];

  for (let li = 0; li < lessons.length; li++) {
    const lesson = lessons[li]!;
    const blockList = lesson.blocks ?? lesson.slides ?? [];
    for (let bi = 0; bi < blockList.length; bi++) {
      const block = blockList[bi]!;
      const label = block.title ?? `Block ${bi + 1}`;
      if (block.sql_text) {
        checks.push({
          sql: block.sql_text,
          source: `${lesson.title} / ${label} [sql_text]`,
        });
      }
      if (block.seed_sql) {
        checks.push({
          sql: block.seed_sql,
          source: `${lesson.title} / ${label} [seed_sql]`,
        });
      }
    }
  }

  if (checks.length === 0) return [];

  const results = await Promise.all(
    checks.map(async ({ sql, source }) => {
      const result = await validateSql(sql);
      return { ...result, source };
    }),
  );

  return results.filter((r) => !r.valid);
}
