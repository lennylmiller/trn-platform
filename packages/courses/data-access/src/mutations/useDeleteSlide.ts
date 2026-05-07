import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';
import { coursesKeys } from '../keys';

export interface DeleteSlideVars { courseId: number; lessonId: number; slideId: number; }

export function useDeleteSlide() {
  const qc = useQueryClient();
  return useMutation<void, Error, DeleteSlideVars>({
    mutationFn: ({ courseId, lessonId, slideId }) =>
      apiFetch<void>(`/api/v2/courses/${courseId}/lessons/${lessonId}/slides/${slideId}`, { method: 'DELETE' }),
    onSuccess: (_d, { courseId }) => { void qc.invalidateQueries({ queryKey: coursesKeys.detail(courseId) }); },
  });
}
