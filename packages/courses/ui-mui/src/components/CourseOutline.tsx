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
import type { CourseLessonDetail, CourseBlock } from '@trn-platform/shared';

export interface CourseOutlineProps {
  lessons: CourseLessonDetail[];
  selectedLessonId?: number;
  selectedBlockId?: number;
  onSelectLesson: (lessonId: number) => void;
  onSelectSlide: (lessonId: number, slideId: number) => void;
  onAddLesson?: () => void;
  onAddBlock?: (lessonId: number) => void;
  onDeleteLesson?: (lessonId: number) => void;
  onDeleteBlock?: (lessonId: number, slideId: number) => void;
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
  slide: CourseBlock;
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
        label={SLIDE_TYPE_SHORT[slide.block_type] ?? slide.block_type}
        size="small"
        color={SLIDE_TYPE_COLORS[slide.block_type] ?? 'default'}
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
  selectedBlockId,
  onSelectLesson,
  onSelectSlide,
  onAddBlock,
  onDeleteLesson,
  onDeleteBlock,
}: {
  lesson: CourseLessonDetail;
  selectedLessonId?: number;
  selectedBlockId?: number;
  onSelectLesson: (lessonId: number) => void;
  onSelectSlide: (lessonId: number, slideId: number) => void;
  onAddBlock?: (lessonId: number) => void;
  onDeleteLesson?: (lessonId: number) => void;
  onDeleteBlock?: (lessonId: number, slideId: number) => void;
}) {
  const isLessonSelected = selectedLessonId === lesson.lesson_id;
  const [open, setOpen] = useState(isLessonSelected || lesson.blocks.length > 0);

  const handleClick = () => {
    setOpen((v) => !v);
    onSelectLesson(lesson.lesson_id);
  };

  return (
    <>
      <ListItemButton
        selected={isLessonSelected && !selectedBlockId}
        onClick={handleClick}
        sx={{ py: 0.75, '&:hover .delete-btn': { opacity: 1 } }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          <MenuBookIcon fontSize="small" color={isLessonSelected ? 'primary' : 'action'} />
        </ListItemIcon>
        <ListItemText
          primary={lesson.title}
          secondary={`${lesson.blocks.length} slides`}
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
        {lesson.blocks.length > 0 && (open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />)}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {lesson.blocks.map((slide) => (
            <SlideRow
              key={slide.block_id}
              slide={slide}
              selected={selectedBlockId === slide.block_id}
              onClick={() => onSelectSlide(lesson.lesson_id, slide.block_id)}
              onDelete={onDeleteBlock ? () => onDeleteBlock(lesson.lesson_id, slide.block_id) : undefined}
            />
          ))}
          {onAddBlock && (
            <ListItemButton
              onClick={(e) => { e.stopPropagation(); onAddBlock(lesson.lesson_id); }}
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
  selectedBlockId,
  onSelectLesson,
  onSelectSlide,
  onAddLesson,
  onAddBlock,
  onDeleteLesson,
  onDeleteBlock,
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
            selectedBlockId={selectedBlockId}
            onSelectLesson={onSelectLesson}
            onSelectSlide={onSelectSlide}
            onAddBlock={onAddBlock}
            onDeleteLesson={onDeleteLesson}
            onDeleteBlock={onDeleteBlock}
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
