import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import type { Story } from '@trn-platform/shared';
import { useStories } from '@trn-platform/stories-data-access';
import { StoryCard } from './StoryCard';

export interface StoryListProps {
  onStoryClick?: (story: Story) => void;
  onNewStory?: () => void;
}

/**
 * Displays all stories as cards with status chips.
 */
export function StoryList({ onStoryClick, onNewStory }: StoryListProps) {
  const { data: stories, isLoading, error } = useStories();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load stories: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Stories
        </Typography>
        {onNewStory && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={onNewStory}
          >
            New Story
          </Button>
        )}
      </Stack>

      {!stories || stories.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No stories yet. Create one to start authoring a training scenario.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {stories.map((story) => (
            <StoryCard key={story.story_id} story={story} onClick={onStoryClick} />
          ))}
        </Stack>
      )}
    </Box>
  );
}
