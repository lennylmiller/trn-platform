import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { BlockUpdate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { compositionsKeys } from '../keys';

interface UpdateBlockVars {
  compositionId: number;
  blockId: number;
  updates: BlockUpdate;
}

export function useUpdateBlock() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, UpdateBlockVars>({
    mutationFn: ({ compositionId, blockId, updates }) =>
      apiFetch(`/${compositionId}/blocks/${blockId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    onSuccess: (_data, { compositionId }) => {
      queryClient.invalidateQueries({ queryKey: compositionsKeys.detail(compositionId) });
    },
  });
}
