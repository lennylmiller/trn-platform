import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArticleIcon from '@mui/icons-material/Article';
import CodeIcon from '@mui/icons-material/Code';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import QuizIcon from '@mui/icons-material/Quiz';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import type { CourseLessonDetail, CourseBlock, CourseSlide } from '@trn-platform/shared';

/**
 * Determine the display badge for a document-first slide.
 * If the content contains a component tag, use the first one's type.
 * Otherwise show "Doc".
 */
function getSlideTypeBadge(slide: CourseSlide): { label: string; color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error' } {
  const content = slide.content ?? '';
  // Check for component tags in order of specificity
  if (content.includes('<Quiz')) return { label: 'Quiz', color: 'secondary' };
  if (content.includes('<LiveDemo')) return { label: 'Demo', color: 'success' };
  if (content.includes('<SqlChallenge')) return { label: 'SQL', color: 'warning' };
  if (content.includes('<DoItInQc')) return { label: 'QC', color: 'primary' };
  if (content.includes('<Placeholder')) return { label: 'Draft', color: 'warning' };
  if (content.includes('<Image')) return { label: 'Read', color: 'default' };
  // Pure markdown narrative
  return { label: 'Read', color: 'default' };
}

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

const BLOCK_ICON_SIZE = 20;

export function getBlockTypeIcon(blockType: string): { icon: React.ReactElement; color: string; label: string } {
  switch (blockType) {
    case 'narrative': return { icon: <ArticleIcon sx={{ fontSize: BLOCK_ICON_SIZE }} />, color: '#607d8b', label: 'Narrative' };
    case 'reference': return { icon: <BookmarkIcon sx={{ fontSize: BLOCK_ICON_SIZE }} />, color: '#03a9f4', label: 'Reference' };
    case 'live_demo': return { icon: <PlayCircleIcon sx={{ fontSize: BLOCK_ICON_SIZE }} />, color: '#4caf50', label: 'Live Demo' };
    case 'sql_challenge': return { icon: <CodeIcon sx={{ fontSize: BLOCK_ICON_SIZE }} />, color: '#ff9800', label: 'SQL Challenge' };
    case 'quiz': return { icon: <QuizIcon sx={{ fontSize: BLOCK_ICON_SIZE }} />, color: '#ab47bc', label: 'Quiz' };
    case 'do_it_in_qc': return { icon: <TouchAppIcon sx={{ fontSize: BLOCK_ICON_SIZE }} />, color: '#1e88e5', label: 'Do It in QC' };
    case 'screenshot_task': return { icon: <PhotoCameraIcon sx={{ fontSize: BLOCK_ICON_SIZE }} />, color: '#ef5350', label: 'Screenshot' };
    default: return { icon: <ArticleIcon sx={{ fontSize: BLOCK_ICON_SIZE }} />, color: '#607d8b', label: blockType };
  }
}

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
      {(() => {
        const { icon, color, label } = getBlockTypeIcon(slide.block_type);
        return (
          <Tooltip title={label} placement="left" arrow>
            <Box sx={{ mr: 1.5, color, display: 'flex', alignItems: 'center' }}>
              {icon}
            </Box>
          </Tooltip>
        );
      })()}
      <ListItemText
        primary={slide.title ?? `Slide ${slide.seq + 1}`}
        slotProps={{ primary: { variant: 'body2', noWrap: true, sx: { fontSize: '0.875rem' } } }}
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
        {((lesson.slides?.some((s) => s.content) ? lesson.slides.filter((s) => s.content).length : lesson.blocks.length) > 0) && (open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />)}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {/* Show document-first slides if they have content, otherwise blocks */}
          {lesson.slides && lesson.slides.some((s) => s.content)
            ? lesson.slides.filter((s) => s.content).map((s) => {
                const badge = getSlideTypeBadge(s);
                const iconInfo = getBlockTypeIcon(
                  badge.label === 'Demo' ? 'live_demo'
                  : badge.label === 'Quiz' ? 'quiz'
                  : badge.label === 'SQL' ? 'sql_challenge'
                  : badge.label === 'QC' ? 'do_it_in_qc'
                  : badge.label === 'Draft' ? 'reference'
                  : 'narrative'
                );
                return (
                  <ListItemButton
                    key={s.slide_id}
                    selected={selectedBlockId === s.slide_id}
                    onClick={() => onSelectSlide(lesson.lesson_id, s.slide_id)}
                    sx={{ pl: 5, py: 0.5 }}
                  >
                    <Tooltip title={iconInfo.label} placement="left" arrow>
                      <Box sx={{ mr: 1.5, color: iconInfo.color, display: 'flex', alignItems: 'center' }}>
                        {iconInfo.icon}
                      </Box>
                    </Tooltip>
                    <ListItemText
                      primary={s.title ?? `Slide ${s.seq + 1}`}
                      slotProps={{ primary: { variant: 'body2', noWrap: true } }}
                    />
                  </ListItemButton>
                );
              })
            : lesson.blocks.map((slide) => (
                <SlideRow
                  key={slide.block_id}
                  slide={slide}
                  selected={selectedBlockId === slide.block_id}
                  onClick={() => onSelectSlide(lesson.lesson_id, slide.block_id)}
                  onDelete={onDeleteBlock ? () => onDeleteBlock(lesson.lesson_id, slide.block_id) : undefined}
                />
              ))
          }
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
