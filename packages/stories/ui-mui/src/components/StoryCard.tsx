import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Story } from '@trn-platform/shared';

export interface StoryCardProps {
  story: Story;
  onClick?: (story: Story) => void;
}

const STATUS_CHIP: Record<string, { label: string; color: 'default' | 'info' | 'warning' | 'primary' | 'success' }> = {
  draft: { label: 'Draft', color: 'default' },
  planning: { label: 'Planning', color: 'info' },
  authoring: { label: 'Authoring', color: 'warning' },
  review: { label: 'Review', color: 'primary' },
  complete: { label: 'Complete', color: 'success' },
};

export function StoryCard({ story, onClick }: StoryCardProps) {
  const chip = STATUS_CHIP[story.status] ?? STATUS_CHIP['draft']!;

  const content = (
    <CardContent>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {story.title}
        </Typography>
        <Chip
          label={chip.label}
          color={chip.color}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Stack>
      {story.description && (
        <Typography variant="body2" color="text.secondary" sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {story.description}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {story.story_ud}
      </Typography>
    </CardContent>
  );

  return (
    <Card variant="outlined">
      {onClick ? (
        <CardActionArea onClick={() => onClick(story)}>
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
}
