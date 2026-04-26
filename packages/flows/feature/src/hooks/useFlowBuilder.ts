import { useState, useCallback, useMemo } from 'react';
import type { FlowStep, FlowStepCreate, FlowStepUpdate } from '@trn-platform/shared';
import {
  useFlow,
  useReplaceFlowSteps,
  useAddFlowStep,
  useUpdateFlowStep,
  useDeleteFlowStep,
} from '@trn-platform/flows-data-access';

export interface UseFlowBuilderOptions {
  flowId: number;
}

export function useFlowBuilder({ flowId }: UseFlowBuilderOptions) {
  const flowQuery = useFlow(flowId);
  const replaceStepsMutation = useReplaceFlowSteps();
  const addStepMutation = useAddFlowStep();
  const updateStepMutation = useUpdateFlowStep();
  const deleteStepMutation = useDeleteFlowStep();

  // Local reorder state — mirrors server steps until saved
  const [localStepOrder, setLocalStepOrder] = useState<FlowStep[] | null>(null);
  const [isDirtyOrder, setIsDirtyOrder] = useState(false);

  const steps = useMemo(() => {
    if (localStepOrder) return localStepOrder;
    return flowQuery.data?.steps ?? [];
  }, [localStepOrder, flowQuery.data?.steps]);

  // Reset local state when server data arrives and no pending edits
  const syncFromServer = useCallback(() => {
    setLocalStepOrder(null);
    setIsDirtyOrder(false);
  }, []);

  const addStep = useCallback(
    (data: FlowStepCreate) => {
      return addStepMutation.mutateAsync({ flowId, data }).then(() => {
        syncFromServer();
      });
    },
    [addStepMutation, flowId, syncFromServer],
  );

  const removeStep = useCallback(
    (flowStepId: number) => {
      return deleteStepMutation.mutateAsync({ flowId, flowStepId }).then(() => {
        syncFromServer();
      });
    },
    [deleteStepMutation, flowId, syncFromServer],
  );

  const reorderSteps = useCallback(
    (fromIndex: number, toIndex: number) => {
      const current = [...steps];
      const [moved] = current.splice(fromIndex, 1);
      if (!moved) return;
      current.splice(toIndex, 0, moved);

      // Reassign seq locally
      const reordered = current.map((step, i) => ({ ...step, seq: i + 1 }));
      setLocalStepOrder(reordered);
      setIsDirtyOrder(true);
    },
    [steps],
  );

  const saveOrder = useCallback(() => {
    if (!localStepOrder) return Promise.resolve();
    const stepsPayload: FlowStepCreate[] = localStepOrder.map((s) => ({
      step_id: s.step_id,
      pause_after: s.pause_after,
      presenter_notes: s.presenter_notes,
      visible_in_execution: s.visible_in_execution,
      override_display_queries: s.override_display_queries,
    }));
    return replaceStepsMutation
      .mutateAsync({ flowId, steps: stepsPayload })
      .then(() => {
        syncFromServer();
      });
  }, [localStepOrder, replaceStepsMutation, flowId, syncFromServer]);

  const updateStepProps = useCallback(
    (flowStepId: number, updates: FlowStepUpdate) => {
      return updateStepMutation.mutateAsync({ flowId, flowStepId, updates });
    },
    [updateStepMutation, flowId],
  );

  return {
    flow: flowQuery.data,
    steps,
    isLoading: flowQuery.isLoading,
    isError: flowQuery.isError,
    error: flowQuery.error,
    isDirtyOrder,
    addStep,
    removeStep,
    reorderSteps,
    saveOrder,
    updateStepProps,
    isSaving:
      replaceStepsMutation.isPending ||
      addStepMutation.isPending ||
      updateStepMutation.isPending ||
      deleteStepMutation.isPending,
  };
}
