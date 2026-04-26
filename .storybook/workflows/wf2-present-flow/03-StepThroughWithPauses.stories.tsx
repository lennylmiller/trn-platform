import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, Card, CardContent, Stack, Chip, Button, Alert, Paper,
} from '@mui/material';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const StepThroughWithPauses = () => {
  const [continued, setContinued] = React.useState(false);

  return (
    <Box sx={{ p: 3, maxWidth: 700 }}>
      <Typography variant="h5" gutterBottom>Step Through With Pauses</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        The flow is paused after step 2. The presenter can review notes and continue when ready.
      </Typography>

      <Alert severity="warning" icon={<PauseCircleIcon />} sx={{ mb: 3 }}>
        {continued
          ? 'Resumed! Step 3 is now executing...'
          : 'Execution paused after "Load member seed data". Click Continue to proceed.'}
      </Alert>

      <Stack spacing={1.5} sx={{ mb: 3 }}>
        <Card variant="outlined" sx={{ borderLeft: 4, borderColor: 'success.main' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleIcon color="success" fontSize="small" />
              <Chip label="1" size="small" variant="outlined" />
              <Typography variant="body2">Create training database</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>120ms</Typography>
            </Stack>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ borderLeft: 4, borderColor: continued ? 'success.main' : 'warning.main' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack direction="row" spacing={1} alignItems="center">
              {continued ? <CheckCircleIcon color="success" fontSize="small" /> : <PauseCircleIcon color="warning" fontSize="small" />}
              <Chip label="2" size="small" variant="outlined" />
              <Typography variant="body2" fontWeight={600}>Load member seed data</Typography>
              <Chip label="Pause" size="small" color="warning" variant="outlined" />
            </Stack>
            {!continued && (
              <Paper sx={{ mt: 1.5, p: 1.5, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Typography variant="caption" fontWeight={600}>Presenter Notes:</Typography>
                <Typography variant="body2">Pause here to discuss the member schema with the audience.</Typography>
              </Paper>
            )}
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ borderLeft: 4, borderColor: continued ? 'primary.main' : 'divider', opacity: continued ? 1 : 0.5 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid', borderColor: 'divider' }} />
              <Chip label="3" size="small" variant="outlined" />
              <Typography variant="body2">Verify claim counts</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {!continued && (
        <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => setContinued(true)}>
          Continue
        </Button>
      )}
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Present Flow/03 Step Through With Pauses',
  component: StepThroughWithPauses,
  tags: ['wf-2', 'domain-execution'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
