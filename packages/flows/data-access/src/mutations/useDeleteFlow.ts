import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';
import { flowsKeys } from '../keys';

export function useDeleteFlow() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) =>
      apiFetch<void>(`/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flowsKeys.lists() });
    },
  });
}
