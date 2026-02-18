/**
 * Alignment and distribution utilities for selected nodes.
 *
 * Operates on node positions and dimensions to align or evenly
 * distribute selected entities on the canvas.
 */

import type { TaxNode } from '@/models/graph';
import { NODE_WIDTH, NODE_HEIGHT } from '@/lib/constants';

type AlignType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
type DistributeType = 'horizontal' | 'vertical';

/** Get node width, falling back to constant */
function getW(node: TaxNode): number {
  return node.width ?? NODE_WIDTH;
}

/** Get node height, falling back to constant */
function getH(node: TaxNode): number {
  return node.height ?? NODE_HEIGHT;
}

/**
 * Align selected nodes along a given axis.
 * Returns new node array with updated positions for selected nodes.
 */
export function alignNodes(
  allNodes: TaxNode[],
  type: AlignType
): TaxNode[] {
  const selected = allNodes.filter((n) => n.selected);
  if (selected.length < 2) return allNodes;

  let target: number;

  switch (type) {
    case 'left':
      target = Math.min(...selected.map((n) => n.position.x));
      return allNodes.map((n) =>
        n.selected ? { ...n, position: { ...n.position, x: target } } : n
      );
    case 'center': {
      const centers = selected.map((n) => n.position.x + getW(n) / 2);
      target = (Math.min(...centers) + Math.max(...centers)) / 2;
      return allNodes.map((n) =>
        n.selected
          ? { ...n, position: { ...n.position, x: target - getW(n) / 2 } }
          : n
      );
    }
    case 'right': {
      target = Math.max(...selected.map((n) => n.position.x + getW(n)));
      return allNodes.map((n) =>
        n.selected
          ? { ...n, position: { ...n.position, x: target - getW(n) } }
          : n
      );
    }
    case 'top':
      target = Math.min(...selected.map((n) => n.position.y));
      return allNodes.map((n) =>
        n.selected ? { ...n, position: { ...n.position, y: target } } : n
      );
    case 'middle': {
      const middles = selected.map((n) => n.position.y + getH(n) / 2);
      target = (Math.min(...middles) + Math.max(...middles)) / 2;
      return allNodes.map((n) =>
        n.selected
          ? { ...n, position: { ...n.position, y: target - getH(n) / 2 } }
          : n
      );
    }
    case 'bottom': {
      target = Math.max(...selected.map((n) => n.position.y + getH(n)));
      return allNodes.map((n) =>
        n.selected
          ? { ...n, position: { ...n.position, y: target - getH(n) } }
          : n
      );
    }
  }
}

/**
 * Distribute selected nodes evenly along an axis.
 * Preserves the positions of the outermost nodes, redistributes inner ones.
 */
export function distributeNodes(
  allNodes: TaxNode[],
  type: DistributeType
): TaxNode[] {
  const selected = allNodes.filter((n) => n.selected);
  if (selected.length < 3) return allNodes;

  if (type === 'horizontal') {
    const sorted = [...selected].sort((a, b) => a.position.x - b.position.x);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalWidth = sorted.reduce((sum, n) => sum + getW(n), 0);
    const totalSpace = (last.position.x + getW(last)) - first.position.x - totalWidth;
    const gap = totalSpace / (sorted.length - 1);

    let x = first.position.x + getW(first) + gap;
    const posMap = new Map<string, number>();
    for (let i = 1; i < sorted.length - 1; i++) {
      posMap.set(sorted[i].id, x);
      x += getW(sorted[i]) + gap;
    }

    return allNodes.map((n) =>
      posMap.has(n.id)
        ? { ...n, position: { ...n.position, x: posMap.get(n.id)! } }
        : n
    );
  }

  // vertical
  const sorted = [...selected].sort((a, b) => a.position.y - b.position.y);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const totalHeight = sorted.reduce((sum, n) => sum + getH(n), 0);
  const totalSpace = (last.position.y + getH(last)) - first.position.y - totalHeight;
  const gap = totalSpace / (sorted.length - 1);

  let y = first.position.y + getH(first) + gap;
  const posMap = new Map<string, number>();
  for (let i = 1; i < sorted.length - 1; i++) {
    posMap.set(sorted[i].id, y);
    y += getH(sorted[i]) + gap;
  }

  return allNodes.map((n) =>
    posMap.has(n.id)
      ? { ...n, position: { ...n.position, y: posMap.get(n.id)! } }
      : n
  );
}
