import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation error',
      errors: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  console.error('[Error]', err.message, err.stack);

  // Surface a helpful message when SQL Server is unreachable
  const isConnectionError =
    err.message.includes('Could not connect') ||
    err.message.includes('ECONNREFUSED') ||
    err.message.includes('ETIMEOUT');

  if (isConnectionError) {
    res.status(503).json({
      message: 'Database is unavailable. Ensure SQL Server is running and .env credentials are set.',
    });
    return;
  }

  res.status(500).json({
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}
