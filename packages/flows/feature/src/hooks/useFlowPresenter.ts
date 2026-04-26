import { useState, useCallback, useMemo } from 'react';
import type { FlowStep } from '@trn-platform/shared';
import { useFlow } from '@trn-platform/flows-data-access';

export type PresenterState = 'idle' | 'running' | 'paused' | 'complete';

export interface UseFlowPresenterOptions {
  flowId: number;
}

export function useFlowPresenter({ flowId }: UseFlowPresenterOptions) {
  const flowQuery = useFlow(flowId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [state, setState] = useState<PresenterState>('idle');

  // Only visible steps are shown in presentation mode
  const visibleSteps = useMemo(() => {
    if (!flowQuery.data?.steps) return [];
    return flowQuery.data.steps.filter((s) => s.visible_in_execution);
  }, [flowQuery.data?.steps]);

  const currentStep: FlowStep | undefined = visibleSteps[currentIndex];
  const totalSteps = visibleSteps.length;
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex >= totalSteps - 1;
  const progress = totalSteps > 0 ? (currentIndex + 1) / totalSteps : 0;

  const start = useCallback(() => {
    setCurrentIndex(0);
    setState('running');
  }, []);

  const next = useCallback(() => {
    if (state === 'paused') {
      setState('running');
      return;
    }

    if (currentIndex >= totalSteps - 1) {
      setState('complete');
      return;
    }

    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);

    // Check if the current step has pause_after
    const movingFrom = visibleSteps[currentIndex];
    if (movingFrom?.pause_after) {
      setState('paused');
    } else {
      setState('running');
    }
  }, [state, currentIndex, totalSteps, visibleSteps]);

  const prev = useCallback(() => {
    if (currentIndex <= 0) return;
    setCurrentIndex(currentIndex - 1);
    setState('running');
  }, [currentIndex]);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSteps) return;
      setCurrentIndex(index);
      setState('running');
    },
    [totalSteps],
  );

  const pause = useCallback(() => {
    setState('paused');
  }, []);

  const resume = useCallback(() => {
    setState('running');
  }, []);

  const abort = useCallback(() => {
    setState('idle');
    setCurrentIndex(0);
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setCurrentIndex(0);
  }, []);

  return {
    flow: flowQuery.data,
    visibleSteps,
    currentStep,
    currentIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    progress,
    state,
    isLoading: flowQuery.isLoading,
    isError: flowQuery.isError,
    error: flowQuery.error,
    start,
    next,
    prev,
    goTo,
    pause,
    resume,
    abort,
    reset,
  };
}
