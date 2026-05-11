import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../client';
import { coursesKeys } from '../keys';

export interface UpdateSlideContentVars {
  courseId: number;
  slideId: number;
  content: string;
  title?: string;
}

export function useUpdateSlideContent() {
  const qc = useQueryClient();
  return useMutation<void, Error, UpdateSlideContentVars>({
    mutationFn: ({ courseId, slideId, content, title }) =>
      apiFetch<void>(`/api/v2/courses/${courseId}/slides/${slideId}`, {
        method: 'PUT',
        body: JSON.stringify({ content, title }),
      }),
    onSuccess: (_d, { courseId }) => {
      void qc.invalidateQueries({ queryKey: coursesKeys.detail(courseId) });
    },
  });
}
