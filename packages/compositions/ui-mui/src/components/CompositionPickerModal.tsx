import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CompositionKind } from '@trn-platform/shared';
import { useCompositions } from '@trn-platform/compositions-data-access';

const KINDS: (CompositionKind | undefined)[] = [undefined, 'story', 'tutorial', 'module'];
const KIND_TAB_LABELS = ['All', 'Stories', 'Tutorials', 'Modules'];

const KIND_COLORS: Record<CompositionKind, 'primary' | 'secondary' | 'warning'> = {
  story: 'primary',
  tutorial: 'secondary',
  module: 'warning',
};

export interface CompositionPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (compositionId: number) => void;
  /** Optional: exclude this composition from the list (prevent self-reference) */
  excludeId?: number;
}

export function CompositionPickerModal({
  open,
  onClose,
  onSelect,
  excludeId,
}: CompositionPickerModalProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const activeKind = KINDS[tabIndex];
  const { data: compositions, isLoading } = useCompositions(activeKind);

  const filtered = compositions?.filter((c) => c.composition_id !== excludeId) ?? [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Composition</DialogTitle>
      <DialogContent>
        <Tabs
          value={tabIndex}
          onChange={(_e, v: number) => setTabIndex(v)}
          sx={{ mb: 2 }}
        >
          {KIND_TAB_LABELS.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {!isLoading && filtered.length === 0 && (
          <Typography
            sx={{
              color: "text.secondary",
              textAlign: 'center',
              py: 4
            }}>
            No compositions found
          </Typography>
        )}

        {!isLoading && filtered.length > 0 && (
          <List sx={{ maxHeight: 360, overflow: 'auto' }}>
            {filtered.map((comp) => (
              <ListItemButton
                key={comp.composition_id}
                onClick={() => {
                  onSelect(comp.composition_id);
                  onClose();
                }}
              >
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} sx={{
                      alignItems: "center"
                    }}>
                      <span>{comp.title}</span>
                      <Chip
                        label={comp.kind}
                        size="small"
                        color={KIND_COLORS[comp.kind]}
                      />
                      <Chip
                        label={`${comp.block_count} blocks`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  }
                  secondary={comp.description}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
