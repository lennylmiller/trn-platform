import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { CourseSlide } from '@trn-platform/shared';
import { MarkdownBlock } from '@trn-platform/compositions-ui-mui';

export function ReferenceSlide({ slide }: { slide: CourseSlide }) {
  return (
    <Box>
      {slide.title && (
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          {slide.title}
        </Typography>
      )}
      {slide.image_url && (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box
            component="img"
            src={slide.image_url}
            alt={slide.title ?? 'Reference'}
            sx={{ maxWidth: '100%', maxHeight: 500, borderRadius: 1, border: 1, borderColor: 'divider' }}
          />
        </Box>
      )}
      {slide.content && <MarkdownBlock content={slide.content} interactive={false} />}
    </Box>
  );
}
