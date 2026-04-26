import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';
import { compositionsKeys } from '../keys';

interface DeleteBlockVars {
  compositionId: number;
  blockId: number;
}

export function useDeleteBlock() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteBlockVars>({
    mutationFn: ({ compositionId, blockId }) =>
      apiFetch<void>(`/${compositionId}/blocks/${blockId}`, { method: 'DELETE' }),
    onSuccess: (_data, { compositionId }) => {
      queryClient.invalidateQueries({ queryKey: compositionsKeys.detail(compositionId) });
      queryClient.invalidateQueries({ queryKey: compositionsKeys.lists() });
    },
  });
}
