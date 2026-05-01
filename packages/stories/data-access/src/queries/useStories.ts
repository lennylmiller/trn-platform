import { useQuery } from '@tanstack/react-query';
import { StoriesResponseSchema } from '@trn-platform/shared';
import type { Story } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { storiesKeys } from '../keys';

/**
 * Fetch all stories.
 */
export function useStories() {
  return useQuery<Story[]>({
    queryKey: storiesKeys.lists(),
    queryFn: async () => {
      const data = await apiFetch<Story[]>('/api/v2/stories');
      return StoriesResponseSchema.parse(data);
    },
  });
}
