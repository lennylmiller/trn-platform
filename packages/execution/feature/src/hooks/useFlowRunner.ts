import { useCallback, useRef } from 'react';
import {
  useExecuteFlow,
  useResumeExecution,
  useAbortExecution,
  useSSE,
} from '@trn-platform/execution-data-access';
import { SSE_EVENTS } from '@trn-platform/shared';
import { useExecutionState } from './useExecutionState';

/**
 * Orchestrates flow execution by combining:
 * - useExecuteFlow mutation (kick off the flow)
 * - useExecutionState reducer (track progress)
 * - useSSE hook (receive real-time events)
 * - useResumeExecution / useAbortExecution mutations (control flow)
 *
 * SSE is broadcast to every connected client; this hook filters events by the
 * active run's `executionId` (from POST /execute/flow) so other sessions do not
 * mutate local state. While waiting for that id, the first `execution:start`
 * event latches the id in case it arrives before the HTTP response.
 *
 * Returns a simple API: start(flowId), resume(), abort(), plus state & connection info.
 */
export function useFlowRunner() {
  const executeFlow = useExecuteFlow();
  const resumeMutation = useResumeExecution();
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
          if (type === SSE_EVENTS.EXECUTION_START) {
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

  const start = useCallback(
    (flowId: number) => {
      reset();
      awaitingRunRef.current = true;
      activeExecutionIdRef.current = null;
      connect();
      void executeFlow
        .mutateAsync(flowId)
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
    [reset, connect, executeFlow, disconnect],
  );

  const resume = useCallback(() => {
    resumeMutation.mutate();
  }, [resumeMutation]);

  const abort = useCallback(() => {
    abortMutation.mutate();
    awaitingRunRef.current = false;
    activeExecutionIdRef.current = null;
    disconnect();
  }, [abortMutation, disconnect]);

  return {
    start,
    resume,
    abort,
    state,
    isConnected,
  };
}
