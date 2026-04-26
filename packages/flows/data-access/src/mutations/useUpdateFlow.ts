import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Flow, FlowUpdate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { flowsKeys } from '../keys';

interface UpdateFlowVars {
  id: number;
  updates: FlowUpdate;
}

export function useUpdateFlow() {
  const queryClient = useQueryClient();

  return useMutation<Flow, Error, UpdateFlowVars>({
    mutationFn: ({ id, updates }) =>
      apiFetch<Flow>(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: flowsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: flowsKeys.detail(id) });
    },
  });
}
