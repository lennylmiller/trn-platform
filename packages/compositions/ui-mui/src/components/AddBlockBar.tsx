import React from 'react';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import DescriptionIcon from '@mui/icons-material/Description';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoIcon from '@mui/icons-material/Info';
import LinkIcon from '@mui/icons-material/Link';
import type { BlockType } from '@trn-platform/shared';

export interface AddBlockBarProps {
  onAdd?: (blockType: BlockType) => void;
  disabled?: boolean;
}

export function AddBlockBar({ onAdd, disabled }: AddBlockBarProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DescriptionIcon />}
          onClick={() => onAdd?.('narrative')}
          disabled={disabled}
        >
          Narrative
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PlayArrowIcon />}
          onClick={() => onAdd?.('flow')}
          disabled={disabled}
          color="success"
        >
          Flow
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<InfoIcon />}
          onClick={() => onAdd?.('note')}
          disabled={disabled}
          color="warning"
        >
          Note
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<LinkIcon />}
          onClick={() => onAdd?.('composition')}
          disabled={disabled}
          color="secondary"
        >
          Composition
        </Button>
      </Stack>
    </Paper>
  );
}
