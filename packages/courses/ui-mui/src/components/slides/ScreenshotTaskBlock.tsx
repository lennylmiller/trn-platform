import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import type { CourseBlock } from '@trn-platform/shared';
import { MarkdownBlock } from '../MarkdownBlock';

export function ScreenshotTaskBlock({ slide }: { slide: CourseBlock }) {
  return (
    <Box>
      {slide.title && (
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          {slide.title}
        </Typography>
      )}
      {slide.content && <MarkdownBlock content={slide.content} interactive={false} />}

      {/* Drop zone placeholder */}
      <Box
        sx={{
          mt: 3,
          p: 4,
          border: 2,
          borderStyle: 'dashed',
          borderColor: 'divider',
          borderRadius: 2,
          textAlign: 'center',
          bgcolor: 'action.hover',
          cursor: 'pointer',
          '&:hover': { borderColor: 'primary.main' },
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography color="text.secondary">
          Drop a screenshot here or click to upload
        </Typography>
        <Typography variant="caption" color="text.secondary">
          (File upload coming soon)
        </Typography>
      </Box>
    </Box>
  );
}
