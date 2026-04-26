import { useQuery } from '@tanstack/react-query';
import type { FlowDetail } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { flowsKeys } from '../keys';

export function useFlow(flowId: number | undefined) {
  return useQuery<FlowDetail>({
    queryKey: flowsKeys.detail(flowId ?? 0),
    queryFn: () => apiFetch<FlowDetail>(`/${flowId}`),
    enabled: flowId !== undefined,
  });
}
