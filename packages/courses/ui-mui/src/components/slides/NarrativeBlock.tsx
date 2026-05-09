import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { CourseBlock } from '@trn-platform/shared';
import { MarkdownBlock } from '@trn-platform/compositions-ui-mui';

export function NarrativeBlock({ slide }: { slide: CourseBlock }) {
  return (
    <Box>
      {slide.title && (
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          {slide.title}
        </Typography>
      )}
      {slide.image_url && (
        <Box
          component="img"
          src={slide.image_url}
          alt={slide.title ?? ''}
          sx={{ maxWidth: '100%', borderRadius: 1, mb: 2 }}
        />
      )}
      {slide.content && <MarkdownBlock content={slide.content} interactive />}
    </Box>
  );
}
