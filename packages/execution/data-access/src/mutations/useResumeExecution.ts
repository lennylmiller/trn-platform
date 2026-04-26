import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../client';

interface ResumeResult {
  resumed: boolean;
}

/**
 * Resume a paused execution (manual step or pause_after).
 */
export function useResumeExecution() {
  return useMutation<ResumeResult, Error, void>({
    mutationFn: async () => {
      return apiFetch<ResumeResult>('/api/v2/execute/resume', {
        method: 'POST',
      });
    },
  });
}
