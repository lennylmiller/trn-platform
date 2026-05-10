import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DescriptionIcon from '@mui/icons-material/Description';
import EditNoteIcon from '@mui/icons-material/EditNote';

export interface WelcomeScreenProps {
  courseTitle: string;
  onStartWithGoal: () => void;
  onStartWithDocument: () => void;
  onStartFromScratch: () => void;
}

function EntryCard({ icon, title, description, onClick }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 200, maxWidth: 280 }}>
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Box sx={{ mb: 2, color: 'primary.main' }}>{icon}</Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export function WelcomeScreen({ courseTitle, onStartWithGoal, onStartWithDocument, onStartFromScratch }: WelcomeScreenProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        {courseTitle}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        How do you want to start?
      </Typography>
      <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        <EntryCard
          icon={<AutoFixHighIcon sx={{ fontSize: 40 }} />}
          title="I have a goal"
          description="Describe what you want to teach. AI will help plan the course structure."
          onClick={onStartWithGoal}
        />
        <EntryCard
          icon={<DescriptionIcon sx={{ fontSize: 40 }} />}
          title="I have a document"
          description="Paste or upload existing material. AI will extract a course outline."
          onClick={onStartWithDocument}
        />
        <EntryCard
          icon={<EditNoteIcon sx={{ fontSize: 40 }} />}
          title="Start from scratch"
          description="Build lessons and blocks manually using the outline editor."
          onClick={onStartFromScratch}
        />
      </Stack>
    </Box>
  );
}
