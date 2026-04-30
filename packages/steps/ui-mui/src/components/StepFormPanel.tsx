import { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { Step, StepType, StepCategory, StepCreate, DisplayQuery } from '@trn-platform/shared';
import { STEP_CATEGORY_LABELS, STEP_TYPE_COLORS, STEP_STORY_LABELS } from '@trn-platform/shared';
import { useCreateStep, useUpdateStep, useSteps } from '@trn-platform/steps-data-access';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEP_TYPES: StepType[] = ['shell', 'sql', 'manual'];
const CATEGORIES: StepCategory[] = ['setup', 'scenario', 'sync', 'verify', 'utility'];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StepFormPanelProps {
  /** Existing step to edit. When undefined, form is in create mode. */
  step?: Step;
  /** Called after a successful create or update with the saved step. */
  onSaved?: (step: Step) => void;
  /** Called when the user clicks "New Step" to reset the form. */
  onNew?: () => void;
  /** Called when the user selects a step from the picker. */
  onStepSelected?: (step: Step) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function serializeDisplayQueries(queries: DisplayQuery[] | null | undefined): string {
  if (!queries || queries.length === 0) return '';
  return JSON.stringify(queries, null, 2);
}

function parseDisplayQueriesInput(input: string): DisplayQuery[] | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed) as DisplayQuery[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Inline step authoring form panel for the Step Workbench.
 * Includes a step picker (Autocomplete), all step fields, and save/new buttons.
 */
export function StepFormPanel({ step, onSaved, onNew, onStepSelected }: StepFormPanelProps) {
  const isEdit = !!step;

  // Form state
  const [label, setLabel] = useState('');
  const [type, setType] = useState<StepType>('shell');
  const [category, setCategory] = useState<StepCategory>('setup');
  const [story, setStory] = useState<string | null>(null);
  const [commandText, setCommandText] = useState('');
  const [description, setDescription] = useState('');
  const [displayQueriesJson, setDisplayQueriesJson] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Mutations
  const createMutation = useCreateStep();
  const updateMutation = useUpdateStep();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Step picker data
  const { data: allSteps = [] } = useSteps();

  // Populate form when step changes
  useEffect(() => {
    if (step) {
      setLabel(step.label);
      setType(step.type);
      setCategory(step.category);
      setStory(step.story ?? null);
      setCommandText(step.command_text ?? '');
      setDescription(step.description ?? '');
      setDisplayQueriesJson(serializeDisplayQueries(step.display_queries));
    } else {
      setLabel('');
      setType('shell');
      setCategory('setup');
      setStory(null);
      setCommandText('');
      setDescription('');
      setDisplayQueriesJson('');
    }
    setJsonError(null);
    setValidationError(null);
  }, [step]);

  const handleSubmit = () => {
    if (!label.trim()) {
      setValidationError('Label is required.');
      return;
    }

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
      story,
    };

    if (isEdit && step) {
      updateMutation.mutate(
        { stepId: step.step_id, updates: input },
        { onSuccess: (saved) => onSaved?.(saved) },
      );
    } else {
      createMutation.mutate(input, {
        onSuccess: (saved) => onSaved?.(saved),
      });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto', p: 2 }}>
      {/* Step Picker — visually distinct from form fields */}
      <Box sx={{ mb: 1.5, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Autocomplete
          options={allSteps}
          getOptionLabel={(opt) => opt.label}
          groupBy={(opt) => opt.story ? (STEP_STORY_LABELS[opt.story] ?? opt.story) : 'Common'}
          value={step ?? null}
          onChange={(_e, value) => {
            if (value) {
              onStepSelected?.(value);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search steps to edit..."
              size="small"
              slotProps={{
                ...params.slotProps,
                input: {
                  ...params.slotProps.input,
                  startAdornment: (
                    <>
                      <SearchIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 20 }} />
                      {params.slotProps.input.startAdornment}
                    </>
                  ),
                },
              }}
            />
          )}
          renderOption={(props, option) => {
            const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: string };
            return (
              <li key={key} {...rest}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                  <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                    {option.label}
                  </Typography>
                  <Chip
                    label={option.type}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      bgcolor: STEP_TYPE_COLORS[option.type],
                      color: '#fff',
                    }}
                  />
                </Stack>
              </li>
            );
          }}
          size="small"
          isOptionEqualToValue={(opt, val) => opt.step_id === val.step_id}
        />
        {step && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Editing step #{step.step_id}
          </Typography>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Stack spacing={2} sx={{ flex: 1 }}>
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
          size="small"
        />

        <Stack direction="row" spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="workbench-type-label">Type</InputLabel>
            <Select
              labelId="workbench-type-label"
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

          <FormControl fullWidth size="small">
            <InputLabel id="workbench-category-label">Category</InputLabel>
            <Select
              labelId="workbench-category-label"
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
        </Stack>

        <FormControl fullWidth size="small">
          <InputLabel id="workbench-story-label">Story</InputLabel>
          <Select
            labelId="workbench-story-label"
            value={story ?? ''}
            label="Story"
            onChange={(e: SelectChangeEvent<string>) => setStory(e.target.value || null)}
          >
            <MenuItem value="">
              <em>Common (no story)</em>
            </MenuItem>
            {Object.entries(STEP_STORY_LABELS).map(([key, label_]) => (
              <MenuItem key={key} value={key}>
                {label_}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Command Text"
          value={commandText}
          onChange={(e) => setCommandText(e.target.value)}
          multiline
          minRows={4}
          fullWidth
          slotProps={{
            input: {
              sx: { fontFamily: 'monospace', fontSize: '0.85rem' },
            },
          }}
        />

        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={2}
          fullWidth
          size="small"
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

      {/* Actions */}
      <Stack direction="row" spacing={1.5} sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          disabled={isSaving}
          size="small"
        >
          {isSaving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onNew}
          disabled={isSaving}
          size="small"
        >
          New Step
        </Button>
      </Stack>
    </Box>
  );
}
