/**
 * Re-export from @trn-platform/shared/db
 * The canonical connection module lives in the shared package.
 * This file exists so server/src/index.ts can import without the workspace alias.
 */
export { getPool, closePool, healthCheck } from '@trn-platform/shared/db';
