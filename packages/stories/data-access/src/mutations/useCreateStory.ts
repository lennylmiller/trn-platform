import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Story, StoryCreate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { storiesKeys } from '../keys';

export function useCreateStory() {
  const queryClient = useQueryClient();

  return useMutation<Story, Error, StoryCreate>({
    mutationFn: async (input: StoryCreate) => {
      return apiFetch<Story>('/api/v2/stories', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: storiesKeys.lists() });
    },
  });
}
