import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FlowStepCreate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { flowsKeys } from '../keys';

interface AddFlowStepVars {
  flowId: number;
  data: FlowStepCreate;
}

export function useAddFlowStep() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, AddFlowStepVars>({
    mutationFn: ({ flowId, data }) =>
      apiFetch(`/${flowId}/steps`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, { flowId }) => {
      queryClient.invalidateQueries({ queryKey: flowsKeys.detail(flowId) });
      queryClient.invalidateQueries({ queryKey: flowsKeys.lists() });
    },
  });
}
