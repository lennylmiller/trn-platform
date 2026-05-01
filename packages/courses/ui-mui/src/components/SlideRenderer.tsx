import type { CourseSlide } from '@trn-platform/shared';
import { NarrativeSlide } from './slides/NarrativeSlide';
import { ReferenceSlide } from './slides/ReferenceSlide';
import { LiveDemoSlide } from './slides/LiveDemoSlide';
import { SqlChallengeSlide } from './slides/SqlChallengeSlide';
import { QuizSlide } from './slides/QuizSlide';
import { DoItInQcSlide } from './slides/DoItInQcSlide';
import { ScreenshotTaskSlide } from './slides/ScreenshotTaskSlide';

export interface SlideRendererProps {
  slide: CourseSlide;
}

/**
 * Dispatches to the correct slide component based on slide_type.
 */
export function SlideRenderer({ slide }: SlideRendererProps) {
  switch (slide.slide_type) {
    case 'narrative':
      return <NarrativeSlide slide={slide} />;
    case 'reference':
      return <ReferenceSlide slide={slide} />;
    case 'live_demo':
      return <LiveDemoSlide slide={slide} />;
    case 'sql_challenge':
      return <SqlChallengeSlide slide={slide} />;
    case 'quiz':
      return <QuizSlide slide={slide} />;
    case 'do_it_in_qc':
      return <DoItInQcSlide slide={slide} />;
    case 'screenshot_task':
      return <ScreenshotTaskSlide slide={slide} />;
    default:
      return null;
  }
}
