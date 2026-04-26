import sql from 'mssql';

/**
 * Named SQL Server connection pools (lazy singletons)
 *
 * Supports multiple databases on the same server instance.
 * - qc_training: metadata (steps, flows, compositions)
 * - qc_core: execution target (training scenarios run here)
 *
 * Environment variables:
 *   DB_SERVER                  — shared server/instance
 *   DB_QC_TRAINING_DATABASE    — defaults to 'qc_training'
 *   DB_QC_CORE_DATABASE        — defaults to 'qc_core'
 *   DB_USER / DB_PASSWORD      — optional (Windows auth if omitted)
 *   DB_PORT                    — default 1433
 *   DB_TRUST_CERT              — default true
 */

const sharedConfig: Omit<sql.config, 'database'> = {
  server: process.env.DB_SERVER || 'localhost',
  user: process.env.DB_USER || undefined,
  password: process.env.DB_PASSWORD || undefined,
  port: Number(process.env.DB_PORT) || 1433,
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

const pools = new Map<string, sql.ConnectionPool>();

function resolveDatabase(name: string): string {
  const envKey = `DB_${name.toUpperCase().replace(/-/g, '_')}_DATABASE`;
  return process.env[envKey] || name;
}

export async function getPool(name: string = 'qc_training'): Promise<sql.ConnectionPool> {
  const existing = pools.get(name);
  if (existing?.connected) return existing;

  const config: sql.config = {
    ...sharedConfig,
    database: resolveDatabase(name),
  };

  const pool = await new sql.ConnectionPool(config).connect();
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
