export const flowsKeys = {
  all: ['flows'] as const,
  lists: () => [...flowsKeys.all, 'list'] as const,
  list: () => [...flowsKeys.lists()] as const,
  details: () => [...flowsKeys.all, 'detail'] as const,
  detail: (flowId: number) => [...flowsKeys.details(), flowId] as const,
};
