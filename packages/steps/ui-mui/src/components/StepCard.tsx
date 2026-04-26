import React from 'react';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Step } from '@trn-platform/shared';
import { STEP_TYPE_COLORS, STEP_CATEGORY_LABELS } from '@trn-platform/shared';

export interface StepCardProps {
  step: Step;
  onClick?: (step: Step) => void;
}

/**
 * MUI Card displaying a step's label, type chip, category chip,
 * and a description preview.
 */
export function StepCard({ step, onClick }: StepCardProps) {
  const typeColor = STEP_TYPE_COLORS[step.type] ?? '#757575';

  const content = (
    <CardContent>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Chip
          label={step.type}
          size="small"
          sx={{
            bgcolor: typeColor,
            color: '#fff',
            fontWeight: 600,
            textTransform: 'uppercase',
            fontSize: '0.7rem',
          }}
        />
        <Chip
          label={STEP_CATEGORY_LABELS[step.category] ?? step.category}
          size="small"
          variant="outlined"
        />
      </Stack>

      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {step.label}
      </Typography>

      {step.description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {step.description}
        </Typography>
      )}

      {step.display_queries && step.display_queries.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {step.display_queries.length} display quer{step.display_queries.length === 1 ? 'y' : 'ies'}
        </Typography>
      )}
    </CardContent>
  );

  if (onClick) {
    return (
      <Card variant="outlined">
        <CardActionArea onClick={() => onClick(step)}>{content}</CardActionArea>
      </Card>
    );
  }

  return <Card variant="outlined">{content}</Card>;
}
