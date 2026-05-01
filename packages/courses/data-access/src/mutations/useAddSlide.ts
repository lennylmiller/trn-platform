import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CourseSlide, SlideCreate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { coursesKeys } from '../keys';

export interface AddSlideVars { courseId: number; sectionId: number; input: SlideCreate; }

export function useAddSlide() {
  const qc = useQueryClient();
  return useMutation<CourseSlide, Error, AddSlideVars>({
    mutationFn: ({ courseId, sectionId, input }) =>
      apiFetch<CourseSlide>(`/api/v2/courses/${courseId}/sections/${sectionId}/slides`, { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: (_d, { courseId }) => { void qc.invalidateQueries({ queryKey: coursesKeys.detail(courseId) }); },
  });
}
