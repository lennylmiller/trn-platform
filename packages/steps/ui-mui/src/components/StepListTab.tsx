import React, { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { StepCategory } from '@trn-platform/shared';
import { STEP_CATEGORY_LABELS } from '@trn-platform/shared';
import { useSteps } from '@trn-platform/steps-data-access';
import { useStepFilters } from '@trn-platform/steps-feature';
import { StepCard } from './StepCard';
import type { Step } from '@trn-platform/shared';

const CATEGORIES: StepCategory[] = ['setup', 'scenario', 'sync', 'verify', 'utility'];

export interface StepListTabProps {
  onStepClick?: (step: Step) => void;
}

/**
 * Full step list view with category filter and text search.
 */
export function StepListTab({ onStepClick }: StepListTabProps) {
  const [category, setCategory] = useState<StepCategory | ''>('');
  const [search, setSearch] = useState('');

  const { data: steps, isLoading, error } = useSteps();
  const { filtered } = useStepFilters(steps, {
    category: category || undefined,
    search,
  });

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setCategory(event.target.value as StepCategory | '');
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load steps: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="step-category-filter-label">Category</InputLabel>
          <Select
            labelId="step-category-filter-label"
            value={category}
            label="Category"
            onChange={handleCategoryChange}
          >
            <MenuItem value="">All Categories</MenuItem>
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {STEP_CATEGORY_LABELS[cat] ?? cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Search steps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
      </Stack>

      {filtered.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={4}>
          No steps found.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {filtered.map((step) => (
            <StepCard key={step.step_id} step={step} onClick={onStepClick} />
          ))}
        </Stack>
      )}
    </Box>
  );
}
