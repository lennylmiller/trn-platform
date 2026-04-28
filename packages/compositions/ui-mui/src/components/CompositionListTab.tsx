import { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import type { CompositionKind } from '@trn-platform/shared';
import { useCompositions } from '@trn-platform/compositions-data-access';
import { CompositionCard } from './CompositionCard';

const KINDS: CompositionKind[] = ['story', 'tutorial', 'module'];
const KIND_LABELS: Record<CompositionKind, string> = {
  story: 'Stories',
  tutorial: 'Tutorials',
  module: 'Modules',
};

export interface CompositionListTabProps {
  onEdit?: (compositionId: number) => void;
  onPresent?: (compositionId: number) => void;
  onDelete?: (compositionId: number) => void;
  onCreate?: () => void;
}

export function CompositionListTab({
  onEdit,
  onPresent,
  onDelete,
  onCreate,
}: CompositionListTabProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const activeKind = KINDS[tabIndex]!;
  const { data: compositions, isLoading, isError, error } = useCompositions(activeKind);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Tabs value={tabIndex} onChange={(_e, v: number) => setTabIndex(v)}>
          {KINDS.map((kind) => (
            <Tab key={kind} label={KIND_LABELS[kind]} />
          ))}
        </Tabs>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
          Create
        </Button>
      </Box>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.message ?? 'Failed to load compositions'}
        </Alert>
      )}
      {!isLoading && !isError && compositions?.length === 0 && (
        <Typography
          sx={{
            color: "text.secondary",
            textAlign: 'center',
            py: 6
          }}>
          No {KIND_LABELS[activeKind].toLowerCase()} yet. Create one to get started.
        </Typography>
      )}
      {!isLoading && !isError && compositions && compositions.length > 0 && (
        <Grid container spacing={2}>
          {compositions.map((comp) => (
            <Grid key={comp.composition_id} size={{ xs: 12, sm: 6, md: 4 }}>
              <CompositionCard
                composition={comp}
                onEdit={onEdit}
                onPresent={onPresent}
                onDelete={onDelete}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
