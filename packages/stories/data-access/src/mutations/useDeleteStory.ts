import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';
import { storiesKeys } from '../keys';

export function useDeleteStory() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (storyId: number) => {
      return apiFetch<void>(`/api/v2/stories/${storyId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: storiesKeys.lists() });
    },
  });
}
