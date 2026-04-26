import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';
import { executionKeys } from '../keys';

interface ExecuteStepResult {
  executionId: string;
  stepId: number;
  type: string;
}

/**
 * Trigger execution of a single step by step_id.
 * The actual output streams over SSE — this just kicks it off.
 */
export function useExecuteStep() {
  const queryClient = useQueryClient();

  return useMutation<ExecuteStepResult, Error, number>({
    mutationFn: async (stepId: number) => {
      return apiFetch<ExecuteStepResult>(`/api/v2/execute/step/${stepId}`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: executionKeys.status() });
    },
  });
}
