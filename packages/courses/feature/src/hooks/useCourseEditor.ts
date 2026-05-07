import { useState, useCallback } from 'react';
import type { CourseSlide, CourseLesson } from '@trn-platform/shared';
import { useCourse } from '@trn-platform/courses-data-access';

export interface CourseEditorSelection {
  lessonId: number;
  slideId?: number;
}

/**
 * Manages course editor state: data fetching + selection.
 * Grows to include mutations in later experiments.
 */
export function useCourseEditor(courseId: number | undefined) {
  const { data: course, isLoading, error } = useCourse(courseId);
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
  };
}
