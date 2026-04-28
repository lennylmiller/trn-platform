import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import type { FlowStep, FlowStepUpdate } from '@trn-platform/shared';

export interface PropertiesPanelProps {
  step: FlowStep | null;
  onUpdate: (updates: FlowStepUpdate) => void;
}

export function PropertiesPanel({ step, onUpdate }: PropertiesPanelProps) {
  const [presenterNotes, setPresenterNotes] = useState('');
  const [overrideJson, setOverrideJson] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Sync local state when selected step changes
  useEffect(() => {
    if (step) {
      setPresenterNotes(step.presenter_notes ?? '');
      setOverrideJson(
        step.override_display_queries
          ? JSON.stringify(step.override_display_queries, null, 2)
          : '',
      );
      setJsonError(null);
    } else {
      setPresenterNotes('');
      setOverrideJson('');
      setJsonError(null);
    }
  }, [step?.flow_step_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePauseAfterChange = useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      onUpdate({ pause_after: checked });
    },
    [onUpdate],
  );

  const handleVisibleChange = useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      onUpdate({ visible_in_execution: checked });
    },
    [onUpdate],
  );

  const handleNotesBlur = useCallback(() => {
    if (!step) return;
    const trimmed = presenterNotes.trim();
    const current = step.presenter_notes ?? '';
    if (trimmed !== current) {
      onUpdate({ presenter_notes: trimmed || null });
    }
  }, [presenterNotes, step, onUpdate]);

  const handleOverrideBlur = useCallback(() => {
    if (!step) return;
    const trimmed = overrideJson.trim();
    if (!trimmed) {
      if (step.override_display_queries) {
        onUpdate({ override_display_queries: null });
      }
      setJsonError(null);
      return;
    }
    try {
      const parsed = JSON.parse(trimmed);
      setJsonError(null);
      onUpdate({ override_display_queries: parsed });
    } catch {
      setJsonError('Invalid JSON');
    }
  }, [overrideJson, step, onUpdate]);

  if (!step) {
    return (
      <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Step Properties
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mt: 4,
            textAlign: 'center'
          }}>
          Select a step to view and edit its properties.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Step Properties
      </Typography>
      <Typography variant="subtitle2" gutterBottom sx={{
        color: "text.secondary"
      }}>
        {step.label}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={step.pause_after}
              onChange={handlePauseAfterChange}
              size="small"
            />
          }
          label="Pause after this step"
        />

        <FormControlLabel
          control={
            <Switch
              checked={step.visible_in_execution}
              onChange={handleVisibleChange}
              size="small"
            />
          }
          label="Visible in presentation"
        />

        <TextField
          label="Presenter Notes"
          value={presenterNotes}
          onChange={(e) => setPresenterNotes(e.target.value)}
          onBlur={handleNotesBlur}
          multiline
          minRows={3}
          maxRows={8}
          fullWidth
          placeholder="Notes visible only to the presenter..."
        />

        <TextField
          label="Override Display Queries (JSON)"
          value={overrideJson}
          onChange={(e) => {
            setOverrideJson(e.target.value);
            setJsonError(null);
          }}
          onBlur={handleOverrideBlur}
          multiline
          minRows={3}
          maxRows={10}
          fullWidth
          error={!!jsonError}
          helperText={jsonError ?? 'Array of { "label": "...", "sql": "..." } objects'}
          slotProps={{
            input: {
              sx: { fontFamily: 'monospace', fontSize: '0.85rem' },
            },
          }}
        />
      </Box>
    </Paper>
  );
}
