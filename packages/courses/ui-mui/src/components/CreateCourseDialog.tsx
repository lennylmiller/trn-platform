import { useState } from 'react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import SettingsIcon from '@mui/icons-material/Settings';
import type { CourseTrack, CourseSeries } from '@trn-platform/shared';

export interface CreateCourseDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (courseId: number) => void;
  tracks: CourseTrack[];
  series: CourseSeries[];
}

const CATEGORIES = [
  { value: 'implementation', label: 'Implementation' },
  { value: 'operations', label: 'Operations' },
  { value: 'walkthrough', label: 'Walkthrough' },
  { value: 'database', label: 'Database' },
  { value: 'troubleshooting', label: 'Troubleshooting' },
];

interface SeriesOption {
  series_id?: number;
  title: string;
  inputValue?: string; // For "Create ..." option
}

const seriesFilter = createFilterOptions<SeriesOption>();

export function CreateCourseDialog({ open, onClose, onCreated, tracks, series }: CreateCourseDialogProps) {
  const [title, setTitle] = useState('');
  const [trackId, setTrackId] = useState<number | ''>('');
  const [category, setCategory] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [description, setDescription] = useState('');
  const [actor, setActor] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<SeriesOption | null>(null);
  const [creating, setCreating] = useState(false);

  const handleClose = () => {
    setTitle('');
    setTrackId('');
    setCategory('');
    setDescription('');
    setActor('');
    setSelectedSeries(null);
    setShowMore(false);
    onClose();
  };

  const handleCreate = async () => {
    if (!title.trim() || trackId === '') return;
    setCreating(true);
    try {
      // If user typed a new series name, create it first
      let seriesId: number | null = null;
      if (selectedSeries) {
        if (selectedSeries.series_id) {
          seriesId = selectedSeries.series_id;
        } else {
          // Create new series
          const seriesRes = await fetch('/api/v2/courses/series', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: selectedSeries.inputValue ?? selectedSeries.title }),
          });
          if (!seriesRes.ok) throw new Error('Create series failed');
          const newSeries = await seriesRes.json();
          seriesId = newSeries.series_id;
        }
      }

      const body: Record<string, unknown> = {
        title: title.trim(),
        track_id: trackId,
        category: category || null,
        description: description.trim() || null,
        actor: actor.trim() || null,
        series_id: seriesId,
      };
      const res = await fetch('/api/v2/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Create failed');
      const course = await res.json();
      handleClose();
      onCreated(course.course_id);
    } catch (err) {
      console.error('Create course failed:', err);
    } finally {
      setCreating(false);
    }
  };

  const seriesOptions: SeriesOption[] = series.map((s) => ({
    series_id: s.series_id,
    title: s.title,
  }));

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Course</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label="Course Title"
            size="small"
            fullWidth
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            placeholder="e.g., Provider Network Setup"
          />

          <TextField
            select
            label="Track"
            size="small"
            fullWidth
            required
            value={trackId}
            onChange={(e) => setTrackId(Number(e.target.value))}
            helperText="Which audience/purpose group does this course belong to?"
          >
            {tracks.map((t) => (
              <MenuItem key={t.track_id} value={t.track_id}>{t.title}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Category"
            size="small"
            fullWidth
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            {CATEGORIES.map((c) => (
              <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
            ))}
          </TextField>

          {/* More options toggle */}
          <Button
            size="small"
            startIcon={<SettingsIcon />}
            onClick={() => setShowMore((v) => !v)}
            sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
          >
            {showMore ? 'Fewer options' : 'More options...'}
          </Button>

          <Collapse in={showMore}>
            <Stack spacing={2}>
              <TextField
                label="Description"
                size="small"
                fullWidth
                multiline
                minRows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of what this course covers"
              />

              <TextField
                label="Actor"
                size="small"
                fullWidth
                value={actor}
                onChange={(e) => setActor(e.target.value)}
                placeholder="e.g., QC Administrator"
                helperText="Who does the learner role-play as?"
              />

              <Autocomplete
                value={selectedSeries}
                onChange={(_event, newValue) => {
                  if (typeof newValue === 'string') {
                    setSelectedSeries({ title: newValue, inputValue: newValue });
                  } else if (newValue && newValue.inputValue) {
                    setSelectedSeries({ title: newValue.inputValue, inputValue: newValue.inputValue });
                  } else {
                    setSelectedSeries(newValue);
                  }
                }}
                filterOptions={(options, params) => {
                  const filtered = seriesFilter(options, params);
                  const { inputValue } = params;
                  const exists = options.some((o) => o.title.toLowerCase() === inputValue.toLowerCase());
                  if (inputValue !== '' && !exists) {
                    filtered.push({
                      inputValue,
                      title: `Create "${inputValue}"`,
                    });
                  }
                  return filtered;
                }}
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                freeSolo
                options={seriesOptions}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  if (option.inputValue) return option.inputValue;
                  return option.title;
                }}
                renderOption={({ key, ...props }, option) => (
                  <li key={key} {...props}>
                    {option.inputValue ? <em>{option.title}</em> : option.title}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Series"
                    size="small"
                    helperText="Type to search or create a new series"
                    placeholder="None (standalone)"
                  />
                )}
              />
            </Stack>
          </Collapse>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={!title.trim() || trackId === '' || creating}
        >
          {creating ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
