export const coursesKeys = {
  all: ['courses'] as const,
  lists: () => [...coursesKeys.all, 'list'] as const,
  details: () => [...coursesKeys.all, 'detail'] as const,
  detail: (courseId: number) => [...coursesKeys.details(), courseId] as const,
};

export const seriesKeys = {
  all: ['series'] as const,
  lists: () => [...seriesKeys.all, 'list'] as const,
};

export const tracksKeys = {
  all: ['tracks'] as const,
  lists: () => [...tracksKeys.all, 'list'] as const,
};
