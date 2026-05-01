import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoIcon from '@mui/icons-material/Info';
import LinkIcon from '@mui/icons-material/Link';
import type { CompositionBlock, BlockType } from '@trn-platform/shared';

const BLOCK_TYPE_BORDER_COLORS: Record<BlockType, string> = {
  narrative: '#2196f3',
  flow: '#4caf50',
  note: '#ff9800',
  composition: '#9c27b0',
};

const BLOCK_TYPE_ICONS: Record<BlockType, React.ReactNode> = {
  narrative: <DescriptionIcon fontSize="small" />,
  flow: <PlayArrowIcon fontSize="small" />,
  note: <InfoIcon fontSize="small" />,
  composition: <LinkIcon sx={{
    fontSize: "small"
  }} />,
};

const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  narrative: 'Narrative',
  flow: 'Flow',
  note: 'Note',
  composition: 'Composition',
};

export interface CompositionBlockCardProps {
  block: CompositionBlock;
  onEdit?: (blockId: number) => void;
  onRemove?: (blockId: number) => void;
}

export function CompositionBlockCard({ block, onEdit, onRemove }: CompositionBlockCardProps) {
  if (!block) return null;
  const borderColor = BLOCK_TYPE_BORDER_COLORS[block.block_type];

  const renderContent = () => {
    switch (block.block_type) {
      case 'narrative':
        return (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
            {block.content ?? 'Empty narrative'}
          </Typography>
        );

      case 'flow':
        return (
          <Stack direction="row" spacing={1} sx={{
            alignItems: "center"
          }}>
            <Typography variant="body2" sx={{
              fontWeight: 500
            }}>
              {block.flow_name ?? 'No flow selected'}
            </Typography>
            {block.flow_step_count != null && (
              <Chip
                label={`${block.flow_step_count} step${block.flow_step_count !== 1 ? 's' : ''}`}
                size="small"
                color="success"
                variant="outlined"
              />
            )}
          </Stack>
        );

      case 'note':
        return (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontFamily: 'monospace',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
            {block.technical_content ?? 'Empty note'}
          </Typography>
        );

      case 'composition':
        return (
          <Stack direction="row" spacing={1} sx={{
            alignItems: "center"
          }}>
            <Typography variant="body2" sx={{
              fontWeight: 500
            }}>
              {block.ref_composition_title ?? 'No composition selected'}
            </Typography>
            {block.ref_composition_kind && (
              <Chip label={block.ref_composition_kind} size="small" variant="outlined" />
            )}
          </Stack>
        );
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: `4px solid ${borderColor}`,
        mb: 1,
      }}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" spacing={1} sx={{
          alignItems: "center"
        }}>
          <DragHandleIcon sx={{ color: 'text.disabled', cursor: 'grab' }} />

          <Chip
            label={block.seq}
            size="small"
            sx={{ minWidth: 28, fontWeight: 600 }}
          />

          <Box sx={{ color: borderColor, display: 'flex', alignItems: 'center' }}>
            {BLOCK_TYPE_ICONS[block.block_type]}
          </Box>

          <Chip
            label={BLOCK_TYPE_LABELS[block.block_type]}
            size="small"
            variant="outlined"
            sx={{ borderColor }}
          />

          {block.heading && (
            <Typography variant="subtitle2" noWrap sx={{ flexGrow: 1 }}>
              {block.heading}
            </Typography>
          )}

          <Box sx={{ flexGrow: block.heading ? 0 : 1 }} />

          <Box sx={{ ml: 'auto' }}>
            {renderContent()}
          </Box>

          <IconButton size="small" onClick={() => onEdit?.(block.block_id)} aria-label="Edit block">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => onRemove?.(block.block_id)}
            aria-label="Remove block"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
}
