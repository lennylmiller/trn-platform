import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error';
import { getPool, healthCheck, closePool } from '../db/connection';

// Domain routers
import { stepsRouter } from '@trn-platform/steps-server';
import { flowsRouter } from '@trn-platform/flows-server';
import { compositionsRouter } from '@trn-platform/compositions-server';
import { executionRouter } from '@trn-platform/execution-server';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Global middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Eagerly connect to both databases at startup
await getPool('qc_training');
await getPool('qc_core');

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
