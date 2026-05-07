import { useState, useCallback } from 'react';
import type { CourseSlide, CourseLesson, SlideUpdate, SlideCreate } from '@trn-platform/shared';
import {
  useCourse, useAddLesson, useAddSlide, useUpdateSlide,
  useDeleteLesson, useDeleteSlide,
} from '@trn-platform/courses-data-access';

export interface CourseEditorSelection {
  lessonId: number;
  slideId?: number;
}

/**
 * Manages course editor state: data fetching, selection, and CRUD mutations.
 */
export function useCourseEditor(courseId: number | undefined) {
  const { data: course, isLoading, error } = useCourse(courseId);
  const addLessonMutation = useAddLesson();
  const addSlideMutation = useAddSlide();
  const updateSlideMutation = useUpdateSlide();
  const deleteLessonMutation = useDeleteLesson();
  const deleteSlideMutation = useDeleteSlide();
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

  // --- Mutations ---

  const updateSlide = useCallback((slideId: number, lessonId: number, updates: SlideUpdate) => {
    if (!courseId) return;
    updateSlideMutation.mutate({ courseId, lessonId, slideId, updates });
  }, [courseId, updateSlideMutation]);

  const addLesson = useCallback((title: string) => {
    if (!courseId) return;
    const seq = course?.lessons.length ?? 0;
    addLessonMutation.mutate({ courseId, input: { seq, title } });
  }, [courseId, course?.lessons.length, addLessonMutation]);

  const addSlide = useCallback((lessonId: number, input: SlideCreate) => {
    if (!courseId) return;
    addSlideMutation.mutate({ courseId, lessonId, input });
  }, [courseId, addSlideMutation]);

  const deleteLesson = useCallback((lessonId: number) => {
    if (!courseId) return;
    // Clear selection if deleting the selected lesson
    if (selection?.lessonId === lessonId) setSelection(null);
    deleteLessonMutation.mutate({ courseId, lessonId });
  }, [courseId, selection?.lessonId, deleteLessonMutation]);

  const deleteSlide = useCallback((lessonId: number, slideId: number) => {
    if (!courseId) return;
    // Clear selection if deleting the selected slide
    if (selection?.slideId === slideId) setSelection({ lessonId });
    deleteSlideMutation.mutate({ courseId, lessonId, slideId });
  }, [courseId, selection?.slideId, deleteSlideMutation]);

  const isSaving = updateSlideMutation.isPending
    || addLessonMutation.isPending
    || addSlideMutation.isPending
    || deleteLessonMutation.isPending
    || deleteSlideMutation.isPending;

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
    addLesson,
    addSlide,
    deleteLesson,
    deleteSlide,
    isSaving,
  };
}
