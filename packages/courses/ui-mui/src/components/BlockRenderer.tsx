import type { CourseBlock } from '@trn-platform/shared';
import { NarrativeBlock } from './slides/NarrativeBlock';
import { ReferenceBlock } from './slides/ReferenceBlock';
import { LiveDemoBlock } from './slides/LiveDemoBlock';
import { SqlChallengeBlock } from './slides/SqlChallengeBlock';
import { QuizBlock } from './slides/QuizBlock';
import { DoItInQcBlock } from './slides/DoItInQcBlock';
import { ScreenshotTaskBlock } from './slides/ScreenshotTaskBlock';

export interface BlockRendererProps {
  slide: CourseBlock;
}

/**
 * Dispatches to the correct slide component based on block_type.
 */
export function BlockRenderer({ slide }: BlockRendererProps) {
  switch (slide.block_type) {
    case 'narrative':
      return <NarrativeBlock slide={slide} />;
    case 'reference':
      return <ReferenceBlock slide={slide} />;
    case 'live_demo':
      return <LiveDemoBlock slide={slide} />;
    case 'sql_challenge':
      return <SqlChallengeBlock slide={slide} />;
    case 'quiz':
      return <QuizBlock slide={slide} />;
    case 'do_it_in_qc':
      return <DoItInQcBlock slide={slide} />;
    case 'screenshot_task':
      return <ScreenshotTaskBlock slide={slide} />;
    default:
      return null;
  }
}
