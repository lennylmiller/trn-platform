import { useMemo } from 'react';
import type { StoryPlanItem } from '@trn-platform/shared';
import { useStory, useUpdateStory, useAddPlanItems, useUpdatePlanItem } from '@trn-platform/stories-data-access';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StoryProgress {
  total: number;
  done: number;
  inProgress: number;
  pending: number;
  skipped: number;
  percent: number;
}

export interface PlanItemsByAct {
  act: string;
  items: StoryPlanItem[];
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Orchestrates the story authoring workflow.
 * Provides the story detail, progress metrics, items grouped by act,
 * and mutation helpers for advancing through the plan.
 */
export function useStoryPlanner(storyId: number | undefined) {
  const { data: story, isLoading, error } = useStory(storyId);
  const updateStory = useUpdateStory();
  const addPlanItems = useAddPlanItems();
  const updatePlanItem = useUpdatePlanItem();

  const progress = useMemo((): StoryProgress => {
    if (!story?.plan_items) return { total: 0, done: 0, inProgress: 0, pending: 0, skipped: 0, percent: 0 };

    const items = story.plan_items;
    const done = items.filter(i => i.status === 'done').length;
    const inProgress = items.filter(i => i.status === 'in_progress').length;
    const pending = items.filter(i => i.status === 'pending').length;
    const skipped = items.filter(i => i.status === 'skipped').length;
    const total = items.length;

    return {
      total,
      done,
      inProgress,
      pending,
      skipped,
      percent: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  }, [story?.plan_items]);

  const itemsByAct = useMemo((): PlanItemsByAct[] => {
    if (!story?.plan_items) return [];

    const groups = new Map<string, StoryPlanItem[]>();
    for (const item of story.plan_items) {
      const act = item.act ?? 'General';
      const list = groups.get(act);
      if (list) {
        list.push(item);
      } else {
        groups.set(act, [item]);
      }
    }

    return [...groups.entries()].map(([act, items]) => ({ act, items }));
  }, [story?.plan_items]);

  const nextPendingItem = useMemo((): StoryPlanItem | undefined => {
    if (!story?.plan_items) return undefined;
    return story.plan_items.find(i => i.status === 'pending' || i.status === 'in_progress');
  }, [story?.plan_items]);

  return {
    story,
    isLoading,
    error,
    progress,
    itemsByAct,
    nextPendingItem,
    updateStory,
    addPlanItems,
    updatePlanItem,
  };
}
