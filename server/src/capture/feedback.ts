import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const feedbackDir = process.env.FEEDBACK_CAPTURE_DIR
  ? path.resolve(process.env.FEEDBACK_CAPTURE_DIR)
  : path.resolve(currentDir, '../../uploads/feedback');

const FeedbackSchema = z.object({
  message: z.string().trim().min(4).max(10_000),
  email: z.string().trim().email().optional(),
  category: z.enum(['bug', 'design', 'course', 'other']),
  page: z.object({
    url: z.string().max(4096),
    path: z.string().max(2048),
    title: z.string().max(512),
  }),
  viewport: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    devicePixelRatio: z.number().positive(),
  }),
  browser: z.object({
    userAgent: z.string().max(2048),
    language: z.string().max(128),
    platform: z.string().max(256),
  }),
  recentActions: z.array(z.object({
    type: z.enum(['click', 'input', 'navigation']),
    label: z.string().max(256),
    path: z.string().max(2048),
    timestamp: z.string().max(64),
  })).max(50),
  screenshot: z.object({
    dataUrl: z.string(),
    mimeType: z.string().max(128),
  }).optional(),
  createdAt: z.string().max(64),
});

export async function handleFeedbackSubmit(req: Request, res: Response, next: NextFunction) {
  try {
    const input = FeedbackSchema.parse(req.body);
    await fs.mkdir(feedbackDir, { recursive: true });

    const id = crypto.randomUUID();
    const savedAt = new Date().toISOString();
    const metadataPath = path.join(feedbackDir, `${id}.json`);
    let screenshotSaved = false;

    const metadata = {
      ...input,
      id,
      savedAt,
      screenshot: input.screenshot ? { mimeType: input.screenshot.mimeType, file: `${id}.png` } : undefined,
    };

    if (input.screenshot) {
      const screenshot = parsePngDataUrl(input.screenshot.dataUrl);
      await fs.writeFile(path.join(feedbackDir, `${id}.png`), screenshot);
      screenshotSaved = true;
    }

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
    res.status(201).json({ id, savedAt, screenshotSaved });
  } catch (err) {
    next(err);
  }
}

export function getFeedbackCaptureDir() {
  return feedbackDir;
}

function parsePngDataUrl(dataUrl: string) {
  const match = /^data:image\/png;base64,(?<payload>[a-zA-Z0-9+/=]+)$/.exec(dataUrl);
  if (!match?.groups?.payload) {
    throw new Error('Only PNG feedback screenshots are supported.');
  }

  const buffer = Buffer.from(match.groups.payload, 'base64');
  if (buffer.length > 10 * 1024 * 1024) {
    throw new Error('Feedback screenshot is too large.');
  }

  return buffer;
}
