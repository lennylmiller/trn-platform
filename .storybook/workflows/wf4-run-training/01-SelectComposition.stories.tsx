import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, Card, CardContent, CardActionArea, Stack, Chip, Radio, Button,
} from '@mui/material';
import { mockCompositionListItems } from '../../mocks/mockData';
import { COMPOSITION_KIND_LABELS } from '@trn-platform/shared';

const SelectComposition = () => {
  const [selected, setSelected] = React.useState<number | null>(null);

  return (
    <Box sx={{ p: 3, maxWidth: 700 }}>
      <Typography variant="h5" gutterBottom>Select Composition</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Pick a story, tutorial, or module to run as a training session.
      </Typography>
      <Stack spacing={2}>
        {mockCompositionListItems.map((comp) => (
          <Card
            key={comp.composition_id}
            variant="outlined"
            sx={{ borderColor: selected === comp.composition_id ? 'primary.main' : undefined, borderWidth: selected === comp.composition_id ? 2 : 1 }}
          >
            <CardActionArea onClick={() => setSelected(comp.composition_id)}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Radio checked={selected === comp.composition_id} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>{comp.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{comp.description}</Typography>
                  </Box>
                  <Stack spacing={0.5} alignItems="flex-end">
                    <Chip label={COMPOSITION_KIND_LABELS[comp.kind]} size="small" color="info" />
                    <Chip label={`${comp.block_count} blocks`} size="small" variant="outlined" />
                    <Chip label={`${comp.flow_count} flows`} size="small" variant="outlined" />
                  </Stack>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
      <Button variant="contained" disabled={!selected} sx={{ mt: 3 }}>Start Session</Button>
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Run Training/01 Select Composition',
  component: SelectComposition,
  tags: ['wf-4', 'domain-compositions'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
