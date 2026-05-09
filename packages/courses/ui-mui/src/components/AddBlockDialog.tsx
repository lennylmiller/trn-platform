import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import type { CourseBlockType } from '@trn-platform/shared';

export interface AddBlockDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (slideType: CourseBlockType, title: string) => void;
}

const SLIDE_TYPES: { value: CourseBlockType; label: string; description: string }[] = [
  { value: 'narrative', label: 'Narrative', description: 'Rich markdown content for teaching concepts' },
  { value: 'reference', label: 'Reference', description: 'Reference material or lookup information' },
  { value: 'live_demo', label: 'Live Demo', description: 'Instructor runs SQL and shows results' },
  { value: 'sql_challenge', label: 'SQL Challenge', description: 'Learner writes SQL with hints and solution' },
  { value: 'quiz', label: 'Quiz', description: 'Multiple-choice knowledge check' },
  { value: 'do_it_in_qc', label: 'Do It in QC', description: 'Hands-on task verified via SQL query' },
  { value: 'screenshot_task', label: 'Screenshot Task', description: 'Learner captures a screenshot' },
];

export function AddBlockDialog({ open, onClose, onAdd }: AddBlockDialogProps) {
  const [selected, setSelected] = useState<CourseBlockType>('narrative');
  const [title, setTitle] = useState('');

  const handleAdd = () => {
    onAdd(selected, title || SLIDE_TYPES.find((t) => t.value === selected)!.label);
    setTitle('');
    setSelected('narrative');
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setSelected('narrative');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add Slide</DialogTitle>
      <DialogContent>
        <TextField
          label="Slide Title"
          size="small"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2, mt: 1 }}
          placeholder="Optional — defaults to type name"
        />
        <List dense sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
          {SLIDE_TYPES.map((t) => (
            <ListItemButton
              key={t.value}
              selected={selected === t.value}
              onClick={() => setSelected(t.value)}
            >
              <ListItemText
                primary={t.label}
                secondary={t.description}
                slotProps={{
                  primary: { variant: 'body2', sx: { fontWeight: 600 } },
                  secondary: { variant: 'caption' },
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleAdd}>Add</Button>
      </DialogActions>
    </Dialog>
  );
}
