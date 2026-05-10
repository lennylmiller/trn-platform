/**
 * Template system for course creation.
 * Templates are YAML files with {{parameters}} and <Placeholder/> tags.
 */
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { getPool } from '@trn-platform/shared/db';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TemplateParameter {
  name: string;
  description: string;
  default?: string;
}

export interface TemplateSlide {
  title: string;
  content: string;
}

export interface TemplateLesson {
  title: string;
  slides: TemplateSlide[];
}

export interface CourseTemplate {
  name: string;
  description: string;
  category: string;
  parameters: TemplateParameter[];
  lessons: TemplateLesson[];
}

export interface TemplateListItem {
  name: string;
  filename: string;
  description: string;
  category: string;
  parameters: TemplateParameter[];
  lessonCount: number;
}

// ---------------------------------------------------------------------------
// Template directory
// ---------------------------------------------------------------------------

function getTemplateDir(): string {
  return path.resolve(process.cwd(), 'packages/courses/templates');
}

// ---------------------------------------------------------------------------
// Load templates
// ---------------------------------------------------------------------------

export function listTemplates(): TemplateListItem[] {
  const dir = getTemplateDir();
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .sort();

  return files.map((filename) => {
    const raw = fs.readFileSync(path.join(dir, filename), 'utf-8');
    const parsed = yaml.load(raw) as CourseTemplate;
    return {
      name: parsed.name,
      filename: filename.replace(/\.ya?ml$/, ''),
      description: parsed.description,
      category: parsed.category,
      parameters: parsed.parameters ?? [],
      lessonCount: parsed.lessons?.length ?? 0,
    };
  });
}

export function getTemplate(templateName: string): CourseTemplate | null {
  const dir = getTemplateDir();
  const filePath = path.join(dir, `${templateName}.yaml`);

  if (!fs.existsSync(filePath)) {
    // Try .yml
    const ymlPath = path.join(dir, `${templateName}.yml`);
    if (!fs.existsSync(ymlPath)) return null;
    const raw = fs.readFileSync(ymlPath, 'utf-8');
    return yaml.load(raw) as CourseTemplate;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  return yaml.load(raw) as CourseTemplate;
}

// ---------------------------------------------------------------------------
// Parameter substitution
// ---------------------------------------------------------------------------

function substituteParams(text: string, params: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_match, paramName: string) => {
    return params[paramName] ?? `{{${paramName}}}`;
  });
}

function substituteInTemplate(template: CourseTemplate, params: Record<string, string>): CourseTemplate {
  // Apply defaults for missing params
  const fullParams = { ...params };
  for (const p of template.parameters) {
    if (!(p.name in fullParams) && p.default) {
      fullParams[p.name] = p.default;
    }
  }

  return {
    ...template,
    lessons: template.lessons.map((lesson) => ({
      title: substituteParams(lesson.title, fullParams),
      slides: lesson.slides.map((slide) => ({
        title: substituteParams(slide.title, fullParams),
        content: substituteParams(slide.content, fullParams),
      })),
    })),
  };
}

// ---------------------------------------------------------------------------
// Apply template to a course (document-first: creates slides with content)
// ---------------------------------------------------------------------------

export async function applyTemplate(
  courseId: number,
  templateName: string,
  params: Record<string, string>,
): Promise<{ lessons: number; slides: number }> {
  const template = getTemplate(templateName);
  if (!template) throw new Error(`Template "${templateName}" not found`);

  const substituted = substituteInTemplate(template, params);
  const pool = await getPool('qc_training');

  // Clear existing lessons (cascades slides, blocks, elements)
  await pool.request().input('id', courseId)
    .query('DELETE FROM course_lesson WHERE course_id = @id');

  let lessonCount = 0;
  let slideCount = 0;

  for (let lessonIdx = 0; lessonIdx < substituted.lessons.length; lessonIdx++) {
    const lesson = substituted.lessons[lessonIdx]!;

    const lessonResult = await pool.request()
      .input('courseId', courseId)
      .input('seq', lessonIdx)
      .input('title', lesson.title)
      .query('INSERT INTO course_lesson (course_id, seq, title) OUTPUT INSERTED.lesson_id VALUES (@courseId, @seq, @title)');
    const lessonId = lessonResult.recordset[0].lesson_id as number;
    lessonCount++;

    for (let slideIdx = 0; slideIdx < lesson.slides.length; slideIdx++) {
      const slide = lesson.slides[slideIdx]!;

      await pool.request()
        .input('lessonId', lessonId)
        .input('seq', slideIdx)
        .input('layout', 'full')
        .input('title', slide.title)
        .input('content', slide.content)
        .query('INSERT INTO course_slide (lesson_id, seq, layout, title, content) VALUES (@lessonId, @seq, @layout, @title, @content)');
      slideCount++;
    }
  }

  await pool.request().input('id', courseId)
    .query('UPDATE course SET updated_at = SYSUTCDATETIME() WHERE course_id = @id');

  return { lessons: lessonCount, slides: slideCount };
}
