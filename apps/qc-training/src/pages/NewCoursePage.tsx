import { useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { ChatPanel } from '@trn-platform/chat-ui-mui';

export default function NewCoursePage() {
  const navigate = useNavigate();

  const handleToolCall = useCallback((tool: string, _input: Record<string, unknown>, result: string) => {
    if (tool !== 'create_course') return;
    // Extract course_id from the create_course result
    try {
      const parsed = JSON.parse(result);
      const courseId = parsed.course_id;
      if (typeof courseId === 'number') {
        // Clear the new-course chat history since we're done here
        try { localStorage.removeItem('chat-session:new-course'); } catch { /* ignore */ }
        // Navigate to the editor with AI Author open
        setTimeout(() => navigate(`/courses/edit/${courseId}`), 1500);
      }
    } catch { /* result wasn't JSON — ignore */ }
  }, [navigate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top bar */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
      >
        <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate('/courses')}>
          Back
        </Button>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Create New Course
        </Typography>
      </Stack>

      {/* Full-width chat */}
      <Box sx={{ flex: 1, overflow: 'hidden', maxWidth: 800, mx: 'auto', width: '100%' }}>
        <ChatPanel
          systemPromptHint="course-creation"
          persistKey="new-course"
          onToolCall={handleToolCall}
        />
      </Box>
    </Box>
  );
}
