import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SaveIcon from '@mui/icons-material/Save';
import type { CourseDraft } from '@trn-platform/shared';

export interface DraftPanelProps {
  courseId: number;
  /** Called when user promotes a draft — parent should call build_course_content */
  onPromote?: (draftContent: string) => void;
  /** Called when a draft is selected — parent can show it in the center canvas */
  onSelectDraft?: (draft: CourseDraft | null) => void;
}

export function DraftPanel({ courseId, onPromote, onSelectDraft }: DraftPanelProps) {
  const [drafts, setDrafts] = useState<CourseDraft[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selected = drafts.find((d) => d.draft_id === selectedId);

  // Fetch drafts
  const fetchDrafts = useCallback(async () => {
    try {
      const res = await fetch(`/api/v2/courses/${courseId}/drafts`);
      if (res.ok) {
        const data = await res.json();
        setDrafts(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => { void fetchDrafts(); }, [fetchDrafts]);

  // When selection changes, load into editor
  useEffect(() => {
    if (selected) {
      setEditTitle(selected.title);
      setEditContent(selected.content);
      setIsDirty(false);
      onSelectDraft?.(selected);
    } else {
      setEditTitle('');
      setEditContent('');
      onSelectDraft?.(null);
    }
  }, [selectedId, selected?.draft_id]);

  const handleCreate = async () => {
    try {
      const res = await fetch(`/api/v2/courses/${courseId}/drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Draft', content: '# New Draft\n\nStart writing your course outline here...', source: 'manual' }),
      });
      if (res.ok) {
        const draft = await res.json();
        await fetchDrafts();
        setSelectedId(draft.draft_id);
      }
    } catch (err) {
      console.error('Create draft failed:', err);
    }
  };

  const handleSave = async () => {
    if (!selectedId || !isDirty) return;
    setIsSaving(true);
    try {
      await fetch(`/api/v2/courses/${courseId}/drafts/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      setIsDirty(false);
      await fetchDrafts();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (draftId: number) => {
    if (!window.confirm('Delete this draft?')) return;
    await fetch(`/api/v2/courses/${courseId}/drafts/${draftId}`, { method: 'DELETE' });
    if (selectedId === draftId) { setSelectedId(null); }
    await fetchDrafts();
  };

  const handlePromote = () => {
    if (!editContent.trim() || !onPromote) return;
    onPromote(editContent);
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Drafts</Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={handleCreate}>New</Button>
      </Stack>

      {/* Draft list */}
      <Box sx={{ maxHeight: 180, overflow: 'auto', borderBottom: 1, borderColor: 'divider' }}>
        {drafts.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            No drafts yet. Create one or use Plan mode.
          </Typography>
        ) : (
          <List dense sx={{ py: 0 }}>
            {drafts.map((d) => (
              <ListItemButton
                key={d.draft_id}
                selected={selectedId === d.draft_id}
                onClick={() => setSelectedId(d.draft_id)}
                sx={{ '&:hover .delete-btn': { opacity: 1 } }}
              >
                <ListItemText
                  primary={d.title}
                  secondary={d.source ?? 'manual'}
                  slotProps={{
                    primary: { variant: 'body2', noWrap: true, sx: { fontWeight: selectedId === d.draft_id ? 700 : 400 } },
                    secondary: { variant: 'caption' },
                  }}
                />
                <Chip label={d.status} size="small" variant="outlined" sx={{ mr: 0.5, fontSize: '0.65rem' }} />
                <IconButton
                  className="delete-btn"
                  size="small"
                  onClick={(e) => { e.stopPropagation(); void handleDelete(d.draft_id); }}
                  sx={{ opacity: 0, transition: 'opacity 0.15s' }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>

      {/* Editor */}
      {selected ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Stack direction="row" spacing={1} sx={{ px: 2, py: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              fullWidth
              value={editTitle}
              onChange={(e) => { setEditTitle(e.target.value); setIsDirty(true); }}
              placeholder="Draft title"
              slotProps={{ input: { sx: { fontWeight: 600 } } }}
            />
            <IconButton size="small" onClick={handleSave} disabled={!isDirty || isSaving} title="Save">
              <SaveIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Box sx={{ flex: 1, overflow: 'auto', px: 2, pb: 1 }}>
            <TextField
              fullWidth
              multiline
              minRows={8}
              value={editContent}
              onChange={(e) => { setEditContent(e.target.value); setIsDirty(true); }}
              placeholder="Write your course outline in markdown..."
              slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.85rem' } } }}
              sx={{ '& .MuiInputBase-root': { alignItems: 'flex-start' } }}
            />
          </Box>
          <Divider />
          <Stack direction="row" spacing={1} sx={{ p: 1.5, justifyContent: 'flex-end' }}>
            <Button
              size="small"
              variant="contained"
              startIcon={<RocketLaunchIcon />}
              onClick={handlePromote}
              disabled={!editContent.trim()}
            >
              Promote to Course
            </Button>
          </Stack>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Select a draft to edit, or create a new one.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
