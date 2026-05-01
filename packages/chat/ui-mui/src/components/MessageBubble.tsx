import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import type { ChatMessage } from '@trn-platform/chat-data-access';

export interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        mb: 1.5,
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}
    >
      {/* Avatar */}
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          mt: 0.5,
        }}
      >
        {isUser ? (
          <PersonIcon sx={{ fontSize: 16, color: '#fff' }} />
        ) : (
          <SmartToyIcon sx={{ fontSize: 16, color: '#fff' }} />
        )}
      </Box>

      {/* Bubble */}
      <Box
        sx={{
          maxWidth: '80%',
          px: 1.5,
          py: 1,
          borderRadius: 2,
          bgcolor: isUser ? 'primary.main' : 'background.paper',
          color: isUser ? '#fff' : 'text.primary',
          border: isUser ? 'none' : 1,
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            '& code': {
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              bgcolor: isUser ? 'rgba(255,255,255,0.15)' : 'action.hover',
              px: 0.5,
              borderRadius: 0.5,
            },
          }}
        >
          {message.content}
        </Typography>
      </Box>
    </Box>
  );
}
