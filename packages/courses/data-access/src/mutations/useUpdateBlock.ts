import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CourseBlock, CourseBlockUpdate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { coursesKeys } from '../keys';

export interface UpdateBlockVars { courseId: number; lessonId: number; slideId: number; updates: CourseBlockUpdate; }

export function useUpdateBlock() {
  const qc = useQueryClient();
  return useMutation<CourseBlock, Error, UpdateBlockVars>({
    mutationFn: ({ courseId, lessonId, slideId, updates }) =>
      apiFetch<CourseBlock>(`/api/v2/courses/${courseId}/lessons/${lessonId}/slides/${slideId}`, { method: 'PUT', body: JSON.stringify(updates) }),
    onSuccess: (_d, { courseId }) => { void qc.invalidateQueries({ queryKey: coursesKeys.detail(courseId) }); },
  });
}
