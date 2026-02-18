/**
 * Hook managing an internal clipboard for copy/paste operations.
 *
 * Stores clipboard data in a ref (session-scoped, not persisted).
 * Uses copySelectedNodes/pasteFromClipboard utilities for the heavy lifting.
 * Paste is atomic via the graph store's pasteNodes action (single undo point).
 *
 * Usage:
 *   const { copy, paste, canPaste } = useClipboard();
 */

import { useRef, useCallback } from 'react';
import { useGraphStore } from '@/stores/graph-store';
import { copySelectedNodes, pasteFromClipboard } from '@/lib/utils/clipboard';
import { PASTE_OFFSET } from '@/lib/constants';
import type { ClipboardData } from '@/lib/utils/clipboard';

export function useClipboard() {
  const clipboardRef = useRef<ClipboardData | null>(null);

  const copy = useCallback(() => {
    const { nodes, edges } = useGraphStore.getState();
    const data = copySelectedNodes(nodes, edges);
    if (data.nodes.length > 0) {
      clipboardRef.current = data;
    }
  }, []);

  const paste = useCallback(() => {
    if (!clipboardRef.current) return;
    const { nodes: newNodes, edges: newEdges } = pasteFromClipboard(
      clipboardRef.current,
      { x: PASTE_OFFSET, y: PASTE_OFFSET }
    );
    useGraphStore.getState().pasteNodes(newNodes, newEdges);
  }, []);

  const canPaste = useCallback(() => clipboardRef.current !== null, []);

  return { copy, paste, canPaste };
}
