import React from 'react';
import {
  Box, Typography, Card, CardContent, CardActionArea, Stack, Chip,
  Divider, CircularProgress, Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFlows } from '@trn-platform/flows-data-access';
import { useCompositions } from '@trn-platform/compositions-data-access';

export default function RunPage() {
  const navigate = useNavigate();
  const flowsQuery = useFlows();
  const compositionsQuery = useCompositions();

  const isLoading = flowsQuery.isLoading || compositionsQuery.isLoading;
  const isError = flowsQuery.isError || compositionsQuery.isError;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Failed to load data. Is the Express API running? (pnpm server:dev)
      </Alert>
    );
  }

  const flows = flowsQuery.data ?? [];
  const compositions = compositionsQuery.data ?? [];

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>Run Training</Typography>
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          mb: 3
        }}>
        Select a flow or composition to present. Flows step through executable actions. Compositions walk through narrative blocks with embedded flows.
      </Typography>
      {/* Compositions */}
      {compositions.length > 0 && (
        <>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{
              color: "text.secondary",
              mt: 2
            }}>
            Compositions ({compositions.length})
          </Typography>
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            {compositions.map((comp) => (
              <Card key={comp.composition_id} variant="outlined">
                <CardActionArea onClick={() => navigate(`/compositions/run/${comp.composition_id}`)}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                      <Stack direction="row" spacing={1} sx={{
                        alignItems: "center"
                      }}>
                        <Chip
                          label={comp.kind}
                          size="small"
                          color={comp.kind === 'story' ? 'primary' : comp.kind === 'tutorial' ? 'secondary' : 'warning'}
                          variant="outlined"
                        />
                        <Typography variant="body1" sx={{
                          fontWeight: 500
                        }}>{comp.title}</Typography>
                      </Stack>
                      {comp.block_count != null && (
                        <Chip label={`${comp.block_count} blocks`} size="small" variant="outlined" />
                      )}
                    </Stack>
                    {comp.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          mt: 0.5
                        }}>
                        {comp.description}
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        </>
      )}
      <Divider sx={{ mb: 2 }} />
      {/* Flows */}
      {flows.length > 0 && (
        <>
          <Typography variant="subtitle2" gutterBottom sx={{
            color: "text.secondary"
          }}>
            Flows ({flows.length})
          </Typography>
          <Stack spacing={1.5}>
            {flows.map((flow) => (
              <Card key={flow.flow_id} variant="outlined">
                <CardActionArea onClick={() => navigate(`/flows/run/${flow.flow_id}`)}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                      <Stack direction="row" spacing={1} sx={{
                        alignItems: "center"
                      }}>
                        <Chip label="flow" size="small" color="secondary" variant="outlined" />
                        <Typography variant="body1" sx={{
                          fontWeight: 500
                        }}>{flow.name}</Typography>
                      </Stack>
                      {flow.step_count != null && (
                        <Chip label={`${flow.step_count} steps`} size="small" variant="outlined" />
                      )}
                    </Stack>
                    {flow.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          mt: 0.5
                        }}>
                        {flow.description}
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        </>
      )}
      {flows.length === 0 && compositions.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No flows or compositions found. Seed the database with pnpm db:seed.
        </Alert>
      )}
    </Box>
  );
}
