import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CourseBlock, CourseBlockCreate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { coursesKeys } from '../keys';

export interface AddBlockVars { courseId: number; lessonId: number; input: CourseBlockCreate; }

export function useAddBlock() {
  const qc = useQueryClient();
  return useMutation<CourseBlock, Error, AddBlockVars>({
    mutationFn: ({ courseId, lessonId, input }) =>
      apiFetch<CourseBlock>(`/api/v2/courses/${courseId}/lessons/${lessonId}/slides`, { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: (_d, { courseId }) => { void qc.invalidateQueries({ queryKey: coursesKeys.detail(courseId) }); },
  });
}
