/**
 * Overlap detection and nudge utility for entity node placement.
 *
 * When a node is dropped on an occupied position, finds the nearest
 * free grid-aligned position using a spiral outward search.
 */

import type { TaxNode } from '@/models/graph';
import { NODE_WIDTH, NODE_HEIGHT, GRID_SIZE } from '@/lib/constants';

/** Minimum gap in pixels between entity bounding boxes during overlap resolution */
const GAP = GRID_SIZE;

/**
 * Resolve overlap by nudging a new node to the nearest free grid-aligned position.
 *
 * Uses bounding-box collision detection and spiral outward search.
 * If no free position is found within radius 20 (extremely rare), returns
 * the node at its original position as a fallback.
 *
 * @param newNode - The node to place
 * @param existingNodes - All existing nodes on the canvas
 * @param gridSize - Grid cell size for alignment (defaults to GRID_SIZE)
 * @returns The node with potentially adjusted position
 */
export function resolveOverlap(
  newNode: TaxNode,
  existingNodes: TaxNode[],
  gridSize: number = GRID_SIZE
): TaxNode {
  const hasOverlap = (pos: { x: number; y: number }): boolean =>
    existingNodes.some((n) => {
      const dx = Math.abs(n.position.x - pos.x);
      const dy = Math.abs(n.position.y - pos.y);
      return dx < NODE_WIDTH + GAP && dy < NODE_HEIGHT + GAP;
    });

  // If no overlap at current position, return unchanged
  if (!hasOverlap(newNode.position)) {
    return newNode;
  }

  // Spiral outward from drop position in grid-aligned steps
  for (let radius = 1; radius <= 20; radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        // Only check perimeter positions (at least one of |dx|, |dy| equals radius)
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;

        const candidate = {
          x: newNode.position.x + dx * gridSize,
          y: newNode.position.y + dy * gridSize,
        };

        if (!hasOverlap(candidate)) {
          return { ...newNode, position: candidate };
        }
      }
    }
  }

  // Fallback: place at original position (extremely rare with 50-entity soft limit)
  return newNode;
}
