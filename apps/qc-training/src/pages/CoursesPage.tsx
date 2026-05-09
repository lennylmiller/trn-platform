import { useState, useEffect, useCallback } from 'react';
import {
  Accordion, AccordionDetails, AccordionSummary,
  Alert, Box, Button, Card, CardActionArea, CardContent,
  Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, IconButton, List, ListItemButton, ListItemText,
  Stack, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCourses, useSeries, useTracks, tracksKeys, coursesKeys, seriesKeys } from '@trn-platform/courses-data-access';
import { CreateCourseDialog } from '@trn-platform/courses-ui-mui';
import type { CourseListItem, CourseSeries, CourseTrack } from '@trn-platform/shared';

const STATUS_COLORS: Record<string, 'default' | 'success' | 'warning'> = {
  draft: 'warning',
  published: 'success',
  archived: 'default',
};

const STORAGE_KEY = 'courses-active-track';

// ---------------------------------------------------------------------------
// Course Card
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Series Accordion
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Track Settings Dialog
// ---------------------------------------------------------------------------

function TrackSettingsDialog({ open, onClose, track }: {
  open: boolean;
  onClose: () => void;
  track: CourseTrack;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(track.title);
  const [description, setDescription] = useState(track.description ?? '');
  const [seq, setSeq] = useState(track.seq);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(track.title);
    setDescription(track.description ?? '');
    setSeq(track.seq);
  }, [track]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/v2/courses/tracks/${track.track_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: description || null, seq }),
      });
      void queryClient.invalidateQueries({ queryKey: tracksKeys.lists() });
      onClose();
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete track "${track.title}"? Courses and series will be unlinked but not deleted.`)) return;
    try {
      await fetch(`/api/v2/courses/tracks/${track.track_id}`, { method: 'DELETE' });
      void queryClient.invalidateQueries({ queryKey: tracksKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ['courses'] });
      onClose();
    } catch (err) {
      console.error('Delete track failed:', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Track Settings</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Title" size="small" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextField label="Description" size="small" fullWidth multiline minRows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          <TextField label="Sort Order" size="small" type="number" value={seq} onChange={(e) => setSeq(Number(e.target.value))} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Button color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>Delete Track</Button>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!title.trim() || saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Add Track Dialog
// ---------------------------------------------------------------------------

function AddTrackDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = async () => {
    if (!title.trim()) return;
    try {
      await fetch('/api/v2/courses/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || null }),
      });
      void queryClient.invalidateQueries({ queryKey: tracksKeys.lists() });
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error('Create track failed:', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add New Track</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Track Title" size="small" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <TextField label="Description (optional)" size="small" fullWidth multiline minRows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleAdd} disabled={!title.trim()}>Add</Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Track Selector Modal
// ---------------------------------------------------------------------------

function TrackSelectorModal({ open, onClose, tracks, activeTrackId, onSelect }: {
  open: boolean;
  onClose: () => void;
  tracks: CourseTrack[];
  activeTrackId: number | null;
  onSelect: (trackId: number | null) => void;
}) {
  const [settingsTrack, setSettingsTrack] = useState<CourseTrack | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Select Track</Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
              Add Track
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List>
            <ListItemButton
              selected={activeTrackId === null}
              onClick={() => { onSelect(null); onClose(); }}
            >
              <ListItemText
                primary="All Courses"
                secondary="Show all tracks and unassigned courses"
                slotProps={{ primary: { sx: { fontWeight: activeTrackId === null ? 700 : 400 } } }}
              />
            </ListItemButton>
            <Divider />
            {tracks.map((track) => (
              <ListItemButton
                key={track.track_id}
                selected={activeTrackId === track.track_id}
                onClick={() => { onSelect(track.track_id); }}
              >
                <ListItemText
                  primary={track.title}
                  secondary={track.description}
                  slotProps={{
                    primary: { sx: { fontWeight: activeTrackId === track.track_id ? 700 : 400 } },
                    secondary: { sx: { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } },
                  }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setSettingsTrack(track); }}
                  title="Track settings"
                  sx={{ ml: 1 }}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {settingsTrack && (
        <TrackSettingsDialog
          open={!!settingsTrack}
          onClose={() => setSettingsTrack(null)}
          track={settingsTrack}
        />
      )}

      <AddTrackDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

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
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    try {
      if (activeTrackId !== null) localStorage.setItem(STORAGE_KEY, String(activeTrackId));
      else localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }, [activeTrackId]);

  const handleSelectTrack = useCallback((trackId: number | null) => {
    setActiveTrackId(trackId);
  }, []);

  const isLoading = coursesLoading || seriesLoading || tracksLoading;

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  if (coursesError) return <Alert severity="error" sx={{ m: 2 }}>Failed to load courses: {coursesError.message}</Alert>;

  const allCourses = courses ?? [];
  const allSeries = seriesList ?? [];
  const allTracks = tracksList ?? [];

  // Auto-select first track if saved track no longer exists
  const effectiveTrackId = activeTrackId !== null && allTracks.some((t) => t.track_id === activeTrackId)
    ? activeTrackId
    : allTracks.length > 0 ? allTracks[0]!.track_id : null;

  const activeTrack = allTracks.find((t) => t.track_id === effectiveTrackId);

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
    const trackSeries = allSeries
      .filter((s) => s.track_id === effectiveTrackId)
      .sort((a, b) => (a.track_seq ?? 0) - (b.track_seq ?? 0));
    for (const s of trackSeries) {
      const sc = coursesBySeries.get(s.series_id) ?? [];
      if (sc.length > 0) visibleSeriesGroups.push({ series: s, courses: sc });
    }
    visibleStandalone = coursesNoSeries.filter((c) => c.track_id === effectiveTrackId);
  } else {
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
      {/* Header */}
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
          onClick={() => setCreateOpen(true)}
        >
          Create Course
        </Button>
      </Stack>

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
        onSelect={handleSelectTrack}
      />

      {/* Create course modal */}
      <CreateCourseDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(courseId, trackId) => {
          void queryClient.invalidateQueries({ queryKey: coursesKeys.all });
          void queryClient.invalidateQueries({ queryKey: seriesKeys.all });
          void queryClient.invalidateQueries({ queryKey: tracksKeys.all });
          // Switch to the new course's track so it's visible when coming back
          if (trackId !== null) setActiveTrackId(trackId);
          navigate(`/courses/edit/${courseId}`);
        }}
        tracks={allTracks}
        series={allSeries}
      />
    </Box>
  );
}
