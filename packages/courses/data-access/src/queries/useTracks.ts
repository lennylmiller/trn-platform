import { useQuery } from '@tanstack/react-query';
import { TracksResponseSchema } from '@trn-platform/shared';
import type { CourseTrack } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { tracksKeys } from '../keys';

export function useTracks() {
  return useQuery<CourseTrack[]>({
    queryKey: tracksKeys.lists(),
    queryFn: async () => {
      const data = await apiFetch<CourseTrack[]>('/api/v2/courses/tracks');
      return TracksResponseSchema.parse(data);
    },
  });
}
