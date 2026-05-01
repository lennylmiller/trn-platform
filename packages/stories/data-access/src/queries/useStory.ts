import { useQuery } from '@tanstack/react-query';
import { StoryDetailSchema } from '@trn-platform/shared';
import type { StoryDetail } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { storiesKeys } from '../keys';

/**
 * Fetch a single story with its plan items.
 */
export function useStory(storyId: number | undefined) {
  return useQuery<StoryDetail>({
    queryKey: storiesKeys.detail(storyId!),
    queryFn: async () => {
      const data = await apiFetch<StoryDetail>(`/api/v2/stories/${storyId}`);
      return StoryDetailSchema.parse(data);
    },
    enabled: storyId !== undefined,
  });
}
