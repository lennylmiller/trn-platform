import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export const StepTypeSchema = z.enum(['shell', 'sql', 'manual']);
export type StepType = z.infer<typeof StepTypeSchema>;

export const StepCategorySchema = z.enum(['setup', 'scenario', 'sync', 'verify', 'utility']);
export type StepCategory = z.infer<typeof StepCategorySchema>;

// ============================================================================
// SUB-SCHEMAS
// ============================================================================

export const DisplayQuerySchema = z.object({
  label: z.string(),
  sql: z.string(),
});
export type DisplayQuery = z.infer<typeof DisplayQuerySchema>;

// ============================================================================
// BASE SCHEMA
// ============================================================================

/**
 * Step schema matching `step_library` table in qc_training
 */
export const StepSchema = z.object({
  step_id: z.number(),
  label: z.string().min(1),
  type: StepTypeSchema,
  category: StepCategorySchema,
  command_text: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  display_queries: z.array(DisplayQuerySchema).nullable().optional(),
  is_seed: z.boolean().default(false),
  story: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});
export type Step = z.infer<typeof StepSchema>;

/**
 * List item — omits heavy fields for list views
 */
export const StepListItemSchema = StepSchema.omit({
  command_text: true,
  display_queries: true,
});
export type StepListItem = z.infer<typeof StepListItemSchema>;

// ============================================================================
// CREATE SCHEMA
// ============================================================================

export const StepCreateSchema = z.object({
  label: z.string().min(1),
  type: StepTypeSchema,
  category: StepCategorySchema,
  command_text: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  display_queries: z.array(DisplayQuerySchema).nullable().optional(),
  story: z.string().nullable().optional(),
});
export type StepCreate = z.infer<typeof StepCreateSchema>;

// ============================================================================
// UPDATE SCHEMA
// ============================================================================

export const StepUpdateSchema = StepCreateSchema.partial();
export type StepUpdate = z.infer<typeof StepUpdateSchema>;

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

export const StepsResponseSchema = z.array(StepSchema);
export const StepListResponseSchema = z.array(StepListItemSchema);
