import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';
import { coursesKeys } from '../keys';

export interface DeleteLessonVars { courseId: number; lessonId: number; }

export function useDeleteLesson() {
  const qc = useQueryClient();
  return useMutation<void, Error, DeleteLessonVars>({
    mutationFn: ({ courseId, lessonId }) =>
      apiFetch<void>(`/api/v2/courses/${courseId}/lessons/${lessonId}`, { method: 'DELETE' }),
    onSuccess: (_d, { courseId }) => { void qc.invalidateQueries({ queryKey: coursesKeys.detail(courseId) }); },
  });
}
