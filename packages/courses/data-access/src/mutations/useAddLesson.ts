import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CourseLesson, LessonCreate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { coursesKeys } from '../keys';

export interface AddLessonVars { courseId: number; input: LessonCreate; }

export function useAddLesson() {
  const qc = useQueryClient();
  return useMutation<CourseLesson, Error, AddLessonVars>({
    mutationFn: ({ courseId, input }) =>
      apiFetch<CourseLesson>(`/api/v2/courses/${courseId}/lessons`, { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: (_d, { courseId }) => { void qc.invalidateQueries({ queryKey: coursesKeys.detail(courseId) }); },
  });
}
