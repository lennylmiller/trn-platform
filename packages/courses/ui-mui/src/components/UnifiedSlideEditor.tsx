import { useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  MDXEditor,
  type MDXEditorMethods,
  jsxPlugin,
  toolbarPlugin,
  diffSourcePlugin,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  markdownShortcutPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  DiffSourceToggleWrapper,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import type { CourseBlock, CourseSlide, CourseBlockUpdate, CourseBlockType, VerifyMode } from '@trn-platform/shared';
import { jsxComponentDescriptors } from './mdxConfig';
import { SLIDE_TYPES, VERIFY_MODES, QuizOptionsEditor, HintsEditor } from './BlockEditorForm';
import { ImageUploadZone } from './ImageUploadZone';

export interface UnifiedSlideEditorProps {
  block: CourseBlock | undefined;
  slide: CourseSlide | undefined;
  courseId: number;
  lessonId: number;
  onSaveBlock?: (blockId: number, lessonId: number, updates: CourseBlockUpdate) => void;
  onSaveSlideContent?: (slideId: number, content: string, title?: string) => void;
  isSaving?: boolean;
}

export function UnifiedSlideEditor({
  block,
  slide,
  courseId,
  lessonId,
  onSaveBlock,
  onSaveSlideContent,
  isSaving,
}: UnifiedSlideEditorProps) {
  const editorRef = useRef<MDXEditorMethods>(null);
  const currentIdRef = useRef(slide?.slide_id ?? block?.block_id);
  const markdownDirtyRef = useRef(false);

  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [propertyDraft, setPropertyDraft] = useState<CourseBlockUpdate>({});

  const itemId = slide?.slide_id ?? block?.block_id;
  const title = slide?.title ?? block?.title ?? 'Untitled';
  const initialMarkdown = slide?.content ?? block?.content ?? '';

  // Reset state when switching slides
  useEffect(() => {
    if (itemId !== currentIdRef.current) {
      editorRef.current?.setMarkdown(slide?.content ?? block?.content ?? '');
      currentIdRef.current = itemId;
      markdownDirtyRef.current = false;
      setPropertyDraft({});
    }
  }, [itemId, slide?.content, block?.content]);

  const handleMarkdownChange = useCallback(() => {
    markdownDirtyRef.current = true;
  }, []);

  // Property draft helpers
  const val = useCallback(<K extends keyof CourseBlock>(field: K): CourseBlock[K] => {
    if (block && field in propertyDraft) return (propertyDraft as Record<string, unknown>)[field] as CourseBlock[K];
    return block?.[field] as CourseBlock[K];
  }, [propertyDraft, block]);

  const set = useCallback(<K extends keyof CourseBlockUpdate>(field: K, value: CourseBlockUpdate[K]) => {
    setPropertyDraft((d) => ({ ...d, [field]: value }));
  }, []);

  const propertyDirty = Object.keys(propertyDraft).length > 0;
  const isDirty = markdownDirtyRef.current || propertyDirty;

  const handleSave = useCallback(() => {
    const markdown = editorRef.current?.getMarkdown() ?? '';

    // Save slide content (markdown)
    if (slide && onSaveSlideContent) {
      onSaveSlideContent(slide.slide_id, markdown, title);
    } else if (block && !slide && onSaveBlock) {
      // Block-only: markdown goes into block.content
      onSaveBlock(block.block_id, lessonId, { ...propertyDraft, content: markdown });
      setPropertyDraft({});
      markdownDirtyRef.current = false;
      return;
    }

    // Save block properties
    if (block && propertyDirty && onSaveBlock) {
      onSaveBlock(block.block_id, lessonId, propertyDraft);
    }

    setPropertyDraft({});
    markdownDirtyRef.current = false;
  }, [slide, block, lessonId, propertyDraft, propertyDirty, title, onSaveBlock, onSaveSlideContent]);

  // Derive field visibility from block_type
  const slideType = (block ? (val('block_type') ?? block.block_type) : 'narrative') as CourseBlockType;
  const hasSQL = ['live_demo', 'sql_challenge', 'do_it_in_qc'].includes(slideType);
  const hasQuiz = slideType === 'quiz';
  const hasHints = ['sql_challenge', 'do_it_in_qc'].includes(slideType);
  const hasVerify = slideType === 'do_it_in_qc';
  const hasSeed = slideType === 'do_it_in_qc';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          {block && (
            <IconButton
              size="small"
              onClick={() => setPropertiesOpen((o) => !o)}
              sx={{
                transform: propertiesOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
              title="Toggle properties"
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          )}
          <Button
            size="small"
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Stack>

      {/* Collapsible Properties Drawer */}
      {block && (
        <Collapse in={propertiesOpen}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50', maxHeight: 400, overflow: 'auto' }}>
            <Stack spacing={1.5}>
              <TextField
                select
                label="Block Type"
                size="small"
                value={slideType}
                onChange={(e) => set('block_type', e.target.value as CourseBlockType)}
              >
                {SLIDE_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </TextField>

              {hasSQL && (
                <>
                  <Divider><Chip label="SQL" size="small" /></Divider>
                  <TextField
                    label="SQL Text"
                    size="small"
                    multiline
                    minRows={2}
                    maxRows={6}
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

              {hasHints && (
                <>
                  <Divider><Chip label="Hints" size="small" /></Divider>
                  <HintsEditor
                    hints={val('hints') as string[] | null}
                    onChange={(h) => set('hints', h)}
                  />
                </>
              )}

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

              {hasSeed && (
                <>
                  <Divider><Chip label="Seed Data" size="small" /></Divider>
                  <TextField
                    label="Seed SQL"
                    size="small"
                    multiline
                    minRows={2}
                    maxRows={6}
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

              {(slideType === 'narrative' || slideType === 'reference' || slideType === 'screenshot_task') && (
                <>
                  <Divider><Chip label="Image" size="small" /></Divider>
                  <ImageUploadZone
                    currentUrl={val('image_url') as string | null}
                    onUpload={(url) => set('image_url', url)}
                  />
                </>
              )}

              <TextField
                label="Presenter Notes"
                size="small"
                multiline
                minRows={2}
                maxRows={4}
                value={val('presenter_notes') ?? ''}
                onChange={(e) => set('presenter_notes', e.target.value || null)}
              />
            </Stack>
          </Box>
        </Collapse>
      )}

      {/* MDX Editor — always primary */}
      <Box sx={{
        flex: 1,
        overflow: 'auto',
        '& .mdxeditor': { height: '100%' },
        '& .mdxeditor-root-contenteditable': { padding: '16px' },
        '& ._toolbarRoot_uazmk_64': { flexWrap: 'wrap' },
      }}>
        <MDXEditor
          ref={editorRef}
          markdown={initialMarkdown}
          onChange={handleMarkdownChange}
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            tablePlugin(),
            codeBlockPlugin({ defaultCodeBlockLanguage: 'sql' }),
            codeMirrorPlugin({ codeBlockLanguages: { sql: 'SQL', js: 'JavaScript', ts: 'TypeScript', '': 'Plain text' } }),
            markdownShortcutPlugin(),
            jsxPlugin({ jsxComponentDescriptors }),
            diffSourcePlugin({ viewMode: 'rich-text' }),
            toolbarPlugin({
              toolbarContents: () => (
                <DiffSourceToggleWrapper>
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                  <BlockTypeSelect />
                  <ListsToggle />
                  <CreateLink />
                  <InsertTable />
                  <InsertThematicBreak />
                </DiffSourceToggleWrapper>
              ),
            }),
          ]}
        />
      </Box>
    </Box>
  );
}
