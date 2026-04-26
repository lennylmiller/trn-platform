import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';
import { executionKeys } from '../keys';

interface ExecuteFlowResult {
  executionId: string;
  flowId: number;
  flowName: string;
  totalSteps: number;
}

/**
 * Trigger execution of an entire flow by flow_id.
 * Steps run sequentially on the server; output streams over SSE.
 */
export function useExecuteFlow() {
  const queryClient = useQueryClient();

  return useMutation<ExecuteFlowResult, Error, number>({
    mutationFn: async (flowId: number) => {
      return apiFetch<ExecuteFlowResult>(`/api/v2/execute/flow/${flowId}`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: executionKeys.status() });
    },
  });
}
