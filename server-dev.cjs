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
const { ExecuteSqlSchema } = require('./packages/shared/src/schemas/index.ts');

// Domain routers — resolve @trn-platform/*-server to source (not dist)
// so node --watch picks up changes without rebuilding.
// tsx/cjs (registered above) transpiles TypeScript on the fly.
const { join } = require('path');
const Module = require('module');
const origResolve = Module._resolveFilename;

const SOURCE_MAP = {
  '@trn-platform/chat-server':         join(__dirname, 'packages/chat/server/src/index.ts'),
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

const { chatRouter, warmupMcpClient } = require('@trn-platform/chat-server');
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

// SQL execution endpoint (used by course SQL challenge blocks)
app.post('/api/v2/execute/sql', async (req, res, next) => {
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

app.use('/api/v2/chat', chatRouter);
app.use('/api/v2/courses', coursesRouter);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`TRN Platform API server listening on port ${PORT}`);
  // Pre-warm MCP client so first chat request doesn't have cold-start latency
  warmupMcpClient().catch(() => {});
});

process.on('SIGTERM', () => { server.close(); closePool().then(() => process.exit(0)); });
process.on('SIGINT', () => { server.close(); closePool().then(() => process.exit(0)); });
