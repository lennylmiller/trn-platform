import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import SaveIcon from '@mui/icons-material/Save';
import type { CourseSlide } from '@trn-platform/shared';

export interface SlideMarkdownEditorProps {
  slide: CourseSlide;
  courseId: number;
  onSaved?: () => void;
}

const INSERT_SNIPPETS = [
  { label: 'LiveDemo', tag: '<LiveDemo sql="" label="Demo" />' },
  { label: 'Quiz', tag: '<Quiz question="" options=\'["","","",""]\' answer="0" explanation="" />' },
  { label: 'Placeholder', tag: '<Placeholder type="" label="" />' },
  { label: 'Image', tag: '<Image src="" alt="" />' },
  { label: 'SqlChallenge', tag: '<SqlChallenge content="" sql="" hints=\'[]\' label="Challenge" />' },
  { label: 'DoItInQc', tag: '<DoItInQc sql="" label="Check My Work" />' },
];

export function SlideMarkdownEditor({ slide, courseId, onSaved }: SlideMarkdownEditorProps) {
  const [content, setContent] = useState(slide.content ?? '');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const slideIdRef = useRef(slide.slide_id);

  // Reset when slide changes
  useEffect(() => {
    if (slide.slide_id !== slideIdRef.current) {
      setContent(slide.content ?? '');
      setIsDirty(false);
      slideIdRef.current = slide.slide_id;
    }
  }, [slide.slide_id, slide.content]);

  const handleChange = (value: string) => {
    setContent(value);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!isDirty) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/v2/courses/${courseId}/slides/${slide.slide_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title: slide.title }),
      });
      if (res.ok) {
        setIsDirty(false);
        onSaved?.();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const insertTag = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((c) => c + '\n\n' + tag);
      setIsDirty(true);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.slice(0, start);
    const after = content.slice(end);
    const newContent = before + tag + after;
    setContent(newContent);
    setIsDirty(true);
    // Set cursor after inserted tag
    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = start + tag.length;
      textarea.focus();
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Slide Editor
        </Typography>
        <Button
          size="small"
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!isDirty || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </Stack>

      {/* Insert toolbar */}
      <Stack direction="row" spacing={0.5} sx={{ px: 2, py: 0.75, borderBottom: 1, borderColor: 'divider', flexWrap: 'wrap', gap: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5, alignSelf: 'center' }}>
          Insert:
        </Typography>
        {INSERT_SNIPPETS.map((s) => (
          <Tooltip key={s.label} title={s.tag} arrow>
            <Chip
              label={s.label}
              size="small"
              variant="outlined"
              onClick={() => insertTag(s.tag)}
              sx={{ cursor: 'pointer', fontSize: '0.7rem' }}
            />
          </Tooltip>
        ))}
      </Stack>

      {/* Markdown editor */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        <TextField
          inputRef={textareaRef}
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          multiline
          fullWidth
          minRows={20}
          slotProps={{
            input: {
              sx: {
                fontFamily: '"Cascadia Code", "Fira Code", "Consolas", monospace',
                fontSize: '0.85rem',
                lineHeight: 1.6,
              },
            },
          }}
          sx={{ '& .MuiInputBase-root': { alignItems: 'flex-start' } }}
        />
      </Box>
    </Box>
  );
}
