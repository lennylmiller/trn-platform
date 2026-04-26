import React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { useFlows } from '@trn-platform/flows-data-access';
import type { FlowListItem } from '@trn-platform/shared';
import { FlowCard } from './FlowCard';

export interface FlowListTabProps {
  onNewFlow?: () => void;
  onOpenDev?: (flowId: number) => void;
  onPresent?: (flowId: number) => void;
  onDelete?: (flowId: number) => void;
}

function LoadingSkeleton() {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Grid key={i} xs={12} sm={6} md={4}>
          <Skeleton variant="rounded" height={180} />
        </Grid>
      ))}
    </Grid>
  );
}

export function FlowListTab({ onNewFlow, onOpenDev, onPresent, onDelete }: FlowListTabProps) {
  const { data: flows, isLoading, error } = useFlows();

  if (isLoading) {
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>
            Flows
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} disabled>
            New Flow
          </Button>
        </Stack>
        <LoadingSkeleton />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>
            Flows
          </Typography>
        </Stack>
        <Alert severity="error" sx={{ m: 2 }}>
          Failed to load flows: {error.message}
        </Alert>
      </Box>
    );
  }

  const flowList: FlowListItem[] = flows ?? [];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Flows
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onNewFlow}>
          New Flow
        </Button>
      </Stack>

      {flowList.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No flows yet
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Create your first flow to organize steps into a demo sequence.
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={onNewFlow}>
            Create Flow
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {flowList.map((flow) => (
            <Grid key={flow.flow_id} xs={12} sm={6} md={4}>
              <FlowCard
                flow={flow}
                onOpenDev={onOpenDev}
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
