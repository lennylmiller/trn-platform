import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import type { CourseLessonDetail, CourseSlide } from '@trn-platform/shared';

export interface CourseOutlineProps {
  lessons: CourseLessonDetail[];
  selectedLessonId?: number;
  selectedSlideId?: number;
  onSelectLesson: (lessonId: number) => void;
  onSelectSlide: (lessonId: number, slideId: number) => void;
  onAddLesson?: () => void;
  onAddSlide?: (lessonId: number) => void;
  onDeleteLesson?: (lessonId: number) => void;
  onDeleteSlide?: (lessonId: number, slideId: number) => void;
}

const SLIDE_TYPE_COLORS: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error' | 'default'> = {
  narrative: 'default',
  reference: 'info',
  live_demo: 'success',
  sql_challenge: 'warning',
  quiz: 'secondary',
  do_it_in_qc: 'primary',
  screenshot_task: 'error',
};

const SLIDE_TYPE_SHORT: Record<string, string> = {
  narrative: 'Read',
  reference: 'Ref',
  live_demo: 'Demo',
  sql_challenge: 'SQL',
  quiz: 'Quiz',
  do_it_in_qc: 'QC',
  screenshot_task: 'Shot',
};

function SlideRow({
  slide,
  selected,
  onClick,
  onDelete,
}: {
  slide: CourseSlide;
  selected: boolean;
  onClick: () => void;
  onDelete?: () => void;
}) {
  return (
    <ListItemButton
      selected={selected}
      onClick={onClick}
      sx={{ pl: 5, py: 0.5, '&:hover .delete-btn': { opacity: 1 } }}
    >
      <Chip
        label={SLIDE_TYPE_SHORT[slide.slide_type] ?? slide.slide_type}
        size="small"
        color={SLIDE_TYPE_COLORS[slide.slide_type] ?? 'default'}
        sx={{ mr: 1.5, minWidth: 44, fontSize: '0.7rem' }}
      />
      <ListItemText
        primary={slide.title ?? `Slide ${slide.seq + 1}`}
        slotProps={{ primary: { variant: 'body2', noWrap: true } }}
      />
      {onDelete && (
        <IconButton
          className="delete-btn"
          size="small"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          sx={{ opacity: 0, transition: 'opacity 0.15s', ml: 0.5 }}
        >
          <DeleteIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}
    </ListItemButton>
  );
}

function LessonGroup({
  lesson,
  selectedLessonId,
  selectedSlideId,
  onSelectLesson,
  onSelectSlide,
  onAddSlide,
  onDeleteLesson,
  onDeleteSlide,
}: {
  lesson: CourseLessonDetail;
  selectedLessonId?: number;
  selectedSlideId?: number;
  onSelectLesson: (lessonId: number) => void;
  onSelectSlide: (lessonId: number, slideId: number) => void;
  onAddSlide?: (lessonId: number) => void;
  onDeleteLesson?: (lessonId: number) => void;
  onDeleteSlide?: (lessonId: number, slideId: number) => void;
}) {
  const isLessonSelected = selectedLessonId === lesson.lesson_id;
  const [open, setOpen] = useState(isLessonSelected || lesson.slides.length > 0);

  const handleClick = () => {
    setOpen((v) => !v);
    onSelectLesson(lesson.lesson_id);
  };

  return (
    <>
      <ListItemButton
        selected={isLessonSelected && !selectedSlideId}
        onClick={handleClick}
        sx={{ py: 0.75, '&:hover .delete-btn': { opacity: 1 } }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          <MenuBookIcon fontSize="small" color={isLessonSelected ? 'primary' : 'action'} />
        </ListItemIcon>
        <ListItemText
          primary={lesson.title}
          secondary={`${lesson.slides.length} slides`}
          slotProps={{
            primary: { variant: 'body2', sx: { fontWeight: 600 }, noWrap: true },
            secondary: { variant: 'caption' },
          }}
        />
        {onDeleteLesson && (
          <IconButton
            className="delete-btn"
            size="small"
            onClick={(e) => { e.stopPropagation(); onDeleteLesson(lesson.lesson_id); }}
            sx={{ opacity: 0, transition: 'opacity 0.15s', mr: 0.5 }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
        {lesson.slides.length > 0 && (open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />)}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {lesson.slides.map((slide) => (
            <SlideRow
              key={slide.slide_id}
              slide={slide}
              selected={selectedSlideId === slide.slide_id}
              onClick={() => onSelectSlide(lesson.lesson_id, slide.slide_id)}
              onDelete={onDeleteSlide ? () => onDeleteSlide(lesson.lesson_id, slide.slide_id) : undefined}
            />
          ))}
          {onAddSlide && (
            <ListItemButton
              onClick={(e) => { e.stopPropagation(); onAddSlide(lesson.lesson_id); }}
              sx={{ pl: 5, py: 0.5, color: 'text.secondary' }}
            >
              <AddIcon sx={{ fontSize: 16, mr: 1 }} />
              <Typography variant="caption">Add slide</Typography>
            </ListItemButton>
          )}
        </List>
      </Collapse>
    </>
  );
}

export function CourseOutline({
  lessons,
  selectedLessonId,
  selectedSlideId,
  onSelectLesson,
  onSelectSlide,
  onAddLesson,
  onAddSlide,
  onDeleteLesson,
  onDeleteSlide,
}: CourseOutlineProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <List dense sx={{ py: 0, flex: 1, overflow: 'auto' }}>
        {lessons.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No lessons yet.
            </Typography>
          </Box>
        )}
        {lessons.map((lesson) => (
          <LessonGroup
            key={lesson.lesson_id}
            lesson={lesson}
            selectedLessonId={selectedLessonId}
            selectedSlideId={selectedSlideId}
            onSelectLesson={onSelectLesson}
            onSelectSlide={onSelectSlide}
            onAddSlide={onAddSlide}
            onDeleteLesson={onDeleteLesson}
            onDeleteSlide={onDeleteSlide}
          />
        ))}
      </List>
      {onAddLesson && (
        <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
          <Button
            fullWidth
            size="small"
            startIcon={<AddIcon />}
            onClick={onAddLesson}
          >
            Add Lesson
          </Button>
        </Box>
      )}
    </Box>
  );
}
