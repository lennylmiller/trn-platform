import { Box, Typography } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { CourseEditor } from '@trn-platform/courses-ui-mui';

export default function CourseEditorPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const id = courseId ? Number(courseId) : undefined;

  if (!id) return <Typography sx={{ p: 4 }}>No course ID provided.</Typography>;

  return (
    <Box sx={{ height: '100vh' }}>
      <CourseEditor
        courseId={id}
        onExit={() => navigate('/courses')}
        onPreview={() => navigate(`/courses/play/${id}`)}
      />
    </Box>
  );
}
