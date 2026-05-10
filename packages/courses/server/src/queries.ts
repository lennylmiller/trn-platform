import type {
  Course, CourseCreate, CourseUpdate, CourseDetail,
  CourseLesson, LessonCreate, LessonUpdate,
  CourseBlock, CourseBlockCreate, CourseBlockUpdate,
  CourseSlide, SlideElement,
  CourseListItem, CourseLessonDetail, CourseSeries, CourseTrack,
  CourseDraft, CourseDraftCreate, CourseDraftUpdate,
} from '@trn-platform/shared/schemas';
import { getPool } from '@trn-platform/shared/db';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseJson(raw: string | null | undefined): unknown {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function mapCourse(row: Record<string, unknown>): Course {
  return {
    course_id: row.course_id as number,
    title: row.title as string,
    description: (row.description as string) ?? null,
    category: (row.category as string) ?? null,
    status: row.status as Course['status'],
    cover_image_url: (row.cover_image_url as string) ?? null,
    series_id: (row.series_id as number) ?? null,
    series_seq: (row.series_seq as number) ?? null,
    actor: (row.actor as string) ?? null,
    track_id: (row.track_id as number) ?? null,
    track_seq: (row.track_seq as number) ?? null,
    created_at: (row.created_at as string) ?? null,
    updated_at: (row.updated_at as string) ?? null,
  };
}

function mapLesson(row: Record<string, unknown>): CourseLesson {
  return {
    lesson_id: row.lesson_id as number,
    course_id: row.course_id as number,
    seq: row.seq as number,
    title: row.title as string,
    description: (row.description as string) ?? null,
  };
}

function mapBlock(row: Record<string, unknown>): CourseBlock {
  return {
    block_id: row.block_id as number,
    lesson_id: row.lesson_id as number,
    seq: row.seq as number,
    block_type: row.block_type as CourseBlock['block_type'],
    title: (row.title as string) ?? null,
    content: (row.content as string) ?? null,
    image_url: (row.image_url as string) ?? null,
    sql_text: (row.sql_text as string) ?? null,
    sql_label: (row.sql_label as string) ?? null,
    verify_mode: (row.verify_mode as CourseBlock['verify_mode']) ?? null,
    expected_json: parseJson(row.expected_json as string),
    quiz_question: (row.quiz_question as string) ?? null,
    quiz_options: parseJson(row.quiz_options as string) as string[] | null,
    quiz_answer: (row.quiz_answer as number) ?? null,
    quiz_explanation: (row.quiz_explanation as string) ?? null,
    hints: parseJson(row.hints as string) as string[] | null,
    presenter_notes: (row.presenter_notes as string) ?? null,
    seed_sql: (row.seed_sql as string) ?? null,
    seed_label: (row.seed_label as string) ?? null,
    created_at: (row.created_at as string) ?? null,
  };
}

// ---------------------------------------------------------------------------
// Tracks
// ---------------------------------------------------------------------------

export async function listTracks(): Promise<CourseTrack[]> {
  const pool = await getPool('qc_training');
  const result = await pool.request().query('SELECT * FROM course_track ORDER BY seq, title');
  return result.recordset.map((r: Record<string, unknown>) => ({
    track_id: r.track_id as number,
    title: r.title as string,
    description: (r.description as string) ?? null,
    seq: (r.seq as number) ?? 0,
    metadata: parseJson(r.metadata as string) as Record<string, unknown> | null,
    created_at: (r.created_at as string) ?? null,
  }));
}

export async function createTrack(input: { title: string; description?: string | null; seq?: number }): Promise<CourseTrack> {
  const pool = await getPool('qc_training');
  const result = await pool.request()
    .input('title', input.title)
    .input('description', input.description ?? null)
    .input('seq', input.seq ?? 0)
    .query('INSERT INTO course_track (title, description, seq) OUTPUT INSERTED.* VALUES (@title, @description, @seq)');
  const r = result.recordset[0];
  return { track_id: r.track_id as number, title: r.title as string, description: (r.description as string) ?? null, seq: (r.seq as number) ?? 0, metadata: null, created_at: (r.created_at as string) ?? null };
}

export async function updateTrack(id: number, updates: { title?: string; description?: string | null; seq?: number; metadata?: Record<string, unknown> | null }): Promise<CourseTrack | null> {
  const pool = await getPool('qc_training');
  const setClauses: string[] = [];
  const request = pool.request().input('id', id);
  if (updates.title !== undefined) { setClauses.push('title = @title'); request.input('title', updates.title); }
  if (updates.description !== undefined) { setClauses.push('description = @description'); request.input('description', updates.description ?? null); }
  if (updates.seq !== undefined) { setClauses.push('seq = @seq'); request.input('seq', updates.seq); }
  if (updates.metadata !== undefined) { setClauses.push('metadata = @metadata'); request.input('metadata', updates.metadata ? JSON.stringify(updates.metadata) : null); }
  if (setClauses.length === 0) return null;
  const result = await request.query(`UPDATE course_track SET ${setClauses.join(', ')} OUTPUT INSERTED.* WHERE track_id = @id`);
  if (!result.recordset[0]) return null;
  const r = result.recordset[0];
  return { track_id: r.track_id as number, title: r.title as string, description: (r.description as string) ?? null, seq: (r.seq as number) ?? 0, metadata: parseJson(r.metadata as string) as Record<string, unknown> | null, created_at: (r.created_at as string) ?? null };
}

export async function deleteTrack(id: number): Promise<boolean> {
  const pool = await getPool('qc_training');
  // Unlink series and courses from this track before deleting
  await pool.request().input('id', id).query('UPDATE course_series SET track_id = NULL, track_seq = NULL WHERE track_id = @id');
  await pool.request().input('id', id).query('UPDATE course SET track_id = NULL, track_seq = NULL WHERE track_id = @id');
  const result = await pool.request().input('id', id).query('DELETE FROM course_track WHERE track_id = @id');
  return (result.rowsAffected[0] ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// Series
// ---------------------------------------------------------------------------

export async function listSeries(): Promise<CourseSeries[]> {
  const pool = await getPool('qc_training');
  const result = await pool.request().query('SELECT * FROM course_series ORDER BY title');
  return result.recordset.map((r: Record<string, unknown>) => ({
    series_id: r.series_id as number,
    title: r.title as string,
    description: (r.description as string) ?? null,
    track_id: (r.track_id as number) ?? null,
    track_seq: (r.track_seq as number) ?? null,
    created_at: (r.created_at as string) ?? null,
  }));
}

export async function createSeries(input: { title: string; description?: string | null }): Promise<CourseSeries> {
  const pool = await getPool('qc_training');
  const result = await pool.request()
    .input('title', input.title)
    .input('description', input.description ?? null)
    .query('INSERT INTO course_series (title, description) OUTPUT INSERTED.* VALUES (@title, @description)');
  const r = result.recordset[0];
  return { series_id: r.series_id as number, title: r.title as string, description: (r.description as string) ?? null, track_id: null, track_seq: null, created_at: (r.created_at as string) ?? null };
}

// ---------------------------------------------------------------------------
// Course CRUD
// ---------------------------------------------------------------------------

export async function listCourses(): Promise<CourseListItem[]> {
  const pool = await getPool('qc_training');
  const result = await pool.request().query(`
    SELECT c.*,
      (SELECT COUNT(*) FROM course_lesson cl WHERE cl.course_id = c.course_id) AS lesson_count,
      (SELECT COUNT(*) FROM course_block sl
       JOIN course_lesson cl2 ON sl.lesson_id = cl2.lesson_id
       WHERE cl2.course_id = c.course_id) AS block_count
    FROM course c
    ORDER BY COALESCE(c.series_id, 2147483647), COALESCE(c.series_seq, 2147483647), c.title
  `);
  return result.recordset.map((r: Record<string, unknown>) => ({
    ...mapCourse(r),
    lesson_count: r.lesson_count as number,
    block_count: r.block_count as number,
  }));
}

export async function getCourse(id: number): Promise<CourseDetail | null> {
  const pool = await getPool('qc_training');

  const courseResult = await pool.request()
    .input('id', id)
    .query('SELECT * FROM course WHERE course_id = @id');
  const courseRow = courseResult.recordset[0];
  if (!courseRow) return null;

  const lessonsResult = await pool.request()
    .input('courseId', id)
    .query('SELECT * FROM course_lesson WHERE course_id = @courseId ORDER BY seq');

  const lessonIds = lessonsResult.recordset.map((r: Record<string, unknown>) => r.lesson_id as number);

  let allBlocks: CourseBlock[] = [];
  let allSlides: CourseSlide[] = [];

  if (lessonIds.length > 0) {
    const idList = lessonIds.join(',');

    // Fetch blocks
    const blocksResult = await pool.request()
      .query(`SELECT * FROM course_block WHERE lesson_id IN (${idList}) ORDER BY lesson_id, seq`);
    allBlocks = blocksResult.recordset.map(mapBlock);

    // Fetch slides + elements
    const slidesResult = await pool.request()
      .query(`SELECT * FROM course_slide WHERE lesson_id IN (${idList}) ORDER BY lesson_id, seq`);
    const slideRows = slidesResult.recordset as Record<string, unknown>[];

    if (slideRows.length > 0) {
      const slideIds = slideRows.map((r) => r.slide_id as number).join(',');
      const elementsResult = await pool.request()
        .query(`SELECT * FROM course_slide_element WHERE slide_id IN (${slideIds}) ORDER BY slide_id, seq`);
      const allElements = elementsResult.recordset as Record<string, unknown>[];

      allSlides = slideRows.map((r) => ({
        slide_id: r.slide_id as number,
        lesson_id: r.lesson_id as number,
        seq: r.seq as number,
        layout: (r.layout as CourseSlide['layout']) ?? 'full',
        title: (r.title as string) ?? null,
        notes: (r.notes as string) ?? null,
        created_at: (r.created_at as string) ?? null,
        elements: allElements
          .filter((e) => e.slide_id === r.slide_id)
          .map((e) => ({
            element_id: e.element_id as number,
            slide_id: e.slide_id as number,
            seq: e.seq as number,
            element_type: e.element_type as SlideElement['element_type'],
            block_id: (e.block_id as number) ?? null,
            image_url: (e.image_url as string) ?? null,
            image_alt: (e.image_alt as string) ?? null,
          })),
      }));
    }
  }

  const lessons: CourseLessonDetail[] = lessonsResult.recordset.map((r: Record<string, unknown>) => {
    const lessonId = r.lesson_id as number;
    const lesson: CourseLessonDetail = {
      ...mapLesson(r),
      blocks: allBlocks.filter((b) => b.lesson_id === lessonId),
    };
    const lessonSlides = allSlides.filter((s) => s.lesson_id === lessonId);
    if (lessonSlides.length > 0) {
      lesson.slides = lessonSlides;
    }
    return lesson;
  });

  return { ...mapCourse(courseRow), lessons };
}

export async function createCourse(input: CourseCreate): Promise<Course> {
  const pool = await getPool('qc_training');
  const result = await pool.request()
    .input('title', input.title)
    .input('description', input.description ?? null)
    .input('category', input.category ?? null)
    .input('actor', input.actor ?? null)
    .input('series_id', input.series_id ?? null)
    .input('series_seq', input.series_seq ?? null)
    .input('track_id', input.track_id ?? null)
    .query('INSERT INTO course (title, description, category, actor, series_id, series_seq, track_id) OUTPUT INSERTED.* VALUES (@title, @description, @category, @actor, @series_id, @series_seq, @track_id)');
  return mapCourse(result.recordset[0]);
}

export async function updateCourse(id: number, updates: CourseUpdate): Promise<Course | null> {
  const pool = await getPool('qc_training');
  const setClauses: string[] = [];
  const request = pool.request().input('id', id);

  if (updates.title !== undefined) { setClauses.push('title = @title'); request.input('title', updates.title); }
  if (updates.description !== undefined) { setClauses.push('description = @description'); request.input('description', updates.description ?? null); }
  if (updates.category !== undefined) { setClauses.push('category = @category'); request.input('category', updates.category ?? null); }
  if (updates.status !== undefined) { setClauses.push('status = @status'); request.input('status', updates.status); }
  if (updates.cover_image_url !== undefined) { setClauses.push('cover_image_url = @cover_image_url'); request.input('cover_image_url', updates.cover_image_url ?? null); }
  if (updates.track_id !== undefined) { setClauses.push('track_id = @track_id'); request.input('track_id', updates.track_id ?? null); }

  if (setClauses.length === 0) return getCourse(id) as Promise<Course | null>;
  setClauses.push('updated_at = SYSUTCDATETIME()');

  const result = await request.query(`UPDATE course SET ${setClauses.join(', ')} OUTPUT INSERTED.* WHERE course_id = @id`);
  return result.recordset[0] ? mapCourse(result.recordset[0]) : null;
}

export async function deleteCourse(id: number): Promise<boolean> {
  const pool = await getPool('qc_training');
  const result = await pool.request().input('id', id).query('DELETE FROM course WHERE course_id = @id');
  return (result.rowsAffected[0] ?? 0) > 0;
}

export async function clearCourse(id: number): Promise<boolean> {
  const pool = await getPool('qc_training');
  await pool.request().input('id', id)
    .query('DELETE FROM course_lesson WHERE course_id = @id');
  await pool.request().input('id', id)
    .query('UPDATE course SET updated_at = SYSUTCDATETIME() WHERE course_id = @id');
  return true;
}

// ---------------------------------------------------------------------------
// Lesson CRUD
// ---------------------------------------------------------------------------

export async function addLesson(courseId: number, input: LessonCreate): Promise<CourseLesson> {
  const pool = await getPool('qc_training');
  const result = await pool.request()
    .input('courseId', courseId)
    .input('seq', input.seq)
    .input('title', input.title)
    .input('description', input.description ?? null)
    .query('INSERT INTO course_lesson (course_id, seq, title, description) OUTPUT INSERTED.* VALUES (@courseId, @seq, @title, @description)');
  return mapLesson(result.recordset[0]);
}

export async function updateLesson(lessonId: number, updates: LessonUpdate): Promise<CourseLesson | null> {
  const pool = await getPool('qc_training');
  const setClauses: string[] = [];
  const request = pool.request().input('id', lessonId);

  if (updates.seq !== undefined) { setClauses.push('seq = @seq'); request.input('seq', updates.seq); }
  if (updates.title !== undefined) { setClauses.push('title = @title'); request.input('title', updates.title); }
  if (updates.description !== undefined) { setClauses.push('description = @description'); request.input('description', updates.description ?? null); }

  if (setClauses.length === 0) return null;
  const result = await request.query(`UPDATE course_lesson SET ${setClauses.join(', ')} OUTPUT INSERTED.* WHERE lesson_id = @id`);
  return result.recordset[0] ? mapLesson(result.recordset[0]) : null;
}

export async function deleteLesson(lessonId: number): Promise<boolean> {
  const pool = await getPool('qc_training');
  const result = await pool.request().input('id', lessonId).query('DELETE FROM course_lesson WHERE lesson_id = @id');
  return (result.rowsAffected[0] ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// Slide CRUD
// ---------------------------------------------------------------------------

export async function addBlock(lessonId: number, input: CourseBlockCreate): Promise<CourseBlock> {
  const pool = await getPool('qc_training');
  const result = await pool.request()
    .input('lessonId', lessonId)
    .input('seq', input.seq)
    .input('block_type', input.block_type)
    .input('title', input.title ?? null)
    .input('content', input.content ?? null)
    .input('image_url', input.image_url ?? null)
    .input('sql_text', input.sql_text ?? null)
    .input('sql_label', input.sql_label ?? null)
    .input('verify_mode', input.verify_mode ?? null)
    .input('expected_json', input.expected_json ? JSON.stringify(input.expected_json) : null)
    .input('quiz_question', input.quiz_question ?? null)
    .input('quiz_options', input.quiz_options ? JSON.stringify(input.quiz_options) : null)
    .input('quiz_answer', input.quiz_answer ?? null)
    .input('quiz_explanation', input.quiz_explanation ?? null)
    .input('hints', input.hints ? JSON.stringify(input.hints) : null)
    .input('presenter_notes', input.presenter_notes ?? null)
    .input('seed_sql', input.seed_sql ?? null)
    .input('seed_label', input.seed_label ?? null)
    .query(`INSERT INTO course_block (lesson_id, seq, block_type, title, content, image_url, sql_text, sql_label, verify_mode, expected_json, quiz_question, quiz_options, quiz_answer, quiz_explanation, hints, presenter_notes, seed_sql, seed_label)
            OUTPUT INSERTED.*
            VALUES (@lessonId, @seq, @block_type, @title, @content, @image_url, @sql_text, @sql_label, @verify_mode, @expected_json, @quiz_question, @quiz_options, @quiz_answer, @quiz_explanation, @hints, @presenter_notes, @seed_sql, @seed_label)`);
  return mapBlock(result.recordset[0]);
}

export async function updateBlock(slideId: number, updates: CourseBlockUpdate): Promise<CourseBlock | null> {
  const pool = await getPool('qc_training');
  const setClauses: string[] = [];
  const request = pool.request().input('id', slideId);

  const stringFields = ['block_type', 'title', 'content', 'image_url', 'sql_text', 'sql_label', 'verify_mode', 'quiz_question', 'quiz_explanation', 'presenter_notes', 'seed_sql', 'seed_label'] as const;
  for (const field of stringFields) {
    if ((updates as Record<string, unknown>)[field] !== undefined) {
      setClauses.push(`${field} = @${field}`);
      request.input(field, (updates as Record<string, unknown>)[field] ?? null);
    }
  }

  if (updates.seq !== undefined) { setClauses.push('seq = @seq'); request.input('seq', updates.seq); }
  if (updates.quiz_answer !== undefined) { setClauses.push('quiz_answer = @quiz_answer'); request.input('quiz_answer', updates.quiz_answer ?? null); }
  if (updates.expected_json !== undefined) { setClauses.push('expected_json = @expected_json'); request.input('expected_json', updates.expected_json ? JSON.stringify(updates.expected_json) : null); }
  if (updates.quiz_options !== undefined) { setClauses.push('quiz_options = @quiz_options'); request.input('quiz_options', updates.quiz_options ? JSON.stringify(updates.quiz_options) : null); }
  if (updates.hints !== undefined) { setClauses.push('hints = @hints'); request.input('hints', updates.hints ? JSON.stringify(updates.hints) : null); }

  if (setClauses.length === 0) return null;
  const result = await request.query(`UPDATE course_block SET ${setClauses.join(', ')} OUTPUT INSERTED.* WHERE block_id = @id`);
  return result.recordset[0] ? mapBlock(result.recordset[0]) : null;
}

export async function deleteBlock(slideId: number): Promise<boolean> {
  const pool = await getPool('qc_training');
  const result = await pool.request().input('id', slideId).query('DELETE FROM course_block WHERE block_id = @id');
  return (result.rowsAffected[0] ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// Bulk Build — create all lessons + slides in one call
// ---------------------------------------------------------------------------

export interface BulkSlideInput {
  block_type: string;
  title?: string | null;
  content?: string | null;
  image_url?: string | null;
  sql_text?: string | null;
  sql_label?: string | null;
  verify_mode?: string | null;
  expected_json?: unknown;
  quiz_question?: string | null;
  quiz_options?: string[] | null;
  quiz_answer?: number | null;
  quiz_explanation?: string | null;
  hints?: string[] | null;
  presenter_notes?: string | null;
  seed_sql?: string | null;
  seed_label?: string | null;
}

export interface BulkLessonInput {
  title: string;
  description?: string | null;
  slides?: BulkSlideInput[];
  blocks?: BulkSlideInput[];
}

export async function buildCourseContent(
  courseId: number,
  lessons: BulkLessonInput[],
): Promise<{ lessons: number; blocks: number }> {
  const pool = await getPool('qc_training');

  // Clear existing content first
  await pool.request().input('id', courseId)
    .query('DELETE FROM course_lesson WHERE course_id = @id');

  let lessonCount = 0;
  let blockCount = 0;

  for (let lessonIdx = 0; lessonIdx < lessons.length; lessonIdx++) {
    const lesson = lessons[lessonIdx]!;
    const lessonResult = await pool.request()
      .input('courseId', courseId)
      .input('seq', lessonIdx)
      .input('title', lesson.title)
      .input('description', lesson.description ?? null)
      .query('INSERT INTO course_lesson (course_id, seq, title, description) OUTPUT INSERTED.lesson_id VALUES (@courseId, @seq, @title, @description)');
    const lessonId = lessonResult.recordset[0].lesson_id as number;
    lessonCount++;

    const blockList = lesson.blocks ?? lesson.slides ?? [];
    for (let slideIdx = 0; slideIdx < blockList.length; slideIdx++) {
      const sl = blockList[slideIdx]!;
      await pool.request()
        .input('lessonId', lessonId)
        .input('seq', slideIdx)
        .input('block_type', sl.block_type)
        .input('title', sl.title ?? null)
        .input('content', sl.content ?? null)
        .input('image_url', sl.image_url ?? null)
        .input('sql_text', sl.sql_text ?? null)
        .input('sql_label', sl.sql_label ?? null)
        .input('verify_mode', sl.verify_mode ?? null)
        .input('expected_json', sl.expected_json != null ? JSON.stringify(sl.expected_json) : null)
        .input('quiz_question', sl.quiz_question ?? null)
        .input('quiz_options', sl.quiz_options ? JSON.stringify(sl.quiz_options) : null)
        .input('quiz_answer', sl.quiz_answer ?? null)
        .input('quiz_explanation', sl.quiz_explanation ?? null)
        .input('hints', sl.hints ? JSON.stringify(sl.hints) : null)
        .input('presenter_notes', sl.presenter_notes ?? null)
        .input('seed_sql', sl.seed_sql ?? null)
        .input('seed_label', sl.seed_label ?? null)
        .query(`INSERT INTO course_block (lesson_id, seq, block_type, title, content, image_url, sql_text, sql_label, verify_mode, expected_json, quiz_question, quiz_options, quiz_answer, quiz_explanation, hints, presenter_notes, seed_sql, seed_label)
                VALUES (@lessonId, @seq, @block_type, @title, @content, @image_url, @sql_text, @sql_label, @verify_mode, @expected_json, @quiz_question, @quiz_options, @quiz_answer, @quiz_explanation, @hints, @presenter_notes, @seed_sql, @seed_label)`);
      blockCount++;
    }
  }

  await pool.request().input('id', courseId)
    .query('UPDATE course SET updated_at = SYSUTCDATETIME() WHERE course_id = @id');

  return { lessons: lessonCount, blocks: blockCount };
}

// ---------------------------------------------------------------------------
// Export — return full course as portable JSON (no IDs, same as fixture format)
// ---------------------------------------------------------------------------

export async function exportCourse(id: number): Promise<unknown> {
  const course = await getCourse(id);
  if (!course) return null;

  return {
    title: course.title,
    description: course.description,
    category: course.category,
    status: course.status,
    actor: course.actor,
    lessons: course.lessons.map((l) => ({
      title: l.title,
      description: l.description,
      blocks: l.blocks.map((sl) => {
        const out: Record<string, unknown> = { block_type: sl.block_type };
        for (const key of ['title', 'content', 'image_url', 'sql_text', 'sql_label', 'verify_mode', 'expected_json', 'quiz_question', 'quiz_options', 'quiz_answer', 'quiz_explanation', 'hints', 'presenter_notes', 'seed_sql', 'seed_label'] as const) {
          if (sl[key] !== null && sl[key] !== undefined) out[key] = sl[key];
        }
        return out;
      }),
    })),
  };
}

// ---------------------------------------------------------------------------
// Draft CRUD
// ---------------------------------------------------------------------------

function mapDraft(row: Record<string, unknown>): CourseDraft {
  return {
    draft_id: row.draft_id as number,
    course_id: row.course_id as number,
    title: row.title as string,
    content: row.content as string,
    source: (row.source as string) ?? null,
    status: (row.status as string) ?? 'draft',
    created_at: (row.created_at as string) ?? null,
    updated_at: (row.updated_at as string) ?? null,
  };
}

export async function listDrafts(courseId: number): Promise<CourseDraft[]> {
  const pool = await getPool('qc_training');
  const result = await pool.request()
    .input('courseId', courseId)
    .query('SELECT * FROM course_draft WHERE course_id = @courseId ORDER BY created_at DESC');
  return result.recordset.map(mapDraft);
}

export async function getDraft(draftId: number): Promise<CourseDraft | null> {
  const pool = await getPool('qc_training');
  const result = await pool.request()
    .input('id', draftId)
    .query('SELECT * FROM course_draft WHERE draft_id = @id');
  return result.recordset[0] ? mapDraft(result.recordset[0]) : null;
}

export async function createDraft(courseId: number, input: CourseDraftCreate): Promise<CourseDraft> {
  const pool = await getPool('qc_training');
  const result = await pool.request()
    .input('courseId', courseId)
    .input('title', input.title)
    .input('content', input.content)
    .input('source', input.source ?? null)
    .query('INSERT INTO course_draft (course_id, title, content, source) OUTPUT INSERTED.* VALUES (@courseId, @title, @content, @source)');
  return mapDraft(result.recordset[0]);
}

export async function updateDraft(draftId: number, updates: CourseDraftUpdate): Promise<CourseDraft | null> {
  const pool = await getPool('qc_training');
  const setClauses: string[] = [];
  const request = pool.request().input('id', draftId);
  if (updates.title !== undefined) { setClauses.push('title = @title'); request.input('title', updates.title); }
  if (updates.content !== undefined) { setClauses.push('content = @content'); request.input('content', updates.content); }
  if (updates.status !== undefined) { setClauses.push('status = @status'); request.input('status', updates.status); }
  if (setClauses.length === 0) return getDraft(draftId);
  setClauses.push('updated_at = SYSUTCDATETIME()');
  const result = await request.query(`UPDATE course_draft SET ${setClauses.join(', ')} OUTPUT INSERTED.* WHERE draft_id = @id`);
  return result.recordset[0] ? mapDraft(result.recordset[0]) : null;
}

export async function deleteDraft(draftId: number): Promise<boolean> {
  const pool = await getPool('qc_training');
  const result = await pool.request().input('id', draftId).query('DELETE FROM course_draft WHERE draft_id = @id');
  return (result.rowsAffected[0] ?? 0) > 0;
}
