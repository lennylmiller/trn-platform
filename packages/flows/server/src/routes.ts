import { type Router as RouterType, Router } from 'express';
import {
  FlowCreateSchema,
  FlowUpdateSchema,
  FlowStepCreateSchema,
  FlowStepUpdateSchema,
} from '@trn-platform/shared';
import {
  listFlows,
  getFlow,
  createFlow,
  updateFlow,
  deleteFlow,
  replaceFlowSteps,
  addFlowStep,
  updateFlowStep,
  deleteFlowStep,
} from './queries';

export const flowsRouter: RouterType = Router();

// ============================================================================
// FLOW ROUTES
// ============================================================================

/** GET / — list flows with step_count */
flowsRouter.get('/', async (_req, res, next) => {
  try {
    const flows = await listFlows();
    res.json(flows);
  } catch (err) {
    next(err);
  }
});

/** GET /:id — get flow detail (flow + joined steps) */
flowsRouter.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid flow id' });
      return;
    }

    const flow = await getFlow(id);
    if (!flow) {
      res.status(404).json({ message: 'Flow not found' });
      return;
    }

    res.json(flow);
  } catch (err) {
    next(err);
  }
});

/** POST / — create flow */
flowsRouter.post('/', async (req, res, next) => {
  try {
    const input = FlowCreateSchema.parse(req.body);
    const flow = await createFlow(input);
    res.status(201).json(flow);
  } catch (err) {
    next(err);
  }
});

/** PUT /:id — update flow metadata */
flowsRouter.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid flow id' });
      return;
    }

    const updates = FlowUpdateSchema.parse(req.body);
    const flow = await updateFlow(id, updates);
    if (!flow) {
      res.status(404).json({ message: 'Flow not found or no changes' });
      return;
    }

    res.json(flow);
  } catch (err) {
    next(err);
  }
});

/** DELETE /:id — delete flow (rejects if referenced by composition_block) */
flowsRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid flow id' });
      return;
    }

    const deleted = await deleteFlow(id);
    if (!deleted) {
      res.status(404).json({ message: 'Flow not found' });
      return;
    }

    res.status(204).end();
  } catch (err) {
    if (err instanceof Error && err.message.includes('composition block')) {
      res.status(409).json({ message: err.message });
      return;
    }
    next(err);
  }
});

// ============================================================================
// FLOW STEP ROUTES
// ============================================================================

/** PUT /:id/steps — replace all flow steps (batch) */
flowsRouter.put('/:id/steps', async (req, res, next) => {
  try {
    const flowId = Number(req.params.id);
    if (Number.isNaN(flowId)) {
      res.status(400).json({ message: 'Invalid flow id' });
      return;
    }

    const steps = FlowStepCreateSchema.array().parse(req.body);
    const result = await replaceFlowSteps(flowId, steps);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/** POST /:id/steps — add single step to flow */
flowsRouter.post('/:id/steps', async (req, res, next) => {
  try {
    const flowId = Number(req.params.id);
    if (Number.isNaN(flowId)) {
      res.status(400).json({ message: 'Invalid flow id' });
      return;
    }

    const data = FlowStepCreateSchema.parse(req.body);
    const step = await addFlowStep(flowId, data);
    res.status(201).json(step);
  } catch (err) {
    next(err);
  }
});

/** PUT /:id/steps/:flowStepId — update flow step properties */
flowsRouter.put('/:id/steps/:flowStepId', async (req, res, next) => {
  try {
    const flowStepId = Number(req.params.flowStepId);
    if (Number.isNaN(flowStepId)) {
      res.status(400).json({ message: 'Invalid flow step id' });
      return;
    }

    const updates = FlowStepUpdateSchema.parse(req.body);
    const step = await updateFlowStep(flowStepId, updates);
    if (!step) {
      res.status(404).json({ message: 'Flow step not found or no changes' });
      return;
    }

    res.json(step);
  } catch (err) {
    next(err);
  }
});

/** DELETE /:id/steps/:flowStepId — remove step from flow */
flowsRouter.delete('/:id/steps/:flowStepId', async (req, res, next) => {
  try {
    const flowStepId = Number(req.params.flowStepId);
    if (Number.isNaN(flowStepId)) {
      res.status(400).json({ message: 'Invalid flow step id' });
      return;
    }

    const deleted = await deleteFlowStep(flowStepId);
    if (!deleted) {
      res.status(404).json({ message: 'Flow step not found' });
      return;
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
