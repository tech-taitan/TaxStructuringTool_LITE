/**
 * Hook exposing undo/redo actions and state from zundo's temporal store.
 *
 * Wraps the temporal middleware API with canUndo/canRedo booleans
 * and guarded undo/redo callbacks that no-op when history is empty.
 *
 * Usage:
 *   const { undo, redo, canUndo, canRedo } = useUndoRedo();
 */

import { useCallback } from 'react';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { useGraphStore } from '@/stores/graph-store';

export function useUndoRedo() {
  const { undo, redo, pastStates, futureStates } = useStore(
    useGraphStore.temporal,
    useShallow((state) => ({
      undo: state.undo,
      redo: state.redo,
      pastStates: state.pastStates,
      futureStates: state.futureStates,
    }))
  );

  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  const handleUndo = useCallback(() => {
    if (canUndo) undo();
  }, [canUndo, undo]);

  const handleRedo = useCallback(() => {
    if (canRedo) redo();
  }, [canRedo, redo]);

  return { undo: handleUndo, redo: handleRedo, canUndo, canRedo };
}
