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
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { AnimatePresence, motion } from 'framer-motion';
import type { CompositionBlock, CompositionKind } from '@trn-platform/shared';
import { MarkdownBlock } from './MarkdownBlock';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TrainingPlayerProps {
  title: string;
  kind: CompositionKind;
  currentBlock: CompositionBlock | undefined;
  currentBlockIndex: number;
  totalBlocks: number;
  isFirst: boolean;
  isLast: boolean;
  canDrillOut: boolean;
  isLoading?: boolean;
  onNext: () => void;
  onPrev: () => void;
  onDrillIn?: (compositionId: number) => void;
  onDrillOut?: () => void;
  onRunFlow?: (flowId: number) => void;
  onExit?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Interactive training player — fullscreen frame-by-frame presentation
 * of a composition with markdown rendering, runnable SQL, keyboard nav,
 * and smooth transitions.
 */
export function TrainingPlayer({
  title,
  kind,
  currentBlock,
  currentBlockIndex,
  totalBlocks,
  isFirst,
  isLast,
  canDrillOut,
  isLoading,
  onNext,
  onPrev,
  onDrillIn,
  onDrillOut,
  onRunFlow,
  onExit,
}: TrainingPlayerProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const progress = totalBlocks > 0 ? ((currentBlockIndex + 1) / totalBlocks) * 100 : 0;

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't capture when typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          if (!isLast) onNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (!isFirst) onPrev();
          break;
        case 'n':
        case 'N':
          setShowNotes((v) => !v);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            void document.exitFullscreen?.();
          } else if (canDrillOut) {
            onDrillOut?.();
          } else {
            onExit?.();
          }
          break;
      }
    },
    [isFirst, isLast, isFullscreen, canDrillOut, onNext, onPrev, onDrillOut, onExit],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Fullscreen
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  };

  // Frame content
  const renderFrame = () => {
    if (!currentBlock) {
      return (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
          No content in this composition.
        </Typography>
      );
    }

    switch (currentBlock.block_type) {
      case 'narrative':
        return (
          <Box>
            {currentBlock.heading && (
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                {currentBlock.heading}
              </Typography>
            )}
            {currentBlock.content && (
              <MarkdownBlock content={currentBlock.content} interactive />
            )}
            {currentBlock.technical_content && (
              <Box sx={{ mt: 3 }}>
                <Chip label="Technical Details" size="small" sx={{ mb: 1 }} />
                <MarkdownBlock content={currentBlock.technical_content} interactive />
              </Box>
            )}
          </Box>
        );

      case 'flow':
        return (
          <Box>
            {currentBlock.heading && (
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {currentBlock.heading}
              </Typography>
            )}
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              {currentBlock.flow_name ?? 'Flow'}
              {currentBlock.flow_step_count != null && (
                <Chip label={`${currentBlock.flow_step_count} steps`} size="small" sx={{ ml: 1 }} />
              )}
            </Typography>
            {currentBlock.flow_description && (
              <Typography variant="body1" sx={{ mb: 3 }}>
                {currentBlock.flow_description}
              </Typography>
            )}
            {currentBlock.content && (
              <MarkdownBlock content={currentBlock.content} interactive />
            )}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                onClick={() => currentBlock.flow_id && onRunFlow?.(currentBlock.flow_id)}
                disabled={!currentBlock.flow_id}
              >
                Run Flow
              </Button>
            </Box>
          </Box>
        );

      case 'note':
        return (
          <Box>
            {currentBlock.heading && (
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                {currentBlock.heading}
              </Typography>
            )}
            <MarkdownBlock
              content={currentBlock.technical_content ?? currentBlock.content ?? ''}
              interactive
            />
          </Box>
        );

      case 'composition':
        return (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            {currentBlock.heading && (
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                {currentBlock.heading}
              </Typography>
            )}
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              {currentBlock.ref_composition_title ?? 'Linked Composition'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<OpenInNewIcon />}
              onClick={() =>
                currentBlock.ref_composition_id && onDrillIn?.(currentBlock.ref_composition_id)
              }
              disabled={!currentBlock.ref_composition_id}
            >
              Open {currentBlock.ref_composition_title ?? 'Composition'}
            </Button>
          </Box>
        );
    }
  };

  if (isLoading) {
    return <LinearProgress />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* Top bar */}
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        {canDrillOut ? (
          <IconButton size="small" onClick={onDrillOut} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        ) : onExit ? (
          <IconButton size="small" onClick={onExit} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        ) : null}

        <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }} noWrap>
          {title}
        </Typography>
        <Chip label={kind} size="small" sx={{ mr: 1, textTransform: 'capitalize' }} />

        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          {currentBlockIndex + 1} / {totalBlocks}
        </Typography>

        <IconButton size="small" onClick={() => setShowNotes((v) => !v)} title="Presenter Notes (N)">
          <NotesIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={toggleFullscreen} title="Fullscreen (F)">
          {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
        </IconButton>
      </Stack>

      <LinearProgress variant="determinate" value={progress} sx={{ height: 3 }} />

      {/* Frame content with animation */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentBlock?.block_id ?? 'empty'}-${currentBlockIndex}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}
          >
            {renderFrame()}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Presenter notes */}
      {currentBlock?.presenter_notes && (
        <Collapse in={showNotes}>
          <Paper
            elevation={2}
            sx={{
              mx: 2,
              mb: 1,
              p: 2,
              bgcolor: 'warning.50',
              border: 1,
              borderColor: 'warning.200',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
              Presenter Notes
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {currentBlock.presenter_notes}
            </Typography>
          </Paper>
        </Collapse>
      )}

      {/* Navigation */}
      <Stack
        direction="row"
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          py: 1.5,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Button
          startIcon={<NavigateBeforeIcon />}
          onClick={onPrev}
          disabled={isFirst}
        >
          Prev
        </Button>

        {/* Dot indicators */}
        <Stack direction="row" spacing={0.5}>
          {Array.from({ length: Math.min(totalBlocks, 20) }, (_, i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: i === currentBlockIndex ? 'primary.main' : 'divider',
                transition: 'background-color 0.2s',
              }}
            />
          ))}
        </Stack>

        <Button
          endIcon={<NavigateNextIcon />}
          onClick={onNext}
          disabled={isLast}
          variant="contained"
        >
          Next
        </Button>
      </Stack>
    </Box>
  );
}
