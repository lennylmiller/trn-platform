/**
 * Execute arbitrary SQL against a named database.
 * Used by both the MCP server and chat-server.
 */
import { getPool } from '../db/index';

export interface SqlToolResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
}

/**
 * Run a SQL query and return structured results.
 */
export async function runSql(
  sql: string,
  database: string = 'qc_core',
): Promise<SqlToolResult> {
  const pool = await getPool(database);
  const result = await pool.request().query(sql);

  const recordset = result.recordset ?? [];
  const columns = recordset.length > 0
    ? Object.keys(recordset[0] as Record<string, unknown>)
    : [];

  return {
    columns,
    rows: recordset as Record<string, unknown>[],
    rowCount: result.rowsAffected?.[0] ?? recordset.length,
  };
}
