/**
 * TanStack Query key factory for the execution domain.
 *
 * Usage:
 *   executionKeys.all        -> ['execution']
 *   executionKeys.status()   -> ['execution', 'status']
 */
export const executionKeys = {
  all: ['execution'] as const,
  status: () => [...executionKeys.all, 'status'] as const,
};
