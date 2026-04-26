import { useQuery } from '@tanstack/react-query';
import { StepsResponseSchema } from '@trn-platform/shared';
import type { Step } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { stepsKeys } from '../keys';

export interface UseStepsOptions {
  category?: string;
}

/**
 * Fetch all steps, optionally filtered by category.
 */
export function useSteps(options: UseStepsOptions = {}) {
  const { category } = options;
  const params = category ? `?category=${encodeURIComponent(category)}` : '';

  return useQuery<Step[]>({
    queryKey: stepsKeys.list(category),
    queryFn: async () => {
      const data = await apiFetch<Step[]>(`/api/v2/steps${params}`);
      return StepsResponseSchema.parse(data);
    },
  });
}
