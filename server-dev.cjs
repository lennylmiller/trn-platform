// CJS dev entry — avoids ESM-CJS interop hanging (tedious/mssql blocks ESM module init on WSL2)
// Loads .env, registers tsx for TypeScript, then boots the server in CJS mode.
// All @trn-platform/* packages resolve to SOURCE (not dist) so changes are
// picked up immediately by node --watch without rebuilding.
require('dotenv').config();
require('tsx/cjs');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { authMiddleware } = require('./server/src/middleware/auth.ts');
const { errorHandler } = require('./server/src/middleware/error.ts');
const { getPool, healthCheck, closePool } = require('./server/db/connection.ts');

// Domain routers — resolve @trn-platform/*-server to source (not dist)
// so node --watch picks up changes without rebuilding.
// tsx/cjs (registered above) transpiles TypeScript on the fly.
const { join } = require('path');
const Module = require('module');
const origResolve = Module._resolveFilename;

const SOURCE_MAP = {
  '@trn-platform/steps-server':        join(__dirname, 'packages/steps/server/src/index.ts'),
  '@trn-platform/flows-server':        join(__dirname, 'packages/flows/server/src/index.ts'),
  '@trn-platform/compositions-server': join(__dirname, 'packages/compositions/server/src/index.ts'),
  '@trn-platform/execution-server':    join(__dirname, 'packages/execution/server/src/index.ts'),
  '@trn-platform/chat-server':         join(__dirname, 'packages/chat/server/src/index.ts'),
  '@trn-platform/stories-server':      join(__dirname, 'packages/stories/server/src/index.ts'),
  '@trn-platform/courses-server':      join(__dirname, 'packages/courses/server/src/index.ts'),
  '@trn-platform/shared':              join(__dirname, 'packages/shared/src/index.ts'),
  '@trn-platform/shared/db':           join(__dirname, 'packages/shared/src/db/index.ts'),
  '@trn-platform/shared/tools':        join(__dirname, 'packages/shared/src/tools/index.ts'),
  '@trn-platform/shared/schemas':      join(__dirname, 'packages/shared/src/schemas/index.ts'),
};

Module._resolveFilename = function(request, parent, isMain, options) {
  if (SOURCE_MAP[request]) {
    return SOURCE_MAP[request];
  }
  return origResolve.call(this, request, parent, isMain, options);
};

const { stepsRouter } = require('@trn-platform/steps-server');
const { flowsRouter } = require('@trn-platform/flows-server');
const { compositionsRouter } = require('@trn-platform/compositions-server');
const { executionRouter } = require('@trn-platform/execution-server');
const { chatRouter, warmupMcpClient } = require('@trn-platform/chat-server');
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

// Static file serving for uploaded images
app.use('/uploads', express.static(join(__dirname, 'uploads')));

app.get('/api/health', async (_req, res) => {
  const dbs = await healthCheck();
  const allOk = Object.values(dbs).every(Boolean);
  res.status(allOk ? 200 : 503).json({ status: allOk ? 'ok' : 'degraded', databases: dbs });
});

// File upload endpoint
const multer = require('multer');
const fs = require('fs');
const crypto = require('crypto');
const uploadStorage = multer.diskStorage({
  destination: join(__dirname, 'uploads'),
  filename: (_req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`);
  },
});
const upload = multer({ storage: uploadStorage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

app.post('/api/v2/uploads', upload.single('file'), (req, res) => {
  if (!req.file) { res.status(400).json({ message: 'No file uploaded' }); return; }
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ url, filename: req.file.filename, size: req.file.size });
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
  // Pre-warm MCP client so first chat request doesn't have cold-start latency
  warmupMcpClient().catch(() => {});
});

process.on('SIGTERM', () => { server.close(); closePool().then(() => process.exit(0)); });
process.on('SIGINT', () => { server.close(); closePool().then(() => process.exit(0)); });
