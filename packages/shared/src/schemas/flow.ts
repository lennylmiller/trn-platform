import { z } from 'zod';
import { StepTypeSchema, StepCategorySchema, DisplayQuerySchema } from './step';

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Flow schema matching `flow` table in qc_training
 */
export const FlowSchema = z.object({
  flow_id: z.number(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  is_seed: z.boolean().default(false),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});
export type Flow = z.infer<typeof FlowSchema>;

/**
 * List item with step count for overview
 */
export const FlowListItemSchema = FlowSchema.extend({
  step_count: z.number(),
});
export type FlowListItem = z.infer<typeof FlowListItemSchema>;

/**
 * Flow step schema — junction with joined step_library fields
 * Matches `flow_step` joined with `step_library` in qc_training
 */
export const FlowStepSchema = z.object({
  flow_step_id: z.number(),
  flow_id: z.number(),
  step_id: z.number(),
  seq: z.number(),
  pause_after: z.boolean().default(false),
  presenter_notes: z.string().nullable().optional(),
  visible_in_execution: z.boolean().default(true),
  override_display_queries: z.array(DisplayQuerySchema).nullable().optional(),
  // Joined from step_library
  label: z.string(),
  type: StepTypeSchema,
  category: StepCategorySchema,
  command_text: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  display_queries: z.array(DisplayQuerySchema).nullable().optional(),
});
export type FlowStep = z.infer<typeof FlowStepSchema>;

/**
 * Flow detail — flow + ordered steps
 */
export const FlowDetailSchema = FlowSchema.extend({
  steps: z.array(FlowStepSchema),
});
export type FlowDetail = z.infer<typeof FlowDetailSchema>;

// ============================================================================
// CREATE / UPDATE SCHEMAS
// ============================================================================

export const FlowCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
});
export type FlowCreate = z.infer<typeof FlowCreateSchema>;

export const FlowUpdateSchema = FlowCreateSchema.partial();
export type FlowUpdate = z.infer<typeof FlowUpdateSchema>;

export const FlowStepCreateSchema = z.object({
  step_id: z.number(),
  pause_after: z.boolean().default(false),
  presenter_notes: z.string().nullable().optional(),
  visible_in_execution: z.boolean().default(true),
  override_display_queries: z.array(DisplayQuerySchema).nullable().optional(),
});
export type FlowStepCreate = z.infer<typeof FlowStepCreateSchema>;

export const FlowStepUpdateSchema = FlowStepCreateSchema.partial();
export type FlowStepUpdate = z.infer<typeof FlowStepUpdateSchema>;

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

export const FlowsResponseSchema = z.array(FlowListItemSchema);
