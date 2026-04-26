import { useCallback } from 'react';
import {
  useExecuteFlow,
  useResumeExecution,
  useAbortExecution,
  useSSE,
} from '@trn-platform/execution-data-access';
import { useExecutionState } from './useExecutionState';

/**
 * Orchestrates flow execution by combining:
 * - useExecuteFlow mutation (kick off the flow)
 * - useExecutionState reducer (track progress)
 * - useSSE hook (receive real-time events)
 * - useResumeExecution / useAbortExecution mutations (control flow)
 *
 * Returns a simple API: start(flowId), resume(), abort(), plus state & connection info.
 */
export function useFlowRunner() {
  const executeFlow = useExecuteFlow();
  const resumeMutation = useResumeExecution();
  const abortMutation = useAbortExecution();
  const { state, dispatch, reset } = useExecutionState();

  const handleSSEEvent = useCallback(
    (type: string, data: unknown) => {
      dispatch(type, (data ?? {}) as Record<string, unknown>);
    },
    [dispatch],
  );

  const { connect, disconnect, isConnected } = useSSE(handleSSEEvent);

  const start = useCallback(
    (flowId: number) => {
      reset();
      connect();
      executeFlow.mutate(flowId);
    },
    [reset, connect, executeFlow],
  );

  const resume = useCallback(() => {
    resumeMutation.mutate();
  }, [resumeMutation]);

  const abort = useCallback(() => {
    abortMutation.mutate();
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
