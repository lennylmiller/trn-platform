import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Composition, CompositionCreate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { compositionsKeys } from '../keys';

export function useCreateComposition() {
  const queryClient = useQueryClient();

  return useMutation<Composition, Error, CompositionCreate>({
    mutationFn: (input) =>
      apiFetch<Composition>('', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: compositionsKeys.lists() });
    },
  });
}
