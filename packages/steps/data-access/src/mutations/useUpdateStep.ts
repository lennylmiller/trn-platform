import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StepSchema } from '@trn-platform/shared';
import type { Step, StepUpdate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { stepsKeys } from '../keys';

interface UpdateStepVars {
  stepId: number;
  updates: StepUpdate;
}

/**
 * Update an existing step.
 * Invalidates both the list and the specific detail cache on success.
 */
export function useUpdateStep() {
  const queryClient = useQueryClient();

  return useMutation<Step, Error, UpdateStepVars>({
    mutationFn: async ({ stepId, updates }) => {
      const data = await apiFetch<Step>(`/api/v2/steps/${stepId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return StepSchema.parse(data);
    },
    onSuccess: (_data, { stepId }) => {
      queryClient.invalidateQueries({ queryKey: stepsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stepsKeys.detail(stepId) });
    },
  });
}
