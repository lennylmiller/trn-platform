import { useQuery } from '@tanstack/react-query';
import { CourseDetailSchema } from '@trn-platform/shared';
import type { CourseDetail } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { coursesKeys } from '../keys';

export function useCourse(courseId: number | undefined) {
  return useQuery<CourseDetail>({
    queryKey: coursesKeys.detail(courseId!),
    queryFn: async () => {
      const data = await apiFetch<CourseDetail>(`/api/v2/courses/${courseId}`);
      return CourseDetailSchema.parse(data);
    },
    enabled: courseId !== undefined,
  });
}
