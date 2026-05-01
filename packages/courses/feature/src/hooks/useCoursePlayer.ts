import { useState, useCallback, useMemo } from 'react';
import type { CourseSlide } from '@trn-platform/shared';
import { useCourse } from '@trn-platform/courses-data-access';

export interface FlatSlide {
  slide: CourseSlide;
  sectionTitle: string;
  sectionIndex: number;
  globalIndex: number;
}

/**
 * Manages course player navigation state.
 * Flattens sections + slides into a linear sequence for next/prev navigation.
 */
export function useCoursePlayer(courseId: number | undefined) {
  const { data: course, isLoading, error } = useCourse(courseId);
  const [currentIndex, setCurrentIndex] = useState(0);

  const flatSlides = useMemo((): FlatSlide[] => {
    if (!course?.sections) return [];
    const result: FlatSlide[] = [];
    course.sections.forEach((section, sectionIdx) => {
      section.slides.forEach((slide) => {
        result.push({
          slide,
          sectionTitle: section.title,
          sectionIndex: sectionIdx,
          globalIndex: result.length,
        });
      });
    });
    return result;
  }, [course?.sections]);

  const totalSlides = flatSlides.length;
  const current = flatSlides[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= totalSlides - 1;

  const next = useCallback(() => {
    if (currentIndex < totalSlides - 1) setCurrentIndex((i) => i + 1);
  }, [currentIndex, totalSlides]);

  const prev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  const goTo = useCallback((index: number) => {
    if (index >= 0 && index < totalSlides) setCurrentIndex(index);
  }, [totalSlides]);

  const reset = useCallback(() => setCurrentIndex(0), []);

  // Section progress
  const sectionBreaks = useMemo(() => {
    if (!course?.sections) return [];
    const breaks: { title: string; startIndex: number; count: number }[] = [];
    let idx = 0;
    for (const section of course.sections) {
      breaks.push({ title: section.title, startIndex: idx, count: section.slides.length });
      idx += section.slides.length;
    }
    return breaks;
  }, [course?.sections]);

  return {
    course,
    isLoading,
    error,
    flatSlides,
    current,
    currentIndex,
    totalSlides,
    isFirst,
    isLast,
    sectionBreaks,
    next,
    prev,
    goTo,
    reset,
  };
}
