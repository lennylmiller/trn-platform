import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { Step, StepType, StepCategory, StepCreate, DisplayQuery } from '@trn-platform/shared';
import { STEP_CATEGORY_LABELS } from '@trn-platform/shared';
import { useCreateStep, useUpdateStep } from '@trn-platform/steps-data-access';

const STEP_TYPES: StepType[] = ['shell', 'sql', 'manual'];
const CATEGORIES: StepCategory[] = ['setup', 'scenario', 'sync', 'verify', 'utility'];

export interface StepEditorModalProps {
  open: boolean;
  onClose: () => void;
  /** If provided, the modal is in edit mode. Otherwise, create mode. */
  step?: Step;
}

function serializeDisplayQueries(queries: DisplayQuery[] | null | undefined): string {
  if (!queries || queries.length === 0) return '';
  return JSON.stringify(queries, null, 2);
}

function parseDisplayQueriesInput(input: string): DisplayQuery[] | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed) as DisplayQuery[];
}

/**
 * MUI Dialog for creating or editing a step.
 */
export function StepEditorModal({ open, onClose, step }: StepEditorModalProps) {
  const isEdit = !!step;

  const [label, setLabel] = useState('');
  const [type, setType] = useState<StepType>('shell');
  const [category, setCategory] = useState<StepCategory>('setup');
  const [commandText, setCommandText] = useState('');
  const [description, setDescription] = useState('');
  const [displayQueriesJson, setDisplayQueriesJson] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const createMutation = useCreateStep();
  const updateMutation = useUpdateStep();

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Populate form when editing
  useEffect(() => {
    if (step) {
      setLabel(step.label);
      setType(step.type);
      setCategory(step.category);
      setCommandText(step.command_text ?? '');
      setDescription(step.description ?? '');
      setDisplayQueriesJson(serializeDisplayQueries(step.display_queries));
    } else {
      setLabel('');
      setType('shell');
      setCategory('setup');
      setCommandText('');
      setDescription('');
      setDisplayQueriesJson('');
    }
    setJsonError(null);
    setValidationError(null);
  }, [step, open]);

  const handleSubmit = () => {
    // Validate required fields
    if (!label.trim()) {
      setValidationError('Label is required.');
      return;
    }

    // Validate display_queries JSON
    let displayQueries: DisplayQuery[] | null = null;
    if (displayQueriesJson.trim()) {
      try {
        displayQueries = parseDisplayQueriesInput(displayQueriesJson);
      } catch {
        setJsonError('Invalid JSON for display queries.');
        return;
      }
    }

    setValidationError(null);
    setJsonError(null);

    const input: StepCreate = {
      label: label.trim(),
      type,
      category,
      command_text: commandText.trim() || null,
      description: description.trim() || null,
      display_queries: displayQueries,
    };

    if (isEdit && step) {
      updateMutation.mutate(
        { stepId: step.step_id, updates: input },
        { onSuccess: () => onClose() },
      );
    } else {
      createMutation.mutate(input, { onSuccess: () => onClose() });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Step' : 'Create Step'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {validationError && (
            <Typography color="error" variant="body2">
              {validationError}
            </Typography>
          )}

          <TextField
            label="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            fullWidth
            autoFocus
          />

          <FormControl fullWidth>
            <InputLabel id="step-type-label">Type</InputLabel>
            <Select
              labelId="step-type-label"
              value={type}
              label="Type"
              onChange={(e: SelectChangeEvent<string>) => setType(e.target.value as StepType)}
            >
              {STEP_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="step-category-label">Category</InputLabel>
            <Select
              labelId="step-category-label"
              value={category}
              label="Category"
              onChange={(e: SelectChangeEvent<string>) => setCategory(e.target.value as StepCategory)}
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {STEP_CATEGORY_LABELS[cat] ?? cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Command Text"
            value={commandText}
            onChange={(e) => setCommandText(e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />

          <TextField
            label="Display Queries (JSON)"
            value={displayQueriesJson}
            onChange={(e) => {
              setDisplayQueriesJson(e.target.value);
              setJsonError(null);
            }}
            multiline
            minRows={3}
            fullWidth
            error={!!jsonError}
            helperText={jsonError ?? 'Array of { "label": "...", "sql": "..." } objects'}
            slotProps={{
              input: {
                sx: { fontFamily: 'monospace', fontSize: '0.85rem' },
              },
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSaving}>
          {isSaving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
