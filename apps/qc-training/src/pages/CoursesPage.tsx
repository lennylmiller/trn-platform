import {
  Accordion, AccordionDetails, AccordionSummary,
  Alert, Box, Button, Card, CardActionArea, CardContent,
  Chip, CircularProgress, IconButton, Stack, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { useCourses, useSeries, useTracks } from '@trn-platform/courses-data-access';
import type { CourseListItem, CourseSeries, CourseTrack } from '@trn-platform/shared';

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
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
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

interface TrackContent {
  track: CourseTrack;
  seriesGroups: { series: CourseSeries; courses: CourseListItem[] }[];
  standaloneCourses: CourseListItem[];
}

function TrackAccordion({ content, defaultExpanded }: { content: TrackContent; defaultExpanded?: boolean }) {
  const totalCourses = content.seriesGroups.reduce((s, g) => s + g.courses.length, 0) + content.standaloneCourses.length;
  return (
    <Accordion defaultExpanded={defaultExpanded} variant="outlined" disableGutters sx={{ '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {content.track.title}
            </Typography>
            <Chip label={`${totalCourses} courses`} size="small" variant="outlined" />
          </Stack>
          {content.track.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {content.track.description}
            </Typography>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        <Stack spacing={1.5}>
          {content.seriesGroups.map((sg, idx) => (
            <SeriesAccordion
              key={sg.series.series_id}
              series={sg.series}
              courses={sg.courses}
              defaultExpanded={idx === 0}
            />
          ))}
          {content.standaloneCourses.length > 0 && (
            <Stack spacing={1}>
              {content.standaloneCourses.map((course) => (
                <CourseCard key={course.course_id} course={course} />
              ))}
            </Stack>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

export default function CoursesPage() {
  const { data: courses, isLoading: coursesLoading, error: coursesError } = useCourses();
  const { data: seriesList, isLoading: seriesLoading } = useSeries();
  const { data: tracksList, isLoading: tracksLoading } = useTracks();

  const isLoading = coursesLoading || seriesLoading || tracksLoading;

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  if (coursesError) return <Alert severity="error" sx={{ m: 2 }}>Failed to load courses: {coursesError.message}</Alert>;

  const allCourses = courses ?? [];
  const allSeries = seriesList ?? [];
  const allTracks = tracksList ?? [];

  // Build lookups
  const seriesById = new Map<number, CourseSeries>(allSeries.map((s) => [s.series_id, s]));

  // Group courses by series
  const coursesBySeries = new Map<number, CourseListItem[]>();
  const coursesNoSeries: CourseListItem[] = [];
  for (const c of allCourses) {
    if (c.series_id) {
      if (!coursesBySeries.has(c.series_id)) coursesBySeries.set(c.series_id, []);
      coursesBySeries.get(c.series_id)!.push(c);
    } else {
      coursesNoSeries.push(c);
    }
  }

  // Build track contents
  const trackContents: TrackContent[] = [];
  const usedSeriesIds = new Set<number>();
  const usedCourseIds = new Set<number>();

  for (const track of allTracks) {
    // Series in this track
    const trackSeries = allSeries
      .filter((s) => s.track_id === track.track_id)
      .sort((a, b) => (a.track_seq ?? 0) - (b.track_seq ?? 0));

    const seriesGroups: TrackContent['seriesGroups'] = [];
    for (const s of trackSeries) {
      const sc = coursesBySeries.get(s.series_id) ?? [];
      if (sc.length > 0) {
        seriesGroups.push({ series: s, courses: sc });
        usedSeriesIds.add(s.series_id);
        sc.forEach((c) => usedCourseIds.add(c.course_id));
      }
    }

    // Standalone courses directly in this track (no series)
    const standaloneCourses = coursesNoSeries
      .filter((c) => c.track_id === track.track_id)
      .sort((a, b) => (a.track_seq ?? 0) - (b.track_seq ?? 0));
    standaloneCourses.forEach((c) => usedCourseIds.add(c.course_id));

    if (seriesGroups.length > 0 || standaloneCourses.length > 0) {
      trackContents.push({ track, seriesGroups, standaloneCourses });
    }
  }

  // Unassigned series (have courses but no track)
  const unassignedSeriesGroups: { series: CourseSeries; courses: CourseListItem[] }[] = [];
  for (const s of allSeries) {
    if (usedSeriesIds.has(s.series_id)) continue;
    const sc = coursesBySeries.get(s.series_id) ?? [];
    if (sc.length > 0) {
      unassignedSeriesGroups.push({ series: s, courses: sc });
      sc.forEach((c) => usedCourseIds.add(c.course_id));
    }
  }

  // Unassigned standalone courses (no series, no track)
  const unassignedCourses = coursesNoSeries.filter((c) => !usedCourseIds.has(c.course_id));

  const hasUnassigned = unassignedSeriesGroups.length > 0 || unassignedCourses.length > 0;
  const isEmpty = allCourses.length === 0;

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Courses
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="small"
          onClick={() => navigate('/courses/new')}
        >
          Create Course
        </Button>
      </Stack>
      {isEmpty ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No courses yet.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {/* Track-grouped content */}
          {trackContents.map((tc, idx) => (
            <TrackAccordion key={tc.track.track_id} content={tc} defaultExpanded={idx === 0} />
          ))}

          {/* Unassigned series */}
          {unassignedSeriesGroups.map((sg) => (
            <SeriesAccordion
              key={sg.series.series_id}
              series={sg.series}
              courses={sg.courses}
              defaultExpanded={trackContents.length === 0}
            />
          ))}

          {/* Unassigned standalone courses */}
          {unassignedCourses.length > 0 && (
            <Box>
              {(trackContents.length > 0 || unassignedSeriesGroups.length > 0) && (
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, mt: 1 }}>
                  Unassigned Courses
                </Typography>
              )}
              <Stack spacing={1}>
                {unassignedCourses.map((course) => (
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
