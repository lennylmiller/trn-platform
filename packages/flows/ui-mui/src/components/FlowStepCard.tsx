import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { FlowStep } from '@trn-platform/shared';
import { STEP_TYPE_COLORS, STEP_CATEGORY_LABELS } from '@trn-platform/shared';

export interface FlowStepCardProps {
  step: FlowStep;
  index: number;
  selected?: boolean;
  onSelect?: (flowStepId: number) => void;
  onRemove?: (flowStepId: number) => void;
  onEdit?: (flowStepId: number) => void;
}

export function FlowStepCard({
  step,
  index,
  selected = false,
  onSelect,
  onRemove,
  onEdit,
}: FlowStepCardProps) {
  const typeColor = STEP_TYPE_COLORS[step.type] ?? '#757575';

  return (
    <Box>
      <Paper
        variant="outlined"
        onClick={() => onSelect?.(step.flow_step_id)}
        sx={{
          p: 2,
          borderLeft: `4px solid ${typeColor}`,
          cursor: onSelect ? 'pointer' : 'default',
          bgcolor: selected ? 'action.selected' : 'background.paper',
          transition: 'background-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
          '&:hover': {
            bgcolor: selected ? 'action.selected' : 'action.hover',
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                bgcolor: 'grey.200',
                color: 'grey.700',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {index + 1}
            </Typography>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="subtitle2" noWrap fontWeight={600}>
                {step.label}
              </Typography>
              <Stack direction="row" spacing={0.5} mt={0.5}>
                <Chip
                  label={step.type}
                  size="small"
                  sx={{
                    bgcolor: typeColor,
                    color: '#fff',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.65rem',
                    height: 20,
                  }}
                />
                <Chip
                  label={STEP_CATEGORY_LABELS[step.category] ?? step.category}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0, ml: 1 }}>
            {onEdit && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(step.flow_step_id);
                }}
                aria-label="Edit step"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {onRemove && (
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(step.flow_step_id);
                }}
                aria-label="Remove step"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        </Stack>

        {step.presenter_notes && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              fontStyle: 'italic',
            }}
          >
            {step.presenter_notes}
          </Typography>
        )}
      </Paper>

      {step.pause_after && (
        <Divider sx={{ my: 1 }}>
          <Chip
            label="PAUSE"
            size="small"
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.65rem' }}
          />
        </Divider>
      )}
    </Box>
  );
}
