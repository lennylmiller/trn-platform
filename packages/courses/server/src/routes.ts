import { type Router as RouterType, Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import {
  CourseCreateSchema, CourseUpdateSchema,
  LessonCreateSchema, LessonUpdateSchema,
  SlideCreateSchema, SlideUpdateSchema,
} from '@trn-platform/shared/schemas';
import {
  listTracks,
  listSeries,
  listCourses, getCourse, createCourse, updateCourse, deleteCourse, clearCourse,
  buildCourseContent, exportCourse,
  addLesson, updateLesson, deleteLesson,
  addSlide, updateSlide, deleteSlide,
} from './queries';
import type { BulkLessonInput } from './queries';

export const coursesRouter: RouterType = Router();

// ---------------------------------------------------------------------------
// Tracks
// ---------------------------------------------------------------------------

coursesRouter.get('/tracks', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json(await listTracks()); } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// Series
// ---------------------------------------------------------------------------

coursesRouter.get('/series', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json(await listSeries()); } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// Course CRUD
// ---------------------------------------------------------------------------

coursesRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json(await listCourses()); } catch (err) { next(err); }
});

coursesRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'Invalid course ID' }); return; }
    const course = await getCourse(id);
    if (!course) { res.status(404).json({ message: 'Course not found' }); return; }
    res.json(course);
  } catch (err) { next(err); }
});

coursesRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = CourseCreateSchema.parse(req.body);
    res.status(201).json(await createCourse(input));
  } catch (err) { next(err); }
});

coursesRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'Invalid course ID' }); return; }
    const updates = CourseUpdateSchema.parse(req.body);
    const course = await updateCourse(id, updates);
    if (!course) { res.status(404).json({ message: 'Course not found' }); return; }
    res.json(course);
  } catch (err) { next(err); }
});

coursesRouter.post('/:id/clear', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'Invalid course ID' }); return; }
    await clearCourse(id);
    res.json({ message: 'Course cleared', course_id: id });
  } catch (err) { next(err); }
});

coursesRouter.post('/:id/build', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'Invalid course ID' }); return; }
    const lessons = req.body.lessons as BulkLessonInput[];
    if (!Array.isArray(lessons)) { res.status(400).json({ message: 'lessons array required' }); return; }
    const result = await buildCourseContent(id, lessons);
    res.json({ message: 'Course content built', course_id: id, ...result });
  } catch (err) { next(err); }
});

coursesRouter.get('/:id/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'Invalid course ID' }); return; }
    const data = await exportCourse(id);
    if (!data) { res.status(404).json({ message: 'Course not found' }); return; }
    res.json(data);
  } catch (err) { next(err); }
});

coursesRouter.post('/import', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, category, actor, lessons } = req.body;
    if (!title) { res.status(400).json({ message: 'title required' }); return; }
    const course = await createCourse({ title, description, category, actor });
    if (Array.isArray(lessons) && lessons.length > 0) {
      await buildCourseContent(course.course_id, lessons);
    }
    const full = await getCourse(course.course_id);
    res.status(201).json(full);
  } catch (err) { next(err); }
});

coursesRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'Invalid course ID' }); return; }
    if (!(await deleteCourse(id))) { res.status(404).json({ message: 'Course not found' }); return; }
    res.status(204).end();
  } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// Lesson CRUD
// ---------------------------------------------------------------------------

coursesRouter.post('/:id/lessons', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = Number(req.params.id);
    if (Number.isNaN(courseId)) { res.status(400).json({ message: 'Invalid course ID' }); return; }
    const input = LessonCreateSchema.parse(req.body);
    res.status(201).json(await addLesson(courseId, input));
  } catch (err) { next(err); }
});

coursesRouter.put('/:id/lessons/:lessonId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lessonId = Number(req.params.lessonId);
    if (Number.isNaN(lessonId)) { res.status(400).json({ message: 'Invalid lesson ID' }); return; }
    const updates = LessonUpdateSchema.parse(req.body);
    const lesson = await updateLesson(lessonId, updates);
    if (!lesson) { res.status(404).json({ message: 'Lesson not found' }); return; }
    res.json(lesson);
  } catch (err) { next(err); }
});

coursesRouter.delete('/:id/lessons/:lessonId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lessonId = Number(req.params.lessonId);
    if (Number.isNaN(lessonId)) { res.status(400).json({ message: 'Invalid lesson ID' }); return; }
    if (!(await deleteLesson(lessonId))) { res.status(404).json({ message: 'Lesson not found' }); return; }
    res.status(204).end();
  } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// Slide CRUD
// ---------------------------------------------------------------------------

coursesRouter.post('/:id/lessons/:lessonId/slides', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lessonId = Number(req.params.lessonId);
    if (Number.isNaN(lessonId)) { res.status(400).json({ message: 'Invalid lesson ID' }); return; }
    const input = SlideCreateSchema.parse(req.body);
    res.status(201).json(await addSlide(lessonId, input));
  } catch (err) { next(err); }
});

coursesRouter.put('/:id/lessons/:lessonId/slides/:slId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slId = Number(req.params.slId);
    if (Number.isNaN(slId)) { res.status(400).json({ message: 'Invalid slide ID' }); return; }
    const updates = SlideUpdateSchema.parse(req.body);
    const slide = await updateSlide(slId, updates);
    if (!slide) { res.status(404).json({ message: 'Slide not found' }); return; }
    res.json(slide);
  } catch (err) { next(err); }
});

coursesRouter.delete('/:id/lessons/:lessonId/slides/:slId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slId = Number(req.params.slId);
    if (Number.isNaN(slId)) { res.status(400).json({ message: 'Invalid slide ID' }); return; }
    if (!(await deleteSlide(slId))) { res.status(404).json({ message: 'Slide not found' }); return; }
    res.status(204).end();
  } catch (err) { next(err); }
});
