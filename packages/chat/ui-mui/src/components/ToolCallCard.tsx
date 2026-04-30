import { useState } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BuildIcon from '@mui/icons-material/Build';
import type { ToolCallRecord } from '@trn-platform/chat-data-access';

export interface ToolCallCardProps {
  toolCall: ToolCallRecord;
}

const TOOL_LABELS: Record<string, string> = {
  explore_schema: 'Explored schema',
  run_sql: 'Ran SQL',
  qc_train: 'Ran qc-train',
  list_steps: 'Listed steps',
  get_step: 'Loaded step',
  create_step: 'Created step',
  update_step: 'Updated step',
  run_step: 'Executed step',
  list_flows: 'Listed flows',
  list_compositions: 'Listed compositions',
};

export function ToolCallCard({ toolCall }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false);
  const label = TOOL_LABELS[toolCall.tool] ?? toolCall.tool;

  return (
    <Box
      sx={{
        bgcolor: 'action.hover',
        borderRadius: 1,
        mb: 0.5,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1,
          py: 0.5,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.selected' },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <BuildIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
        <Typography variant="caption" sx={{ flex: 1, fontWeight: 600 }}>
          {label}
        </Typography>
        <IconButton size="small" sx={{ p: 0 }}>
          <ExpandMoreIcon
            sx={{
              fontSize: 16,
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box
          sx={{
            px: 1,
            pb: 1,
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            maxHeight: 200,
            overflow: 'auto',
            color: 'text.secondary',
          }}
        >
          {toolCall.result.slice(0, 2000)}
          {toolCall.result.length > 2000 && '\n... (truncated)'}
        </Box>
      </Collapse>
    </Box>
  );
}
