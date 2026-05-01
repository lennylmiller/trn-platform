import { Box, Typography } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { TrainingPlayer } from '@trn-platform/compositions-ui-mui';
import { useCompositionPresenter } from '@trn-platform/compositions-feature';

export default function TrainingPlayerPage() {
  const { compositionId } = useParams<{ compositionId: string }>();
  const navigate = useNavigate();
  const id = compositionId ? Number(compositionId) : undefined;

  if (!id) {
    return <Typography sx={{ p: 4 }}>No composition ID provided.</Typography>;
  }

  const presenter = useCompositionPresenter({ compositionId: id });

  return (
    <Box sx={{ height: '100vh' }}>
      <TrainingPlayer
        title={presenter.composition?.title ?? 'Loading...'}
        kind={presenter.composition?.kind ?? 'story'}
        currentBlock={presenter.currentBlock}
        currentBlockIndex={presenter.currentBlockIndex}
        totalBlocks={presenter.blocks.length}
        isFirst={presenter.isFirst}
        isLast={presenter.isLast}
        canDrillOut={presenter.canDrillOut}
        isLoading={presenter.isLoading}
        onNext={presenter.next}
        onPrev={presenter.prev}
        onDrillIn={presenter.drillIn}
        onDrillOut={presenter.drillOut}
        onRunFlow={(flowId) => navigate(`/flows/run/${flowId}`)}
        onExit={() => navigate('/compositions')}
      />
    </Box>
  );
}
