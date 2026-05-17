import { z } from 'zod';

/**
 * SQL query result from qc_core execution
 */
export const SqlResultSchema = z.object({
  columns: z.array(z.string()),
  rows: z.array(z.record(z.string(), z.unknown())),
  rowCount: z.number(),
});
export type SqlResult = z.infer<typeof SqlResultSchema>;

/**
 * Input schema for SQL execution requests
 */
export const ExecuteSqlSchema = z.object({
  sql: z.string().min(1),
});
export type ExecuteSql = z.infer<typeof ExecuteSqlSchema>;
