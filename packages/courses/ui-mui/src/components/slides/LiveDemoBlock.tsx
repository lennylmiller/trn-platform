import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { CourseBlock } from '@trn-platform/shared';
import { RunnableSqlBlock, MarkdownBlock } from '@trn-platform/compositions-ui-mui';

export function LiveDemoBlock({ slide }: { slide: CourseBlock }) {
  return (
    <Box>
      {slide.title && (
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          {slide.title}
        </Typography>
      )}
      {slide.content && <MarkdownBlock content={slide.content} interactive={false} />}
      {slide.sql_text && (
        <RunnableSqlBlock sql={slide.sql_text} label={slide.sql_label ?? 'SQL'} />
      )}
    </Box>
  );
}
