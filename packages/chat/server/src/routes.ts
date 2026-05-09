/**
 * Chat API routes.
 *
 * POST /  — Send a message and get a response (with tool execution).
 */
import { type Router as RouterType, Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { chat } from './service.js';
import type { ChatMessage } from './service.js';
import { planWithClaudeCode } from './claude-code.js';

export const chatRouter: RouterType = Router();

chatRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messages, context, systemPromptHint } = req.body as {
      messages?: ChatMessage[];
      context?: Record<string, unknown>;
      systemPromptHint?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ message: 'messages array is required' });
      return;
    }

    const result = await chat(messages, context, systemPromptHint);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

chatRouter.post('/plan', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt } = req.body as { prompt?: string };
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ message: 'prompt string is required' });
      return;
    }

    const result = await planWithClaudeCode(prompt);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
