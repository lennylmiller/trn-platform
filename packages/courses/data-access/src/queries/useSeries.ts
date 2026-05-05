import { useQuery } from '@tanstack/react-query';
import { SeriesResponseSchema } from '@trn-platform/shared';
import type { CourseSeries } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { seriesKeys } from '../keys';

export function useSeries() {
  return useQuery<CourseSeries[]>({
    queryKey: seriesKeys.lists(),
    queryFn: async () => {
      const data = await apiFetch<CourseSeries[]>('/api/v2/courses/series');
      return SeriesResponseSchema.parse(data);
    },
  });
}
