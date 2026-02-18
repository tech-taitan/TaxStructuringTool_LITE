/**
 * Pure utility functions for copy/paste operations.
 *
 * No React dependencies -- can be tested independently.
 * Handles ID remapping and internal edge filtering during copy/paste.
 */

import { nanoid } from 'nanoid';
import type { TaxNode, TaxEdge } from '@/models/graph';

export interface ClipboardData {
  nodes: TaxNode[];
  edges: TaxEdge[];
}

/**
 * Extract selected nodes and their internal edges (edges where both
 * source AND target are in the selected set) for copying.
 */
export function copySelectedNodes(
  nodes: TaxNode[],
  edges: TaxEdge[]
): ClipboardData {
  const selectedNodes = nodes.filter((n) => n.selected);
  const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));

  // Only copy edges where BOTH endpoints are selected
  const internalEdges = edges.filter(
    (e) => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target)
  );

  return { nodes: selectedNodes, edges: internalEdges };
}

/**
 * Create new nodes and edges from clipboard data with fresh IDs,
 * remapped edge endpoints, and offset positions.
 */
export function pasteFromClipboard(
  clipboard: ClipboardData,
  offset: { x: number; y: number }
): { nodes: TaxNode[]; edges: TaxEdge[] } {
  const idMap = new Map<string, string>();

  const newNodes: TaxNode[] = clipboard.nodes.map((node) => {
    const newId = nanoid();
    idMap.set(node.id, newId);
    return {
      ...node,
      id: newId,
      position: {
        x: node.position.x + offset.x,
        y: node.position.y + offset.y,
      },
      selected: true, // Select pasted nodes
      dragging: false,
    };
  });

  const newEdges: TaxEdge[] = clipboard.edges.map((edge) => ({
    ...edge,
    id: nanoid(),
    source: idMap.get(edge.source)!,
    target: idMap.get(edge.target)!,
    selected: false,
  }));

  return { nodes: newNodes, edges: newEdges };
}
