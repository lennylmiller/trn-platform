import { useMemo } from 'react';
import type { Step, StepCategory } from '@trn-platform/shared';

/**
 * Groups an array of steps by their category.
 * Returns a record keyed by StepCategory with arrays of steps.
 * Categories with no steps are omitted from the result.
 */
export function useGroupedSteps(
  steps: Step[] | undefined,
): Record<StepCategory, Step[]> {
  return useMemo(() => {
    const groups: Record<string, Step[]> = {};

    if (!steps) return groups as Record<StepCategory, Step[]>;

    for (const step of steps) {
      const cat = step.category;
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(step);
    }

    return groups as Record<StepCategory, Step[]>;
  }, [steps]);
}
