// CJS dev entry — avoids ESM-CJS interop hanging (tedious/mssql blocks ESM module init on WSL2)
// Loads .env, registers tsx for TypeScript, then boots the server in CJS mode
require('dotenv').config();
require('tsx/cjs');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { authMiddleware } = require('./server/src/middleware/auth.ts');
const { errorHandler } = require('./server/src/middleware/error.ts');
const { getPool, healthCheck, closePool } = require('./server/db/connection.ts');

// Domain routers — resolve from server's node_modules (pnpm workspace links)
const { join } = require('path');
const Module = require('module');
const origResolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain, options) {
  if (request.startsWith('@trn-platform/') && parent?.filename?.includes('server-dev.cjs')) {
    try {
      return origResolve.call(this, request, { ...parent, paths: [join(__dirname, 'server', 'node_modules')] }, isMain, options);
    } catch {}
  }
  return origResolve.call(this, request, parent, isMain, options);
};

const { stepsRouter } = require('@trn-platform/steps-server');
const { flowsRouter } = require('@trn-platform/flows-server');
const { compositionsRouter } = require('@trn-platform/compositions-server');
const { executionRouter } = require('@trn-platform/execution-server');
const { chatRouter } = require('@trn-platform/chat-server');
const { storiesRouter } = require('@trn-platform/stories-server');
const { coursesRouter } = require('@trn-platform/courses-server');

console.log('[server] AUTH_DISABLED:', process.env.AUTH_DISABLED);
const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(helmet());
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:6006'];
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  const dbs = await healthCheck();
  const allOk = Object.values(dbs).every(Boolean);
  res.status(allOk ? 200 : 503).json({ status: allOk ? 'ok' : 'degraded', databases: dbs });
});

app.use('/api', authMiddleware);
app.use('/api/v2/steps', stepsRouter);
app.use('/api/v2/flows', flowsRouter);
app.use('/api/v2/compositions', compositionsRouter);
app.use('/api/v2/execute', executionRouter);
app.use('/api/v2/chat', chatRouter);
app.use('/api/v2/stories', storiesRouter);
app.use('/api/v2/courses', coursesRouter);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`TRN Platform API server listening on port ${PORT}`);
});

process.on('SIGTERM', () => { server.close(); closePool().then(() => process.exit(0)); });
process.on('SIGINT', () => { server.close(); closePool().then(() => process.exit(0)); });
