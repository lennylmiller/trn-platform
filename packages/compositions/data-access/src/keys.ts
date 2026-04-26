import type { CompositionKind } from '@trn-platform/shared';

export const compositionsKeys = {
  all: ['compositions'] as const,
  lists: () => [...compositionsKeys.all, 'list'] as const,
  list: (kind?: CompositionKind) => [...compositionsKeys.lists(), { kind }] as const,
  details: () => [...compositionsKeys.all, 'detail'] as const,
  detail: (compositionId: number) => [...compositionsKeys.details(), compositionId] as const,
};
