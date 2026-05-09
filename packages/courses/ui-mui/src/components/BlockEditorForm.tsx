import { useState, useEffect, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import type { CourseBlock, CourseBlockUpdate, CourseBlockType, VerifyMode } from '@trn-platform/shared';

export interface BlockEditorFormProps {
  slide: CourseBlock;
  onSave: (updates: CourseBlockUpdate) => void;
  isSaving?: boolean;
}

const SLIDE_TYPES: { value: CourseBlockType; label: string }[] = [
  { value: 'narrative', label: 'Narrative' },
  { value: 'reference', label: 'Reference' },
  { value: 'live_demo', label: 'Live Demo' },
  { value: 'sql_challenge', label: 'SQL Challenge' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'do_it_in_qc', label: 'Do It in QC' },
  { value: 'screenshot_task', label: 'Screenshot Task' },
];

const VERIFY_MODES: { value: VerifyMode; label: string }[] = [
  { value: 'auto', label: 'Auto (check expected_json)' },
  { value: 'show', label: 'Show (display results)' },
];

/**
 * Editable form for a single slide. Fields shown depend on block_type.
 * Tracks local draft state and saves on explicit button click.
 */
export function BlockEditorForm({ slide, onSave, isSaving }: BlockEditorFormProps) {
  const [draft, setDraft] = useState<CourseBlockUpdate>({});
  const slideIdRef = useRef(slide.block_id);

  // Reset draft when switching slides
  useEffect(() => {
    if (slide.block_id !== slideIdRef.current) {
      setDraft({});
      slideIdRef.current = slide.block_id;
    }
  }, [slide.block_id]);

  const isDirty = Object.keys(draft).length > 0;

  // Merge draft with original slide for display
  const val = useCallback(<K extends keyof CourseBlock>(field: K): CourseBlock[K] => {
    if (field in draft) return (draft as Record<string, unknown>)[field] as CourseBlock[K];
    return slide[field];
  }, [draft, slide]);

  const set = useCallback(<K extends keyof CourseBlockUpdate>(field: K, value: CourseBlockUpdate[K]) => {
    setDraft((d) => ({ ...d, [field]: value }));
  }, []);

  const handleSave = () => {
    if (!isDirty) return;
    onSave(draft);
    setDraft({});
  };

  const slideType = (val('block_type') ?? slide.block_type) as CourseBlockType;

  const hasSQL = ['live_demo', 'sql_challenge', 'do_it_in_qc'].includes(slideType);
  const hasQuiz = slideType === 'quiz';
  const hasHints = ['sql_challenge', 'do_it_in_qc'].includes(slideType);
  const hasVerify = slideType === 'do_it_in_qc';
  const hasSeed = slideType === 'do_it_in_qc';
  const hasContent = !hasQuiz; // quiz uses quiz_question instead

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Edit Slide
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

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Stack spacing={2}>
          {/* Slide type */}
          <TextField
            select
            label="Slide Type"
            size="small"
            value={slideType}
            onChange={(e) => set('block_type', e.target.value as CourseBlockType)}
          >
            {SLIDE_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </TextField>

          {/* Title */}
          <TextField
            label="Title"
            size="small"
            value={val('title') ?? ''}
            onChange={(e) => set('title', e.target.value || null)}
          />

          {/* Content (markdown) — not for quiz */}
          {hasContent && (
            <TextField
              label="Content (Markdown)"
              size="small"
              multiline
              minRows={4}
              maxRows={12}
              value={val('content') ?? ''}
              onChange={(e) => set('content', e.target.value || null)}
            />
          )}

          {/* Image URL */}
          {(slideType === 'narrative' || slideType === 'reference') && (
            <TextField
              label="Image URL"
              size="small"
              value={val('image_url') ?? ''}
              onChange={(e) => set('image_url', e.target.value || null)}
            />
          )}

          {/* SQL fields */}
          {hasSQL && (
            <>
              <Divider><Chip label="SQL" size="small" /></Divider>
              <TextField
                label="SQL Text"
                size="small"
                multiline
                minRows={3}
                maxRows={10}
                value={val('sql_text') ?? ''}
                onChange={(e) => set('sql_text', e.target.value || null)}
                slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
              />
              <TextField
                label="SQL Label"
                size="small"
                value={val('sql_label') ?? ''}
                onChange={(e) => set('sql_label', e.target.value || null)}
              />
            </>
          )}

          {/* Quiz fields */}
          {hasQuiz && (
            <>
              <Divider><Chip label="Quiz" size="small" /></Divider>
              <TextField
                label="Question"
                size="small"
                multiline
                minRows={2}
                value={val('quiz_question') ?? ''}
                onChange={(e) => set('quiz_question', e.target.value || null)}
              />
              <QuizOptionsEditor
                options={val('quiz_options') as string[] | null}
                answer={val('quiz_answer') as number | null}
                onChangeOptions={(opts) => set('quiz_options', opts)}
                onChangeAnswer={(a) => set('quiz_answer', a)}
              />
              <TextField
                label="Explanation"
                size="small"
                multiline
                minRows={2}
                value={val('quiz_explanation') ?? ''}
                onChange={(e) => set('quiz_explanation', e.target.value || null)}
              />
            </>
          )}

          {/* Hints */}
          {hasHints && (
            <>
              <Divider><Chip label="Hints" size="small" /></Divider>
              <HintsEditor
                hints={val('hints') as string[] | null}
                onChange={(h) => set('hints', h)}
              />
            </>
          )}

          {/* Verify mode */}
          {hasVerify && (
            <TextField
              select
              label="Verify Mode"
              size="small"
              value={val('verify_mode') ?? ''}
              onChange={(e) => set('verify_mode', (e.target.value || null) as VerifyMode | null)}
            >
              <MenuItem value="">None</MenuItem>
              {VERIFY_MODES.map((m) => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </TextField>
          )}

          {/* Seed SQL */}
          {hasSeed && (
            <>
              <Divider><Chip label="Seed Data" size="small" /></Divider>
              <TextField
                label="Seed SQL"
                size="small"
                multiline
                minRows={3}
                maxRows={8}
                value={val('seed_sql') ?? ''}
                onChange={(e) => set('seed_sql', e.target.value || null)}
                slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
              />
              <TextField
                label="Seed Label"
                size="small"
                value={val('seed_label') ?? ''}
                onChange={(e) => set('seed_label', e.target.value || null)}
              />
            </>
          )}

          {/* Presenter notes — all types */}
          <Divider />
          <TextField
            label="Presenter Notes"
            size="small"
            multiline
            minRows={2}
            maxRows={6}
            value={val('presenter_notes') ?? ''}
            onChange={(e) => set('presenter_notes', e.target.value || null)}
          />
        </Stack>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function QuizOptionsEditor({
  options,
  answer,
  onChangeOptions,
  onChangeAnswer,
}: {
  options: string[] | null;
  answer: number | null;
  onChangeOptions: (opts: string[]) => void;
  onChangeAnswer: (a: number) => void;
}) {
  const opts = options ?? [];

  const updateOption = (idx: number, value: string) => {
    const next = [...opts];
    next[idx] = value;
    onChangeOptions(next);
  };

  const addOption = () => {
    onChangeOptions([...opts, '']);
  };

  const removeOption = (idx: number) => {
    const next = opts.filter((_, i) => i !== idx);
    onChangeOptions(next);
    // Adjust answer index if needed
    if (answer !== null) {
      if (idx === answer) onChangeAnswer(0);
      else if (idx < answer) onChangeAnswer(answer - 1);
    }
  };

  return (
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary">
        Options (click radio to set correct answer)
      </Typography>
      {opts.map((opt, idx) => (
        <Stack key={idx} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Chip
            label={idx === answer ? 'correct' : String.fromCharCode(65 + idx)}
            size="small"
            color={idx === answer ? 'success' : 'default'}
            onClick={() => onChangeAnswer(idx)}
            sx={{ cursor: 'pointer', minWidth: 56 }}
          />
          <TextField
            size="small"
            fullWidth
            value={opt}
            onChange={(e) => updateOption(idx, e.target.value)}
            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
          />
          <IconButton size="small" onClick={() => removeOption(idx)} disabled={opts.length <= 2}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ))}
      <Button size="small" startIcon={<AddIcon />} onClick={addOption}>
        Add Option
      </Button>
    </Stack>
  );
}

function HintsEditor({
  hints,
  onChange,
}: {
  hints: string[] | null;
  onChange: (h: string[]) => void;
}) {
  const items = hints ?? [];

  const updateHint = (idx: number, value: string) => {
    const next = [...items];
    next[idx] = value;
    onChange(next);
  };

  const addHint = () => onChange([...items, '']);

  const removeHint = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <Stack spacing={1}>
      {items.map((hint, idx) => (
        <Stack key={idx} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="caption" sx={{ minWidth: 20 }}>{idx + 1}.</Typography>
          <TextField
            size="small"
            fullWidth
            value={hint}
            onChange={(e) => updateHint(idx, e.target.value)}
            placeholder={`Hint ${idx + 1}`}
          />
          <IconButton size="small" onClick={() => removeHint(idx)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ))}
      <Button size="small" startIcon={<AddIcon />} onClick={addHint}>
        Add Hint
      </Button>
    </Stack>
  );
}
