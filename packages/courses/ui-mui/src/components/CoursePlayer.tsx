import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NotesIcon from '@mui/icons-material/Notes';
import { AnimatePresence, motion } from 'framer-motion';
import { useCoursePlayer } from '@trn-platform/courses-feature';
import { BlockRenderer } from './BlockRenderer';

export interface CoursePlayerProps {
  courseId: number;
  onExit?: () => void;
}

const SLIDE_TYPE_LABELS: Record<string, string> = {
  narrative: 'Read',
  reference: 'Reference',
  live_demo: 'Live Demo',
  sql_challenge: 'Challenge',
  quiz: 'Quiz',
  do_it_in_qc: 'QC Task',
  screenshot_task: 'Screenshot',
};

export function CoursePlayer({ courseId, onExit }: CoursePlayerProps) {
  const {
    course, isLoading, current, currentIndex, totalBlocks,
    isFirst, isLast, next, prev,
  } = useCoursePlayer(courseId);

  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const progress = totalBlocks > 0 ? ((currentIndex + 1) / totalBlocks) * 100 : 0;

  // Keyboard
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    switch (e.key) {
      case 'ArrowRight': case ' ':
        e.preventDefault(); if (!isLast) next(); break;
      case 'ArrowLeft':
        e.preventDefault(); if (!isFirst) prev(); break;
      case 'n': case 'N': setShowNotes(v => !v); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case 'Escape':
        if (document.fullscreenElement) void document.exitFullscreen();
        else onExit?.();
        break;
    }
  }, [isFirst, isLast, next, prev, onExit]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen();
  };

  if (isLoading) return <LinearProgress />;
  if (!course) return <Typography sx={{ p: 4 }}>Course not found.</Typography>;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Top bar */}
      <Stack direction="row" sx={{ alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        {onExit && (
          <IconButton size="small" onClick={onExit} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
        )}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }} noWrap>
          {course.title}
        </Typography>
        {current && (
          <>
            <Chip label={current.lessonTitle} size="small" variant="outlined" sx={{ mr: 1 }} />
            <Chip label={SLIDE_TYPE_LABELS[current.slide.block_type] ?? current.slide.block_type} size="small" color="primary" sx={{ mr: 1 }} />
          </>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          {currentIndex + 1} / {totalBlocks}
        </Typography>
        <IconButton size="small" onClick={() => setShowNotes(v => !v)} title="Notes (N)">
          <NotesIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={toggleFullscreen} title="Fullscreen (F)">
          {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
        </IconButton>
      </Stack>

      <LinearProgress variant="determinate" value={progress} sx={{ height: 3 }} />

      {/* Slide content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current?.slide.block_id ?? currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}
          >
            {current ? (
              <BlockRenderer slide={current.slide} />
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
                This course has no slides yet.
              </Typography>
            )}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Presenter notes */}
      {current?.slide.presenter_notes && (
        <Collapse in={showNotes}>
          <Paper elevation={2} sx={{ mx: 2, mb: 1, p: 2, bgcolor: 'warning.50', border: 1, borderColor: 'warning.200' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
              Presenter Notes
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {current.slide.presenter_notes}
            </Typography>
          </Paper>
        </Collapse>
      )}

      {/* Navigation */}
      <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center', gap: 2, py: 1.5, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Button startIcon={<NavigateBeforeIcon />} onClick={prev} disabled={isFirst}>Prev</Button>
        <Stack direction="row" spacing={0.5}>
          {Array.from({ length: Math.min(totalBlocks, 20) }, (_, i) => (
            <Box key={i} sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: i === currentIndex ? 'primary.main' : 'divider', transition: 'background-color 0.2s' }} />
          ))}
        </Stack>
        <Button endIcon={<NavigateNextIcon />} onClick={next} disabled={isLast} variant="contained">Next</Button>
      </Stack>
    </Box>
  );
}
