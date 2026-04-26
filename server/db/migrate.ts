import fs from 'node:fs';
import path from 'node:path';
import sql from 'mssql';
import { getPool, closePool } from './connection';

/**
 * Lightweight SQL Server migration runner
 *
 * Reads .sql files from the migrations/ directory, tracks applied migrations
 * in a __migrations table, and runs pending ones in filename order.
 *
 * Usage: npx tsx server/db/migrate.ts
 */

const MIGRATIONS_DIR = path.resolve(import.meta.dirname, 'migrations');

async function ensureMigrationsTable(pool: sql.ConnectionPool) {
  await pool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = '__migrations')
    CREATE TABLE __migrations (
      id         INT IDENTITY(1,1) PRIMARY KEY,
      filename   NVARCHAR(500)     NOT NULL UNIQUE,
      applied_at DATETIME2         DEFAULT SYSUTCDATETIME()
    );
  `);
}

async function getAppliedMigrations(pool: sql.ConnectionPool): Promise<Set<string>> {
  const result = await pool.request().query('SELECT filename FROM __migrations');
  return new Set(result.recordset.map((r: { filename: string }) => r.filename));
}

async function runMigrations() {
  const pool = await getPool('qc_training');

  try {
    await ensureMigrationsTable(pool);
    const applied = await getAppliedMigrations(pool);

    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const pending = files.filter((f) => !applied.has(f));

    if (pending.length === 0) {
      console.log('No pending migrations.');
      return;
    }

    for (const file of pending) {
      console.log(`Applying: ${file}`);
      const sqlText = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');

      // Split on GO statements for SQL Server batch execution
      const batches = sqlText.split(/^\s*GO\s*$/gim).filter((b) => b.trim());

      for (const batch of batches) {
        await pool.request().query(batch);
      }

      await pool.request()
        .input('filename', sql.NVarChar, file)
        .query('INSERT INTO __migrations (filename) VALUES (@filename)');

      console.log(`Applied: ${file}`);
    }

    console.log(`${pending.length} migration(s) applied.`);
  } finally {
    await closePool();
  }
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
