import { useParams, useNavigate } from 'react-router-dom';
import { CompositionRunPage as CompositionRunView } from '@trn-platform/compositions-ui-mui';
import { useCompositionPresenter } from '@trn-platform/compositions-feature';

export default function CompositionRunPage() {
  const { compositionId } = useParams<{ compositionId: string }>();
  const navigate = useNavigate();

  if (!compositionId) return null;

  const presenter = useCompositionPresenter({ compositionId: Number(compositionId) });

  return (
    <CompositionRunView
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
      onDrillIn={(id) => presenter.drillIn(id)}
      onDrillOut={presenter.canDrillOut ? presenter.drillOut : () => navigate(-1)}
      onRunFlow={(flowId) => navigate(`/flows/run/${flowId}`)}
    />
  );
}
