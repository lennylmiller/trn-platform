import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const express = require('express') as typeof import('express').default;
const cors = require('cors') as typeof import('cors').default;
const helmet = require('helmet') as typeof import('helmet').default;

import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error';
import { getPool, healthCheck, closePool } from '../db/connection';

// Domain routers — loaded from compiled dist via workspace package resolution
const { stepsRouter } = require('@trn-platform/steps-server') as typeof import('@trn-platform/steps-server');
const { flowsRouter } = require('@trn-platform/flows-server') as typeof import('@trn-platform/flows-server');
const { compositionsRouter } = require('@trn-platform/compositions-server') as typeof import('@trn-platform/compositions-server');
const { executionRouter } = require('@trn-platform/execution-server') as typeof import('@trn-platform/execution-server');
const { chatRouter } = require('@trn-platform/chat-server') as typeof import('@trn-platform/chat-server');
const { storiesRouter } = require('@trn-platform/stories-server') as typeof import('@trn-platform/stories-server');
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
app.use(express.json());

// Database connections are lazy — getPool() connects on first API request
console.log('[server] Database connections will be established on first request');

// Health check (no auth required)
app.get('/api/health', async (_req, res) => {
  const dbs = await healthCheck();
  const allOk = Object.values(dbs).every(Boolean);
  res.status(allOk ? 200 : 503).json({ status: allOk ? 'ok' : 'degraded', databases: dbs });
});

// Auth middleware for all /api routes below
app.use('/api', authMiddleware);

// Mount domain routers
app.use('/api/v2/steps', stepsRouter);
app.use('/api/v2/flows', flowsRouter);
app.use('/api/v2/compositions', compositionsRouter);
app.use('/api/v2/execute', executionRouter);
app.use('/api/v2/chat', chatRouter);
app.use('/api/v2/stories', storiesRouter);
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
