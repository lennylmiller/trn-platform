import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Story, StoryUpdate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { storiesKeys } from '../keys';

export interface UpdateStoryVars {
  storyId: number;
  updates: StoryUpdate;
}

export function useUpdateStory() {
  const queryClient = useQueryClient();

  return useMutation<Story, Error, UpdateStoryVars>({
    mutationFn: async ({ storyId, updates }: UpdateStoryVars) => {
      return apiFetch<Story>(`/api/v2/stories/${storyId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: (_data, { storyId }) => {
      void queryClient.invalidateQueries({ queryKey: storiesKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: storiesKeys.detail(storyId) });
    },
  });
}
