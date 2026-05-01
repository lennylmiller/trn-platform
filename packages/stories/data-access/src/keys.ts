export const storiesKeys = {
  all: ['stories'] as const,
  lists: () => [...storiesKeys.all, 'list'] as const,
  details: () => [...storiesKeys.all, 'detail'] as const,
  detail: (storyId: number) => [...storiesKeys.details(), storyId] as const,
};
