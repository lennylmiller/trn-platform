import { useState, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useQueryClient } from '@tanstack/react-query';
import { useCourseEditor } from '@trn-platform/courses-feature';
import { coursesKeys } from '@trn-platform/courses-data-access';
import { ChatPanel } from '@trn-platform/chat-ui-mui';
import { CourseOutline } from './CourseOutline';
import { CoursePlayer } from './CoursePlayer';
import { SlideRenderer } from './SlideRenderer';
import { SlideEditorForm } from './SlideEditorForm';
import { AddLessonDialog } from './AddLessonDialog';
import { AddSlideDialog } from './AddSlideDialog';
import type { CourseLesson, SlideType } from '@trn-platform/shared';

export interface CourseEditorProps {
  courseId: number;
  onExit?: () => void;
}

const STATUS_COLORS: Record<string, 'default' | 'success' | 'warning'> = {
  draft: 'warning',
  published: 'success',
  archived: 'default',
};

function LessonPropertiesPanel({ lesson }: { lesson: CourseLesson }) {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
        Lesson Properties
      </Typography>
      <Stack spacing={1}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Lesson ID</Typography>
          <Typography variant="body2">{lesson.lesson_id}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Title</Typography>
          <Typography variant="body2">{lesson.title}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Seq</Typography>
          <Typography variant="body2">{lesson.seq}</Typography>
        </Box>
        {lesson.description && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Description</Typography>
            <Typography variant="body2">{lesson.description}</Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export function CourseEditor({ courseId, onExit }: CourseEditorProps) {
  const {
    course, isLoading, error,
    selection, selectedLesson, selectedSlide,
    selectLesson, selectSlide,
    updateSlide, addLesson, addSlide, deleteLesson, deleteSlide,
    clearSelection, isSaving,
  } = useCourseEditor(courseId);

  const queryClient = useQueryClient();
  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [addSlideTarget, setAddSlideTarget] = useState<number | null>(null);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [chatOpen, setChatOpen] = useState(false);

  const chatContext = useMemo(() => ({ courseId }), [courseId]);
  const handleChatResponse = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: coursesKeys.detail(courseId) });
  }, [queryClient, courseId]);

  const handleClearCourse = useCallback(async () => {
    if (!window.confirm('Clear all lessons and slides from this course? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/v2/courses/${courseId}/clear`, { method: 'POST' });
      if (!res.ok) throw new Error('Clear failed');
      clearSelection();
      void queryClient.invalidateQueries({ queryKey: coursesKeys.detail(courseId) });
    } catch (err) {
      console.error('Clear course failed:', err);
    }
  }, [courseId, queryClient, clearSelection]);

  const handleDeleteCourse = useCallback(async () => {
    if (!window.confirm('Delete this entire course? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/v2/courses/${courseId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      void queryClient.invalidateQueries({ queryKey: ['courses'] });
      onExit?.();
    } catch (err) {
      console.error('Delete course failed:', err);
    }
  }, [courseId, queryClient, onExit]);

  const handleExportCourse = useCallback(async () => {
    try {
      const res = await fetch(`/api/v2/courses/${courseId}/export`);
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `course-${courseId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [courseId]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>Failed to load course: {error.message}</Alert>;
  }

  if (!course) {
    return <Typography sx={{ p: 4 }}>Course not found.</Typography>;
  }

  const handleAddLesson = (title: string, _description: string) => {
    addLesson(title);
  };

  const handleAddSlide = (slideType: SlideType, title: string) => {
    if (addSlideTarget === null) return;
    const lesson = course.lessons.find((l) => l.lesson_id === addSlideTarget);
    const seq = lesson?.slides.length ?? 0;
    addSlide(addSlideTarget, { seq, slide_type: slideType, title });
  };

  const handleDeleteLesson = (lessonId: number) => {
    const lesson = course.lessons.find((l) => l.lesson_id === lessonId);
    const slideCount = lesson?.slides.length ?? 0;
    const msg = slideCount > 0
      ? `Delete "${lesson?.title}" and its ${slideCount} slides?`
      : `Delete "${lesson?.title}"?`;
    if (window.confirm(msg)) deleteLesson(lessonId);
  };

  const handleDeleteSlide = (lessonId: number, slideId: number) => {
    const slide = course.lessons
      .find((l) => l.lesson_id === lessonId)
      ?.slides.find((s) => s.slide_id === slideId);
    if (window.confirm(`Delete slide "${slide?.title ?? 'Untitled'}"?`)) {
      deleteSlide(lessonId, slideId);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top bar */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
      >
        {onExit && (
          <Button size="small" startIcon={<ArrowBackIcon />} onClick={onExit}>
            Back
          </Button>
        )}
        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }} noWrap>
          {course.title}
        </Typography>
        <Chip
          label={course.status}
          size="small"
          color={STATUS_COLORS[course.status] ?? 'default'}
          sx={{ textTransform: 'capitalize' }}
        />
        {course.category && (
          <Chip label={course.category} size="small" variant="outlined" />
        )}
        <Typography variant="body2" color="text.secondary">
          {course.lessons.length} lessons &middot; {course.lessons.reduce((s, l) => s + l.slides.length, 0)} slides
        </Typography>
        <Button
          size="small"
          variant={chatOpen ? 'contained' : 'outlined'}
          startIcon={<SmartToyIcon />}
          onClick={() => { setChatOpen((v) => !v); if (mode === 'preview') setMode('edit'); }}
          color={chatOpen ? 'secondary' : 'primary'}
        >
          AI Author
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportCourse}
        >
          Export
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<ClearAllIcon />}
          onClick={handleClearCourse}
          color="error"
          disabled={course.lessons.length === 0}
        >
          Clear
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DeleteIcon />}
          onClick={handleDeleteCourse}
          color="error"
        >
          Delete
        </Button>
        <ButtonGroup size="small" variant="outlined">
          <Button
            startIcon={<EditIcon />}
            variant={mode === 'edit' ? 'contained' : 'outlined'}
            onClick={() => setMode('edit')}
          >
            Edit
          </Button>
          <Button
            startIcon={<PlayArrowIcon />}
            variant={mode === 'preview' ? 'contained' : 'outlined'}
            onClick={() => setMode('preview')}
          >
            Preview
          </Button>
        </ButtonGroup>
      </Stack>

      {/* Content area */}
      {mode === 'preview' ? (
        /* Full-width player preview */
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <CoursePlayer courseId={courseId} onExit={() => setMode('edit')} />
        </Box>
      ) : (
        /* 3-panel editor layout */
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left: Outline */}
          <Box sx={{ width: 280, flexShrink: 0, borderRight: 1, borderColor: 'divider', overflow: 'hidden', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
            <CourseOutline
              lessons={course.lessons}
              selectedLessonId={selection?.lessonId}
              selectedSlideId={selection?.slideId}
              onSelectLesson={selectLesson}
              onSelectSlide={selectSlide}
              onAddLesson={() => setAddLessonOpen(true)}
              onAddSlide={(lessonId) => setAddSlideTarget(lessonId)}
              onDeleteLesson={handleDeleteLesson}
              onDeleteSlide={handleDeleteSlide}
            />
          </Box>

          {/* Center: Slide preview */}
          <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.default' }}>
            {selectedSlide ? (
              <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
                <SlideRenderer slide={selectedSlide} />
              </Box>
            ) : selectedLesson ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {selectedLesson.title}
                </Typography>
                {selectedLesson.description && (
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {selectedLesson.description}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Select a slide from the outline to preview it.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body1" color="text.secondary">
                  Select a lesson or slide from the outline.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Right: Editor / Properties OR Chat */}
          {chatOpen ? (
            <Box sx={{ width: 380, flexShrink: 0, borderLeft: 1, borderColor: 'divider', overflow: 'hidden', bgcolor: 'background.paper' }}>
              <ChatPanel
                context={chatContext}
                systemPromptHint="course-authoring"
                onResponse={handleChatResponse}
                persistKey={`course-${courseId}`}
              />
            </Box>
          ) : (
            <Box sx={{ width: 360, flexShrink: 0, borderLeft: 1, borderColor: 'divider', overflow: 'hidden', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
              {selectedSlide && selection ? (
                <SlideEditorForm
                  slide={selectedSlide}
                  onSave={(updates) => updateSlide(selectedSlide.slide_id, selection.lessonId, updates)}
                  isSaving={isSaving}
                />
              ) : selectedLesson ? (
                <LessonPropertiesPanel lesson={selectedLesson} />
              ) : (
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Select a slide to edit its properties.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Dialogs */}
      <AddLessonDialog
        open={addLessonOpen}
        onClose={() => setAddLessonOpen(false)}
        onAdd={handleAddLesson}
      />
      <AddSlideDialog
        open={addSlideTarget !== null}
        onClose={() => setAddSlideTarget(null)}
        onAdd={handleAddSlide}
      />
    </Box>
  );
}
