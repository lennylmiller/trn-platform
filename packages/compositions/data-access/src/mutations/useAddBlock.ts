import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { BlockCreate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { compositionsKeys } from '../keys';

interface AddBlockVars {
  compositionId: number;
  data: BlockCreate;
}

export function useAddBlock() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, AddBlockVars>({
    mutationFn: ({ compositionId, data }) =>
      apiFetch(`/${compositionId}/blocks`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, { compositionId }) => {
      queryClient.invalidateQueries({ queryKey: compositionsKeys.detail(compositionId) });
      queryClient.invalidateQueries({ queryKey: compositionsKeys.lists() });
    },
  });
}
