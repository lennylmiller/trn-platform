import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import type { SSEEventType } from '@trn-platform/shared';
import { ExecuteSqlSchema, SSE_EVENTS } from '@trn-platform/shared';
import { executeShell, abortExecution, isRunning } from './executor';
import { addClient, broadcast } from './sse';
import {
  executeSql,
  getStepForExecution,
  getFlowForExecution,
  getTrainingStatus,
} from './queries';

export const executionRouter = Router();

// ---------------------------------------------------------------------------
// Flow execution state — allows pause/resume signaling
// ---------------------------------------------------------------------------

let pauseResolver: (() => void) | null = null;

function waitForResume(): Promise<void> {
  return new Promise((resolve) => {
    pauseResolver = resolve;
  });
}

// ---------------------------------------------------------------------------
// POST /step/:stepId — execute a single step
// ---------------------------------------------------------------------------
executionRouter.post(
  '/step/:stepId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stepId = Number(req.params.stepId);
      if (Number.isNaN(stepId)) {
        res.status(400).json({ message: 'Invalid step ID' });
        return;
      }

      const step = await getStepForExecution(stepId);
      if (!step) {
        res.status(404).json({ message: 'Step not found' });
        return;
      }

      const executionId = randomUUID();
      const callbacks = {
        onEvent: (event: SSEEventType, data: unknown) =>
          broadcast(event, data as Parameters<typeof broadcast>[1]),
      };

      res.json({ executionId, stepId, type: step.type });

      if (step.type === 'shell' && step.command_text) {
        void executeShell(step.command_text, executionId, stepId, callbacks);
      } else if (step.type === 'sql' && step.command_text) {
        broadcast(SSE_EVENTS.STEP_START as SSEEventType, {
          executionId,
          stepId,
          label: step.label,
          type: 'sql',
        });

        try {
          const result = await executeSql(step.command_text);
          broadcast(SSE_EVENTS.STEP_OUTPUT as SSEEventType, {
            executionId,
            stepId,
            line: `${result.rowCount} row(s) affected`,
            stream: 'stdout',
          });
          broadcast(SSE_EVENTS.STEP_COMPLETE as SSEEventType, {
            executionId,
            stepId,
            exitCode: 0,
          });
        } catch (err) {
          broadcast(SSE_EVENTS.STEP_ERROR as SSEEventType, {
            executionId,
            stepId,
            message: err instanceof Error ? err.message : String(err),
          });
        }
      } else if (step.type === 'manual') {
        broadcast(SSE_EVENTS.STEP_PAUSED as SSEEventType, {
          executionId,
          stepId,
          label: step.label,
          presenterNotes: step.presenter_notes,
          message: 'Manual step — waiting for user to continue',
        });
      }
    } catch (err) {
      next(err);
    }
  },
);

