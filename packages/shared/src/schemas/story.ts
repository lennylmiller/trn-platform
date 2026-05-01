import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export const StoryStatusSchema = z.enum(['draft', 'planning', 'authoring', 'review', 'complete']);
export type StoryStatus = z.infer<typeof StoryStatusSchema>;

export const PlanItemStatusSchema = z.enum(['pending', 'in_progress', 'done', 'skipped']);
export type PlanItemStatus = z.infer<typeof PlanItemStatusSchema>;

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Story schema matching `story` table in qc_training.
 * A story is the top-level container for a training narrative arc.
 */
export const StorySchema = z.object({
  story_id: z.number(),
  story_ud: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  status: StoryStatusSchema,
  flow_id: z.number().nullable().optional(),
  composition_id: z.number().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});
export type Story = z.infer<typeof StorySchema>;

/**
 * Plan item schema matching `story_plan_item` table in qc_training.
 * Each plan item is a blueprint for a step to author.
 */
export const StoryPlanItemSchema = z.object({
  plan_item_id: z.number(),
  story_id: z.number(),
  seq: z.number(),
  act: z.string().nullable().optional(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  tables_involved: z.array(z.string()).nullable().optional(),
  status: PlanItemStatusSchema,
  step_id: z.number().nullable().optional(),
  created_at: z.string().nullable().optional(),
});
export type StoryPlanItem = z.infer<typeof StoryPlanItemSchema>;

// ============================================================================
// DETAIL SCHEMA (story + plan items)
// ============================================================================

export const StoryDetailSchema = StorySchema.extend({
  plan_items: z.array(StoryPlanItemSchema),
});
export type StoryDetail = z.infer<typeof StoryDetailSchema>;

// ============================================================================
// CREATE / UPDATE SCHEMAS
// ============================================================================

export const StoryCreateSchema = z.object({
  story_ud: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
});
export type StoryCreate = z.infer<typeof StoryCreateSchema>;

export const StoryUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: StoryStatusSchema.optional(),
  flow_id: z.number().nullable().optional(),
  composition_id: z.number().nullable().optional(),
}).partial();
export type StoryUpdate = z.infer<typeof StoryUpdateSchema>;

export const PlanItemCreateSchema = z.object({
  seq: z.number(),
  act: z.string().nullable().optional(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  tables_involved: z.array(z.string()).nullable().optional(),
});
export type PlanItemCreate = z.infer<typeof PlanItemCreateSchema>;

export const PlanItemUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  act: z.string().nullable().optional(),
  tables_involved: z.array(z.string()).nullable().optional(),
  status: PlanItemStatusSchema.optional(),
  step_id: z.number().nullable().optional(),
}).partial();
export type PlanItemUpdate = z.infer<typeof PlanItemUpdateSchema>;

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

export const StoriesResponseSchema = z.array(StorySchema);
