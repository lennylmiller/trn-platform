import { useState, useCallback, useMemo } from 'react';
import type { CourseBlock, CourseSlide } from '@trn-platform/shared';
import { useCourse } from '@trn-platform/courses-data-access';

/**
 * A player screen — either a composed slide (with layout + elements)
 * or a single block (backwards compat for courses without slides).
 */
export interface PlayerScreen {
  /** The slide container, if this course uses slides */
  slide?: CourseSlide;
  /** For backwards compat: single block when no slides exist */
  block?: CourseBlock;
  /** Resolved blocks for this screen (from slide elements or single block) */
  blocks: CourseBlock[];
  /** Images in this screen (from slide elements) */
  images: { url: string; alt?: string | null }[];
  /** Layout hint */
  layout: 'full' | 'side-by-side' | 'image-left' | 'image-right';
  /** Lesson info */
  lessonTitle: string;
  lessonIndex: number;
  /** Notes (from slide or block) */
  notes?: string | null;
  /** Global position */
  globalIndex: number;
}

/**
 * Manages course player navigation state.
 * Uses slides when available, falls back to one-block-per-screen.
 */
export function useCoursePlayer(courseId: number | undefined, initialBlockId?: number) {
  const { data: course, isLoading, error } = useCourse(courseId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [initialApplied, setInitialApplied] = useState(false);

  // Build a flat list of all blocks keyed by block_id for element resolution
  const blockMap = useMemo(() => {
    if (!course?.lessons) return new Map<number, CourseBlock>();
    const map = new Map<number, CourseBlock>();
    for (const lesson of course.lessons) {
      for (const block of lesson.blocks) {
        map.set(block.block_id, block);
      }
    }
    return map;
  }, [course?.lessons]);

  const screens = useMemo((): PlayerScreen[] => {
    if (!course?.lessons) return [];
    const result: PlayerScreen[] = [];

    course.lessons.forEach((lesson, lessonIdx) => {
      const hasSlides = lesson.slides && lesson.slides.length > 0;

      if (hasSlides) {
        // Compose screens from slides
        for (const slide of lesson.slides!) {
          const blocks: CourseBlock[] = [];
          const images: { url: string; alt?: string | null }[] = [];

          for (const el of slide.elements ?? []) {
            if (el.element_type === 'block' && el.block_id) {
              const block = blockMap.get(el.block_id);
              if (block) blocks.push(block);
            } else if (el.element_type === 'image' && el.image_url) {
              images.push({ url: el.image_url, alt: el.image_alt });
            }
          }

          result.push({
            slide,
            blocks,
            images,
            layout: slide.layout as PlayerScreen['layout'],
            lessonTitle: lesson.title,
            lessonIndex: lessonIdx,
            notes: slide.notes,
            globalIndex: result.length,
          });
        }
      } else {
        // Backwards compat: one block = one screen
        for (const block of lesson.blocks) {
          result.push({
            block,
            blocks: [block],
            images: block.image_url ? [{ url: block.image_url, alt: block.title }] : [],
            layout: 'full',
            lessonTitle: lesson.title,
            lessonIndex: lessonIdx,
            notes: block.presenter_notes,
            globalIndex: result.length,
          });
        }
      }
    });

    return result;
  }, [course?.lessons, blockMap]);

  // Jump to the screen containing initialBlockId on first load
  if (!initialApplied && initialBlockId && screens.length > 0) {
    const idx = screens.findIndex((s) =>
      s.block?.block_id === initialBlockId ||
      s.blocks.some((b) => b.block_id === initialBlockId),
    );
    if (idx >= 0) setCurrentIndex(idx);
    setInitialApplied(true);
  }

  const totalScreens = screens.length;
  const current = screens[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= totalScreens - 1;

  const next = useCallback(() => {
    if (currentIndex < totalScreens - 1) setCurrentIndex((i) => i + 1);
  }, [currentIndex, totalScreens]);

  const prev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  const goTo = useCallback((index: number) => {
    if (index >= 0 && index < totalScreens) setCurrentIndex(index);
  }, [totalScreens]);

  const reset = useCallback(() => setCurrentIndex(0), []);

  // Lesson progress
  const lessonBreaks = useMemo(() => {
    if (!screens.length) return [];
    const breaks: { title: string; startIndex: number; count: number }[] = [];
    let currentLesson = -1;
    for (const screen of screens) {
      if (screen.lessonIndex !== currentLesson) {
        breaks.push({ title: screen.lessonTitle, startIndex: screen.globalIndex, count: 0 });
        currentLesson = screen.lessonIndex;
      }
      breaks[breaks.length - 1]!.count++;
    }
    return breaks;
  }, [screens]);

  return {
    course,
    isLoading,
    error,
    screens,
    current,
    currentIndex,
    totalScreens,
    isFirst,
    isLast,
    lessonBreaks,
    next,
    prev,
    goTo,
    reset,
  };
}
