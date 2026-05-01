import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { StoryPlanItem, PlanItemCreate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { storiesKeys } from '../keys';

export interface AddPlanItemsVars {
  storyId: number;
  items: PlanItemCreate[];
}

export function useAddPlanItems() {
  const queryClient = useQueryClient();

  return useMutation<StoryPlanItem[], Error, AddPlanItemsVars>({
    mutationFn: async ({ storyId, items }: AddPlanItemsVars) => {
      return apiFetch<StoryPlanItem[]>(`/api/v2/stories/${storyId}/plan`, {
        method: 'POST',
        body: JSON.stringify(items),
      });
    },
    onSuccess: (_data, { storyId }) => {
      void queryClient.invalidateQueries({ queryKey: storiesKeys.detail(storyId) });
    },
  });
}
