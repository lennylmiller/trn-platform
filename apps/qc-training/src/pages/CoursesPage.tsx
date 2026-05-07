import {
  Accordion, AccordionDetails, AccordionSummary,
  Alert, Box, Card, CardActionArea, CardContent,
  Chip, CircularProgress, IconButton, Stack, Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { useCourses, useSeries } from '@trn-platform/courses-data-access';
import type { CourseListItem, CourseSeries } from '@trn-platform/shared';

const STATUS_COLORS: Record<string, 'default' | 'success' | 'warning'> = {
  draft: 'warning',
  published: 'success',
  archived: 'default',
};

function CourseCard({ course, showSeq }: { course: CourseListItem; showSeq?: boolean }) {
  const navigate = useNavigate();
  return (
    <Card variant="outlined">
      <CardActionArea onClick={() => navigate(`/courses/play/${course.course_id}`)}>
        <CardContent sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          {showSeq && course.series_seq != null && (
            <Box sx={{
              minWidth: 32, height: 32, borderRadius: '50%',
              bgcolor: 'primary.main', color: 'primary.contrastText',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 700, flexShrink: 0, mt: 0.25,
            }}>
              {course.series_seq}
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                {course.title}
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0, ml: 1, alignItems: 'center' }}>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); navigate(`/courses/edit/${course.course_id}`); }}
                  title="Edit course"
                  sx={{ mr: 0.5 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <Chip label={course.status} size="small" color={STATUS_COLORS[course.status] ?? 'default'} sx={{ textTransform: 'capitalize' }} />
                {course.category && <Chip label={course.category} size="small" variant="outlined" />}
              </Stack>
            </Stack>
            {course.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {course.description}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {course.lesson_count} lessons &middot; {course.slide_count} slides
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function SeriesAccordion({ series, courses, defaultExpanded }: {
  series: CourseSeries;
  courses: CourseListItem[];
  defaultExpanded?: boolean;
}) {
  return (
    <Accordion defaultExpanded={defaultExpanded} variant="outlined" disableGutters sx={{ '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {series.title}
            </Typography>
            <Chip label={`${courses.length} courses`} size="small" variant="outlined" />
          </Stack>
          {series.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {series.description}
            </Typography>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        <Stack spacing={1}>
          {courses.map((course) => (
            <CourseCard key={course.course_id} course={course} showSeq />
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

export default function CoursesPage() {
  const { data: courses, isLoading: coursesLoading, error: coursesError } = useCourses();
  const { data: seriesList, isLoading: seriesLoading } = useSeries();

  const isLoading = coursesLoading || seriesLoading;

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  if (coursesError) return <Alert severity="error" sx={{ m: 2 }}>Failed to load courses: {coursesError.message}</Alert>;

  // Group courses by series
  const seriesMap = new Map<number, CourseListItem[]>();
  const standalone: CourseListItem[] = [];
  (courses ?? []).forEach((c) => {
    if (c.series_id) {
      if (!seriesMap.has(c.series_id)) seriesMap.set(c.series_id, []);
      seriesMap.get(c.series_id)!.push(c);
    } else {
      standalone.push(c);
    }
  });

  // Build lookup for series metadata
  const seriesById = new Map<number, CourseSeries>(
    (seriesList ?? []).map((s: CourseSeries) => [s.series_id, s] as const),
  );

  // Ordered series IDs (preserve the order from the seriesList response)
  const orderedSeriesIds: number[] = (seriesList ?? [])
    .filter((s: CourseSeries) => seriesMap.has(s.series_id))
    .map((s: CourseSeries) => s.series_id);

  const isEmpty = (courses ?? []).length === 0;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Courses
      </Typography>
      {isEmpty ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No courses yet.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {orderedSeriesIds.map((seriesId: number, idx: number) => {
            const series = seriesById.get(seriesId);
            const grouped = seriesMap.get(seriesId) ?? [];
            if (!series || grouped.length === 0) return null;
            return (
              <SeriesAccordion
                key={seriesId}
                series={series}
                courses={grouped}
                defaultExpanded={idx === 0}
              />
            );
          })}

          {standalone.length > 0 && (
            <Box>
              {orderedSeriesIds.length > 0 && (
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, mt: 1 }}>
                  Standalone Courses
                </Typography>
              )}
              <Stack spacing={1}>
                {standalone.map((course) => (
                  <CourseCard key={course.course_id} course={course} />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
}
