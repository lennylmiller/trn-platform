import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import yaml from 'js-yaml';
import { getPool, closePool } from '@trn-platform/shared/db';
import {
  FixtureCourseSchema,
  type FixtureCourse,
  type FixtureBlock,
} from './fixture-schema.js';

/**
 * Load every YAML fixture in packages/courses/fixtures/ and upsert it into
 * the qc_training database.
 *
 * Upsert semantics — keep course_id stable so foreign keys (course_dependency,
 * course_completion) survive reseeds:
 *   - Course row: UPDATE if a row with the same title exists, else INSERT.
 *   - Lessons + slides: DELETE existing lessons for that course (cascade
 *     drops slides) then INSERT fresh from the fixture.
 *   - Series: upsert by title.
 *   - Prerequisites: DELETE existing course_dependency rows for the course
 *     then INSERT from the fixture's prerequisites list.
 *
 * Usage:  npx tsx packages/courses/server/src/fixtures.ts [fixtures-dir]
 */

interface LoadResult {
  courses: number;
  lessons: number;
  slides: number;
  series: number;
  tracks: number;
  dependencies: number;
}

function readFixtures(dir: string): { filename: string; fixture: FixtureCourse }[] {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml')).sort();
  return files.map((filename) => {
    const raw = fs.readFileSync(path.join(dir, filename), 'utf-8');
    const parsed = yaml.load(raw);
    const fixture = FixtureCourseSchema.parse(parsed);
    return { filename, fixture };
  });
}

async function upsertTrack(pool: any, title: string, description: string | null | undefined, seq: number): Promise<number> {
  const existing = await pool.request()
    .input('title', title)
    .query('SELECT track_id FROM course_track WHERE title = @title');
  if (existing.recordset[0]) {
    await pool.request()
      .input('id', existing.recordset[0].track_id)
      .input('description', description ?? null)
      .input('seq', seq)
      .query('UPDATE course_track SET description = @description, seq = @seq WHERE track_id = @id');
    return existing.recordset[0].track_id as number;
  }
  const inserted = await pool.request()
    .input('title', title)
    .input('description', description ?? null)
    .input('seq', seq)
    .query('INSERT INTO course_track (title, description, seq) OUTPUT INSERTED.track_id VALUES (@title, @description, @seq)');
  return inserted.recordset[0].track_id as number;
}

async function upsertSeries(pool: any, title: string, description: string | null | undefined, trackId: number | null, trackSeq: number | null): Promise<number> {
  const existing = await pool.request()
    .input('title', title)
    .query('SELECT series_id FROM course_series WHERE title = @title');
  if (existing.recordset[0]) {
    await pool.request()
      .input('id', existing.recordset[0].series_id)
      .input('description', description ?? null)
      .input('track_id', trackId)
      .input('track_seq', trackSeq)
      .query('UPDATE course_series SET description = @description, track_id = @track_id, track_seq = @track_seq WHERE series_id = @id');
    return existing.recordset[0].series_id as number;
  }
  const inserted = await pool.request()
    .input('title', title)
    .input('description', description ?? null)
    .input('track_id', trackId)
    .input('track_seq', trackSeq)
    .query('INSERT INTO course_series (title, description, track_id, track_seq) OUTPUT INSERTED.series_id VALUES (@title, @description, @track_id, @track_seq)');
  return inserted.recordset[0].series_id as number;
}

