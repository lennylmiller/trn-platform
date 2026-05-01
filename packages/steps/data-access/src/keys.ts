/**
 * TanStack Query key factory for the steps domain.
 *
 * Usage:
 *   stepsKeys.all          → ['steps']
 *   stepsKeys.lists()      → ['steps', 'list']
 *   stepsKeys.list('setup')→ ['steps', 'list', { category: 'setup' }]
 *   stepsKeys.details()    → ['steps', 'detail']
 *   stepsKeys.detail(42)   → ['steps', 'detail', 42]
 */
export const stepsKeys = {
  all: ['steps'] as const,
  lists: () => [...stepsKeys.all, 'list'] as const,
  list: (filters?: { category?: string; story?: string }) =>
    filters && Object.values(filters).some(Boolean)
      ? ([...stepsKeys.lists(), filters] as const)
      : stepsKeys.lists(),
  details: () => [...stepsKeys.all, 'detail'] as const,
  detail: (stepId: number) => [...stepsKeys.details(), stepId] as const,
};
