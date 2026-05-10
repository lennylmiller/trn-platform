import { useState, useCallback } from 'react';
import type { CourseBlock, CourseLesson, CourseSlide, CourseBlockUpdate, CourseBlockCreate } from '@trn-platform/shared';
import {
  useCourse, useAddLesson, useAddBlock, useUpdateBlock,
  useDeleteLesson, useDeleteBlock,
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
  const addBlockMutation = useAddBlock();
  const updateBlockMutation = useUpdateBlock();
  const deleteLessonMutation = useDeleteLesson();
  const deleteBlockMutation = useDeleteBlock();
  const [selection, setSelection] = useState<CourseEditorSelection | null>(null);

  const selectLesson = useCallback((lessonId: number) => {
    setSelection({ lessonId });
  }, []);

  const selectBlock = useCallback((lessonId: number, slideId: number) => {
    setSelection({ lessonId, slideId });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  // Resolve selected objects from the course data
  const selectedLesson: CourseLesson | undefined = course?.lessons.find(
    (l) => l.lesson_id === selection?.lessonId,
  );
  const selectedBlock: CourseBlock | undefined = selectedLesson && selection?.slideId
    ? (course?.lessons
        .find((l) => l.lesson_id === selection.lessonId)
        ?.blocks.find((s) => s.block_id === selection.slideId))
    : undefined;

  // Also try to resolve as a slide (document-first model)
  const selectedSlide: CourseSlide | undefined = selection?.slideId
    ? (course?.lessons
        .find((l) => l.lesson_id === selection.lessonId)
        ?.slides?.find((s) => s.slide_id === selection.slideId))
    : undefined;

  // --- Mutations ---

  const updateBlock = useCallback((slideId: number, lessonId: number, updates: CourseBlockUpdate) => {
    if (!courseId) return;
    updateBlockMutation.mutate({ courseId, lessonId, slideId, updates });
  }, [courseId, updateBlockMutation]);

  const addLesson = useCallback((title: string) => {
    if (!courseId) return;
    const seq = course?.lessons.length ?? 0;
    addLessonMutation.mutate({ courseId, input: { seq, title } });
  }, [courseId, course?.lessons.length, addLessonMutation]);

  const addBlock = useCallback((lessonId: number, input: CourseBlockCreate) => {
    if (!courseId) return;
    addBlockMutation.mutate({ courseId, lessonId, input });
  }, [courseId, addBlockMutation]);

  const deleteLesson = useCallback((lessonId: number) => {
    if (!courseId) return;
    // Clear selection if deleting the selected lesson
    if (selection?.lessonId === lessonId) setSelection(null);
    deleteLessonMutation.mutate({ courseId, lessonId });
  }, [courseId, selection?.lessonId, deleteLessonMutation]);

  const deleteBlock = useCallback((lessonId: number, slideId: number) => {
    if (!courseId) return;
    // Clear selection if deleting the selected slide
    if (selection?.slideId === slideId) setSelection({ lessonId });
    deleteBlockMutation.mutate({ courseId, lessonId, slideId });
  }, [courseId, selection?.slideId, deleteBlockMutation]);

  const isSaving = updateBlockMutation.isPending
    || addLessonMutation.isPending
    || addBlockMutation.isPending
    || deleteLessonMutation.isPending
    || deleteBlockMutation.isPending;

  return {
    course,
    isLoading,
    error,
    selection,
    selectedLesson,
    selectedBlock,
    selectedSlide,
    selectLesson,
    selectBlock,
    clearSelection,
    updateBlock,
    addLesson,
    addBlock,
    deleteLesson,
    deleteBlock,
    isSaving,
  };
}
