import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Course, CourseCreate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { coursesKeys } from '../keys';

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation<Course, Error, CourseCreate>({
    mutationFn: (input) => apiFetch<Course>('/api/v2/courses', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: coursesKeys.lists() }); },
  });
}
