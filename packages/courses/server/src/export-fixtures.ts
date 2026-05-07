import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import yaml from 'js-yaml';
import { getPool, closePool } from '@trn-platform/shared/db';
import {
  FixtureCourseSchema,
  type FixtureCourse,
  type FixtureSlide,
  slugify,
} from './fixture-schema.js';

/**
 * Export every course in the DB to a YAML fixture file.
 *
 * Usage:  npx tsx packages/courses/server/src/export-fixtures.ts [out-dir]
 * Default out dir:  packages/courses/fixtures/
 */

interface CourseRow {
  course_id: number;
  title: string;
  description: string | null;
  category: string | null;
  status: 'draft' | 'published' | 'archived';
  cover_image_url: string | null;
  actor: string | null;
  series_id: number | null;
  series_seq: number | null;
}

interface SeriesRow {
  series_id: number;
  title: string;
  description: string | null;
}

interface SectionRow {
  section_id: number;
  course_id: number;
  seq: number;
  title: string;
  description: string | null;
}

interface SlideRow {
  slide_id: number;
  section_id: number;
  seq: number;
  slide_type: FixtureSlide['slide_type'];
  title: string | null;
  content: string | null;
  image_url: string | null;
  sql_text: string | null;
  sql_label: string | null;
  verify_mode: 'auto' | 'show' | null;
  expected_json: string | null;
  quiz_question: string | null;
  quiz_options: string | null;
  quiz_answer: number | null;
  quiz_explanation: string | null;
  hints: string | null;
  presenter_notes: string | null;
  seed_sql: string | null;
  seed_label: string | null;
}

interface DependencyRow {
  course_id: number;
  depends_on_course_id: number;
}

function parseJson<T = unknown>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

/** Drop null/empty/default values so the YAML stays readable. */
function pruneFixture(course: FixtureCourse): unknown {
  const out: Record<string, unknown> = {
    title: course.title,
  };
  if (course.description) out.description = course.description;
  if (course.category) out.category = course.category;
  if (course.status && course.status !== 'draft') out.status = course.status;
  if (course.cover_image_url) out.cover_image_url = course.cover_image_url;
  if (course.actor) out.actor = course.actor;
  if (course.series) out.series = course.series;
  if (course.prerequisites && course.prerequisites.length > 0) out.prerequisites = course.prerequisites;
  out.sections = course.sections.map((s) => {
    const sec: Record<string, unknown> = { title: s.title };
    if (s.description) sec.description = s.description;
    sec.slides = s.slides.map((sl) => pruneSlide(sl));
    return sec;
  });
  return out;
}

function pruneSlide(slide: FixtureSlide): Record<string, unknown> {
  const out: Record<string, unknown> = { slide_type: slide.slide_type };
  const passthrough: (keyof FixtureSlide)[] = [
    'title', 'content', 'image_url', 'sql_text', 'sql_label', 'verify_mode',
    'expected_json', 'quiz_question', 'quiz_options', 'quiz_answer',
    'quiz_explanation', 'hints', 'presenter_notes', 'seed_sql', 'seed_label',
  ];
  for (const key of passthrough) {
    const v = slide[key];
    if (v !== null && v !== undefined) out[key as string] = v;
  }
  return out;
}

async function main() {
  const outDir = path.resolve(
    process.argv[2] ?? path.join(import.meta.dirname, '..', '..', 'fixtures'),
  );
  fs.mkdirSync(outDir, { recursive: true });

  const pool = await getPool('qc_training');

  try {
    const seriesRows: SeriesRow[] = (await pool.request()
      .query('SELECT series_id, title, description FROM course_series')).recordset;
    const seriesById = new Map(seriesRows.map((s) => [s.series_id, s]));

    const courseRows: CourseRow[] = (await pool.request()
      .query('SELECT course_id, title, description, category, status, cover_image_url, actor, series_id, series_seq FROM course ORDER BY course_id')).recordset;

    const sectionRows: SectionRow[] = (await pool.request()
      .query('SELECT section_id, course_id, seq, title, description FROM course_section ORDER BY course_id, seq')).recordset;

    const slideRows: SlideRow[] = (await pool.request()
      .query('SELECT * FROM course_slide ORDER BY section_id, seq')).recordset;

    const dependencyRows: DependencyRow[] = (await pool.request()
      .query('SELECT course_id, depends_on_course_id FROM course_dependency')).recordset;

    const courseTitleById = new Map(courseRows.map((c) => [c.course_id, c.title]));

    let written = 0;
    for (const course of courseRows) {
      const sections = sectionRows
        .filter((s) => s.course_id === course.course_id)
        .map((s) => ({
          title: s.title,
          description: s.description,
          slides: slideRows
            .filter((sl) => sl.section_id === s.section_id)
            .map<FixtureSlide>((sl) => ({
              slide_type: sl.slide_type,
              title: sl.title,
              content: sl.content,
              image_url: sl.image_url,
              sql_text: sl.sql_text,
              sql_label: sl.sql_label,
              verify_mode: sl.verify_mode,
              expected_json: parseJson(sl.expected_json),
              quiz_question: sl.quiz_question,
              quiz_options: parseJson<string[]>(sl.quiz_options),
              quiz_answer: sl.quiz_answer,
              quiz_explanation: sl.quiz_explanation,
              hints: parseJson<string[]>(sl.hints),
              presenter_notes: sl.presenter_notes,
              seed_sql: sl.seed_sql,
              seed_label: sl.seed_label,
            })),
        }));

      const series = course.series_id != null
        ? (() => {
            const s = seriesById.get(course.series_id!);
            if (!s) return null;
            return {
              title: s.title,
              description: s.description,
              seq: course.series_seq ?? 0,
            };
          })()
        : null;

      const prerequisites = dependencyRows
        .filter((d) => d.course_id === course.course_id)
        .map((d) => courseTitleById.get(d.depends_on_course_id))
        .filter((t): t is string => typeof t === 'string');

      const fixture: FixtureCourse = FixtureCourseSchema.parse({
        title: course.title,
        description: course.description,
        category: course.category,
        status: course.status,
        cover_image_url: course.cover_image_url,
        actor: course.actor,
        series,
        prerequisites,
        sections,
      });

      const yamlBody = yaml.dump(pruneFixture(fixture), {
        lineWidth: 120,
        noRefs: true,
        sortKeys: false,
      });
      const filename = `${slugify(course.title)}.yaml`;
      fs.writeFileSync(path.join(outDir, filename), yamlBody, 'utf-8');
      console.log(`wrote ${filename}`);
      written += 1;
    }

    console.log(`Exported ${written} course(s) to ${outDir}`);
  } finally {
    await closePool();
  }
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? '').href
  || fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? '');

if (isMain) {
  main().catch((err) => {
    console.error('Export failed:', err);
    process.exit(1);
  });
}
