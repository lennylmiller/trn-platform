/**
 * Explore SQL Server schema via INFORMATION_SCHEMA.
 * Used by both the MCP server and chat-server.
 */
import { getPool } from '../db/index';

export interface SchemaTable {
  schema: string;
  name: string;
}

export interface SchemaColumn {
  column: string;
  type: string;
  nullable: string;
  default_value: string | null;
}

export interface TableDetail {
  table: string;
  database: string;
  columns: SchemaColumn[];
  primaryKeys: string[];
}

/**
 * List all user tables in a database.
 */
export async function listTables(database: string = 'qc_core'): Promise<SchemaTable[]> {
  const pool = await getPool(database);
  const result = await pool.request().query(`
    SELECT TABLE_SCHEMA AS [schema], TABLE_NAME AS name
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_TYPE = 'BASE TABLE'
    ORDER BY TABLE_SCHEMA, TABLE_NAME
  `);
  return result.recordset as SchemaTable[];
}

/**
 * Describe a table: columns, types, and primary keys.
 */
export async function describeTable(
  table: string,
  database: string = 'qc_core',
): Promise<TableDetail> {
  const pool = await getPool(database);

  const colResult = await pool.request()
    .input('table', table)
    .query(`
      SELECT
        COLUMN_NAME AS [column],
        DATA_TYPE + CASE
          WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN '(' + CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) + ')'
          WHEN DATA_TYPE IN ('decimal','numeric') THEN '(' + CAST(NUMERIC_PRECISION AS VARCHAR) + ',' + CAST(NUMERIC_SCALE AS VARCHAR) + ')'
          ELSE ''
        END AS type,
        IS_NULLABLE AS nullable,
        COLUMN_DEFAULT AS default_value
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = @table
      ORDER BY ORDINAL_POSITION
    `);

  const pkResult = await pool.request()
    .input('table', table)
    .query(`
      SELECT c.COLUMN_NAME AS pk_column
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
      JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE c
        ON tc.CONSTRAINT_NAME = c.CONSTRAINT_NAME
        AND tc.TABLE_NAME = c.TABLE_NAME
      WHERE tc.TABLE_NAME = @table
        AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
      ORDER BY c.ORDINAL_POSITION
    `);

  return {
    table,
    database,
    columns: colResult.recordset as SchemaColumn[],
    primaryKeys: (pkResult.recordset as Array<{ pk_column: string }>).map(r => r.pk_column),
  };
}

/**
 * High-level explore function for MCP/chat tools.
 * No args: list tables in both databases.
 * With table: describe that table.
 */
export async function exploreSchema(params: {
  table?: string;
  database?: string;
}): Promise<string> {
  const { table, database } = params;

  if (table) {
    const db = database ?? 'qc_core';
    const detail = await describeTable(table, db);
    const lines = [
      `Table: ${detail.database}.dbo.${detail.table}`,
      `Primary keys: ${detail.primaryKeys.join(', ') || 'none'}`,
      '',
      'Columns:',
      ...detail.columns.map(c =>
        `  ${c.column} ${c.type} ${c.nullable === 'YES' ? 'NULL' : 'NOT NULL'}${c.default_value ? ` DEFAULT ${c.default_value}` : ''}`
      ),
    ];
    return lines.join('\n');
  }

  // List tables in both databases
  const [coreTables, trainingTables] = await Promise.all([
    listTables('qc_core'),
    listTables('qc_training'),
  ]);

  const lines = [
    `qc_core (${coreTables.length} tables):`,
    ...coreTables.map(t => `  ${t.schema}.${t.name}`),
    '',
    `qc_training (${trainingTables.length} tables):`,
    ...trainingTables.map(t => `  ${t.schema}.${t.name}`),
  ];
  return lines.join('\n');
}
