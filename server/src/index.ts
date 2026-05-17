import { createRequire } from 'module';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error';
import { getFeedbackCaptureDir, handleFeedbackSubmit } from './capture/feedback';
import { healthCheck, closePool } from '../db/connection';
import { ExecuteSqlSchema } from '@trn-platform/shared';
import { getPool } from '@trn-platform/shared/db';

const require = createRequire(import.meta.url);

// Domain routers — loaded from compiled dist via workspace package resolution
const { chatRouter } = require('@trn-platform/chat-server') as typeof import('@trn-platform/chat-server');
const { coursesRouter } = require('@trn-platform/courses-server') as typeof import('@trn-platform/courses-server');

console.log('[server] AUTH_DISABLED:', process.env.AUTH_DISABLED);
const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Global middleware
app.use(helmet());
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:6006'];
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '15mb' }));

// Database connections are lazy and connect on first API request.
console.log('[server] Database connections will be established on first request');

// Health check (no auth required)
app.get('/api/health', async (_req: Request, res: Response) => {
  const dbs = await healthCheck();
  const allOk = Object.values(dbs).every(Boolean);
  res.status(allOk ? 200 : 503).json({ status: allOk ? 'ok' : 'degraded', databases: dbs });
});

// Auth middleware for all /api routes below
app.use('/api', authMiddleware);

// Low-friction app feedback capture
app.post('/api/v2/feedback', handleFeedbackSubmit);
app.get('/api/v2/feedback/info', (_req: Request, res: Response) => {
  res.json({ feedbackDir: getFeedbackCaptureDir() });
});

// SQL execution endpoint (used by course SQL challenge blocks)
app.post('/api/v2/execute/sql', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sql } = ExecuteSqlSchema.parse(req.body);
    const pool = await getPool('qc_core');
    const result = await pool.request().query(sql);
    const columns = result.recordset?.columns
      ? Object.keys(result.recordset.columns)
      : [];
    res.json({
      columns,
      rows: result.recordset ?? [],
      rowCount: result.rowsAffected[0] ?? 0,
    });
  } catch (err) {
    next(err);
  }
});

// Mount domain routers
app.use('/api/v2/chat', chatRouter);
app.use('/api/v2/courses', coursesRouter);

// Error handling
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`TRN Platform API server listening on port ${PORT}`);
});

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down...');
  server.close();
  await closePool();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
