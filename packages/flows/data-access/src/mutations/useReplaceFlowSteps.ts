import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FlowStepCreate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { flowsKeys } from '../keys';

interface ReplaceFlowStepsVars {
  flowId: number;
  steps: FlowStepCreate[];
}

export function useReplaceFlowSteps() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, ReplaceFlowStepsVars>({
    mutationFn: ({ flowId, steps }) =>
      apiFetch(`/${flowId}/steps`, {
        method: 'PUT',
        body: JSON.stringify(steps),
      }),
    onSuccess: (_data, { flowId }) => {
      queryClient.invalidateQueries({ queryKey: flowsKeys.detail(flowId) });
      queryClient.invalidateQueries({ queryKey: flowsKeys.lists() });
    },
  });
}
