import { type Router as RouterType, Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import {
  CourseCreateSchema, CourseUpdateSchema,
  SectionCreateSchema, SectionUpdateSchema,
  SlideCreateSchema, SlideUpdateSchema,
} from '@trn-platform/shared';
import {
  listCourses, getCourse, createCourse, updateCourse, deleteCourse,
  addSection, updateSection, deleteSection,
  addSlide, updateSlide, deleteSlide,
} from './queries';

export const coursesRouter: RouterType = Router();

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

coursesRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'Invalid course ID' }); return; }
    if (!(await deleteCourse(id))) { res.status(404).json({ message: 'Course not found' }); return; }
    res.status(204).end();
  } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// Section CRUD
// ---------------------------------------------------------------------------

coursesRouter.post('/:id/sections', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = Number(req.params.id);
    if (Number.isNaN(courseId)) { res.status(400).json({ message: 'Invalid course ID' }); return; }
    const input = SectionCreateSchema.parse(req.body);
    res.status(201).json(await addSection(courseId, input));
  } catch (err) { next(err); }
});

coursesRouter.put('/:id/sections/:secId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const secId = Number(req.params.secId);
    if (Number.isNaN(secId)) { res.status(400).json({ message: 'Invalid section ID' }); return; }
    const updates = SectionUpdateSchema.parse(req.body);
    const section = await updateSection(secId, updates);
    if (!section) { res.status(404).json({ message: 'Section not found' }); return; }
    res.json(section);
  } catch (err) { next(err); }
});

coursesRouter.delete('/:id/sections/:secId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const secId = Number(req.params.secId);
    if (Number.isNaN(secId)) { res.status(400).json({ message: 'Invalid section ID' }); return; }
    if (!(await deleteSection(secId))) { res.status(404).json({ message: 'Section not found' }); return; }
    res.status(204).end();
  } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// Slide CRUD
// ---------------------------------------------------------------------------

coursesRouter.post('/:id/sections/:secId/slides', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const secId = Number(req.params.secId);
    if (Number.isNaN(secId)) { res.status(400).json({ message: 'Invalid section ID' }); return; }
    const input = SlideCreateSchema.parse(req.body);
    res.status(201).json(await addSlide(secId, input));
  } catch (err) { next(err); }
});

coursesRouter.put('/:id/sections/:secId/slides/:slId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slId = Number(req.params.slId);
    if (Number.isNaN(slId)) { res.status(400).json({ message: 'Invalid slide ID' }); return; }
    const updates = SlideUpdateSchema.parse(req.body);
    const slide = await updateSlide(slId, updates);
    if (!slide) { res.status(404).json({ message: 'Slide not found' }); return; }
    res.json(slide);
  } catch (err) { next(err); }
});

coursesRouter.delete('/:id/sections/:secId/slides/:slId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slId = Number(req.params.slId);
    if (Number.isNaN(slId)) { res.status(400).json({ message: 'Invalid slide ID' }); return; }
    if (!(await deleteSlide(slId))) { res.status(404).json({ message: 'Slide not found' }); return; }
    res.status(204).end();
  } catch (err) { next(err); }
});
