import { useQuery } from '@tanstack/react-query';
import type { CompositionDetail } from '@trn-platform/shared';
import { CompositionDetailSchema } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { compositionsKeys } from '../keys';

export function useComposition(compositionId: number | undefined) {
  return useQuery<CompositionDetail>({
    queryKey: compositionsKeys.detail(compositionId ?? 0),
    queryFn: async () => {
      const data = await apiFetch<CompositionDetail>(`/${compositionId}`);
      return CompositionDetailSchema.parse(data);
    },
    enabled: !!compositionId,
  });
}
