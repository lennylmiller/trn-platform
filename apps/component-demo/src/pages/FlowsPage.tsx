import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { FlowListTab } from '@trn-platform/flows-ui-mui';
import { useDeleteFlow } from '@trn-platform/flows-data-access';

export default function FlowsPage() {
  const navigate = useNavigate();
  const deleteFlow = useDeleteFlow();

  return (
    <Box sx={{ p: 3 }}>
      <FlowListTab
        onOpenDev={(flowId) => navigate(`/flows/dev/${flowId}`)}
        onPresent={(flowId) => navigate(`/flows/run/${flowId}`)}
        onDelete={(flowId) => {
          if (window.confirm('Delete this flow? This cannot be undone.')) {
            deleteFlow.mutate(flowId);
          }
        }}
      />
    </Box>
  );
}
