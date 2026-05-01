import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
  /** If true, SQL code fences become runnable blocks */
  interactive?: boolean;
}

/**
 * Renders markdown content with GFM support (tables, bold, code).
 * SQL code fences are rendered as interactive RunnableSqlBlock when interactive=true.
 */
export function MarkdownBlock({ content, interactive = true }: MarkdownBlockProps) {
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

          // Inline code
          code: ({ className, children }) => {
            const match = /language-(\w+)/.exec(className ?? '');
            const lang = match ? match[1] : null;
            const codeString = String(children).replace(/\n$/, '');

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
                    p: 2,
                    my: 2,
                    bgcolor: '#1e1e1e',
                    color: '#e0e0e0',
                    borderRadius: 1,
                    fontFamily: '"Cascadia Code", "Fira Code", monospace',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
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
                sx={{
                  px: 0.5,
                  py: 0.25,
                  bgcolor: 'action.hover',
                  borderRadius: 0.5,
                  fontFamily: 'monospace',
                  fontSize: '0.85em',
                }}
              >
                {children}
              </Box>
            );
          },

          // Tables (GFM)
          table: ({ children }) => (
            <Table size="small" sx={{ my: 2 }}>
              {children}
            </Table>
          ),
          thead: ({ children }) => <TableHead>{children}</TableHead>,
          tbody: ({ children }) => <TableBody>{children}</TableBody>,
          tr: ({ children }) => <TableRow hover>{children}</TableRow>,
          th: ({ children }) => (
            <TableCell sx={{ fontWeight: 700, bgcolor: '#fafafa', whiteSpace: 'nowrap' }}>
              {children}
            </TableCell>
          ),
          td: ({ children }) => (
            <TableCell sx={{ fontSize: '0.875rem' }}>
              {children}
            </TableCell>
          ),

          // Blockquotes (callouts / "Try it now" boxes)
          blockquote: ({ children }) => (
            <Box
              sx={{
                borderLeft: 4,
                borderColor: 'primary.main',
                pl: 2,
                py: 1,
                my: 2,
                bgcolor: 'primary.50',
                borderRadius: '0 4px 4px 0',
              }}
            >
              {children}
            </Box>
          ),

          // Strong
          strong: ({ children }) => (
            <Box component="strong" sx={{ fontWeight: 700 }}>
              {children}
            </Box>
          ),

          // Lists
          ul: ({ children }) => (
            <Box component="ul" sx={{ pl: 3, mb: 1.5, '& li': { mb: 0.5 } }}>
              {children}
            </Box>
          ),
          ol: ({ children }) => (
            <Box component="ol" sx={{ pl: 3, mb: 1.5, '& li': { mb: 0.5 } }}>
              {children}
            </Box>
          ),

          // Horizontal rule
          hr: () => (
            <Box sx={{ my: 3, borderTop: 1, borderColor: 'divider' }} />
          ),
        }}
      >
        {content}
      </Markdown>
    </Box>
  );
}
