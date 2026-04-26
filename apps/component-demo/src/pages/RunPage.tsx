import React from 'react';
import {
  Box, Typography, Card, CardContent, CardActionArea, Stack, Chip, Button, Divider,
  Paper, LinearProgress, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type RunTarget = { id: number; name: string; type: 'flow' | 'composition'; itemCount: number };

const targets: RunTarget[] = [
  { id: 1, name: 'New Hire Onboarding Demo', type: 'flow', itemCount: 3 },
  { id: 2, name: 'Claims Processing Overview', type: 'flow', itemCount: 5 },
  { id: 1, name: 'New Hire Onboarding', type: 'composition', itemCount: 3 },
  { id: 2, name: 'Claims Deep Dive', type: 'composition', itemCount: 7 },
];

export default function RunPage() {
  const [selected, setSelected] = React.useState<RunTarget | null>(null);
  const [status, setStatus] = React.useState<'idle' | 'running' | 'complete'>('idle');

  const handleRun = () => {
    setStatus('running');
    setTimeout(() => setStatus('complete'), 2000);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>Run Training</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select a flow or composition to run. The execution engine will step through each item, pausing where configured.
      </Typography>

      {/* Status bar */}
      {status === 'running' && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.light' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Executing: {selected?.name}</Typography>
          <LinearProgress />
        </Paper>
      )}
      {status === 'complete' && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'success.light' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircleIcon color="success" />
            <Typography variant="subtitle2">Execution complete: {selected?.name}</Typography>
          </Stack>
        </Paper>
      )}

      {/* Target selection */}
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Select a target</Typography>
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {targets.map((target, i) => (
          <Card
            key={`${target.type}-${target.id}`}
            variant="outlined"
            sx={{
              borderColor: selected === target ? 'primary.main' : undefined,
              borderWidth: selected === target ? 2 : 1,
            }}
          >
            <CardActionArea onClick={() => { setSelected(target); setStatus('idle'); }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={target.type}
                      size="small"
                      color={target.type === 'flow' ? 'secondary' : 'info'}
                      variant="outlined"
                    />
                    <Typography variant="body1" fontWeight={500}>{target.name}</Typography>
                  </Stack>
                  <Chip label={`${target.itemCount} items`} size="small" variant="outlined" />
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Console preview */}
      {status !== 'idle' && (
        <Paper
          variant="outlined"
          sx={{
            p: 2, mb: 2, bgcolor: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace', fontSize: 12,
            minHeight: 150, borderRadius: 2,
          }}
        >
          <Box sx={{ color: '#6a9955' }}>{'>'} Starting execution of {selected?.name}...</Box>
          {status === 'running' && <Box sx={{ color: '#569cd6' }}>Executing step 1...</Box>}
          {status === 'complete' && (
            <>
              <Box>[step 1] Complete (120ms)</Box>
              <Box>[step 2] Complete (340ms)</Box>
              <Box>[step 3] Complete (750ms)</Box>
              <Box sx={{ color: '#6a9955', mt: 1 }}>All steps completed successfully.</Box>
            </>
          )}
        </Paper>
      )}

      <Button
        variant="contained"
        size="large"
        startIcon={<PlayArrowIcon />}
        disabled={!selected || status === 'running'}
        onClick={handleRun}
      >
        {status === 'complete' ? 'Run Again' : 'Run'}
      </Button>
    </Box>
  );
}
