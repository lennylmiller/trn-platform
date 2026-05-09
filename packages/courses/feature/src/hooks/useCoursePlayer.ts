import { useState, useCallback, useMemo } from 'react';
import type { CourseBlock } from '@trn-platform/shared';
import { useCourse } from '@trn-platform/courses-data-access';

export interface FlatBlock {
  slide: CourseBlock;
  lessonTitle: string;
  lessonIndex: number;
  globalIndex: number;
}

/**
 * Manages course player navigation state.
 * Flattens lessons + slides into a linear sequence for next/prev navigation.
 */
export function useCoursePlayer(courseId: number | undefined) {
  const { data: course, isLoading, error } = useCourse(courseId);
  const [currentIndex, setCurrentIndex] = useState(0);

  const flatBlocks = useMemo((): FlatBlock[] => {
    if (!course?.lessons) return [];
    const result: FlatBlock[] = [];
    course.lessons.forEach((lesson, lessonIdx) => {
      lesson.slides.forEach((slide) => {
        result.push({
          slide,
          lessonTitle: lesson.title,
          lessonIndex: lessonIdx,
          globalIndex: result.length,
        });
      });
    });
    return result;
  }, [course?.lessons]);

  const totalBlocks = flatBlocks.length;
  const current = flatBlocks[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= totalBlocks - 1;

  const next = useCallback(() => {
    if (currentIndex < totalBlocks - 1) setCurrentIndex((i) => i + 1);
  }, [currentIndex, totalBlocks]);

  const prev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  const goTo = useCallback((index: number) => {
    if (index >= 0 && index < totalBlocks) setCurrentIndex(index);
  }, [totalBlocks]);

  const reset = useCallback(() => setCurrentIndex(0), []);

  // Lesson progress
  const lessonBreaks = useMemo(() => {
    if (!course?.lessons) return [];
    const breaks: { title: string; startIndex: number; count: number }[] = [];
    let idx = 0;
    for (const lesson of course.lessons) {
      breaks.push({ title: lesson.title, startIndex: idx, count: lesson.slides.length });
      idx += lesson.slides.length;
    }
    return breaks;
  }, [course?.lessons]);

  return {
    course,
    isLoading,
    error,
    flatBlocks,
    current,
    currentIndex,
    totalBlocks,
    isFirst,
    isLast,
    lessonBreaks,
    next,
    prev,
    goTo,
    reset,
  };
}
