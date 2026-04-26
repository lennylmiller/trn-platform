import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';
import { flowsKeys } from '../keys';

interface DeleteFlowStepVars {
  flowId: number;
  flowStepId: number;
}

export function useDeleteFlowStep() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteFlowStepVars>({
    mutationFn: ({ flowId, flowStepId }) =>
      apiFetch<void>(`/${flowId}/steps/${flowStepId}`, { method: 'DELETE' }),
    onSuccess: (_data, { flowId }) => {
      queryClient.invalidateQueries({ queryKey: flowsKeys.detail(flowId) });
      queryClient.invalidateQueries({ queryKey: flowsKeys.lists() });
    },
  });
}
