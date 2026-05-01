import { type Router as RouterType, Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { StoryCreateSchema, StoryUpdateSchema, PlanItemCreateSchema, PlanItemUpdateSchema } from '@trn-platform/shared';
import {
  listStories, getStory, createStory, updateStory, deleteStory,
  addPlanItems, updatePlanItem, deletePlanItem,
} from './queries';

export const storiesRouter: RouterType = Router();

// ---------------------------------------------------------------------------
// GET / — list all stories
// ---------------------------------------------------------------------------
storiesRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stories = await listStories();
    res.json(stories);
  } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// GET /:id — get story with plan items
// ---------------------------------------------------------------------------
storiesRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'Invalid story ID' }); return; }
    const story = await getStory(id);
    if (!story) { res.status(404).json({ message: 'Story not found' }); return; }
    res.json(story);
  } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// POST / — create story
// ---------------------------------------------------------------------------
storiesRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = StoryCreateSchema.parse(req.body);
    const story = await createStory(input);
    res.status(201).json(story);
  } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// PUT /:id — update story
// ---------------------------------------------------------------------------
storiesRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'Invalid story ID' }); return; }
    const updates = StoryUpdateSchema.parse(req.body);
    const story = await updateStory(id, updates);
    if (!story) { res.status(404).json({ message: 'Story not found' }); return; }
    res.json(story);
  } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// DELETE /:id — delete story (cascades plan items)
// ---------------------------------------------------------------------------
storiesRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'Invalid story ID' }); return; }
    const deleted = await deleteStory(id);
    if (!deleted) { res.status(404).json({ message: 'Story not found' }); return; }
    res.status(204).end();
  } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// POST /:id/plan — add plan items
// ---------------------------------------------------------------------------
storiesRouter.post('/:id/plan', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storyId = Number(req.params.id);
    if (Number.isNaN(storyId)) { res.status(400).json({ message: 'Invalid story ID' }); return; }

    const items = Array.isArray(req.body)
      ? req.body.map((b: unknown) => PlanItemCreateSchema.parse(b))
      : [PlanItemCreateSchema.parse(req.body)];

    const created = await addPlanItems(storyId, items);
    res.status(201).json(created);
  } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// PUT /:id/plan/:itemId — update plan item
// ---------------------------------------------------------------------------
storiesRouter.put('/:id/plan/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemId = Number(req.params.itemId);
    if (Number.isNaN(itemId)) { res.status(400).json({ message: 'Invalid plan item ID' }); return; }
    const updates = PlanItemUpdateSchema.parse(req.body);
    const item = await updatePlanItem(itemId, updates);
    if (!item) { res.status(404).json({ message: 'Plan item not found' }); return; }
    res.json(item);
  } catch (err) { next(err); }
});

// ---------------------------------------------------------------------------
// DELETE /:id/plan/:itemId — remove plan item
// ---------------------------------------------------------------------------
storiesRouter.delete('/:id/plan/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemId = Number(req.params.itemId);
    if (Number.isNaN(itemId)) { res.status(400).json({ message: 'Invalid plan item ID' }); return; }
    const deleted = await deletePlanItem(itemId);
    if (!deleted) { res.status(404).json({ message: 'Plan item not found' }); return; }
    res.status(204).end();
  } catch (err) { next(err); }
});
