import { useQuery } from '@tanstack/react-query';
import { StepsResponseSchema } from '@trn-platform/shared';
import type { Step } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { stepsKeys } from '../keys';

export interface UseStepsOptions {
  category?: string;
  story?: string;
}

/**
 * Fetch all steps, optionally filtered by category and/or story.
 */
export function useSteps(options: UseStepsOptions = {}) {
  const { category, story } = options;

  const searchParams = new URLSearchParams();
  if (category) searchParams.set('category', category);
  if (story) searchParams.set('story', story);
  const qs = searchParams.toString();
  const params = qs ? `?${qs}` : '';

  return useQuery<Step[]>({
    queryKey: stepsKeys.list({ category, story }),
    queryFn: async () => {
      const data = await apiFetch<Step[]>(`/api/v2/steps${params}`);
      return StepsResponseSchema.parse(data);
    },
  });
}
