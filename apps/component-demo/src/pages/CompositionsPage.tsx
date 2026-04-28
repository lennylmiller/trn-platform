import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { CompositionListTab } from '@trn-platform/compositions-ui-mui';
import { useDeleteComposition } from '@trn-platform/compositions-data-access';

export default function CompositionsPage() {
  const navigate = useNavigate();
  const deleteComposition = useDeleteComposition();

  return (
    <Box sx={{ p: 3 }}>
      <CompositionListTab
        onEdit={(compositionId) => navigate(`/compositions/edit/${compositionId}`)}
        onPresent={(compositionId) => navigate(`/compositions/run/${compositionId}`)}
        onDelete={(compositionId) => {
          if (window.confirm('Delete this composition? This cannot be undone.')) {
            deleteComposition.mutate(compositionId);
          }
        }}
      />
    </Box>
  );
}
