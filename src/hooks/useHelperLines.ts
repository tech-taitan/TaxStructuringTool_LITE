/**
 * Hook that intercepts onNodesChange to calculate alignment snap helper lines.
 *
 * Wraps the standard applyNodeChanges with helper line detection: when a node
 * is being dragged, calculates alignment against other nodes and snaps the
 * position if within threshold. Returns the helper line coordinates for the
 * HelperLines SVG overlay component.
 */

import { useState, useCallback } from 'react';
import { type NodeChange, applyNodeChanges } from '@xyflow/react';
import type { TaxNode } from '@/models/graph';
import { getHelperLines } from '@/lib/utils/helper-lines';
import { SNAP_THRESHOLD, NODE_WIDTH, NODE_HEIGHT } from '@/lib/constants';

export function useHelperLines() {
  const [helperLines, setHelperLines] = useState<{
    horizontal?: number;
    vertical?: number;
  }>({});

  const applyNodesChangeWithHelperLines = useCallback(
    (changes: NodeChange<TaxNode>[], nodes: TaxNode[]): TaxNode[] => {
      // Find position changes (drag in progress)
      const positionChange = changes.find(
        (c): c is NodeChange<TaxNode> & {
          type: 'position';
          dragging: true;
          position: { x: number; y: number };
        } => c.type === 'position' && 'dragging' in c && c.dragging === true && 'position' in c && c.position != null
      );

      if (positionChange) {
        // Build pseudo-node with the proposed position
        const draggingNode = nodes.find((n) => n.id === positionChange.id);
        if (draggingNode) {
          const result = getHelperLines(
            { ...draggingNode, position: positionChange.position },
            nodes,
            SNAP_THRESHOLD,
            NODE_WIDTH,
            NODE_HEIGHT
          );

          setHelperLines({
            horizontal: result.horizontalLine,
            vertical: result.verticalLine,
          });

          // Snap the position if alignment found
          if (result.horizontalLine !== undefined || result.verticalLine !== undefined) {
            positionChange.position = result.snappedPosition;
          }
        }
      } else {
        // Not dragging -- clear helper lines
        const isDragging = changes.some(
          (c) => c.type === 'position' && 'dragging' in c && c.dragging === true
        );
        if (!isDragging) {
          setHelperLines({});
        }
      }

      return applyNodeChanges(changes, nodes);
    },
    []
  );

  return { helperLines, applyNodesChangeWithHelperLines };
}
