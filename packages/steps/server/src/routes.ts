import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { StepCreateSchema, StepUpdateSchema } from '@trn-platform/shared';
import { listSteps, getStep, createStep, updateStep, deleteStep } from './queries';

export const stepsRouter = Router();

// ---------------------------------------------------------------------------
// GET / — list steps, optional ?category= filter
// ---------------------------------------------------------------------------
stepsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string | undefined;
    const steps = await listSteps(category);
    res.json(steps);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /:id — get step by step_id
// ---------------------------------------------------------------------------
stepsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid step ID' });
      return;
    }

    const step = await getStep(id);
    if (!step) {
      res.status(404).json({ message: 'Step not found' });
      return;
    }

    res.json(step);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST / — create step
// ---------------------------------------------------------------------------
stepsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = StepCreateSchema.parse(req.body);
    const step = await createStep(input);
    res.status(201).json(step);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — update step
// ---------------------------------------------------------------------------
stepsRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid step ID' });
      return;
    }

    const updates = StepUpdateSchema.parse(req.body);
    const step = await updateStep(id, updates);
    if (!step) {
      res.status(404).json({ message: 'Step not found' });
      return;
    }

    res.json(step);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — delete step (check flow_step references first)
// ---------------------------------------------------------------------------
stepsRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid step ID' });
      return;
    }

    const result = await deleteStep(id);
    if (!result.deleted) {
      const status = result.error ? 409 : 404;
      res.status(status).json({ message: result.error ?? 'Step not found' });
      return;
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