async function upsertCourseRow(
  pool: any,
  fixture: FixtureCourse,
  seriesId: number | null,
  trackId: number | null,
): Promise<number> {
  const existing = await pool.request()
    .input('title', fixture.title)
    .query('SELECT course_id FROM course WHERE title = @title');

  const seriesSeq = fixture.series?.seq ?? null;

  if (existing.recordset[0]) {
    const id = existing.recordset[0].course_id as number;
    await pool.request()
      .input('id', id)
      .input('description', fixture.description ?? null)
      .input('category', fixture.category ?? null)
      .input('status', fixture.status)
      .input('cover_image_url', fixture.cover_image_url ?? null)
      .input('actor', fixture.actor ?? null)
      .input('series_id', seriesId)
      .input('series_seq', seriesSeq)
      .input('track_id', trackId)
      .query(`UPDATE course SET
        description = @description, category = @category, status = @status,
        cover_image_url = @cover_image_url, actor = @actor,
        series_id = @series_id, series_seq = @series_seq,
        track_id = @track_id,
        updated_at = SYSUTCDATETIME()
        WHERE course_id = @id`);
    return id;
  }

  const inserted = await pool.request()
    .input('title', fixture.title)
    .input('description', fixture.description ?? null)
    .input('category', fixture.category ?? null)
    .input('status', fixture.status)
    .input('cover_image_url', fixture.cover_image_url ?? null)
    .input('actor', fixture.actor ?? null)
    .input('series_id', seriesId)
    .input('series_seq', seriesSeq)
    .input('track_id', trackId)
    .query(`INSERT INTO course
      (title, description, category, status, cover_image_url, actor, series_id, series_seq, track_id)
      OUTPUT INSERTED.course_id
      VALUES (@title, @description, @category, @status, @cover_image_url, @actor, @series_id, @series_seq, @track_id)`);
  return inserted.recordset[0].course_id as number;
}

async function replaceLessonsAndSlides(
  pool: any,
  courseId: number,
  fixture: FixtureCourse,
): Promise<{ lessons: number; slides: number }> {
  // CASCADE on course_lesson drops dependent slides.
  await pool.request()
    .input('id', courseId)
    .query('DELETE FROM course_lesson WHERE course_id = @id');

  let lessonCount = 0;
  let slideCount = 0;

  for (let lessonIdx = 0; lessonIdx < fixture.lessons.length; lessonIdx += 1) {
    const lesson = fixture.lessons[lessonIdx]!;
    const inserted = await pool.request()
      .input('courseId', courseId)
      .input('seq', lessonIdx)
      .input('title', lesson.title)
      .input('description', lesson.description ?? null)
      .query(`INSERT INTO course_lesson (course_id, seq, title, description)
              OUTPUT INSERTED.lesson_id
              VALUES (@courseId, @seq, @title, @description)`);
    const lessonId = inserted.recordset[0].lesson_id as number;
    lessonCount += 1;

    for (let slideIdx = 0; slideIdx < lesson.slides.length; slideIdx += 1) {
      const slide = lesson.slides[slideIdx]!;
      await insertBlock(pool, lessonId, slideIdx, slide);
      slideCount += 1;
    }
  }

  return { lessons: lessonCount, slides: slideCount };
}

async function insertBlock(pool: any, lessonId: number, seq: number, slide: FixtureBlock) {
  const blockType = slide.block_type ?? slide.slide_type ?? 'narrative';
  await pool.request()
    .input('lessonId', lessonId)
    .input('seq', seq)
    .input('block_type', blockType)
    .input('title', slide.title ?? null)
    .input('content', slide.content ?? null)
    .input('image_url', slide.image_url ?? null)
    .input('sql_text', slide.sql_text ?? null)
    .input('sql_label', slide.sql_label ?? null)
    .input('verify_mode', slide.verify_mode ?? null)
    .input('expected_json', slide.expected_json != null ? JSON.stringify(slide.expected_json) : null)
    .input('quiz_question', slide.quiz_question ?? null)
    .input('quiz_options', slide.quiz_options ? JSON.stringify(slide.quiz_options) : null)
    .input('quiz_answer', slide.quiz_answer ?? null)
    .input('quiz_explanation', slide.quiz_explanation ?? null)
    .input('hints', slide.hints ? JSON.stringify(slide.hints) : null)
    .input('presenter_notes', slide.presenter_notes ?? null)
    .input('seed_sql', slide.seed_sql ?? null)
    .input('seed_label', slide.seed_label ?? null)
    .query(`INSERT INTO course_block
      (lesson_id, seq, block_type, title, content, image_url, sql_text, sql_label,
       verify_mode, expected_json, quiz_question, quiz_options, quiz_answer,
       quiz_explanation, hints, presenter_notes, seed_sql, seed_label)
      VALUES (@lessonId, @seq, @block_type, @title, @content, @image_url, @sql_text, @sql_label,
       @verify_mode, @expected_json, @quiz_question, @quiz_options, @quiz_answer,
       @quiz_explanation, @hints, @presenter_notes, @seed_sql, @seed_label)`);
}

