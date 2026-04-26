import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography, TextField, Chip, Card, CardContent, Stack, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { mockStepListItems } from '../../mocks/mockData';
import { STEP_TYPE_COLORS, STEP_CATEGORY_LABELS } from '@trn-platform/shared';

const BrowseStepLibrary = () => {
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string | null>(null);

  const filtered = mockStepListItems.filter((s) => {
    const matchesSearch = !search || s.label.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(mockStepListItems.map((s) => s.category))];

  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h5" gutterBottom>Step Library</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Browse and filter reusable steps. Click a category chip to filter, or type to search by name.
      </Typography>
      <TextField
        fullWidth
        size="small"
        placeholder="Search steps..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
        sx={{ mb: 2 }}
      />
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Chip label="All" variant={categoryFilter === null ? 'filled' : 'outlined'} onClick={() => setCategoryFilter(null)} />
        {categories.map((cat) => (
          <Chip
            key={cat}
            label={STEP_CATEGORY_LABELS[cat] ?? cat}
            variant={categoryFilter === cat ? 'filled' : 'outlined'}
            onClick={() => setCategoryFilter(cat)}
          />
        ))}
      </Stack>
      <Stack spacing={2}>
        {filtered.map((step) => (
          <Card key={step.step_id} variant="outlined">
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight={600}>{step.label}</Typography>
                <Chip
                  label={step.type}
                  size="small"
                  sx={{ bgcolor: STEP_TYPE_COLORS[step.type], color: '#fff', fontWeight: 600 }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {step.description ?? 'No description'}
              </Typography>
              <Chip label={STEP_CATEGORY_LABELS[step.category] ?? step.category} size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No steps match your filters.</Typography>
        )}
      </Stack>
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Build Demo/01 Browse Step Library',
  component: BrowseStepLibrary,
  tags: ['wf-1', 'domain-steps'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
