import { useState, useEffect } from 'react';
import {
  Accordion, AccordionDetails, AccordionSummary,
  Alert, Box, Button, Card, CardActionArea, CardContent,
  Chip, CircularProgress, Dialog, DialogContent, DialogTitle,
  IconButton, List, ListItemButton, ListItemText,
  Stack, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { useNavigate } from 'react-router-dom';
import { useCourses, useSeries, useTracks } from '@trn-platform/courses-data-access';
import type { CourseListItem, CourseSeries, CourseTrack } from '@trn-platform/shared';

const STATUS_COLORS: Record<string, 'default' | 'success' | 'warning'> = {
  draft: 'warning',
  published: 'success',
  archived: 'default',
};

const STORAGE_KEY = 'courses-active-track';

function CourseCard({ course, showSeq }: { course: CourseListItem; showSeq?: boolean }) {
  const navigate = useNavigate();
  return (
    <Card variant="outlined">
      <Stack direction="row" sx={{ alignItems: 'stretch' }}>
        <CardActionArea onClick={() => navigate(`/courses/play/${course.course_id}`)} sx={{ flex: 1 }}>
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
        <IconButton
          onClick={() => navigate(`/courses/edit/${course.course_id}`)}
          title="Edit course"
          sx={{ borderLeft: 1, borderColor: 'divider', borderRadius: 0, px: 1.5 }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Stack>
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

function TrackSelectorModal({ open, onClose, tracks, activeTrackId, onSelect }: {
  open: boolean;
  onClose: () => void;
  tracks: CourseTrack[];
  activeTrackId: number | null;
  onSelect: (trackId: number | null) => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Track</DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <List>
          <ListItemButton
            selected={activeTrackId === null}
            onClick={() => { onSelect(null); onClose(); }}
          >
            <ListItemText
              primary="All Courses"
              secondary="Show all tracks and unassigned courses"
              slotProps={{
                primary: { sx: { fontWeight: activeTrackId === null ? 700 : 400 } },
              }}
            />
          </ListItemButton>
          {tracks.map((track) => (
            <ListItemButton
              key={track.track_id}
              selected={activeTrackId === track.track_id}
              onClick={() => { onSelect(track.track_id); onClose(); }}
            >
              <ListItemText
                primary={track.title}
                secondary={track.description}
                slotProps={{
                  primary: { sx: { fontWeight: activeTrackId === track.track_id ? 700 : 400 } },
                  secondary: { sx: { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } },
                }}
              />
              <Chip label={`seq ${track.seq}`} size="small" variant="outlined" sx={{ ml: 1 }} />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}

export default function CoursesPage() {
  const navigate = useNavigate();
  const { data: courses, isLoading: coursesLoading, error: coursesError } = useCourses();
  const { data: seriesList, isLoading: seriesLoading } = useSeries();
  const { data: tracksList, isLoading: tracksLoading } = useTracks();

  const [activeTrackId, setActiveTrackId] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? Number(saved) : null;
    } catch { return null; }
  });
  const [selectorOpen, setSelectorOpen] = useState(false);

  useEffect(() => {
    try {
      if (activeTrackId !== null) localStorage.setItem(STORAGE_KEY, String(activeTrackId));
      else localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }, [activeTrackId]);

  const isLoading = coursesLoading || seriesLoading || tracksLoading;

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  if (coursesError) return <Alert severity="error" sx={{ m: 2 }}>Failed to load courses: {coursesError.message}</Alert>;

  const allCourses = courses ?? [];
  const allSeries = seriesList ?? [];
  const allTracks = tracksList ?? [];

  // Auto-select first track if none selected and tracks exist
  const effectiveTrackId = activeTrackId !== null && allTracks.some((t) => t.track_id === activeTrackId)
    ? activeTrackId
    : allTracks.length > 0 ? allTracks[0]!.track_id : null;

  const activeTrack = allTracks.find((t) => t.track_id === effectiveTrackId);

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

  // Filter by active track
  let visibleSeriesGroups: { series: CourseSeries; courses: CourseListItem[] }[] = [];
  let visibleStandalone: CourseListItem[] = [];

  if (effectiveTrackId !== null) {
    // Series in this track
    const trackSeries = allSeries
      .filter((s) => s.track_id === effectiveTrackId)
      .sort((a, b) => (a.track_seq ?? 0) - (b.track_seq ?? 0));
    for (const s of trackSeries) {
      const sc = coursesBySeries.get(s.series_id) ?? [];
      if (sc.length > 0) visibleSeriesGroups.push({ series: s, courses: sc });
    }
    // Standalone courses in this track
    visibleStandalone = coursesNoSeries.filter((c) => c.track_id === effectiveTrackId);
  } else {
    // Show everything (all tracks mode)
    for (const s of allSeries) {
      const sc = coursesBySeries.get(s.series_id) ?? [];
      if (sc.length > 0) visibleSeriesGroups.push({ series: s, courses: sc });
    }
    visibleStandalone = coursesNoSeries;
  }

  const totalVisible = visibleSeriesGroups.reduce((s, g) => s + g.courses.length, 0) + visibleStandalone.length;
  const isEmpty = allCourses.length === 0;

  return (
    <Box sx={{ p: 2 }}>
      {/* Header: Track name (clickable) + Create Course */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Button
          onClick={() => setSelectorOpen(true)}
          endIcon={<UnfoldMoreIcon />}
          sx={{ textTransform: 'none', px: 1, py: 0.5 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {activeTrack ? activeTrack.title : 'All Courses'}
          </Typography>
          <Chip label={`${totalVisible} courses`} size="small" variant="outlined" sx={{ ml: 1.5 }} />
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="small"
          onClick={() => navigate('/courses/new')}
        >
          Create Course
        </Button>
      </Stack>

      {/* Track description */}
      {activeTrack?.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 1 }}>
          {activeTrack.description}
        </Typography>
      )}

      {/* Course content */}
      {isEmpty ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No courses yet.
        </Typography>
      ) : totalVisible === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No courses in this track.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {visibleSeriesGroups.map((sg, idx) => (
            <SeriesAccordion
              key={sg.series.series_id}
              series={sg.series}
              courses={sg.courses}
              defaultExpanded={idx === 0}
            />
          ))}
          {visibleStandalone.length > 0 && (
            <Box>
              {visibleSeriesGroups.length > 0 && (
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, mt: 1 }}>
                  Standalone Courses
                </Typography>
              )}
              <Stack spacing={1}>
                {visibleStandalone.map((course) => (
                  <CourseCard key={course.course_id} course={course} />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      )}

      {/* Track selector modal */}
      <TrackSelectorModal
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        tracks={allTracks}
        activeTrackId={effectiveTrackId}
        onSelect={setActiveTrackId}
      />
    </Box>
  );
}
