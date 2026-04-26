import React from 'react';
import type { Decorator } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Dual-mode API decorator for Storybook stories.
 *
 * By default, stories use MSW mock handlers (defined in ../mocks/handlers.ts).
 * To use the live Express API instead, set `parameters.api.live = true` on a story:
 *
 * ```ts
 * export const LiveData: Story = {
 *   parameters: { api: { live: true, baseUrl: 'http://localhost:3001' } },
 * };
 * ```
 *
 * When `api.live` is true, MSW is bypassed and TanStack Query hits the real
 * Express server at `api.baseUrl` (defaults to http://localhost:3001).
 */
export const ApiDecorator: Decorator = (Story, context) => {
  const apiParams = context.parameters?.api ?? {};
  const isLive = apiParams.live === true;
  const baseUrl = apiParams.baseUrl ?? 'http://localhost:3001';

  // Create a fresh QueryClient per story to avoid cache bleed
  const queryClient = React.useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: isLive ? 30_000 : Infinity,
            refetchOnWindowFocus: isLive,
          },
          mutations: { retry: false },
        },
      }),
    [isLive],
  );

  return (
    <QueryClientProvider client={queryClient}>
      {isLive && (
        <div
          style={{
            padding: '4px 12px',
            background: '#fff3e0',
            borderBottom: '1px solid #ffe0b2',
            fontSize: 12,
            color: '#e65100',
            fontFamily: 'monospace',
          }}
        >
          LIVE API: {baseUrl}
        </div>
      )}
      <Story />
    </QueryClientProvider>
  );
};

export default ApiDecorator;
