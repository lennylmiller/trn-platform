import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export const SlideTypeSchema = z.enum([
  'narrative', 'reference', 'live_demo', 'sql_challenge',
  'quiz', 'do_it_in_qc', 'screenshot_task',
]);
export type SlideType = z.infer<typeof SlideTypeSchema>;

export const VerifyModeSchema = z.enum(['auto', 'show']);
export type VerifyMode = z.infer<typeof VerifyModeSchema>;

export const CourseStatusSchema = z.enum(['draft', 'published', 'archived']);
export type CourseStatus = z.infer<typeof CourseStatusSchema>;

// ============================================================================
// SERIES
// ============================================================================

export const CourseSeriesSchema = z.object({
  series_id: z.number(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
});
export type CourseSeries = z.infer<typeof CourseSeriesSchema>;

export const CourseSeriesCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
});
export type CourseSeriesCreate = z.infer<typeof CourseSeriesCreateSchema>;

// ============================================================================
// BASE SCHEMAS
// ============================================================================

export const CourseSchema = z.object({
  course_id: z.number(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  status: CourseStatusSchema,
  cover_image_url: z.string().nullable().optional(),
  series_id: z.number().nullable().optional(),
  series_seq: z.number().nullable().optional(),
  actor: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});
export type Course = z.infer<typeof CourseSchema>;

export const CourseSectionSchema = z.object({
  section_id: z.number(),
  course_id: z.number(),
  seq: z.number(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
});
export type CourseSection = z.infer<typeof CourseSectionSchema>;

export const CourseSlideSchema = z.object({
  slide_id: z.number(),
  section_id: z.number(),
  seq: z.number(),
  slide_type: SlideTypeSchema,
  title: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  sql_text: z.string().nullable().optional(),
  sql_label: z.string().nullable().optional(),
  verify_mode: VerifyModeSchema.nullable().optional(),
  expected_json: z.unknown().nullable().optional(),
  quiz_question: z.string().nullable().optional(),
  quiz_options: z.array(z.string()).nullable().optional(),
  quiz_answer: z.number().nullable().optional(),
  quiz_explanation: z.string().nullable().optional(),
  hints: z.array(z.string()).nullable().optional(),
  presenter_notes: z.string().nullable().optional(),
  seed_sql: z.string().nullable().optional(),
  seed_label: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
});
export type CourseSlide = z.infer<typeof CourseSlideSchema>;

// ============================================================================
// DETAIL SCHEMAS
// ============================================================================

export const CourseSectionDetailSchema = CourseSectionSchema.extend({
  slides: z.array(CourseSlideSchema),
});
export type CourseSectionDetail = z.infer<typeof CourseSectionDetailSchema>;

export const CourseDetailSchema = CourseSchema.extend({
  sections: z.array(CourseSectionDetailSchema),
});
export type CourseDetail = z.infer<typeof CourseDetailSchema>;

// ============================================================================
// LIST SCHEMAS
// ============================================================================

export const CourseListItemSchema = CourseSchema.extend({
  section_count: z.number(),
  slide_count: z.number(),
});
export type CourseListItem = z.infer<typeof CourseListItemSchema>;

// ============================================================================
// CREATE / UPDATE SCHEMAS
// ============================================================================

export const CourseCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  actor: z.string().nullable().optional(),
  series_id: z.number().nullable().optional(),
  series_seq: z.number().nullable().optional(),
});
export type CourseCreate = z.infer<typeof CourseCreateSchema>;

export const CourseUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  actor: z.string().nullable().optional(),
  series_id: z.number().nullable().optional(),
  series_seq: z.number().nullable().optional(),
  status: CourseStatusSchema.optional(),
  cover_image_url: z.string().nullable().optional(),
}).partial();
export type CourseUpdate = z.infer<typeof CourseUpdateSchema>;

export const SectionCreateSchema = z.object({
  seq: z.number(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
});
export type SectionCreate = z.infer<typeof SectionCreateSchema>;

export const SectionUpdateSchema = SectionCreateSchema.partial();
export type SectionUpdate = z.infer<typeof SectionUpdateSchema>;

export const SlideCreateSchema = z.object({
  seq: z.number(),
  slide_type: SlideTypeSchema,
  title: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  sql_text: z.string().nullable().optional(),
  sql_label: z.string().nullable().optional(),
  verify_mode: VerifyModeSchema.nullable().optional(),
  expected_json: z.unknown().nullable().optional(),
  quiz_question: z.string().nullable().optional(),
  quiz_options: z.array(z.string()).nullable().optional(),
  quiz_answer: z.number().nullable().optional(),
  quiz_explanation: z.string().nullable().optional(),
  hints: z.array(z.string()).nullable().optional(),
  presenter_notes: z.string().nullable().optional(),
  seed_sql: z.string().nullable().optional(),
  seed_label: z.string().nullable().optional(),
});
export type SlideCreate = z.infer<typeof SlideCreateSchema>;

export const SlideUpdateSchema = SlideCreateSchema.partial();
export type SlideUpdate = z.infer<typeof SlideUpdateSchema>;

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

export const CoursesResponseSchema = z.array(CourseListItemSchema);
