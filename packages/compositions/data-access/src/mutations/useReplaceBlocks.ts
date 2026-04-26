import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { BlockCreate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { compositionsKeys } from '../keys';

interface ReplaceBlocksVars {
  compositionId: number;
  blocks: BlockCreate[];
}

export function useReplaceBlocks() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, ReplaceBlocksVars>({
    mutationFn: ({ compositionId, blocks }) =>
      apiFetch(`/${compositionId}/blocks`, {
        method: 'PUT',
        body: JSON.stringify(blocks),
      }),
    onSuccess: (_data, { compositionId }) => {
      queryClient.invalidateQueries({ queryKey: compositionsKeys.detail(compositionId) });
      queryClient.invalidateQueries({ queryKey: compositionsKeys.lists() });
    },
  });
}
