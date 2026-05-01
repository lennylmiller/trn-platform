import { useMemo } from 'react';
import type { Step, StepCategory } from '@trn-platform/shared';

export interface StepFilterParams {
  category?: StepCategory;
  story?: string | null;
  search?: string;
}

export interface UseStepFiltersResult {
  filtered: Step[];
  total: number;
}

/**
 * Filters and searches a steps array by category and free-text search.
 * Search matches against label and description (case-insensitive).
 */
export function useStepFilters(
  steps: Step[] | undefined,
  params: StepFilterParams,
): UseStepFiltersResult {
  const { category, story, search } = params;

  const filtered = useMemo(() => {
    if (!steps) return [];

    let result = steps;

    if (category) {
      result = result.filter((s) => s.category === category);
    }

    if (story !== undefined) {
      result = result.filter((s) => (story === null ? !s.story : s.story === story));
    }

    if (search && search.trim().length > 0) {
      const term = search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.label.toLowerCase().includes(term) ||
          (s.description && s.description.toLowerCase().includes(term)),
      );
    }

    return result;
  }, [steps, category, story, search]);

  return {
    filtered,
    total: steps?.length ?? 0,
  };
}
