import type { Response } from 'express';
import type { SSEEventType, StepExecutionEvent } from '@trn-platform/shared';

// ---------------------------------------------------------------------------
// SSE Connection Manager
// ---------------------------------------------------------------------------

const clients = new Set<Response>();

/**
 * Register an SSE client connection. Sets appropriate headers and
 * handles cleanup on close.
 */
export function addClient(res: Response): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write('\n');
  clients.add(res);

  res.on('close', () => {
    clients.delete(res);
  });
}

/**
 * Broadcast a typed SSE event to all connected clients.
 */
export function broadcast(event: SSEEventType, data: StepExecutionEvent): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    client.write(payload);
  }
}

/**
 * Send a typed SSE event to a single client.
 */
export function sendEvent(res: Response, event: SSEEventType, data: StepExecutionEvent): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/**
 * Number of currently connected clients.
 */
export function clientCount(): number {
  return clients.size;
}

/**
 * Disconnect all SSE clients (e.g. during shutdown).
 */
export function disconnectAll(): void {
  for (const client of clients) {
    client.end();
  }
  clients.clear();
}
