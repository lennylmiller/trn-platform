import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { StoryPlanItem, PlanItemUpdate } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { storiesKeys } from '../keys';

export interface UpdatePlanItemVars {
  storyId: number;
  planItemId: number;
  updates: PlanItemUpdate;
}

export function useUpdatePlanItem() {
  const queryClient = useQueryClient();

  return useMutation<StoryPlanItem, Error, UpdatePlanItemVars>({
    mutationFn: async ({ storyId, planItemId, updates }: UpdatePlanItemVars) => {
      return apiFetch<StoryPlanItem>(`/api/v2/stories/${storyId}/plan/${planItemId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: (_data, { storyId }) => {
      void queryClient.invalidateQueries({ queryKey: storiesKeys.detail(storyId) });
    },
  });
}
