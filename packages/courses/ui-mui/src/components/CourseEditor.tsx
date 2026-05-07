import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useCourseEditor } from '@trn-platform/courses-feature';
import { CourseOutline } from './CourseOutline';
import { SlideRenderer } from './SlideRenderer';
import type { CourseSlide, CourseLesson } from '@trn-platform/shared';

export interface CourseEditorProps {
  courseId: number;
  onExit?: () => void;
  onPreview?: () => void;
}

const STATUS_COLORS: Record<string, 'default' | 'success' | 'warning'> = {
  draft: 'warning',
  published: 'success',
  archived: 'default',
};

function SlidePropertiesPanel({ slide, lesson }: { slide: CourseSlide; lesson?: CourseLesson }) {
  const fields: { label: string; value: string | number | null | undefined }[] = [
    { label: 'Slide ID', value: slide.slide_id },
    { label: 'Type', value: slide.slide_type },
    { label: 'Seq', value: slide.seq },
    { label: 'Lesson', value: lesson?.title },
    { label: 'Title', value: slide.title },
  ];

  if (slide.sql_text) fields.push({ label: 'SQL Label', value: slide.sql_label });
  if (slide.verify_mode) fields.push({ label: 'Verify Mode', value: slide.verify_mode });
  if (slide.quiz_question) {
    fields.push({ label: 'Quiz Answer', value: slide.quiz_options?.[slide.quiz_answer ?? 0] });
    fields.push({ label: 'Options', value: `${slide.quiz_options?.length ?? 0} choices` });
  }
  if (slide.hints) fields.push({ label: 'Hints', value: `${slide.hints.length} hints` });
  if (slide.presenter_notes) fields.push({ label: 'Notes', value: 'Yes' });
  if (slide.seed_sql) fields.push({ label: 'Seed SQL', value: slide.seed_label ?? 'Yes' });

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
        Slide Properties
      </Typography>
      <Stack spacing={1}>
        {fields.map((f) => (
          <Box key={f.label}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {f.label}
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
              {f.value ?? '—'}
            </Typography>
          </Box>
        ))}
      </Stack>
      {slide.sql_text && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            SQL
          </Typography>
          <Paper variant="outlined" sx={{ p: 1, bgcolor: 'action.hover', maxHeight: 200, overflow: 'auto' }}>
            <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.7rem' }}>
              {slide.sql_text}
            </Typography>
          </Paper>
        </>
      )}
    </Box>
  );
}

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

export function CourseEditor({ courseId, onExit, onPreview }: CourseEditorProps) {
  const {
    course, isLoading, error,
    selection, selectedLesson, selectedSlide,
    selectLesson, selectSlide,
  } = useCourseEditor(courseId);

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
        {onPreview && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<PlayArrowIcon />}
            onClick={onPreview}
          >
            Preview
          </Button>
        )}
      </Stack>

      {/* 3-panel layout */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Outline */}
        <Box sx={{ width: 280, flexShrink: 0, borderRight: 1, borderColor: 'divider', overflow: 'auto', bgcolor: 'background.paper' }}>
          <CourseOutline
            lessons={course.lessons}
            selectedLessonId={selection?.lessonId}
            selectedSlideId={selection?.slideId}
            onSelectLesson={selectLesson}
            onSelectSlide={selectSlide}
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

        {/* Right: Properties */}
        <Box sx={{ width: 260, flexShrink: 0, borderLeft: 1, borderColor: 'divider', overflow: 'auto', bgcolor: 'background.paper' }}>
          {selectedSlide && selectedLesson ? (
            <SlidePropertiesPanel slide={selectedSlide} lesson={selectedLesson} />
          ) : selectedLesson ? (
            <LessonPropertiesPanel lesson={selectedLesson} />
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Select a lesson or slide to view its properties.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
