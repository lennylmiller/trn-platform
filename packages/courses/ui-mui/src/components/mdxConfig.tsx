import {
  type JsxEditorProps,
  type JsxComponentDescriptor,
} from '@mdxeditor/editor';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { RunnableSqlBlock } from '@trn-platform/compositions-ui-mui';
import { Component, type ReactNode, type ErrorInfo } from 'react';

// ---------------------------------------------------------------------------
// Error boundary — prevents a crashing editor from blanking the whole page
// ---------------------------------------------------------------------------

class EditorErrorBoundary extends Component<
  { name: string; children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.name} editor]`, error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <Alert severity="warning" sx={{ m: 2 }}>
          {this.props.name} render error: {this.state.error.message}
        </Alert>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Helpers: read MDAST JSX attributes
// ---------------------------------------------------------------------------

function getAttr(mdastNode: JsxEditorProps['mdastNode'], name: string): string {
  const attr = mdastNode.attributes.find(
    (a) => a.type === 'mdxJsxAttribute' && a.name === name,
  );
  if (!attr) return '';
  if (typeof attr.value === 'string') return attr.value;
  if (attr.value && typeof attr.value === 'object' && 'value' in attr.value) {
    return String(attr.value.value);
  }
  return '';
}

// ---------------------------------------------------------------------------
// Custom JSX Editors — render the actual interactive components
// ---------------------------------------------------------------------------

function LiveDemoEditor({ mdastNode }: JsxEditorProps) {
  const sql = getAttr(mdastNode, 'sql');
  const label = getAttr(mdastNode, 'label') || 'SQL';

  return (
    <EditorErrorBoundary name="LiveDemo">
      <Box sx={{ my: 2 }}>
        {sql ? (
          <RunnableSqlBlock sql={sql} label={label} />
        ) : (
          <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1, color: 'text.secondary', textAlign: 'center' }}>
            LiveDemo — no SQL set
          </Box>
        )}
      </Box>
    </EditorErrorBoundary>
  );
}

function SqlChallengeEditor({ mdastNode }: JsxEditorProps) {
  const sql = getAttr(mdastNode, 'sql');
  const label = getAttr(mdastNode, 'label') || 'Challenge';
  const content = getAttr(mdastNode, 'content');

  return (
    <EditorErrorBoundary name="SqlChallenge">
      <Box sx={{ my: 2 }}>
        {content && <Typography sx={{ mb: 1 }}>{content}</Typography>}
        {sql ? (
          <RunnableSqlBlock sql={sql} label={label} />
        ) : (
          <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1, color: 'text.secondary', textAlign: 'center' }}>
            SqlChallenge — no SQL set
          </Box>
        )}
      </Box>
    </EditorErrorBoundary>
  );
}

function DoItInQcEditor({ mdastNode }: JsxEditorProps) {
  const sql = getAttr(mdastNode, 'sql');
  const label = getAttr(mdastNode, 'label') || 'Verify';
  const content = getAttr(mdastNode, 'content');

  return (
    <EditorErrorBoundary name="DoItInQc">
      <Box sx={{ my: 2, p: 2, border: '2px solid #1976d2', borderRadius: 2, bgcolor: '#f5f9ff' }}>
        <Typography sx={{ fontWeight: 700, color: '#1976d2', mb: 1, fontSize: '0.875rem', textTransform: 'uppercase' }}>
          Do It in QC
        </Typography>
        {content && <Typography sx={{ mb: 1.5 }}>{content}</Typography>}
        {sql && <RunnableSqlBlock sql={sql} label={label} />}
      </Box>
    </EditorErrorBoundary>
  );
}

function QuizEditor({ mdastNode }: JsxEditorProps) {
  const question = getAttr(mdastNode, 'question');
  const optionsStr = getAttr(mdastNode, 'options');
  const answer = getAttr(mdastNode, 'answer');
  const explanation = getAttr(mdastNode, 'explanation');

  let options: string[] = [];
  try { options = JSON.parse(optionsStr); } catch { /* empty */ }

  return (
    <EditorErrorBoundary name="Quiz">
      <Box sx={{ my: 2, p: 2, border: '2px solid #ed6c02', borderRadius: 2, bgcolor: '#fff8f0' }}>
        <Typography sx={{ fontWeight: 700, color: '#ed6c02', mb: 1, fontSize: '0.875rem', textTransform: 'uppercase' }}>
          Quiz
        </Typography>
        {question && <Typography sx={{ fontWeight: 600, mb: 1.5 }}>{question}</Typography>}
        {options.map((opt, i) => (
          <Box
            key={i}
            sx={{
              p: '6px 12px', mb: 0.5, borderRadius: 1, border: '1px solid #ddd',
              bgcolor: String(i) === answer ? '#e8f5e9' : '#fff',
              fontWeight: String(i) === answer ? 600 : 400,
            }}
          >
            {String.fromCharCode(65 + i)}. {opt}
          </Box>
        ))}
        {explanation && (
          <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', fontStyle: 'italic', mt: 1 }}>
            {explanation}
          </Typography>
        )}
      </Box>
    </EditorErrorBoundary>
  );
}

function PlaceholderEditor({ mdastNode }: JsxEditorProps) {
  const type = getAttr(mdastNode, 'type') || 'content';
  const label = getAttr(mdastNode, 'label') || `${type} placeholder`;

  return (
    <Box sx={{ my: 2, p: 3, border: '2px dashed #bbb', borderRadius: 2, textAlign: 'center', color: 'text.secondary', bgcolor: '#fafafa' }}>
      {label}
    </Box>
  );
}

function ImageEditor({ mdastNode }: JsxEditorProps) {
  const src = getAttr(mdastNode, 'src');
  const alt = getAttr(mdastNode, 'alt');

  if (!src) {
    return (
      <Box sx={{ p: 3, border: '2px dashed #bbb', borderRadius: 2, textAlign: 'center', color: 'text.secondary' }}>
        Image — no src set
      </Box>
    );
  }

  return <img src={src} alt={alt || ''} style={{ maxWidth: '100%', borderRadius: 8, margin: '16px 0' }} />;
}

// ---------------------------------------------------------------------------
// Descriptors
// ---------------------------------------------------------------------------

export const jsxComponentDescriptors: JsxComponentDescriptor[] = [
  {
    name: 'LiveDemo',
    kind: 'flow',
    source: '@course/components',
    defaultExport: false,
    hasChildren: false,
    props: [
      { name: 'sql', type: 'string' as const },
      { name: 'label', type: 'string' as const },
    ],
    Editor: LiveDemoEditor,
  },
  {
    name: 'Quiz',
    kind: 'flow',
    source: '@course/components',
    defaultExport: false,
    hasChildren: false,
    props: [
      { name: 'question', type: 'string' as const },
      { name: 'options', type: 'string' as const },
      { name: 'answer', type: 'string' as const },
      { name: 'explanation', type: 'string' as const },
    ],
    Editor: QuizEditor,
  },
  {
    name: 'SqlChallenge',
    kind: 'flow',
    source: '@course/components',
    defaultExport: false,
    hasChildren: false,
    props: [
      { name: 'content', type: 'string' as const },
      { name: 'sql', type: 'string' as const },
      { name: 'hints', type: 'string' as const },
      { name: 'label', type: 'string' as const },
    ],
    Editor: SqlChallengeEditor,
  },
  {
    name: 'Placeholder',
    kind: 'flow',
    source: '@course/components',
    defaultExport: false,
    hasChildren: false,
    props: [
      { name: 'type', type: 'string' as const },
      { name: 'label', type: 'string' as const },
    ],
    Editor: PlaceholderEditor,
  },
  {
    name: 'Image',
    kind: 'flow',
    source: '@course/components',
    defaultExport: false,
    hasChildren: false,
    props: [
      { name: 'src', type: 'string' as const },
      { name: 'alt', type: 'string' as const },
    ],
    Editor: ImageEditor,
  },
  {
    name: 'DoItInQc',
    kind: 'flow',
    source: '@course/components',
    defaultExport: false,
    hasChildren: false,
    props: [
      { name: 'sql', type: 'string' as const },
      { name: 'label', type: 'string' as const },
      { name: 'content', type: 'string' as const },
    ],
    Editor: DoItInQcEditor,
  },
];
