import { type Router as RouterType, Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import {
  CompositionCreateSchema,
  CompositionUpdateSchema,
  BlockCreateSchema,
  BlockUpdateSchema,
} from '@trn-platform/shared';
import {
  listCompositions,
  getComposition,
  createComposition,
  updateComposition,
  deleteComposition,
  replaceBlocks,
  addBlock,
  updateBlock,
  deleteBlock,
} from './queries';

export const compositionsRouter: RouterType = Router();

// ---------------------------------------------------------------------------
// GET / — list compositions, optional ?kind= filter
// ---------------------------------------------------------------------------
compositionsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const kind = req.query.kind as string | undefined;
    const compositions = await listCompositions(kind);
    res.json(compositions);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /:id — get composition detail with blocks
// ---------------------------------------------------------------------------
compositionsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid composition ID' });
      return;
    }

    const composition = await getComposition(id);
    if (!composition) {
      res.status(404).json({ message: 'Composition not found' });
      return;
    }

    res.json(composition);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST / — create composition
// ---------------------------------------------------------------------------
compositionsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = CompositionCreateSchema.parse(req.body);
    const composition = await createComposition(input);
    res.status(201).json(composition);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — update composition metadata
// ---------------------------------------------------------------------------
compositionsRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid composition ID' });
      return;
    }

    const updates = CompositionUpdateSchema.parse(req.body);
    const composition = await updateComposition(id, updates);
    if (!composition) {
      res.status(404).json({ message: 'Composition not found' });
      return;
    }

    res.json(composition);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — delete composition
// ---------------------------------------------------------------------------
compositionsRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid composition ID' });
      return;
    }

    const deleted = await deleteComposition(id);
    if (!deleted) {
      res.status(404).json({ message: 'Composition not found' });
      return;
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/blocks — replace all blocks
// ---------------------------------------------------------------------------
compositionsRouter.put('/:id/blocks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid composition ID' });
      return;
    }

    const blocks = BlockCreateSchema.array().parse(req.body);
    const result = await replaceBlocks(id, blocks);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /:id/blocks — add a block
// ---------------------------------------------------------------------------
compositionsRouter.post('/:id/blocks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid composition ID' });
      return;
    }

    const data = BlockCreateSchema.parse(req.body);
    const block = await addBlock(id, data);
    res.status(201).json(block);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/blocks/:blockId — update a block
// ---------------------------------------------------------------------------
compositionsRouter.put(
  '/:id/blocks/:blockId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blockId = Number(req.params.blockId);
      if (Number.isNaN(blockId)) {
        res.status(400).json({ message: 'Invalid block ID' });
        return;
      }

      const updates = BlockUpdateSchema.parse(req.body);
      const block = await updateBlock(blockId, updates);
      if (!block) {
        res.status(404).json({ message: 'Block not found' });
        return;
      }

      res.json(block);
    } catch (err) {
      next(err);
    }
  },
);

// ---------------------------------------------------------------------------
// DELETE /:id/blocks/:blockId — remove a block
// ---------------------------------------------------------------------------
compositionsRouter.delete(
  '/:id/blocks/:blockId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blockId = Number(req.params.blockId);
      if (Number.isNaN(blockId)) {
        res.status(400).json({ message: 'Invalid block ID' });
        return;
      }

      const deleted = await deleteBlock(blockId);
      if (!deleted) {
        res.status(404).json({ message: 'Block not found' });
        return;
      }

      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
);
