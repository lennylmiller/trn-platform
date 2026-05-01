import { useState } from 'react';
import { Box } from '@mui/material';
import { StoryList, StoryPlanView, StoryWizard } from '@trn-platform/stories-ui-mui';
import type { Story } from '@trn-platform/shared';

export default function StoriesPage() {
  const [activeStoryId, setActiveStoryId] = useState<number | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  if (activeStoryId) {
    return (
      <Box sx={{ height: '100%' }}>
        <StoryPlanView
          storyId={activeStoryId}
          onBack={() => setActiveStoryId(null)}
          onPlanItemClick={(item) => {
            // Future: navigate to workbench with plan item context
            console.log('Plan item clicked:', item);
          }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <StoryList
        onStoryClick={(story: Story) => setActiveStoryId(story.story_id)}
        onNewStory={() => setWizardOpen(true)}
      />
      <StoryWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onComplete={(story) => setActiveStoryId(story.story_id)}
      />
    </Box>
  );
}
