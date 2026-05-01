import { Box, Card, CardActionArea, CardContent, Chip, CircularProgress, Stack, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '@trn-platform/courses-data-access';

const STATUS_COLORS: Record<string, 'default' | 'success' | 'warning'> = {
  draft: 'warning',
  published: 'success',
  archived: 'default',
};

export default function CoursesPage() {
  const { data: courses, isLoading, error } = useCourses();
  const navigate = useNavigate();

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 2 }}>Failed to load courses: {error.message}</Alert>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Courses
      </Typography>
      {!courses || courses.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No courses yet.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {courses.map((course) => (
            <Card key={course.course_id} variant="outlined">
              <CardActionArea onClick={() => navigate(`/courses/play/${course.course_id}`)}>
                <CardContent>
                  <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {course.title}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip label={course.status} size="small" color={STATUS_COLORS[course.status] ?? 'default'} sx={{ textTransform: 'capitalize' }} />
                      {course.category && <Chip label={course.category} size="small" variant="outlined" />}
                    </Stack>
                  </Stack>
                  {course.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {course.description}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {course.section_count} sections &middot; {course.slide_count} slides
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
