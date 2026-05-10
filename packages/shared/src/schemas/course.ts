import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export const CourseBlockTypeSchema = z.enum([
  'narrative', 'reference', 'live_demo', 'sql_challenge',
  'quiz', 'do_it_in_qc', 'screenshot_task',
]);
export type CourseBlockType = z.infer<typeof CourseBlockTypeSchema>;

export const VerifyModeSchema = z.enum(['auto', 'show']);
export type VerifyMode = z.infer<typeof VerifyModeSchema>;

export const CourseStatusSchema = z.enum(['draft', 'published', 'archived']);
export type CourseStatus = z.infer<typeof CourseStatusSchema>;

export const SlideLayoutSchema = z.enum(['full', 'side-by-side', 'image-left', 'image-right']);
export type SlideLayout = z.infer<typeof SlideLayoutSchema>;

// ============================================================================
// TRACKS
// ============================================================================

export const CourseTrackSchema = z.object({
  track_id: z.number(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  seq: z.number(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  created_at: z.string().nullable().optional(),
});
export type CourseTrack = z.infer<typeof CourseTrackSchema>;

export const CourseTrackCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  seq: z.number().optional(),
});
export type CourseTrackCreate = z.infer<typeof CourseTrackCreateSchema>;

// ============================================================================
// SERIES
// ============================================================================

export const CourseSeriesSchema = z.object({
  series_id: z.number(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  track_id: z.number().nullable().optional(),
  track_seq: z.number().nullable().optional(),
  created_at: z.string().nullable().optional(),
});
export type CourseSeries = z.infer<typeof CourseSeriesSchema>;

export const CourseSeriesCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
});
export type CourseSeriesCreate = z.infer<typeof CourseSeriesCreateSchema>;

// ============================================================================
// COURSE
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
  track_id: z.number().nullable().optional(),
  track_seq: z.number().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});
export type Course = z.infer<typeof CourseSchema>;

// ============================================================================
// LESSON
// ============================================================================

export const CourseLessonSchema = z.object({
  lesson_id: z.number(),
  course_id: z.number(),
  seq: z.number(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
});
export type CourseLesson = z.infer<typeof CourseLessonSchema>;

// ============================================================================
// BLOCK (content unit)
// ============================================================================

export const CourseBlockSchema = z.object({
  block_id: z.number(),
  lesson_id: z.number(),
  seq: z.number(),
  block_type: CourseBlockTypeSchema,
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
export type CourseBlock = z.infer<typeof CourseBlockSchema>;

// ============================================================================
// SLIDE (visual container) & ELEMENTS
// ============================================================================

export const SlideElementSchema = z.object({
  element_id: z.number(),
  slide_id: z.number(),
  seq: z.number(),
  element_type: z.enum(['block', 'image']),
  block_id: z.number().nullable().optional(),
  image_url: z.string().nullable().optional(),
  image_alt: z.string().nullable().optional(),
});
export type SlideElement = z.infer<typeof SlideElementSchema>;

export const CourseSlideSchema = z.object({
  slide_id: z.number(),
  lesson_id: z.number(),
  seq: z.number(),
  layout: SlideLayoutSchema,
  title: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  elements: z.array(SlideElementSchema).optional(),
  created_at: z.string().nullable().optional(),
});
export type CourseSlide = z.infer<typeof CourseSlideSchema>;

// ============================================================================
// DETAIL SCHEMAS
// ============================================================================

export const CourseLessonDetailSchema = CourseLessonSchema.extend({
  blocks: z.array(CourseBlockSchema),
  slides: z.array(CourseSlideSchema).optional(),
});
export type CourseLessonDetail = z.infer<typeof CourseLessonDetailSchema>;

export const CourseDetailSchema = CourseSchema.extend({
  lessons: z.array(CourseLessonDetailSchema),
});
export type CourseDetail = z.infer<typeof CourseDetailSchema>;

// ============================================================================
// LIST SCHEMAS
// ============================================================================

export const CourseListItemSchema = CourseSchema.extend({
  lesson_count: z.number(),
  block_count: z.number(),
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
  track_id: z.number().nullable().optional(),
});
export type CourseCreate = z.infer<typeof CourseCreateSchema>;

export const CourseUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  actor: z.string().nullable().optional(),
  series_id: z.number().nullable().optional(),
  series_seq: z.number().nullable().optional(),
  track_id: z.number().nullable().optional(),
  status: CourseStatusSchema.optional(),
  cover_image_url: z.string().nullable().optional(),
}).partial();
export type CourseUpdate = z.infer<typeof CourseUpdateSchema>;

export const LessonCreateSchema = z.object({
  seq: z.number(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
});
export type LessonCreate = z.infer<typeof LessonCreateSchema>;

export const LessonUpdateSchema = LessonCreateSchema.partial();
export type LessonUpdate = z.infer<typeof LessonUpdateSchema>;

export const CourseBlockCreateSchema = z.object({
  seq: z.number(),
  block_type: CourseBlockTypeSchema,
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
export type CourseBlockCreate = z.infer<typeof CourseBlockCreateSchema>;

export const CourseBlockUpdateSchema = CourseBlockCreateSchema.partial();
export type CourseBlockUpdate = z.infer<typeof CourseBlockUpdateSchema>;

// ============================================================================
// DRAFTS
// ============================================================================

export const CourseDraftSchema = z.object({
  draft_id: z.number(),
  course_id: z.number(),
  title: z.string().min(1),
  content: z.string(),
  source: z.string().nullable().optional(),
  status: z.string(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});
export type CourseDraft = z.infer<typeof CourseDraftSchema>;

export const CourseDraftCreateSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  source: z.string().nullable().optional(),
});
export type CourseDraftCreate = z.infer<typeof CourseDraftCreateSchema>;

export const CourseDraftUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  status: z.string().optional(),
}).partial();
export type CourseDraftUpdate = z.infer<typeof CourseDraftUpdateSchema>;

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

export const CoursesResponseSchema = z.array(CourseListItemSchema);
export const SeriesResponseSchema = z.array(CourseSeriesSchema);
export const TracksResponseSchema = z.array(CourseTrackSchema);
export const DraftsResponseSchema = z.array(CourseDraftSchema);
