import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';
import { coursesKeys } from '../keys';

export interface DeleteBlockVars { courseId: number; lessonId: number; slideId: number; }

export function useDeleteBlock() {
  const qc = useQueryClient();
  return useMutation<void, Error, DeleteBlockVars>({
    mutationFn: ({ courseId, lessonId, slideId }) =>
      apiFetch<void>(`/api/v2/courses/${courseId}/lessons/${lessonId}/slides/${slideId}`, { method: 'DELETE' }),
    onSuccess: (_d, { courseId }) => { void qc.invalidateQueries({ queryKey: coursesKeys.detail(courseId) }); },
  });
}
