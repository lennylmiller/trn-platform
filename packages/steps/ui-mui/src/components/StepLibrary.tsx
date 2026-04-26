import React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import TerminalIcon from '@mui/icons-material/Terminal';
import StorageIcon from '@mui/icons-material/Storage';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import type { Step, StepType } from '@trn-platform/shared';

const TYPE_ICONS: Record<StepType, React.ReactElement> = {
  shell: <TerminalIcon fontSize="small" />,
  sql: <StorageIcon fontSize="small" />,
  manual: <TouchAppIcon fontSize="small" />,
};

export interface StepLibraryProps {
  steps: Step[];
  onSelectStep?: (step: Step) => void;
}

/**
 * Compact sidebar panel showing the step library.
 * Used by the flows domain for adding steps to a flow.
 */
export function StepLibrary({ steps = [], onSelectStep }: StepLibraryProps) {
  if (steps.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Step Library
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No steps available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
        Step Library
      </Typography>
      <List dense disablePadding>
        {steps.map((step) => (
          <ListItemButton
            key={step.step_id}
            onClick={() => onSelectStep?.(step)}
            sx={{ py: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              {TYPE_ICONS[step.type] ?? <TerminalIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText
              primary={step.label}
              primaryTypographyProps={{
                variant: 'body2',
                noWrap: true,
              }}
              secondary={step.category}
              secondaryTypographyProps={{
                variant: 'caption',
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
