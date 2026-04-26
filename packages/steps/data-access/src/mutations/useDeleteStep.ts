import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';
import { stepsKeys } from '../keys';

/**
 * Delete a step from the step_library.
 * Invalidates step list queries on success.
 */
export function useDeleteStep() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (stepId) => {
      await apiFetch<void>(`/api/v2/steps/${stepId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stepsKeys.lists() });
    },
  });
}
