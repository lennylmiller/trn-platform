import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import type { CourseSlide } from '@trn-platform/shared';
import { RunnableSqlBlock, MarkdownBlock } from '@trn-platform/compositions-ui-mui';

export function SqlChallengeSlide({ slide }: { slide: CourseSlide }) {
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const hints = slide.hints ?? [];

  return (
    <Box>
      {slide.title && (
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          {slide.title}
        </Typography>
      )}
      {slide.content && <MarkdownBlock content={slide.content} interactive={false} />}

      {/* Editable SQL area — starts empty for the learner */}
      <RunnableSqlBlock sql="" label="Your SQL" />

      {/* Hints */}
      {hints.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Button
            size="small"
            startIcon={<LightbulbIcon />}
            onClick={() => setHintsRevealed((h) => Math.min(h + 1, hints.length))}
            disabled={hintsRevealed >= hints.length}
          >
            {hintsRevealed >= hints.length ? 'All hints shown' : `Show hint (${hintsRevealed}/${hints.length})`}
          </Button>
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            {hints.slice(0, hintsRevealed).map((hint, i) => (
              <Chip key={i} label={hint} variant="outlined" size="small" sx={{ fontFamily: 'monospace' }} />
            ))}
          </Stack>
        </Box>
      )}

      {/* Solution toggle */}
      {slide.sql_text && (
        <Box sx={{ mt: 2 }}>
          <Button size="small" onClick={() => setShowSolution(!showSolution)}>
            {showSolution ? 'Hide Solution' : 'Show Solution'}
          </Button>
          <Collapse in={showSolution}>
            <Box sx={{ mt: 1 }}>
              <RunnableSqlBlock sql={slide.sql_text} label="Solution" />
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  );
}
