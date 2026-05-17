import { useMutation } from '@tanstack/react-query';
import { SqlResultSchema } from '@trn-platform/shared';
import type { SqlResult } from '@trn-platform/shared';
import { apiFetch } from '../client';

/**
 * Execute raw SQL against qc_core. Returns columns, rows, and rowCount.
 */
export function useExecuteSql() {
  return useMutation<SqlResult, Error, string>({
    mutationFn: async (sql: string) => {
      const data = await apiFetch<SqlResult>('/api/v2/execute/sql', {
        method: 'POST',
        body: JSON.stringify({ sql }),
      });
      return SqlResultSchema.parse(data);
    },
  });
}
