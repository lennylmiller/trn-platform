import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';
import { executionKeys } from '../keys';

interface AbortResult {
  aborted: boolean;
}

/**
 * Abort any currently running execution — kills the child process
 * and unblocks any paused flow.
 */
export function useAbortExecution() {
  const queryClient = useQueryClient();

  return useMutation<AbortResult, Error, void>({
    mutationFn: async () => {
      return apiFetch<AbortResult>('/api/v2/execute/abort', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: executionKeys.status() });
    },
  });
}
