import React, { useState, useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useFlows } from '@trn-platform/flows-data-access';

export interface FlowPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (flowId: number) => void;
}

export function FlowPickerModal({ open, onClose, onSelect }: FlowPickerModalProps) {
  const [search, setSearch] = useState('');
  const { data: flows, isLoading } = useFlows();

  const filtered = useMemo(() => {
    if (!flows) return [];
    if (!search.trim()) return flows;
    const lower = search.toLowerCase();
    return flows.filter(
      (f) =>
        f.name.toLowerCase().includes(lower) ||
        (f.description ?? '').toLowerCase().includes(lower),
    );
  }, [flows, search]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Flow</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder="Search flows..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2, mt: 1 }}
        />

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {!isLoading && filtered.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No flows found
          </Typography>
        )}

        {!isLoading && filtered.length > 0 && (
          <List sx={{ maxHeight: 360, overflow: 'auto' }}>
            {filtered.map((flow) => (
              <ListItemButton
                key={flow.flow_id}
                onClick={() => {
                  onSelect(flow.flow_id);
                  onClose();
                }}
              >
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>{flow.name}</span>
                      <Chip
                        label={`${flow.step_count} step${flow.step_count !== 1 ? 's' : ''}`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  }
                  secondary={flow.description}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
