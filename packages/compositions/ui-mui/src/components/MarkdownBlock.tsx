import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { RunnableSqlBlock } from './RunnableSqlBlock';

export interface MarkdownBlockProps {
  content: string;
  /** If true, SQL code fences become runnable blocks and component tags are rendered */
  interactive?: boolean;
}

// ---------------------------------------------------------------------------
// Component tag pre-processor
// ---------------------------------------------------------------------------

interface ParsedComponent {
  name: string;
  props: Record<string, string>;
}

/**
 * Pre-process markdown: find <ComponentName prop="value" /> tags and replace
 * them with special code fences that the code handler can intercept.
 *
 * Supports: <LiveDemo sql="..." label="..." />
 *           <Quiz question="..." options='[...]' answer="0" />
 *           <Image src="..." alt="..." />
 *           <SqlChallenge ... />
 */
function preprocessComponentTags(markdown: string): string {
  // Match self-closing tags: <Name prop="value" prop='value' />
  // Also match tags with content: <Name ...>content</Name>
  return markdown.replace(
    /<(LiveDemo|Quiz|SqlChallenge|Image|DoItInQc)\s+([^>]*?)\/>/gs,
    (_match, name: string, propsStr: string) => {
      // Encode as a special code fence that the renderer will intercept
      const encoded = JSON.stringify({ component: name, propsRaw: propsStr.trim() });
      return `\n\`\`\`component\n${encoded}\n\`\`\`\n`;
    },
  );
}

/**
 * Parse HTML-style props string into a Record.
 * Handles: prop="value" prop='value' prop={value}
 */
function parseProps(propsStr: string): Record<string, string> {
  const props: Record<string, string> = {};
  const regex = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g;
  let match;
  while ((match = regex.exec(propsStr)) !== null) {
    const key = match[1]!;
    const value = match[2] ?? match[3] ?? match[4] ?? '';
    props[key] = value;
  }
  return props;
}

// ---------------------------------------------------------------------------
// Inline component renderers
// ---------------------------------------------------------------------------

