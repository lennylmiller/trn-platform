import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import type { CompositionBlock, CompositionKind } from '@trn-platform/shared';

const KIND_COLORS: Record<CompositionKind, 'primary' | 'secondary' | 'warning'> = {
  story: 'primary',
  tutorial: 'secondary',
  module: 'warning',
};

export interface CompositionRunPageProps {
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
}

export function CompositionRunPage({
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
}: CompositionRunPageProps) {
  const [showNotes, setShowNotes] = useState(false);

  const progress = totalBlocks > 0 ? ((currentBlockIndex + 1) / totalBlocks) * 100 : 0;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const renderBlockContent = () => {
    if (!currentBlock) {
      return (
        <Alert severity="info">No blocks in this composition.</Alert>
      );
    }

    switch (currentBlock.block_type) {
      case 'narrative':
        return (
          <Box>
            {currentBlock.heading && (
              <Typography variant="h5" gutterBottom>
                {currentBlock.heading}
              </Typography>
            )}
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {currentBlock.content}
            </Typography>
            {currentBlock.technical_content && (
              <>
                <Divider sx={{ my: 2 }} />
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: 'grey.50',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {currentBlock.technical_content}
                </Paper>
              </>
            )}
          </Box>
        );

      case 'flow':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            {currentBlock.heading && (
              <Typography variant="h5" gutterBottom>
                {currentBlock.heading}
              </Typography>
            )}
            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                mb: 2
              }}>
              {currentBlock.flow_name ?? 'Flow'}
            </Typography>
            {currentBlock.flow_description && (
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  mb: 3
                }}>
                {currentBlock.flow_description}
              </Typography>
            )}
            {currentBlock.flow_step_count != null && (
              <Chip
                label={`${currentBlock.flow_step_count} steps`}
                sx={{ mb: 3 }}
              />
            )}
            <Box>
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<PlayArrowIcon />}
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
              <Typography variant="h5" gutterBottom>
                {currentBlock.heading}
              </Typography>
            )}
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                bgcolor: 'grey.900',
                color: 'grey.100',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap',
                borderRadius: 2,
              }}
            >
              {currentBlock.technical_content ?? currentBlock.content ?? 'No content'}
            </Paper>
          </Box>
        );

      case 'composition':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            {currentBlock.heading && (
              <Typography variant="h5" gutterBottom>
                {currentBlock.heading}
              </Typography>
            )}
            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                mb: 1
              }}>
              {currentBlock.ref_composition_title ?? 'Linked Composition'}
            </Typography>
            {currentBlock.ref_composition_kind && (
              <Chip
                label={currentBlock.ref_composition_kind}
                color={KIND_COLORS[currentBlock.ref_composition_kind]}
                sx={{ mb: 3 }}
              />
            )}
            <Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<OpenInNewIcon />}
                onClick={() =>
                  currentBlock.ref_composition_id &&
                  onDrillIn?.(currentBlock.ref_composition_id)
                }
                disabled={!currentBlock.ref_composition_id}
              >
                Open {currentBlock.ref_composition_title ?? 'Composition'}
              </Button>
            </Box>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* AppBar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          {canDrillOut && (
            <IconButton edge="start" onClick={onDrillOut} sx={{ mr: 1 }} aria-label="Back">
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }} noWrap>
            {title}
          </Typography>
          <Chip label={kind} color={KIND_COLORS[kind]} size="small" sx={{ mr: 2 }} />
          <Typography variant="body2" sx={{
            color: "text.secondary"
          }}>
            Block {currentBlockIndex + 1} of {totalBlocks}
          </Typography>
        </Toolbar>
        <LinearProgress variant="determinate" value={progress} />
      </AppBar>
      {/* Main content */}
      <Box sx={{ flexGrow: 1, p: 4, maxWidth: 800, mx: 'auto', width: '100%' }}>
        {renderBlockContent()}
      </Box>
      {/* Presenter notes */}
      {currentBlock?.presenter_notes && (
        <Box sx={{ px: 4, pb: 1 }}>
          <Button
            size="small"
            onClick={() => setShowNotes(!showNotes)}
            endIcon={showNotes ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            Presenter Notes
          </Button>
          <Collapse in={showNotes}>
            <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'warning.50' }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {currentBlock.presenter_notes}
              </Typography>
            </Paper>
          </Collapse>
        </Box>
      )}
      {/* Navigation */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} sx={{
          justifyContent: "center"
        }}>
          <Button
            variant="outlined"
            startIcon={<NavigateBeforeIcon />}
            onClick={onPrev}
            disabled={isFirst}
          >
            Previous
          </Button>
          {canDrillOut && (
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={onDrillOut}
              color="secondary"
            >
              Back
            </Button>
          )}
          <Button
            variant="contained"
            endIcon={<NavigateNextIcon />}
            onClick={onNext}
            disabled={isLast}
          >
            Next
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
