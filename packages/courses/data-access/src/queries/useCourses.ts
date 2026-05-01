import { useQuery } from '@tanstack/react-query';
import { CoursesResponseSchema } from '@trn-platform/shared';
import type { CourseListItem } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { coursesKeys } from '../keys';

export function useCourses() {
  return useQuery<CourseListItem[]>({
    queryKey: coursesKeys.lists(),
    queryFn: async () => {
      const data = await apiFetch<CourseListItem[]>('/api/v2/courses');
      return CoursesResponseSchema.parse(data);
    },
  });
}
