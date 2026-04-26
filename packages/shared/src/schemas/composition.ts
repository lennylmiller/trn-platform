import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export const CompositionKindSchema = z.enum(['story', 'tutorial', 'module']);
export type CompositionKind = z.infer<typeof CompositionKindSchema>;

export const BlockTypeSchema = z.enum(['narrative', 'flow', 'note', 'composition']);
export type BlockType = z.infer<typeof BlockTypeSchema>;

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Composition schema matching `composition` table in qc_training
 */
export const CompositionSchema = z.object({
  composition_id: z.number(),
  kind: CompositionKindSchema,
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  is_seed: z.boolean().default(false),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});
export type Composition = z.infer<typeof CompositionSchema>;

/**
 * List item with counts for overview
 */
export const CompositionListItemSchema = CompositionSchema.extend({
  block_count: z.number(),
  flow_count: z.number(),
});
export type CompositionListItem = z.infer<typeof CompositionListItemSchema>;

/**
 * Composition block — joined with flow and ref_composition fields
 * Matches `composition_block` with joins in qc_training
 */
export const CompositionBlockSchema = z.object({
  block_id: z.number(),
  composition_id: z.number(),
  seq: z.number(),
  block_type: BlockTypeSchema,
  content: z.string().nullable().optional(),
  technical_content: z.string().nullable().optional(),
  flow_id: z.number().nullable().optional(),
  ref_composition_id: z.number().nullable().optional(),
  heading: z.string().nullable().optional(),
  presenter_notes: z.string().nullable().optional(),
  // Joined fields
  flow_name: z.string().nullable().optional(),
  flow_description: z.string().nullable().optional(),
  flow_step_count: z.number().nullable().optional(),
  ref_composition_title: z.string().nullable().optional(),
  ref_composition_kind: CompositionKindSchema.nullable().optional(),
});
export type CompositionBlock = z.infer<typeof CompositionBlockSchema>;

/**
 * Composition detail — composition + ordered blocks
 */
export const CompositionDetailSchema = CompositionSchema.extend({
  blocks: z.array(CompositionBlockSchema),
});
export type CompositionDetail = z.infer<typeof CompositionDetailSchema>;

// ============================================================================
// CREATE / UPDATE SCHEMAS
// ============================================================================

export const CompositionCreateSchema = z.object({
  kind: CompositionKindSchema,
  title: z.string().min(1),
  description: z.string().nullable().optional(),
});
export type CompositionCreate = z.infer<typeof CompositionCreateSchema>;

export const CompositionUpdateSchema = CompositionCreateSchema.partial();
export type CompositionUpdate = z.infer<typeof CompositionUpdateSchema>;

export const BlockCreateSchema = z.object({
  block_type: BlockTypeSchema,
  content: z.string().nullable().optional(),
  technical_content: z.string().nullable().optional(),
  flow_id: z.number().nullable().optional(),
  ref_composition_id: z.number().nullable().optional(),
  heading: z.string().nullable().optional(),
  presenter_notes: z.string().nullable().optional(),
});
export type BlockCreate = z.infer<typeof BlockCreateSchema>;

export const BlockUpdateSchema = BlockCreateSchema.partial();
export type BlockUpdate = z.infer<typeof BlockUpdateSchema>;

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

export const CompositionsResponseSchema = z.array(CompositionListItemSchema);
