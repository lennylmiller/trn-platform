import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { StoryPlanItem } from '@trn-platform/shared';
import { useStoryPlanner } from '@trn-platform/stories-feature';
import { PlanItemCard } from './PlanItemCard';

export interface StoryPlanViewProps {
  storyId: number;
  onBack?: () => void;
  onPlanItemClick?: (item: StoryPlanItem) => void;
}

/**
 * Displays a story's plan as a checklist grouped by act,
 * with progress bar and status indicators.
 */
export function StoryPlanView({ storyId, onBack, onPlanItemClick }: StoryPlanViewProps) {
  const { story, isLoading, progress, itemsByAct, nextPendingItem } = useStoryPlanner(storyId);

  if (isLoading) {
    return <LinearProgress sx={{ m: 2 }} />;
  }

  if (!story) {
    return (
      <Typography color="text.secondary" sx={{ p: 2 }}>
        Story not found.
      </Typography>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
          {onBack && (
            <Button size="small" startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mr: 1 }}>
              Stories
            </Button>
          )}
          <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
            {story.title}
          </Typography>
          <Chip
            label={story.status}
            size="small"
            color={story.status === 'complete' ? 'success' : story.status === 'authoring' ? 'warning' : 'default'}
            sx={{ fontWeight: 600, textTransform: 'capitalize' }}
          />
        </Stack>

        {story.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {story.description}
          </Typography>
        )}

        {/* Progress bar */}
        {progress.total > 0 && (
          <Box>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {progress.done} of {progress.total} steps done
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progress.percent}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress.percent}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}

        {/* Next action hint */}
        {nextPendingItem && (
          <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
            Next: {nextPendingItem.title}
          </Typography>
        )}
      </Box>

      {/* Plan items grouped by act */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 1.5 }}>
        {itemsByAct.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No plan items yet. Use AI Chat or MCP tools to generate a plan.
          </Typography>
        ) : (
          itemsByAct.map(({ act, items }) => (
            <Box key={act} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'text.secondary' }}>
                {act}
              </Typography>
              {items.map((item) => (
                <PlanItemCard
                  key={item.plan_item_id}
                  item={item}
                  onClick={onPlanItemClick}
                />
              ))}
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
