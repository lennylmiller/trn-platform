import { z } from 'zod';
import { CourseBlockTypeSchema, VerifyModeSchema, CourseStatusSchema } from '@trn-platform/shared/schemas';

/**
 * Zod schemas for the YAML fixture format.
 *
 * Differences from the DB schemas in @trn-platform/shared:
 *  - No IDs (course_id, section_id, block_id) — assigned by the DB.
 *  - No `seq` on sections/slides — order in the array is the order on disk
 *    and gets written back as `seq = index`.
 *  - Series is referenced by title (with optional metadata to upsert).
 *  - Prerequisites are referenced by course title.
 *  - `created_at` / `updated_at` are not part of fixtures.
 */

export const FixtureBlockSchema = z.object({
  block_type: CourseBlockTypeSchema.optional(),
  slide_type: CourseBlockTypeSchema.optional(),
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
export type FixtureBlock = z.infer<typeof FixtureBlockSchema>;

export const FixtureLessonSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  slides: z.array(FixtureBlockSchema).default([]),
});
export type FixtureLesson = z.infer<typeof FixtureLessonSchema>;

export const FixtureTrackRefSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  seq: z.number().int().nonnegative().optional(),
});
export type FixtureTrackRef = z.infer<typeof FixtureTrackRefSchema>;

export const FixtureSeriesRefSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  seq: z.number().int().nonnegative(),
});
export type FixtureSeriesRef = z.infer<typeof FixtureSeriesRefSchema>;

export const FixtureCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  status: CourseStatusSchema.default('draft'),
  cover_image_url: z.string().nullable().optional(),
  actor: z.string().nullable().optional(),
  track: FixtureTrackRefSchema.nullable().optional(),
  series: FixtureSeriesRefSchema.nullable().optional(),
  prerequisites: z.array(z.string().min(1)).default([]),
  lessons: z.array(FixtureLessonSchema).default([]),
});
export type FixtureCourse = z.infer<typeof FixtureCourseSchema>;

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
