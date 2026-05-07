import { useState, useCallback } from 'react';
import type { CourseSlide, CourseLesson, SlideUpdate } from '@trn-platform/shared';
import { useCourse, useUpdateSlide } from '@trn-platform/courses-data-access';

export interface CourseEditorSelection {
  lessonId: number;
  slideId?: number;
}

/**
 * Manages course editor state: data fetching, selection, and mutations.
 */
export function useCourseEditor(courseId: number | undefined) {
  const { data: course, isLoading, error } = useCourse(courseId);
  const updateSlideMutation = useUpdateSlide();
  const [selection, setSelection] = useState<CourseEditorSelection | null>(null);

  const selectLesson = useCallback((lessonId: number) => {
    setSelection({ lessonId });
  }, []);

  const selectSlide = useCallback((lessonId: number, slideId: number) => {
    setSelection({ lessonId, slideId });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  // Resolve selected objects from the course data
  const selectedLesson: CourseLesson | undefined = course?.lessons.find(
    (l) => l.lesson_id === selection?.lessonId,
  );
  const selectedSlide: CourseSlide | undefined = selectedLesson && selection?.slideId
    ? (course?.lessons
        .find((l) => l.lesson_id === selection.lessonId)
        ?.slides.find((s) => s.slide_id === selection.slideId))
    : undefined;

  const updateSlide = useCallback((slideId: number, lessonId: number, updates: SlideUpdate) => {
    if (!courseId) return;
    updateSlideMutation.mutate({ courseId, lessonId, slideId, updates });
  }, [courseId, updateSlideMutation]);

  return {
    course,
    isLoading,
    error,
    selection,
    selectedLesson,
    selectedSlide,
    selectLesson,
    selectSlide,
    clearSelection,
    updateSlide,
    isSaving: updateSlideMutation.isPending,
  };
}
