/**
 * Named SQL Server connection pools (lazy singletons)
 *
 * mssql/tedious is loaded lazily on first getPool() call to avoid blocking
 * server startup in environments where SQL Server is unavailable.
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';

let sql: typeof import('mssql') | null = null;

function loadSql() {
  if (sql) return sql;
  // Use createRequire to load mssql synchronously
  // This avoids ESM-CJS interop issues with mssql/tedious
  const esmFilename = typeof __filename !== 'undefined'
    ? __filename
    : fileURLToPath(import.meta.url);
  const req = createRequire(esmFilename);
  sql = req('mssql') as typeof import('mssql');
  return sql;
}

function getSharedConfig() {
  return {
    server: process.env.DB_SERVER || 'localhost',
    user: process.env.DB_USER || undefined,
    password: process.env.DB_PASSWORD || undefined,
    port: Number(process.env.DB_PORT) || 1433,
    connectionTimeout: 5000,
    requestTimeout: 10000,
    options: {
      encrypt: false,
      trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
}

const pools = new Map<any, any>();

function resolveDatabase(name: string): string {
  const envKey = `DB_${name.toUpperCase().replace(/-/g, '_')}_DATABASE`;
  return process.env[envKey] || name;
}

export async function getPool(name: string = 'qc_training'): Promise<any> {
  const existing = pools.get(name);
  if (existing?.connected) return existing;

  const mssql = loadSql();
  const config = {
    ...getSharedConfig(),
    database: resolveDatabase(name),
  };

  const pool = await new (mssql as any).ConnectionPool(config).connect();
  pools.set(name, pool);
  return pool;
}

export async function closePool(name?: string): Promise<void> {
  if (name) {
    const pool = pools.get(name);
    if (pool) {
      await pool.close();
      pools.delete(name);
    }
    return;
  }
  for (const [key, pool] of pools) {
    await pool.close();
    pools.delete(key);
  }
}

export async function healthCheck(): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};
  for (const key of pools.keys()) {
    try {
      const p = pools.get(key)!;
      await p.request().query('SELECT 1 AS ok');
      results[key] = true;
    } catch {
      results[key] = false;
    }
  }
  return results;
}
