import { useCallback, useReducer } from 'react';
import type { ExecutionStatus } from '@trn-platform/shared';
import { SSE_EVENTS } from '@trn-platform/shared';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OutputLine {
  line: string;
  stream: 'stdout' | 'stderr';
  timestamp: Date;
}

export interface ExecutionState {
  status: ExecutionStatus;
  currentStepIndex: number;
  totalSteps: number;
  currentStepLabel: string;
  outputLines: OutputLine[];
  error?: string;
  presenterNotes?: string;
}

type ExecutionAction =
  | { type: typeof SSE_EVENTS.EXECUTION_START; payload: { totalSteps?: number } }
  | { type: typeof SSE_EVENTS.STEP_START; payload: { stepIndex?: number; label?: string } }
  | { type: typeof SSE_EVENTS.STEP_OUTPUT; payload: { line?: string; stream?: 'stdout' | 'stderr' } }
  | { type: typeof SSE_EVENTS.STEP_COMPLETE }
  | { type: typeof SSE_EVENTS.STEP_ERROR; payload: { message?: string } }
  | { type: typeof SSE_EVENTS.STEP_PAUSED; payload: { presenterNotes?: string | null; message?: string } }
  | { type: typeof SSE_EVENTS.EXECUTION_COMPLETE }
  | { type: 'RESET' };

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

const initialState: ExecutionState = {
  status: 'idle',
  currentStepIndex: 0,
  totalSteps: 0,
  currentStepLabel: '',
  outputLines: [],
  error: undefined,
  presenterNotes: undefined,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function executionReducer(state: ExecutionState, action: ExecutionAction): ExecutionState {
  switch (action.type) {
    case SSE_EVENTS.EXECUTION_START:
      return {
        ...initialState,
        status: 'running',
        totalSteps: action.payload.totalSteps ?? state.totalSteps,
      };

    case SSE_EVENTS.STEP_START:
      return {
        ...state,
        status: 'running',
        currentStepIndex: action.payload.stepIndex ?? state.currentStepIndex,
        currentStepLabel: action.payload.label ?? state.currentStepLabel,
        presenterNotes: undefined,
        error: undefined,
      };

    case SSE_EVENTS.STEP_OUTPUT: {
      const line: OutputLine = {
        line: action.payload.line ?? '',
        stream: action.payload.stream ?? 'stdout',
        timestamp: new Date(),
      };
      return {
        ...state,
        outputLines: [...state.outputLines, line],
      };
    }

    case SSE_EVENTS.STEP_COMPLETE:
      return {
        ...state,
        currentStepIndex: state.currentStepIndex + 1,
      };

    case SSE_EVENTS.STEP_ERROR:
      return {
        ...state,
        status: 'idle',
        error: action.payload.message ?? 'Unknown error',
      };

    case SSE_EVENTS.STEP_PAUSED:
      return {
        ...state,
        status: 'paused',
        presenterNotes: action.payload.presenterNotes ?? action.payload.message ?? undefined,
      };

    case SSE_EVENTS.EXECUTION_COMPLETE:
      return {
        ...state,
        status: 'complete',
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Reducer-based hook for tracking execution state from SSE events.
 *
 * The `dispatch` function accepts SSE event type strings and their data payloads,
 * mapping them to internal reducer actions.
 *
 * The execution API broadcasts SSE to every connected client. Callers that wire
 * `useSSE` directly must ignore payloads whose `executionId` is not the active
 * run; [`useFlowRunner`](./useFlowRunner.ts) applies that filter for flow runs.
 */
export function useExecutionState() {
  const [state, rawDispatch] = useReducer(executionReducer, initialState);

  const dispatch = useCallback(
    (eventType: string, data: Record<string, unknown> = {}) => {
      rawDispatch({ type: eventType, payload: data } as ExecutionAction);
    },
    [],
  );

  const reset = useCallback(() => {
    rawDispatch({ type: 'RESET' });
  }, []);

  return { state, dispatch, reset };
}
