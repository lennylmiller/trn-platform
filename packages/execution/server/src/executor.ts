import { spawn, type ChildProcess } from 'child_process';
import type { SSEEventType, StepExecutionEvent } from '@trn-platform/shared';
import { SSE_EVENTS } from '@trn-platform/shared';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExecutorCallbacks {
  onEvent: (event: SSEEventType, data: StepExecutionEvent) => void;
}

// ---------------------------------------------------------------------------
// Active Process Tracking
// ---------------------------------------------------------------------------

let activeProcess: ChildProcess | null = null;
let aborted = false;

/**
 * Execute a shell command in a child process, streaming output lines
 * through the provided callbacks.
 */
export function executeShell(
  command: string,
  executionId: string,
  stepId: number,
  callbacks: ExecutorCallbacks,
): Promise<number> {
  return new Promise((resolve, reject) => {
    aborted = false;

    callbacks.onEvent(SSE_EVENTS.STEP_START as SSEEventType, {
      executionId,
      stepId,
      label: command.slice(0, 80),
      type: 'shell',
    });

    const wrapper = process.env.SHELL_WRAPPER;
    const fullCommand = wrapper ? `${wrapper} ${command}` : command;

    const child = spawn('bash', ['-c', fullCommand], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    activeProcess = child;

    child.stdout?.on('data', (chunk: Buffer) => {
      const lines = chunk.toString().split('\n').filter(Boolean);
      for (const line of lines) {
        callbacks.onEvent(SSE_EVENTS.STEP_OUTPUT as SSEEventType, {
          executionId,
          stepId,
          line,
          stream: 'stdout',
        });
      }
    });

    child.stderr?.on('data', (chunk: Buffer) => {
      const lines = chunk.toString().split('\n').filter(Boolean);
      for (const line of lines) {
        callbacks.onEvent(SSE_EVENTS.STEP_OUTPUT as SSEEventType, {
          executionId,
          stepId,
          line,
          stream: 'stderr',
        });
      }
    });

    child.on('close', (exitCode) => {
      activeProcess = null;
      const code = exitCode ?? (aborted ? 130 : 1);

      if (aborted) {
        callbacks.onEvent(SSE_EVENTS.STEP_ERROR as SSEEventType, {
          executionId,
          stepId,
          message: 'Execution aborted by user',
          exitCode: code,
        });
      } else if (code === 0) {
        callbacks.onEvent(SSE_EVENTS.STEP_COMPLETE as SSEEventType, {
          executionId,
          stepId,
          exitCode: code,
        });
      } else {
        callbacks.onEvent(SSE_EVENTS.STEP_ERROR as SSEEventType, {
          executionId,
          stepId,
          message: `Process exited with code ${code}`,
          exitCode: code,
        });
      }

      resolve(code);
    });

    child.on('error', (err) => {
      activeProcess = null;
      callbacks.onEvent(SSE_EVENTS.STEP_ERROR as SSEEventType, {
        executionId,
        stepId,
        message: err.message,
      });
      reject(err);
    });
  });
}

/**
 * Abort any currently running child process.
 */
export function abortExecution(): boolean {
  if (activeProcess) {
    aborted = true;
    activeProcess.kill('SIGTERM');
    return true;
  }
  return false;
}

/**
 * Check if a process is currently running.
 */
export function isRunning(): boolean {
  return activeProcess !== null;
}
