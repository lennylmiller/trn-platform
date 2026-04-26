import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FlowStepUpdate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { flowsKeys } from '../keys';

interface UpdateFlowStepVars {
  flowId: number;
  flowStepId: number;
  updates: FlowStepUpdate;
}

export function useUpdateFlowStep() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, UpdateFlowStepVars>({
    mutationFn: ({ flowId, flowStepId, updates }) =>
      apiFetch(`/${flowId}/steps/${flowStepId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    onSuccess: (_data, { flowId }) => {
      queryClient.invalidateQueries({ queryKey: flowsKeys.detail(flowId) });
    },
  });
}
