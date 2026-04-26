import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StepSchema } from '@trn-platform/shared';
import type { Step, StepCreate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { stepsKeys } from '../keys';

/**
 * Create a new step in the step_library.
 * Invalidates step list queries on success.
 */
export function useCreateStep() {
  const queryClient = useQueryClient();

  return useMutation<Step, Error, StepCreate>({
    mutationFn: async (input) => {
      const data = await apiFetch<Step>('/api/v2/steps', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return StepSchema.parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stepsKeys.lists() });
    },
  });
}
