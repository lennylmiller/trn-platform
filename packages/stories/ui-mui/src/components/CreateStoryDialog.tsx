import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCreateStory } from '@trn-platform/stories-data-access';
import type { Story } from '@trn-platform/shared';

export interface CreateStoryDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (story: Story) => void;
}

export function CreateStoryDialog({ open, onClose, onCreated }: CreateStoryDialogProps) {
  const [title, setTitle] = useState('');
  const [storyUd, setStoryUd] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateStory();

  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Auto-generate story_ud from title if user hasn't manually edited it
    if (!storyUd || storyUd === slugify(title)) {
      setStoryUd(slugify(value));
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!storyUd.trim()) {
      setError('Identifier is required.');
      return;
    }

    setError(null);
    createMutation.mutate(
      {
        story_ud: storyUd.trim().toLowerCase(),
        title: title.trim(),
        description: description.trim() || null,
      },
      {
        onSuccess: (story) => {
          setTitle('');
          setStoryUd('');
          setDescription('');
          onCreated?.(story);
          onClose();
        },
        onError: (err) => {
          setError(err.message);
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Story</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <TextField
            label="Title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            fullWidth
            autoFocus
            placeholder="e.g. Johnson Family"
          />

          <TextField
            label="Identifier"
            value={storyUd}
            onChange={(e) => setStoryUd(e.target.value)}
            required
            fullWidth
            size="small"
            helperText="Short lowercase key used to tag steps (e.g. johnson)"
            slotProps={{
              input: { sx: { fontFamily: 'monospace' } },
            }}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={3}
            fullWidth
            placeholder="The narrative premise — who is this person, where do they work, what plan do they have?"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={createMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}
