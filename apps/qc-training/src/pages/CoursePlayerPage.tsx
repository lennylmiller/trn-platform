import { Box, Typography } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { CoursePlayer } from '@trn-platform/courses-ui-mui';

export default function CoursePlayerPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const id = courseId ? Number(courseId) : undefined;

  if (!id) return <Typography sx={{ p: 4 }}>No course ID provided.</Typography>;

  return (
    <Box sx={{ height: '100vh' }}>
      <CoursePlayer courseId={id} onExit={() => navigate('/courses')} />
    </Box>
  );
}
