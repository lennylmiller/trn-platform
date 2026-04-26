import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';
import { compositionsKeys } from '../keys';

export function useDeleteComposition() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) =>
      apiFetch<void>(`/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: compositionsKeys.lists() });
    },
  });
}
