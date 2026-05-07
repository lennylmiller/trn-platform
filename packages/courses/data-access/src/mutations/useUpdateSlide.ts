import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CourseSlide, SlideUpdate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { coursesKeys } from '../keys';

export interface UpdateSlideVars { courseId: number; lessonId: number; slideId: number; updates: SlideUpdate; }

export function useUpdateSlide() {
  const qc = useQueryClient();
  return useMutation<CourseSlide, Error, UpdateSlideVars>({
    mutationFn: ({ courseId, lessonId, slideId, updates }) =>
      apiFetch<CourseSlide>(`/api/v2/courses/${courseId}/lessons/${lessonId}/slides/${slideId}`, { method: 'PUT', body: JSON.stringify(updates) }),
    onSuccess: (_d, { courseId }) => { void qc.invalidateQueries({ queryKey: coursesKeys.detail(courseId) }); },
  });
}
