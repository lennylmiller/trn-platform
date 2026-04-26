import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export const SSEEventTypeSchema = z.enum([
  'step:start',
  'step:output',
  'step:complete',
  'step:error',
  'step:paused',
  'execution:start',
  'execution:complete',
  'status:refresh',
]);
export type SSEEventType = z.infer<typeof SSEEventTypeSchema>;

export const ExecutionStatusSchema = z.enum(['idle', 'running', 'paused', 'complete']);
export type ExecutionStatus = z.infer<typeof ExecutionStatusSchema>;

// ============================================================================
// RESULT SCHEMAS
// ============================================================================

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
 * SSE event payload for step execution
 */
export const StepExecutionEventSchema = z.object({
  executionId: z.string().optional(),
  stepId: z.number().optional(),
  flowStepId: z.number().optional(),
  stepIndex: z.number().optional(),
  label: z.string().optional(),
  type: z.string().optional(),
  line: z.string().optional(),
  stream: z.enum(['stdout', 'stderr']).optional(),
  exitCode: z.number().optional(),
  durationMs: z.number().optional(),
  message: z.string().optional(),
  presenterNotes: z.string().nullable().optional(),
});
export type StepExecutionEvent = z.infer<typeof StepExecutionEventSchema>;

/**
 * Training status from qc-train.sh status command
 */
export const TrainingStatusSchema = z.object({
  exists: z.boolean(),
  members: z.array(z.record(z.string(), z.string())),
  pcp: z.array(z.record(z.string(), z.string())),
  qcap: z.array(z.record(z.string(), z.string())),
  claim: z.array(z.record(z.string(), z.string())),
  referral: z.array(z.record(z.string(), z.string())),
});
export type TrainingStatus = z.infer<typeof TrainingStatusSchema>;

// ============================================================================
// COMMAND SCHEMAS
// ============================================================================

export const ExecuteSqlSchema = z.object({
  sql: z.string().min(1),
});
export type ExecuteSql = z.infer<typeof ExecuteSqlSchema>;
