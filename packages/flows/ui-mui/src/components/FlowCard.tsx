import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BuildIcon from '@mui/icons-material/Build';
import DeleteIcon from '@mui/icons-material/Delete';
import type { FlowListItem } from '@trn-platform/shared';

export interface FlowCardProps {
  flow: FlowListItem;
  onOpenDev?: (flowId: number) => void;
  onPresent?: (flowId: number) => void;
  onDelete?: (flowId: number) => void;
}

export function FlowCard({ flow, onOpenDev, onPresent, onDelete }: FlowCardProps) {
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
            {flow.name}
          </Typography>
          <Chip
            label={`${flow.step_count} step${flow.step_count !== 1 ? 's' : ''}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Stack>
        {flow.description && (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
            {flow.description}
          </Typography>
        )}
        {!flow.description && (
          <Typography
            variant="body2"
            sx={{
              color: "text.disabled",
              fontStyle: "italic"
            }}>
            No description
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ px: 2, pb: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
          <Button
            size="small"
            startIcon={<BuildIcon />}
            onClick={() => onOpenDev?.(flow.flow_id)}
          >
            Open Dev
          </Button>
          <Button
            size="small"
            startIcon={<PlayArrowIcon />}
            onClick={() => onPresent?.(flow.flow_id)}
            disabled={flow.step_count === 0}
          >
            Present
          </Button>
        </Box>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => onDelete?.(flow.flow_id)}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
}
