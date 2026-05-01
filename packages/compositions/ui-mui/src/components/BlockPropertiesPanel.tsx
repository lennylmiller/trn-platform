import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import type { CompositionBlock, BlockUpdate } from '@trn-platform/shared';

export interface BlockPropertiesPanelProps {
  block: CompositionBlock | null;
  onChange?: (blockId: number, updates: BlockUpdate) => void;
  onPickFlow?: (blockId: number) => void;
  onPickComposition?: (blockId: number) => void;
}

export function BlockPropertiesPanel({
  block,
  onChange,
  onPickFlow,
  onPickComposition,
}: BlockPropertiesPanelProps) {
  if (!block) {
    return (
      <Paper sx={{ p: 3, minHeight: 400 }} variant="outlined">
        <Typography
          sx={{
            color: "text.secondary",
            textAlign: 'center',
            pt: 8
          }}>
          Select a block to edit its properties
        </Typography>
      </Paper>
    );
  }

  const handleFieldChange = (field: keyof BlockUpdate) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange?.(block.block_id, { [field]: e.target.value });
  };

  return (
    <Paper sx={{ p: 3 }} variant="outlined">
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="overline" sx={{
            color: "text.secondary"
          }}>
            Block Type
          </Typography>
          <Box sx={{
            mt: 0.5
          }}>
            <Chip label={block.block_type} size="small" />
          </Box>
        </Box>

        <Divider />

        <TextField
          label="Heading"
          value={block.heading ?? ''}
          onChange={handleFieldChange('heading')}
          fullWidth
          size="small"
        />

        <TextField
          label="Story Content"
          value={block.content ?? ''}
          onChange={handleFieldChange('content')}
          fullWidth
          multiline
          minRows={3}
          maxRows={8}
          size="small"
        />

        <TextField
          label="Technical Content"
          value={block.technical_content ?? ''}
          onChange={handleFieldChange('technical_content')}
          fullWidth
          multiline
          minRows={3}
          maxRows={8}
          size="small"
          sx={{ '& textarea': { fontFamily: 'monospace' } }}
        />

        {block.block_type === 'flow' && (
          <>
            <Divider />
            <Box>
              <Typography variant="overline" sx={{
                color: "text.secondary"
              }}>
                Flow Reference
              </Typography>
              {block.flow_name ? (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: "center",
                    mt: 0.5
                  }}>
                  <Typography variant="body2">{block.flow_name}</Typography>
                  {block.flow_step_count != null && (
                    <Chip
                      label={`${block.flow_step_count} steps`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.disabled",
                    mt: 0.5
                  }}>
                  No flow selected
                </Typography>
              )}
              <Button
                size="small"
                variant="outlined"
                startIcon={<OpenInNewIcon />}
                onClick={() => onPickFlow?.(block.block_id)}
                sx={{ mt: 1 }}
              >
                {block.flow_id ? 'Change Flow' : 'Select Flow'}
              </Button>
            </Box>
          </>
        )}

        {block.block_type === 'composition' && (
          <>
            <Divider />
            <Box>
              <Typography variant="overline" sx={{
                color: "text.secondary"
              }}>
                Composition Reference
              </Typography>
              {block.ref_composition_title ? (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: "center",
                    mt: 0.5
                  }}>
                  <Typography variant="body2">{block.ref_composition_title}</Typography>
                  {block.ref_composition_kind && (
                    <Chip label={block.ref_composition_kind} size="small" variant="outlined" />
                  )}
                </Stack>
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.disabled",
                    mt: 0.5
                  }}>
                  No composition selected
                </Typography>
              )}
              <Button
                size="small"
                variant="outlined"
                startIcon={<OpenInNewIcon />}
                onClick={() => onPickComposition?.(block.block_id)}
                sx={{ mt: 1 }}
              >
                {block.ref_composition_id ? 'Change Composition' : 'Select Composition'}
              </Button>
            </Box>
          </>
        )}

        <Divider />

        <TextField
          label="Presenter Notes"
          value={block.presenter_notes ?? ''}
          onChange={handleFieldChange('presenter_notes')}
          fullWidth
          multiline
          minRows={2}
          maxRows={6}
          size="small"
        />
      </Stack>
    </Paper>
  );
}
