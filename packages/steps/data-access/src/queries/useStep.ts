import { useQuery } from '@tanstack/react-query';
import { StepSchema } from '@trn-platform/shared';
import type { Step } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { stepsKeys } from '../keys';

/**
 * Fetch a single step by ID.
 * Disabled when stepId is not provided.
 */
export function useStep(stepId: number | undefined) {
  return useQuery<Step>({
    queryKey: stepsKeys.detail(stepId ?? 0),
    queryFn: async () => {
      const data = await apiFetch<Step>(`/api/v2/steps/${stepId}`);
      return StepSchema.parse(data);
    },
    enabled: !!stepId,
  });
}