async function replaceDependencies(
  pool: any,
  courseId: number,
  prerequisiteCourseIds: number[],
): Promise<number> {
  await pool.request()
    .input('id', courseId)
    .query('DELETE FROM course_dependency WHERE course_id = @id');

  for (const depId of prerequisiteCourseIds) {
    await pool.request()
      .input('id', courseId)
      .input('dep', depId)
      .query(`INSERT INTO course_dependency (course_id, depends_on_course_id)
              VALUES (@id, @dep)`);
  }
  return prerequisiteCourseIds.length;
}

export async function loadFixturesFromDir(dir: string): Promise<LoadResult> {
  const fixtures = readFixtures(dir);
  if (fixtures.length === 0) {
    console.warn(`No fixtures found in ${dir}`);
    return { courses: 0, lessons: 0, slides: 0, series: 0, tracks: 0, dependencies: 0 };
  }

  const pool = await getPool('qc_training');
  const result: LoadResult = { courses: 0, lessons: 0, slides: 0, series: 0, tracks: 0, dependencies: 0 };

  // Pass 1 — tracks + series + courses + lessons + slides.
  const trackIdByTitle = new Map<string, number>();
  const seriesIdByTitle = new Map<string, number>();
  const courseIdByTitle = new Map<string, number>();

  for (const { filename, fixture } of fixtures) {
    // Resolve track (from fixture.track or inherited from series in future)
    let trackId: number | null = null;
    if (fixture.track) {
      const cached = trackIdByTitle.get(fixture.track.title);
      if (cached != null) {
        trackId = cached;
      } else {
        trackId = await upsertTrack(pool, fixture.track.title, fixture.track.description, fixture.track.seq ?? 0);
        trackIdByTitle.set(fixture.track.title, trackId);
        result.tracks += 1;
      }
    }

    // Resolve series
    let seriesId: number | null = null;
    if (fixture.series) {
      const cached = seriesIdByTitle.get(fixture.series.title);
      if (cached != null) {
        seriesId = cached;
      } else {
        seriesId = await upsertSeries(pool, fixture.series.title, fixture.series.description, trackId, null);
        seriesIdByTitle.set(fixture.series.title, seriesId);
        result.series += 1;
      }
    }

    const courseId = await upsertCourseRow(pool, fixture, seriesId, trackId);
    courseIdByTitle.set(fixture.title, courseId);
    result.courses += 1;

    const counts = await replaceLessonsAndSlides(pool, courseId, fixture);
    result.lessons += counts.lessons;
    result.slides += counts.slides;

    console.log(`loaded ${filename}: course_id=${courseId} lessons=${counts.lessons} slides=${counts.slides}`);
  }

  // Pass 2 — prerequisites (need every course_id from pass 1).
  for (const { filename, fixture } of fixtures) {
    if (fixture.prerequisites.length === 0) continue;
    const courseId = courseIdByTitle.get(fixture.title)!;
    const prereqIds: number[] = [];
    for (const prereqTitle of fixture.prerequisites) {
      const id = courseIdByTitle.get(prereqTitle);
      if (id == null) {
        console.warn(`${filename}: prerequisite "${prereqTitle}" not found among loaded fixtures, skipping`);
        continue;
      }
      prereqIds.push(id);
    }
    const inserted = await replaceDependencies(pool, courseId, prereqIds);
    result.dependencies += inserted;
  }

  return result;
}

async function main() {
  const dir = path.resolve(
    process.argv[2] ?? path.join(import.meta.dirname, '..', '..', 'fixtures'),
  );

  try {
    const result = await loadFixturesFromDir(dir);
    console.log(
      `Done. tracks=${result.tracks} courses=${result.courses} lessons=${result.lessons} slides=${result.slides} series=${result.series} deps=${result.dependencies}`,
    );
  } finally {
    await closePool();
  }
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? '').href
  || fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? '');

if (isMain) {
  main().catch((err) => {
    console.error('Load failed:', err);
    process.exit(1);
  });
}