// ---------------------------------------------------------------------------
// POST /flow/:flowId — execute an entire flow sequentially
// ---------------------------------------------------------------------------
executionRouter.post(
  '/flow/:flowId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const flowId = Number(req.params.flowId);
      if (Number.isNaN(flowId)) {
        res.status(400).json({ message: 'Invalid flow ID' });
        return;
      }

      const data = await getFlowForExecution(flowId);
      if (!data) {
        res.status(404).json({ message: 'Flow not found' });
        return;
      }

      const executionId = randomUUID();
      const { flow, steps } = data;

      // Respond immediately so the client can listen to SSE
      res.json({
        executionId,
        flowId,
        flowName: flow.name,
        totalSteps: steps.length,
      });

      // Run steps sequentially in the background
      const callbacks = {
        onEvent: (event: SSEEventType, data: unknown) =>
          broadcast(event, data as Parameters<typeof broadcast>[1]),
      };

      broadcast(SSE_EVENTS.EXECUTION_START as SSEEventType, {
        executionId,
        message: `Starting flow: ${flow.name}`,
      });

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]!;

        broadcast(SSE_EVENTS.STEP_START as SSEEventType, {
          executionId,
          stepId: step.step_id,
          flowStepId: step.flow_step_id,
          stepIndex: i,
          label: step.label,
          type: step.type,
        });

        try {
          if (step.type === 'shell' && step.command_text) {
            const exitCode = await executeShell(
              step.command_text,
              executionId,
              step.step_id,
              callbacks,
            );
            if (exitCode !== 0) {
              // Step failed — stop flow
              break;
            }
          } else if (step.type === 'sql' && step.command_text) {
            const result = await executeSql(step.command_text);
            broadcast(SSE_EVENTS.STEP_OUTPUT as SSEEventType, {
              executionId,
              stepId: step.step_id,
              line: `${result.rowCount} row(s) affected`,
              stream: 'stdout',
            });
            broadcast(SSE_EVENTS.STEP_COMPLETE as SSEEventType, {
              executionId,
              stepId: step.step_id,
              exitCode: 0,
            });
          } else if (step.type === 'manual') {
            broadcast(SSE_EVENTS.STEP_PAUSED as SSEEventType, {
              executionId,
              stepId: step.step_id,
              label: step.label,
              presenterNotes: step.presenter_notes,
              message: 'Manual step — waiting for user to continue',
            });
            await waitForResume();
            broadcast(SSE_EVENTS.STEP_COMPLETE as SSEEventType, {
              executionId,
              stepId: step.step_id,
              exitCode: 0,
            });
          }
        } catch (err) {
          broadcast(SSE_EVENTS.STEP_ERROR as SSEEventType, {
            executionId,
            stepId: step.step_id,
            message: err instanceof Error ? err.message : String(err),
          });
          break;
        }

        // Respect pause_after flag
        if (step.pause_after) {
          broadcast(SSE_EVENTS.STEP_PAUSED as SSEEventType, {
            executionId,
            stepId: step.step_id,
            label: step.label,
            presenterNotes: step.presenter_notes,
            message: 'Paused after step (pause_after flag)',
          });
          await waitForResume();
        }
      }

      broadcast(SSE_EVENTS.EXECUTION_COMPLETE as SSEEventType, {
        executionId,
        message: `Flow complete: ${flow.name}`,
      });
    } catch (err) {
      next(err);
    }
  },
);

// ---------------------------------------------------------------------------
// POST /sql — execute raw SQL against qc_core
// ---------------------------------------------------------------------------
executionRouter.post('/sql', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sql } = ExecuteSqlSchema.parse(req.body);
    const result = await executeSql(sql);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /resume — resume a paused execution
// ---------------------------------------------------------------------------
executionRouter.post('/resume', (_req: Request, res: Response) => {
  if (pauseResolver) {
    pauseResolver();
    pauseResolver = null;
    res.json({ resumed: true });
  } else {
    res.status(409).json({ message: 'No paused execution to resume' });
  }
});

// ---------------------------------------------------------------------------
// POST /abort — abort running execution
// ---------------------------------------------------------------------------
executionRouter.post('/abort', (_req: Request, res: Response) => {
  const wasRunning = isRunning();
  const killed = abortExecution();

  // Also unblock any paused flow
  if (pauseResolver) {
    pauseResolver();
    pauseResolver = null;
  }

  res.json({ aborted: killed || wasRunning });
});

// ---------------------------------------------------------------------------
// GET /events — SSE endpoint
// ---------------------------------------------------------------------------
executionRouter.get('/events', (req: Request, res: Response) => {
  addClient(res);

  // Send keepalive every 15 seconds
  const keepalive = setInterval(() => {
    res.write(':keepalive\n\n');
  }, 15_000);

  req.on('close', () => {
    clearInterval(keepalive);
  });
});

// ---------------------------------------------------------------------------
// GET /status — training status from qc_core
// ---------------------------------------------------------------------------
executionRouter.get('/status', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const status = await getTrainingStatus();
    res.json(status);
  } catch (err) {
    next(err);
  }
});
