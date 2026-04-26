import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Flow, FlowCreate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { flowsKeys } from '../keys';

export function useCreateFlow() {
  const queryClient = useQueryClient();

  return useMutation<Flow, Error, FlowCreate>({
    mutationFn: (input) =>
      apiFetch<Flow>('', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flowsKeys.lists() });
    },
  });
}
