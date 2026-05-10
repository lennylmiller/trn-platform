import { useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SaveIcon from '@mui/icons-material/Save';
import {
  MDXEditor,
  type MDXEditorMethods,
  jsxPlugin,
  GenericJsxEditor,
  toolbarPlugin,
  diffSourcePlugin,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  tablePlugin,
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
import type { CourseSlide } from '@trn-platform/shared';

export interface SlideMarkdownEditorProps {
  slide: CourseSlide;
  courseId: number;
  onSaved?: () => void;
}

// ---------------------------------------------------------------------------
// Custom JSX component descriptors for course components
// ---------------------------------------------------------------------------

const jsxComponentDescriptors = [
  {
    name: 'LiveDemo',
    kind: 'flow' as const,
    source: '@course/components',
    defaultExport: false,
    hasChildren: false,
    props: [
      { name: 'sql', type: 'string' as const },
      { name: 'label', type: 'string' as const },
    ],
    Editor: GenericJsxEditor,
  },
  {
    name: 'Quiz',
    kind: 'flow' as const,
    source: '@course/components',
    defaultExport: false,
    hasChildren: false,
    props: [
      { name: 'question', type: 'string' as const },
      { name: 'options', type: 'string' as const },
      { name: 'answer', type: 'string' as const },
      { name: 'explanation', type: 'string' as const },
    ],
    Editor: GenericJsxEditor,
  },
  {
    name: 'SqlChallenge',
    kind: 'flow' as const,
    source: '@course/components',
    defaultExport: false,
    hasChildren: false,
    props: [
      { name: 'content', type: 'string' as const },
      { name: 'sql', type: 'string' as const },
      { name: 'hints', type: 'string' as const },
      { name: 'label', type: 'string' as const },
    ],
    Editor: GenericJsxEditor,
  },
  {
    name: 'Placeholder',
    kind: 'flow' as const,
    source: '@course/components',
    defaultExport: false,
    hasChildren: false,
    props: [
      { name: 'type', type: 'string' as const },
      { name: 'label', type: 'string' as const },
    ],
    Editor: GenericJsxEditor,
  },
  {
    name: 'Image',
    kind: 'flow' as const,
    source: '@course/components',
    defaultExport: false,
    hasChildren: false,
    props: [
      { name: 'src', type: 'string' as const },
      { name: 'alt', type: 'string' as const },
    ],
    Editor: GenericJsxEditor,
  },
  {
    name: 'DoItInQc',
    kind: 'flow' as const,
    source: '@course/components',
    defaultExport: false,
    hasChildren: false,
    props: [
      { name: 'sql', type: 'string' as const },
      { name: 'label', type: 'string' as const },
      { name: 'content', type: 'string' as const },
    ],
    Editor: GenericJsxEditor,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SlideMarkdownEditor({ slide, courseId, onSaved }: SlideMarkdownEditorProps) {
  const editorRef = useRef<MDXEditorMethods>(null);
  const slideIdRef = useRef(slide.slide_id);
  const isDirtyRef = useRef(false);

  // Reset editor when slide changes
  useEffect(() => {
    if (slide.slide_id !== slideIdRef.current) {
      editorRef.current?.setMarkdown(slide.content ?? '');
      slideIdRef.current = slide.slide_id;
      isDirtyRef.current = false;
    }
  }, [slide.slide_id, slide.content]);

  const handleChange = useCallback(() => {
    isDirtyRef.current = true;
  }, []);

  const handleSave = useCallback(async () => {
    const content = editorRef.current?.getMarkdown() ?? '';
    try {
      const res = await fetch(`/api/v2/courses/${courseId}/slides/${slide.slide_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title: slide.title }),
      });
      if (res.ok) {
        isDirtyRef.current = false;
        onSaved?.();
      }
    } catch (err) {
      console.error('Save failed:', err);
    }
  }, [courseId, slide.slide_id, slide.title, onSaved]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {slide.title ?? 'Slide Editor'}
        </Typography>
        <Button
          size="small"
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Save
        </Button>
      </Stack>

      {/* MDX Editor */}
      <Box sx={{
        flex: 1,
        overflow: 'auto',
        '& .mdxeditor': { height: '100%' },
        '& .mdxeditor-root-contenteditable': { padding: '16px' },
        '& ._toolbarRoot_uazmk_64': { flexWrap: 'wrap' },
      }}>
        <MDXEditor
          ref={editorRef}
          markdown={slide.content ?? ''}
          onChange={handleChange}
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            tablePlugin(),
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
