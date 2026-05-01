import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import type { CompositionListItem, CompositionKind } from '@trn-platform/shared';

const KIND_COLORS: Record<CompositionKind, 'primary' | 'secondary' | 'warning'> = {
  story: 'primary',
  tutorial: 'secondary',
  module: 'warning',
};

const KIND_LABELS: Record<CompositionKind, string> = {
  story: 'Story',
  tutorial: 'Tutorial',
  module: 'Module',
};

export interface CompositionCardProps {
  composition: CompositionListItem;
  onEdit?: (compositionId: number) => void;
  onPresent?: (compositionId: number) => void;
  onDelete?: (compositionId: number) => void;
}

export function CompositionCard({
  composition,
  onEdit,
  onPresent,
  onDelete,
}: CompositionCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s ease-in-out',
        '&:hover': { boxShadow: 4 },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1
          }}>
          <Typography variant="h6" component="div" noWrap sx={{ flexGrow: 1, mr: 1 }}>
            {composition.title}
          </Typography>
          <Chip
            label={KIND_LABELS[composition.kind]}
            size="small"
            color={KIND_COLORS[composition.kind]}
          />
        </Stack>

        {composition.description ? (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1.5
            }}>
            {composition.description}
          </Typography>
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: "text.disabled",
              fontStyle: "italic",
              mb: 1.5
            }}>
            No description
          </Typography>
        )}

        <Stack direction="row" spacing={1}>
          <Chip
            label={`${composition.block_count} block${composition.block_count !== 1 ? 's' : ''}`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${composition.flow_count} flow${composition.flow_count !== 1 ? 's' : ''}`}
            size="small"
            variant="outlined"
            color="info"
          />
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEdit?.(composition.composition_id)}
          >
            Edit
          </Button>
          <Button
            size="small"
            startIcon={<PlayArrowIcon />}
            onClick={() => onPresent?.(composition.composition_id)}
            disabled={composition.block_count === 0}
          >
            Present
          </Button>
        </Box>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => onDelete?.(composition.composition_id)}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
}
