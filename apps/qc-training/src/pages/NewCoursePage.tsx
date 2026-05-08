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

  const handleToolCall = useCallback((tool: string, input: Record<string, unknown>, result: string) => {
    // Look for create_course tool call
    if (tool !== 'create_course') return;

    // Try to extract course_id from the result
    let courseId: number | undefined;
    try {
      const parsed = JSON.parse(result);
      courseId = parsed.course_id;
    } catch {
      // Result might contain the course_id in a different structure
      const match = result.match(/"course_id"\s*:\s*(\d+)/);
      if (match) courseId = Number(match[1]);
    }

    if (typeof courseId === 'number' && courseId > 0) {
      // Clear the new-course chat history since we're done here
      try { localStorage.removeItem('chat-session:new-course'); } catch { /* ignore */ }
      // Navigate to the editor
      setTimeout(() => navigate(`/courses/edit/${courseId}`), 1500);
    }
  }, [navigate]);

  // Also check onResponse — scan all tool calls for create_course
  const handleResponse = useCallback(() => {
    // This fires after every response. The onToolCall above should handle it,
    // but as a fallback, we could check localStorage for the last response.
    // For now, onToolCall is the primary mechanism.
  }, []);

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
          onResponse={handleResponse}
        />
      </Box>
    </Box>
  );
}
