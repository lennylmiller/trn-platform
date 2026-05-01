import { useParams, useNavigate } from 'react-router-dom';
import { FlowRunPage } from '@trn-platform/flows-ui-mui';

export default function FlowRunView() {
  const { flowId } = useParams<{ flowId: string }>();
  const navigate = useNavigate();

  if (!flowId) return null;

  return (
    <FlowRunPage
      flowId={Number(flowId)}
      onAbort={() => navigate(-1)}
    />
  );
}
