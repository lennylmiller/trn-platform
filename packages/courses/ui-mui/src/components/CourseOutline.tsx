import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
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
}: {
  slide: CourseSlide;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <ListItemButton
      selected={selected}
      onClick={onClick}
      sx={{ pl: 5, py: 0.5 }}
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
    </ListItemButton>
  );
}

function LessonGroup({
  lesson,
  selectedLessonId,
  selectedSlideId,
  onSelectLesson,
  onSelectSlide,
}: {
  lesson: CourseLessonDetail;
  selectedLessonId?: number;
  selectedSlideId?: number;
  onSelectLesson: (lessonId: number) => void;
  onSelectSlide: (lessonId: number, slideId: number) => void;
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
        sx={{ py: 0.75 }}
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
            />
          ))}
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
}: CourseOutlineProps) {
  if (lessons.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No lessons yet.
        </Typography>
      </Box>
    );
  }

  return (
    <List dense sx={{ py: 0 }}>
      {lessons.map((lesson) => (
        <LessonGroup
          key={lesson.lesson_id}
          lesson={lesson}
          selectedLessonId={selectedLessonId}
          selectedSlideId={selectedSlideId}
          onSelectLesson={onSelectLesson}
          onSelectSlide={onSelectSlide}
        />
      ))}
    </List>
  );
}
