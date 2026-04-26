import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, Card, CardContent, CardActionArea, Stack, Chip, Button, Radio, Alert,
} from '@mui/material';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import { mockFlowListItems } from '../../mocks/mockData';

const AddFlowBlock = () => {
  const [selectedFlow, setSelectedFlow] = React.useState<number | null>(null);
  const [added, setAdded] = React.useState(false);

  return (
    <Box sx={{ p: 3, maxWidth: 700 }}>
      <Typography variant="h5" gutterBottom>Add Flow Block</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Pick a flow to embed in the composition. When the composition is presented, this flow will run inline.
      </Typography>
      {added && <Alert severity="success" sx={{ mb: 2 }}>Flow block added to composition.</Alert>}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <PlaylistPlayIcon color="secondary" />
        <Chip label="Flow Block" size="small" color="secondary" variant="outlined" />
      </Stack>
      <Stack spacing={1.5}>
        {mockFlowListItems.map((flow) => (
          <Card
            key={flow.flow_id}
            variant="outlined"
            sx={{ borderColor: selectedFlow === flow.flow_id ? 'secondary.main' : undefined }}
          >
            <CardActionArea onClick={() => setSelectedFlow(flow.flow_id)}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Radio checked={selectedFlow === flow.flow_id} color="secondary" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">{flow.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{flow.description}</Typography>
                  </Box>
                  <Chip label={`${flow.step_count} steps`} size="small" variant="outlined" />
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
      <Button variant="contained" sx={{ mt: 2 }} disabled={!selectedFlow} onClick={() => setAdded(true)}>
        Add Flow Block
      </Button>
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Author Story/03 Add Flow Block',
  component: AddFlowBlock,
  tags: ['wf-3', 'domain-compositions', 'domain-flows'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
