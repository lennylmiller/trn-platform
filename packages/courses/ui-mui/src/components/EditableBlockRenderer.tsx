import { useState, useCallback, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import Collapse from '@mui/material/Collapse';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import type { CourseBlock, CourseBlockUpdate, CourseBlockType, VerifyMode } from '@trn-platform/shared';
import { MarkdownBlock, RunnableSqlBlock } from '@trn-platform/compositions-ui-mui';
import { SLIDE_TYPES, VERIFY_MODES, QuizOptionsEditor, HintsEditor } from './BlockEditorForm';
import { ImageUploadZone } from './ImageUploadZone';

// Re-import the player block components for view mode
import { NarrativeBlock } from './slides/NarrativeBlock';
import { ReferenceBlock } from './slides/ReferenceBlock';
import { LiveDemoBlock } from './slides/LiveDemoBlock';
import { SqlChallengeBlock } from './slides/SqlChallengeBlock';
import { QuizBlock } from './slides/QuizBlock';
import { DoItInQcBlock } from './slides/DoItInQcBlock';
import { ScreenshotTaskBlock } from './slides/ScreenshotTaskBlock';

export interface EditableBlockRendererProps {
  block: CourseBlock;
  onSave: (updates: CourseBlockUpdate) => void;
  isSaving?: boolean;
}

/**
 * Renders a course block identically to the player, with an Edit button
 * that toggles inline editing. The rendered view IS the editor.
 */
export function EditableBlockRenderer({ block, onSave, isSaving }: EditableBlockRendererProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<CourseBlockUpdate>({});
  const [propsOpen, setPropsOpen] = useState(false);
  const blockIdRef = useRef(block.block_id);

  // Reset when switching blocks
  useEffect(() => {
    if (block.block_id !== blockIdRef.current) {
      setEditing(false);
      setDraft({});
      setPropsOpen(false);
      blockIdRef.current = block.block_id;
    }
  }, [block.block_id]);

  const isDirty = Object.keys(draft).length > 0;

  const val = useCallback(<K extends keyof CourseBlock>(field: K): CourseBlock[K] => {
    if (field in draft) return (draft as Record<string, unknown>)[field] as CourseBlock[K];
    return block[field];
  }, [draft, block]);

  const set = useCallback(<K extends keyof CourseBlockUpdate>(field: K, value: CourseBlockUpdate[K]) => {
    setDraft((d) => ({ ...d, [field]: value }));
  }, []);

  const handleSave = () => {
    if (!isDirty) return;
    onSave(draft);
    setDraft({});
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft({});
    setEditing(false);
    setPropsOpen(false);
  };

  const slideType = (val('block_type') ?? block.block_type) as CourseBlockType;
  const hasSQL = ['live_demo', 'sql_challenge', 'do_it_in_qc'].includes(slideType);
  const hasQuiz = slideType === 'quiz';
  const hasHints = ['sql_challenge', 'do_it_in_qc'].includes(slideType);
  const hasVerify = slideType === 'do_it_in_qc';
  const hasSeed = slideType === 'do_it_in_qc';
  const hasImage = ['narrative', 'reference', 'screenshot_task'].includes(slideType);

  // ── VIEW MODE: render exactly like the player ──
  if (!editing) {
    return (
      <Box
        sx={{
          position: 'relative',
          '&:hover .edit-overlay': { opacity: 1 },
        }}
      >
        {/* Hover overlay with Edit button */}
        <Box
          className="edit-overlay"
          sx={{
            position: 'absolute', top: 8, right: 8, zIndex: 10,
            opacity: 0, transition: 'opacity 0.2s',
          }}
        >
          <Button
            size="small"
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setEditing(true)}
            sx={{ textTransform: 'none' }}
          >
            Edit
          </Button>
        </Box>

        {/* The actual rendered block — same components as the player */}
        <PlayerBlock block={block} />
      </Box>
    );
  }

  // ── EDIT MODE: inline fields that match the rendered layout ──
  return (
    <Box sx={{ border: '2px solid', borderColor: 'primary.main', borderRadius: 2, p: 0, position: 'relative' }}>
      {/* Edit toolbar */}
      <Stack direction="row" sx={{ alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.50' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', flex: 1, textTransform: 'uppercase' }}>
          Editing: {SLIDE_TYPES.find((t) => t.value === slideType)?.label ?? slideType}
        </Typography>
        <IconButton size="small" onClick={() => setPropsOpen((o) => !o)} title="Properties" sx={{ mr: 0.5 }}>
          <SettingsIcon fontSize="small" />
        </IconButton>
        <Button size="small" onClick={handleCancel} startIcon={<CloseIcon />} sx={{ mr: 0.5, textTransform: 'none' }}>
          Cancel
        </Button>
        <Button size="small" variant="contained" onClick={handleSave} startIcon={<SaveIcon />} disabled={!isDirty || isSaving} sx={{ textTransform: 'none' }}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </Stack>

      {/* Collapsible properties drawer */}
      <Collapse in={propsOpen}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Stack spacing={1.5}>
            <TextField select label="Block Type" size="small" value={slideType} onChange={(e) => set('block_type', e.target.value as CourseBlockType)}>
              {SLIDE_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </TextField>
            {hasVerify && (
              <TextField select label="Verify Mode" size="small" value={val('verify_mode') ?? ''} onChange={(e) => set('verify_mode', (e.target.value || null) as VerifyMode | null)}>
                <MenuItem value="">None</MenuItem>
                {VERIFY_MODES.map((m) => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
              </TextField>
            )}
            {hasSeed && (
              <>
                <Divider><Chip label="Seed Data" size="small" /></Divider>
                <TextField label="Seed SQL" size="small" multiline minRows={2} maxRows={4} value={val('seed_sql') ?? ''} onChange={(e) => set('seed_sql', e.target.value || null)} slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }} />
                <TextField label="Seed Label" size="small" value={val('seed_label') ?? ''} onChange={(e) => set('seed_label', e.target.value || null)} />
              </>
            )}
            <TextField label="Presenter Notes" size="small" multiline minRows={2} maxRows={3} value={val('presenter_notes') ?? ''} onChange={(e) => set('presenter_notes', e.target.value || null)} />
          </Stack>
        </Box>
      </Collapse>

      {/* Inline editing fields — laid out to match the rendered block */}
      <Box sx={{ p: 3 }}>
        {/* Title */}
        <TextField
          fullWidth
          variant="standard"
          placeholder="Slide title"
          value={val('title') ?? ''}
          onChange={(e) => set('title', e.target.value || null)}
          slotProps={{ input: { sx: { fontSize: '1.5rem', fontWeight: 700, mb: 2 }, disableUnderline: !isDirty } }}
        />

        {/* Image (for narrative/reference/screenshot) */}
        {hasImage && (
          <Box sx={{ my: 2 }}>
            {val('image_url') ? (
              <Box sx={{ position: 'relative' }}>
                <Box component="img" src={val('image_url') as string} alt={val('title') as string ?? ''} sx={{ maxWidth: '100%', borderRadius: 1 }} />
                <TextField fullWidth size="small" label="Image URL" value={val('image_url') ?? ''} onChange={(e) => set('image_url', e.target.value || null)} sx={{ mt: 1 }} />
              </Box>
            ) : (
              <ImageUploadZone currentUrl={null} onUpload={(url) => set('image_url', url)} />
            )}
          </Box>
        )}

        {/* Content (narrative markdown) — not for quiz */}
        {!hasQuiz && (
          <TextField
            fullWidth
            multiline
            variant="outlined"
            label="Content (Markdown)"
            minRows={3}
            maxRows={12}
            value={val('content') ?? ''}
            onChange={(e) => set('content', e.target.value || null)}
            sx={{ mb: 2 }}
          />
        )}

        {/* SQL fields */}
        {hasSQL && (
          <Box sx={{ my: 2 }}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={10}
              label={`SQL — ${val('sql_label') ?? 'Query'}`}
              value={val('sql_text') ?? ''}
              onChange={(e) => set('sql_text', e.target.value || null)}
              slotProps={{ input: { sx: { fontFamily: '"Cascadia Code", "Fira Code", monospace', fontSize: '0.85rem', bgcolor: '#1e1e1e', color: '#e0e0e0', borderRadius: 1 } } }}
            />
            <TextField fullWidth size="small" label="SQL Label" value={val('sql_label') ?? ''} onChange={(e) => set('sql_label', e.target.value || null)} sx={{ mt: 1 }} />
          </Box>
        )}

        {/* Quiz fields */}
        {hasQuiz && (
          <Box sx={{ my: 2 }}>
            <TextField fullWidth multiline minRows={2} label="Question" value={val('quiz_question') ?? ''} onChange={(e) => set('quiz_question', e.target.value || null)} sx={{ mb: 2 }} />
            <QuizOptionsEditor
              options={val('quiz_options') as string[] | null}
              answer={val('quiz_answer') as number | null}
              onChangeOptions={(opts) => set('quiz_options', opts)}
              onChangeAnswer={(a) => set('quiz_answer', a)}
            />
            <TextField fullWidth multiline minRows={2} label="Explanation" value={val('quiz_explanation') ?? ''} onChange={(e) => set('quiz_explanation', e.target.value || null)} sx={{ mt: 2 }} />
          </Box>
        )}

        {/* Hints */}
        {hasHints && (
          <Box sx={{ my: 2 }}>
            <Divider><Chip label="Hints" size="small" /></Divider>
            <Box sx={{ mt: 1 }}>
              <HintsEditor hints={val('hints') as string[] | null} onChange={(h) => set('hints', h)} />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// PlayerBlock — dispatches to the existing read-only block components
// ---------------------------------------------------------------------------

function PlayerBlock({ block }: { block: CourseBlock }) {
  switch (block.block_type) {
    case 'narrative': return <NarrativeBlock slide={block} />;
    case 'reference': return <ReferenceBlock slide={block} />;
    case 'live_demo': return <LiveDemoBlock slide={block} />;
    case 'sql_challenge': return <SqlChallengeBlock slide={block} />;
    case 'quiz': return <QuizBlock slide={block} />;
    case 'do_it_in_qc': return <DoItInQcBlock slide={block} />;
    case 'screenshot_task': return <ScreenshotTaskBlock slide={block} />;
    default: return null;
  }
}
