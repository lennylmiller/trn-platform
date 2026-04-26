import { useQuery } from '@tanstack/react-query';
import type { CompositionKind, CompositionListItem } from '@trn-platform/shared';
import { CompositionsResponseSchema } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { compositionsKeys } from '../keys';

export function useCompositions(kind?: CompositionKind) {
  return useQuery<CompositionListItem[]>({
    queryKey: compositionsKeys.list(kind),
    queryFn: async () => {
      const params = kind ? `?kind=${kind}` : '';
      const data = await apiFetch<CompositionListItem[]>(params);
      return CompositionsResponseSchema.parse(data);
    },
  });
}
