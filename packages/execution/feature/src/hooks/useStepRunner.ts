import { useCallback, useRef } from 'react';
import {
  useExecuteStep,
  useAbortExecution,
  useSSE,
} from '@trn-platform/execution-data-access';
import { SSE_EVENTS } from '@trn-platform/shared';
import { useExecutionState } from './useExecutionState';

/**
 * Orchestrates single-step execution by combining:
 * - useExecuteStep mutation (kick off the step)
 * - useExecutionState reducer (track progress)
 * - useSSE hook (receive real-time events)
 * - useAbortExecution mutation (cancel running step)
 *
 * SSE is broadcast to every connected client; this hook filters events by the
 * active run's `executionId` so other sessions do not mutate local state.
 * While waiting for that id, the first `step:start` event latches the id in
 * case it arrives before the HTTP response.
 *
 * Returns a simple API: run(stepId), abort(), plus state & connection info.
 */
export function useStepRunner() {
  const executeStep = useExecuteStep();
  const abortMutation = useAbortExecution();
  const { state, dispatch, reset } = useExecutionState();

  const activeExecutionIdRef = useRef<string | null>(null);
  const awaitingRunRef = useRef(false);

  const handleSSEEvent = useCallback(
    (type: string, data: unknown) => {
      const payload = (data ?? {}) as Record<string, unknown>;
      const eventId = payload.executionId;

      if (typeof eventId === 'string') {
        if (activeExecutionIdRef.current) {
          if (eventId !== activeExecutionIdRef.current) return;
        } else if (awaitingRunRef.current) {
          // Latch executionId from the first step:start event if the HTTP
          // response hasn't arrived yet.
          if (type === SSE_EVENTS.STEP_START) {
            activeExecutionIdRef.current = eventId;
          } else {
            return;
          }
        } else {
          return;
        }
      }

      dispatch(type, payload);
    },
    [dispatch],
  );

  const { connect, disconnect, isConnected } = useSSE(handleSSEEvent);

  const run = useCallback(
    (stepId: number) => {
      reset();
      awaitingRunRef.current = true;
      activeExecutionIdRef.current = null;
      connect();
      void executeStep
        .mutateAsync(stepId)
        .then((result) => {
          activeExecutionIdRef.current = result.executionId;
          awaitingRunRef.current = false;
        })
        .catch(() => {
          awaitingRunRef.current = false;
          activeExecutionIdRef.current = null;
          disconnect();
        });
    },
    [reset, connect, executeStep, disconnect],
  );

  const abort = useCallback(() => {
    abortMutation.mutate();
    awaitingRunRef.current = false;
    activeExecutionIdRef.current = null;
    disconnect();
  }, [abortMutation, disconnect]);

  return {
    run,
    abort,
    state,
    isConnected,
  };
}
