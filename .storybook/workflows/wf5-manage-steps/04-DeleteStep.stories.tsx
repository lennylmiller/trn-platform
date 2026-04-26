import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, Card, CardContent, Stack, Chip, Button, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { mockSteps } from '../../mocks/mockData';
import { STEP_TYPE_COLORS } from '@trn-platform/shared';

const DeleteStep = () => {
  const step = mockSteps[4]; // Reset training environment (not a seed)
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>Delete Step</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Remove an unused step from the library. Seed steps cannot be deleted.
      </Typography>

      {deleted ? (
        <Alert severity="info">Step &quot;{step.label}&quot; has been deleted.</Alert>
      ) : (
        <>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Chip label={step.type} size="small" sx={{ bgcolor: STEP_TYPE_COLORS[step.type], color: '#fff' }} />
                <Typography variant="subtitle1" fontWeight={600}>{step.label}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">{step.description}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip label={`ID: ${step.step_id}`} size="small" variant="outlined" />
                <Chip label={step.is_seed ? 'Seed (protected)' : 'User-created'} size="small" color={step.is_seed ? 'warning' : 'default'} />
              </Stack>
            </CardContent>
          </Card>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDialogOpen(true)}
            disabled={step.is_seed}
          >
            Delete Step
          </Button>

          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>
              <Stack direction="row" spacing={1} alignItems="center">
                <WarningAmberIcon color="error" />
                <span>Confirm Deletion</span>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete &quot;{step.label}&quot;? This action cannot be undone.
                Any flows using this step will need to be updated.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button color="error" variant="contained" onClick={() => { setDialogOpen(false); setDeleted(true); }}>
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Manage Steps/04 Delete Step',
  component: DeleteStep,
  tags: ['wf-5', 'domain-steps'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
