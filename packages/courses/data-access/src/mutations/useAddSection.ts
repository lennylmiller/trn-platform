import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CourseSection, SectionCreate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { coursesKeys } from '../keys';

export interface AddSectionVars { courseId: number; input: SectionCreate; }

export function useAddSection() {
  const qc = useQueryClient();
  return useMutation<CourseSection, Error, AddSectionVars>({
    mutationFn: ({ courseId, input }) =>
      apiFetch<CourseSection>(`/api/v2/courses/${courseId}/sections`, { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: (_d, { courseId }) => { void qc.invalidateQueries({ queryKey: coursesKeys.detail(courseId) }); },
  });
}
