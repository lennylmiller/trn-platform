import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box, Typography, Card, CardContent, CardActionArea, Stack, Chip, Radio, Button,
} from '@mui/material';
import { mockFlowListItems } from '../../mocks/mockData';

const SelectFlow = () => {
  const [selected, setSelected] = React.useState<number | null>(null);

  return (
    <Box sx={{ p: 3, maxWidth: 700 }}>
      <Typography variant="h5" gutterBottom>Select Flow</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose a flow to present. Each flow contains an ordered set of steps to execute during training.
      </Typography>
      <Stack spacing={2}>
        {mockFlowListItems.map((flow) => (
          <Card
            key={flow.flow_id}
            variant="outlined"
            sx={{ borderColor: selected === flow.flow_id ? 'primary.main' : undefined, borderWidth: selected === flow.flow_id ? 2 : 1 }}
          >
            <CardActionArea onClick={() => setSelected(flow.flow_id)}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Radio checked={selected === flow.flow_id} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>{flow.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{flow.description}</Typography>
                  </Box>
                  <Chip label={`${flow.step_count} steps`} size="small" variant="outlined" />
                  {flow.is_seed && <Chip label="Seed" size="small" color="info" />}
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
      <Button variant="contained" disabled={!selected} sx={{ mt: 3 }}>
        Start Presentation
      </Button>
    </Box>
  );
};

const meta: Meta = {
  title: 'Workflows/Present Flow/01 Select Flow',
  component: SelectFlow,
  tags: ['wf-2', 'domain-flows'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
