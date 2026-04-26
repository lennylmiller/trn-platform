import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Composition, CompositionUpdate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { compositionsKeys } from '../keys';

interface UpdateCompositionVars {
  id: number;
  updates: CompositionUpdate;
}

export function useUpdateComposition() {
  const queryClient = useQueryClient();

  return useMutation<Composition, Error, UpdateCompositionVars>({
    mutationFn: ({ id, updates }) =>
      apiFetch<Composition>(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: compositionsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: compositionsKeys.detail(id) });
    },
  });
}
