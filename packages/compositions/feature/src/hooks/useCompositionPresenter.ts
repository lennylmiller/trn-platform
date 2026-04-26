import { useState, useCallback, useMemo } from 'react';
import type { CompositionBlock } from '@trn-platform/shared';
import { useComposition } from '@trn-platform/compositions-data-access';

export interface UseCompositionPresenterOptions {
  compositionId: number;
}

export function useCompositionPresenter({ compositionId }: UseCompositionPresenterOptions) {
  const [activeCompositionId, setActiveCompositionId] = useState(compositionId);
  const compositionQuery = useComposition(activeCompositionId);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [navigationStack, setNavigationStack] = useState<number[]>([]);

  const blocks = useMemo(() => {
    return compositionQuery.data?.blocks ?? [];
  }, [compositionQuery.data?.blocks]);

  const currentBlock: CompositionBlock | undefined = blocks[currentBlockIndex];
  const isFirst = currentBlockIndex === 0;
  const isLast = currentBlockIndex >= blocks.length - 1;

  const next = useCallback(() => {
    if (currentBlockIndex < blocks.length - 1) {
      setCurrentBlockIndex((prev) => prev + 1);
    }
  }, [currentBlockIndex, blocks.length]);

  const prev = useCallback(() => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex((prev) => prev - 1);
    }
  }, [currentBlockIndex]);

  const drillIn = useCallback(
    (nestedCompositionId: number) => {
      setNavigationStack((stack) => [...stack, activeCompositionId]);
      setActiveCompositionId(nestedCompositionId);
      setCurrentBlockIndex(0);
    },
    [activeCompositionId],
  );

  const drillOut = useCallback(() => {
    setNavigationStack((stack) => {
      if (stack.length === 0) return stack;
      const newStack = [...stack];
      const parentId = newStack.pop()!;
      setActiveCompositionId(parentId);
      setCurrentBlockIndex(0);
      return newStack;
    });
  }, []);

  return {
    composition: compositionQuery.data,
    blocks,
    currentBlock,
    currentBlockIndex,
    navigationStack,
    isFirst,
    isLast,
    isLoading: compositionQuery.isLoading,
    isError: compositionQuery.isError,
    error: compositionQuery.error,
    canDrillOut: navigationStack.length > 0,
    next,
    prev,
    drillIn,
    drillOut,
  };
}
