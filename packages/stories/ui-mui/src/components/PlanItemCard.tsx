import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import type { StoryPlanItem } from '@trn-platform/shared';

export interface PlanItemCardProps {
  item: StoryPlanItem;
  onClick?: (item: StoryPlanItem) => void;
}

const STATUS_ICON = {
  pending: <RadioButtonUncheckedIcon sx={{ color: 'text.disabled', fontSize: 20 }} />,
  in_progress: <PlayCircleIcon sx={{ color: 'warning.main', fontSize: 20 }} />,
  done: <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />,
  skipped: <SkipNextIcon sx={{ color: 'text.disabled', fontSize: 20 }} />,
};

export function PlanItemCard({ item, onClick }: PlanItemCardProps) {
  const icon = STATUS_ICON[item.status] ?? STATUS_ICON.pending;
  const isDone = item.status === 'done' || item.status === 'skipped';

  const content = (
    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        {icon}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              textDecoration: isDone ? 'line-through' : 'none',
              color: isDone ? 'text.secondary' : 'text.primary',
            }}
            noWrap
          >
            {item.seq}. {item.title}
          </Typography>
          {item.description && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {item.description}
            </Typography>
          )}
        </Box>
        {item.tables_involved && item.tables_involved.length > 0 && (
          <Chip
            label={`${item.tables_involved.length} tables`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        )}
        {item.step_id && (
          <Chip
            label={`step #${item.step_id}`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        )}
      </Stack>
    </CardContent>
  );

  return (
    <Card variant="outlined" sx={{ mb: 0.5 }}>
      {onClick ? (
        <CardActionArea onClick={() => onClick(item)}>
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
}
