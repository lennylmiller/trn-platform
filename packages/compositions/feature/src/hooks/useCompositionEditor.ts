import { useCallback, useMemo } from 'react';
import type { CompositionBlock, BlockCreate, BlockUpdate } from '@trn-platform/shared';
import {
  useComposition,
  useAddBlock,
  useDeleteBlock,
  useReplaceBlocks,
  useUpdateBlock,
} from '@trn-platform/compositions-data-access';

export interface UseCompositionEditorOptions {
  compositionId: number;
}

export function useCompositionEditor({ compositionId }: UseCompositionEditorOptions) {
  const compositionQuery = useComposition(compositionId);
  const addBlockMutation = useAddBlock();
  const deleteBlockMutation = useDeleteBlock();
  const replaceBlocksMutation = useReplaceBlocks();
  const updateBlockMutation = useUpdateBlock();

  const blocks = useMemo(() => {
    return compositionQuery.data?.blocks ?? [];
  }, [compositionQuery.data?.blocks]);

  const addBlock = useCallback(
    (create: BlockCreate) => {
      return addBlockMutation.mutateAsync({ compositionId, data: create });
    },
    [addBlockMutation, compositionId],
  );

  const removeBlock = useCallback(
    (blockId: number) => {
      return deleteBlockMutation.mutateAsync({ compositionId, blockId });
    },
    [deleteBlockMutation, compositionId],
  );

  const reorderBlocks = useCallback(
    (reorderedBlocks: CompositionBlock[]) => {
      const resequenced: BlockCreate[] = reorderedBlocks.map((b) => ({
        block_type: b.block_type,
        content: b.content,
        technical_content: b.technical_content,
        flow_id: b.flow_id,
        ref_composition_id: b.ref_composition_id,
        heading: b.heading,
        presenter_notes: b.presenter_notes,
      }));
      return replaceBlocksMutation.mutateAsync({
        compositionId,
        blocks: resequenced,
      });
    },
    [replaceBlocksMutation, compositionId],
  );

  const updateBlockProps = useCallback(
    (blockId: number, updates: BlockUpdate) => {
      return updateBlockMutation.mutateAsync({ compositionId, blockId, updates });
    },
    [updateBlockMutation, compositionId],
  );

  return {
    composition: compositionQuery.data,
    blocks,
    isLoading: compositionQuery.isLoading,
    isError: compositionQuery.isError,
    error: compositionQuery.error,
    isSaving:
      addBlockMutation.isPending ||
      deleteBlockMutation.isPending ||
      replaceBlocksMutation.isPending ||
      updateBlockMutation.isPending,
    addBlock,
    removeBlock,
    reorderBlocks,
    updateBlockProps,
  };
}
