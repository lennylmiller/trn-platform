import { useCallback, useEffect, useRef, useState } from 'react';
import { SSE_EVENTS } from '@trn-platform/shared';

const SSE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:3001') + '/api/v2/execute/events';

const ALL_EVENT_TYPES = Object.values(SSE_EVENTS);

/**
 * Hook that manages an EventSource connection to the execution SSE endpoint.
 *
 * Listens for all known SSE event types and forwards them to the provided
 * callback. Automatically cleans up on unmount.
 *
 * @param onEvent - callback invoked with (eventType, parsedData) for each SSE event
 */
export function useSSE(onEvent: (type: string, data: unknown) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);
  const onEventRef = useRef(onEvent);

  // Keep callback ref current without re-subscribing
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const disconnect = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const connect = useCallback(() => {
    // Close existing connection if any
    disconnect();

    const es = new EventSource(SSE_URL);
    sourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
    };

    es.onerror = () => {
      // EventSource auto-reconnects; we just track state
      setIsConnected(false);
    };

    // Register a listener for each known SSE event type
    for (const eventType of ALL_EVENT_TYPES) {
      es.addEventListener(eventType, (event: MessageEvent) => {
        try {
          const data: unknown = JSON.parse(event.data as string);
          onEventRef.current(eventType, data);
        } catch {
          onEventRef.current(eventType, event.data);
        }
      });
    }
  }, [disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { connect, disconnect, isConnected };
}
