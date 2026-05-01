import type {
  Course, CourseCreate, CourseUpdate, CourseDetail,
  CourseSection, SectionCreate, SectionUpdate,
  CourseSlide, SlideCreate, SlideUpdate,
  CourseListItem, CourseSectionDetail,
} from '@trn-platform/shared';
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
    created_at: (row.created_at as string) ?? null,
    updated_at: (row.updated_at as string) ?? null,
  };
}

function mapSection(row: Record<string, unknown>): CourseSection {
  return {
    section_id: row.section_id as number,
    course_id: row.course_id as number,
    seq: row.seq as number,
    title: row.title as string,
    description: (row.description as string) ?? null,
  };
}

function mapSlide(row: Record<string, unknown>): CourseSlide {
  return {
    slide_id: row.slide_id as number,
    section_id: row.section_id as number,
    seq: row.seq as number,
    slide_type: row.slide_type as CourseSlide['slide_type'],
    title: (row.title as string) ?? null,
    content: (row.content as string) ?? null,
    image_url: (row.image_url as string) ?? null,
    sql_text: (row.sql_text as string) ?? null,
    sql_label: (row.sql_label as string) ?? null,
    verify_mode: (row.verify_mode as CourseSlide['verify_mode']) ?? null,
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
// Course CRUD
// ---------------------------------------------------------------------------

export async function listCourses(): Promise<CourseListItem[]> {
  const pool = await getPool('qc_training');
  const result = await pool.request().query(`
    SELECT c.*,
      (SELECT COUNT(*) FROM course_section cs WHERE cs.course_id = c.course_id) AS section_count,
      (SELECT COUNT(*) FROM course_slide sl
       JOIN course_section cs2 ON sl.section_id = cs2.section_id
       WHERE cs2.course_id = c.course_id) AS slide_count
    FROM course c
    ORDER BY c.title
  `);
  return result.recordset.map((r: Record<string, unknown>) => ({
    ...mapCourse(r),
    section_count: r.section_count as number,
    slide_count: r.slide_count as number,
  }));
}

export async function getCourse(id: number): Promise<CourseDetail | null> {
  const pool = await getPool('qc_training');

  const courseResult = await pool.request()
    .input('id', id)
    .query('SELECT * FROM course WHERE course_id = @id');
  const courseRow = courseResult.recordset[0];
  if (!courseRow) return null;

  const sectionsResult = await pool.request()
    .input('courseId', id)
    .query('SELECT * FROM course_section WHERE course_id = @courseId ORDER BY seq');

  const sectionIds = sectionsResult.recordset.map((r: Record<string, unknown>) => r.section_id as number);

  let slides: CourseSlide[] = [];
  if (sectionIds.length > 0) {
    const idList = sectionIds.join(',');
    const slidesResult = await pool.request()
      .query(`SELECT * FROM course_slide WHERE section_id IN (${idList}) ORDER BY section_id, seq`);
    slides = slidesResult.recordset.map(mapSlide);
  }

  const sections: CourseSectionDetail[] = sectionsResult.recordset.map((r: Record<string, unknown>) => ({
    ...mapSection(r),
    slides: slides.filter(s => s.section_id === (r.section_id as number)),
  }));

  return { ...mapCourse(courseRow), sections };
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
    .query('INSERT INTO course (title, description, category, actor, series_id, series_seq) OUTPUT INSERTED.* VALUES (@title, @description, @category, @actor, @series_id, @series_seq)');
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

// ---------------------------------------------------------------------------
// Section CRUD
// ---------------------------------------------------------------------------

export async function addSection(courseId: number, input: SectionCreate): Promise<CourseSection> {
  const pool = await getPool('qc_training');
  const result = await pool.request()
    .input('courseId', courseId)
    .input('seq', input.seq)
    .input('title', input.title)
    .input('description', input.description ?? null)
    .query('INSERT INTO course_section (course_id, seq, title, description) OUTPUT INSERTED.* VALUES (@courseId, @seq, @title, @description)');
  return mapSection(result.recordset[0]);
}

export async function updateSection(sectionId: number, updates: SectionUpdate): Promise<CourseSection | null> {
  const pool = await getPool('qc_training');
  const setClauses: string[] = [];
  const request = pool.request().input('id', sectionId);

  if (updates.seq !== undefined) { setClauses.push('seq = @seq'); request.input('seq', updates.seq); }
  if (updates.title !== undefined) { setClauses.push('title = @title'); request.input('title', updates.title); }
  if (updates.description !== undefined) { setClauses.push('description = @description'); request.input('description', updates.description ?? null); }

  if (setClauses.length === 0) return null;
  const result = await request.query(`UPDATE course_section SET ${setClauses.join(', ')} OUTPUT INSERTED.* WHERE section_id = @id`);
  return result.recordset[0] ? mapSection(result.recordset[0]) : null;
}

export async function deleteSection(sectionId: number): Promise<boolean> {
  const pool = await getPool('qc_training');
  const result = await pool.request().input('id', sectionId).query('DELETE FROM course_section WHERE section_id = @id');
  return (result.rowsAffected[0] ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// Slide CRUD
// ---------------------------------------------------------------------------

export async function addSlide(sectionId: number, input: SlideCreate): Promise<CourseSlide> {
  const pool = await getPool('qc_training');
  const result = await pool.request()
    .input('sectionId', sectionId)
    .input('seq', input.seq)
    .input('slide_type', input.slide_type)
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
    .query(`INSERT INTO course_slide (section_id, seq, slide_type, title, content, image_url, sql_text, sql_label, verify_mode, expected_json, quiz_question, quiz_options, quiz_answer, quiz_explanation, hints, presenter_notes, seed_sql, seed_label)
            OUTPUT INSERTED.*
            VALUES (@sectionId, @seq, @slide_type, @title, @content, @image_url, @sql_text, @sql_label, @verify_mode, @expected_json, @quiz_question, @quiz_options, @quiz_answer, @quiz_explanation, @hints, @presenter_notes, @seed_sql, @seed_label)`);
  return mapSlide(result.recordset[0]);
}

export async function updateSlide(slideId: number, updates: SlideUpdate): Promise<CourseSlide | null> {
  const pool = await getPool('qc_training');
  const setClauses: string[] = [];
  const request = pool.request().input('id', slideId);

  const stringFields = ['slide_type', 'title', 'content', 'image_url', 'sql_text', 'sql_label', 'verify_mode', 'quiz_question', 'quiz_explanation', 'presenter_notes', 'seed_sql', 'seed_label'] as const;
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
  const result = await request.query(`UPDATE course_slide SET ${setClauses.join(', ')} OUTPUT INSERTED.* WHERE slide_id = @id`);
  return result.recordset[0] ? mapSlide(result.recordset[0]) : null;
}

export async function deleteSlide(slideId: number): Promise<boolean> {
  const pool = await getPool('qc_training');
  const result = await pool.request().input('id', slideId).query('DELETE FROM course_slide WHERE slide_id = @id');
  return (result.rowsAffected[0] ?? 0) > 0;
}
