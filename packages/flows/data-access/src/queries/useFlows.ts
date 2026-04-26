import { useQuery } from '@tanstack/react-query';
import type { FlowListItem } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { flowsKeys } from '../keys';

export function useFlows() {
  return useQuery<FlowListItem[]>({
    queryKey: flowsKeys.list(),
    queryFn: () => apiFetch<FlowListItem[]>(''),
  });
}