function InlineQuiz({ question, options, answer, explanation }: {
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = selected === answer;

  return (
    <Box sx={{ my: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{question}</Typography>
      <RadioGroup
        value={selected !== null ? String(selected) : ''}
        onChange={(e) => { setSelected(Number(e.target.value)); setSubmitted(false); }}
      >
        {options.map((opt, idx) => (
          <FormControlLabel
            key={idx}
            value={String(idx)}
            control={<Radio />}
            label={opt}
            disabled={submitted}
            sx={{
              mb: 0.5, p: 0.5, borderRadius: 1, border: 1,
              borderColor: submitted
                ? idx === answer ? 'success.main' : idx === selected ? 'error.main' : 'divider'
                : idx === selected ? 'primary.main' : 'divider',
            }}
          />
        ))}
      </RadioGroup>
      {!submitted && (
        <Button variant="contained" onClick={() => setSubmitted(true)} disabled={selected === null} sx={{ mt: 1 }}>
          Check Answer
        </Button>
      )}
      {submitted && (
        <Alert severity={isCorrect ? 'success' : 'error'} sx={{ mt: 1 }}>
          {isCorrect ? 'Correct!' : `Incorrect. The answer is: ${options[answer]}`}
          {explanation && <Typography variant="body2" sx={{ mt: 0.5 }}>{explanation}</Typography>}
        </Alert>
      )}
    </Box>
  );
}

function renderComponent(name: string, props: Record<string, string>): React.ReactNode {
  switch (name) {
    case 'LiveDemo':
      return <RunnableSqlBlock sql={props.sql ?? ''} label={props.label ?? 'SQL'} />;

    case 'Quiz': {
      let options: string[] = [];
      try { options = JSON.parse(props.options ?? '[]'); } catch { /* ignore */ }
      return (
        <InlineQuiz
          question={props.question ?? ''}
          options={options}
          answer={Number(props.answer ?? 0)}
          explanation={props.explanation}
        />
      );
    }

    case 'SqlChallenge':
      return (
        <Box sx={{ my: 3 }}>
          {props.content && <Typography variant="body1" sx={{ mb: 1 }}>{props.content}</Typography>}
          <RunnableSqlBlock sql="" label={props.label ?? 'Your SQL'} />
          {props.sql && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">Solution: </Typography>
              <RunnableSqlBlock sql={props.sql} label="Solution" />
            </Box>
          )}
        </Box>
      );

    case 'Image':
      return (
        <Box sx={{ my: 2, textAlign: 'center' }}>
          <Box
            component="img"
            src={props.src ?? ''}
            alt={props.alt ?? ''}
            sx={{ maxWidth: '100%', borderRadius: 1, border: 1, borderColor: 'divider' }}
          />
          {props.alt && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {props.alt}
            </Typography>
          )}
        </Box>
      );

    case 'DoItInQc':
      return (
        <Box sx={{ my: 3, p: 2, border: 1, borderColor: 'primary.main', borderRadius: 1, bgcolor: 'primary.50' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Hands-On Task</Typography>
          {props.content && <Typography variant="body1" sx={{ mb: 1 }}>{props.content}</Typography>}
          {props.sql && <RunnableSqlBlock sql={props.sql} label={props.label ?? 'Check My Work'} />}
        </Box>
      );

    default:
      return <Typography color="error">Unknown component: {name}</Typography>;
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Renders markdown content with GFM support (tables, bold, code).
 * When interactive=true:
 *   - SQL code fences become runnable blocks
 *   - Component tags (<LiveDemo/>, <Quiz/>, etc.) render as interactive components
 */
export function MarkdownBlock({ content, interactive = true }: MarkdownBlockProps) {
  // Pre-process: convert component tags to special code fences
  const processed = interactive ? preprocessComponentTags(content) : content;

  return (
    <Box sx={{ '& > *:first-of-type': { mt: 0 } }}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 3, mb: 1.5 }}>
              {children}
            </Typography>
          ),
          h2: ({ children }) => (
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 2.5, mb: 1 }}>
              {children}
            </Typography>
          ),
          h3: ({ children }) => (
            <Typography variant="h6" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
              {children}
            </Typography>
          ),

          // Paragraphs
          p: ({ children }) => (
            <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 1.5 }}>
              {children}
            </Typography>
          ),

          // Code blocks — handles SQL, component tags, and generic code
          code: ({ className, children }) => {
            const match = /language-(\w+)/.exec(className ?? '');
            const lang = match ? match[1] : null;
            const codeString = String(children).replace(/\n$/, '');

            // Component tag (pre-processed from <ComponentName ... />)
            if (lang === 'component' && interactive) {
              try {
                const parsed = JSON.parse(codeString);
                const props = parseProps(parsed.propsRaw);
                return <>{renderComponent(parsed.component, props)}</>;
              } catch {
                return <Typography color="error">Failed to render component</Typography>;
              }
            }

            // SQL code fence → runnable block
            if (lang === 'sql' && interactive) {
              return <RunnableSqlBlock sql={codeString} />;
            }

            // Other code fences → styled block
            if (className) {
              return (
                <Box
                  component="pre"
                  sx={{
                    p: 2, my: 2, bgcolor: '#1e1e1e', color: '#e0e0e0',
                    borderRadius: 1, fontFamily: '"Cascadia Code", "Fira Code", monospace',
                    fontSize: '0.85rem', lineHeight: 1.6, overflow: 'auto', whiteSpace: 'pre-wrap',
                  }}
                >
                  <code>{children}</code>
                </Box>
              );
            }

            // Inline code
            return (
              <Box
                component="code"
                sx={{ px: 0.5, py: 0.25, bgcolor: 'action.hover', borderRadius: 0.5, fontFamily: 'monospace', fontSize: '0.85em' }}
              >
                {children}
              </Box>
            );
          },

          // Tables (GFM)
          table: ({ children }) => <Table size="small" sx={{ my: 2 }}>{children}</Table>,
          thead: ({ children }) => <TableHead>{children}</TableHead>,
          tbody: ({ children }) => <TableBody>{children}</TableBody>,
          tr: ({ children }) => <TableRow hover>{children}</TableRow>,
          th: ({ children }) => <TableCell sx={{ fontWeight: 700, bgcolor: '#fafafa', whiteSpace: 'nowrap' }}>{children}</TableCell>,
          td: ({ children }) => <TableCell sx={{ fontSize: '0.875rem' }}>{children}</TableCell>,

          // Blockquotes
          blockquote: ({ children }) => (
            <Box sx={{ borderLeft: 4, borderColor: 'primary.main', pl: 2, py: 1, my: 2, bgcolor: 'primary.50', borderRadius: '0 4px 4px 0' }}>
              {children}
            </Box>
          ),

          // Strong
          strong: ({ children }) => <Box component="strong" sx={{ fontWeight: 700 }}>{children}</Box>,

          // Lists
          ul: ({ children }) => <Box component="ul" sx={{ pl: 3, mb: 1.5, '& li': { mb: 0.5 } }}>{children}</Box>,
          ol: ({ children }) => <Box component="ol" sx={{ pl: 3, mb: 1.5, '& li': { mb: 0.5 } }}>{children}</Box>,

          // Horizontal rule
          hr: () => <Box sx={{ my: 3, borderTop: 1, borderColor: 'divider' }} />,
        }}
      >
        {processed}
      </Markdown>
    </Box>
  );
}
