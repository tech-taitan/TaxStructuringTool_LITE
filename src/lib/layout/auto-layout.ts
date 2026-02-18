/**
 * Smart auto-align layout.
 *
 * Steps:
 * 1. Determine vertical layers (columns). Space columns apart by at least
 *    1 full entity width so there is clear visual separation.
 * 2. Determine horizontal layers (rows). Space rows apart by at least
 *    half an entity height for tighter vertical grouping.
 * 3. Fill column-major: top-to-bottom within each column, then next column.
 *
 * Connected components are grouped together so related entities stay
 * adjacent. The grid is centered around the current center-of-mass
 * (or the canvas center when nodes are stacked at the origin).
 */

import type { TaxNode, TaxEdge } from '@/models/graph';
import {
  NODE_WIDTH,
  NODE_HEIGHT,
  GRID_SIZE,
  CANVAS_BOUNDS,
} from '@/lib/constants';

/**
 * Auto-align all nodes into a grid with equal spacing.
 * Columns (vertical layers) are spaced by 1 entity width.
 * Rows (horizontal layers) are spaced by half an entity height.
 */
export function getLayoutedElements(nodes: TaxNode[], edges: TaxEdge[]): TaxNode[] {
  if (nodes.length === 0) return nodes;

  const n = nodes.length;
  const nodeMap = new Map(nodes.map((nd) => [nd.id, nd]));

  // --- Cell size ---
  // Use the largest node dimensions as the baseline
  const maxW = Math.max(...nodes.map((nd) => nd.width ?? NODE_WIDTH));
  const maxH = Math.max(...nodes.map((nd) => nd.height ?? NODE_HEIGHT));

  // Vertical layers (columns): gap = 1 full entity width between columns
  const colGap = maxW;
  const cellW = Math.ceil((maxW + colGap) / GRID_SIZE) * GRID_SIZE;

  // Horizontal layers (rows): gap = half an entity height between rows
  const rowGap = Math.ceil(maxH / 2);
  const cellH = Math.ceil((maxH + rowGap) / GRID_SIZE) * GRID_SIZE;

  // --- Connected components via BFS ---
  const adj = new Map<string, Set<string>>();
  for (const nd of nodes) adj.set(nd.id, new Set());
  for (const edge of edges) {
    adj.get(edge.source)?.add(edge.target);
    adj.get(edge.target)?.add(edge.source);
  }

  const visited = new Set<string>();
  const components: string[][] = [];
  for (const nd of nodes) {
    if (visited.has(nd.id)) continue;
    const comp: string[] = [];
    const queue = [nd.id];
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      comp.push(id);
      for (const neighbor of adj.get(id) ?? []) {
        if (!visited.has(neighbor)) queue.push(neighbor);
      }
    }
    components.push(comp);
  }

  // Sort components: largest first
  components.sort((a, b) => b.length - a.length);

  // Within each component, sort by spatial position (top-to-bottom, left-to-right)
  for (const comp of components) {
    comp.sort((a, b) => {
      const na = nodeMap.get(a)!;
      const nb = nodeMap.get(b)!;
      const rowA = Math.round(na.position.y / (cellH || 1));
      const rowB = Math.round(nb.position.y / (cellH || 1));
      if (rowA !== rowB) return rowA - rowB;
      return na.position.x - nb.position.x;
    });
  }

  // Flatten into ordered ID list (grouped components stay together)
  const orderedIds = components.flat();

  // --- Grid dimensions: compute rows first (vertical), then columns ---
  const rows = n <= 3 ? n : Math.ceil(Math.sqrt(n * 1.5));
  const cols = Math.ceil(n / rows);

  // --- Center point: use center-of-mass, or canvas center if nodes are stacked ---
  const sumX = nodes.reduce((s, nd) => s + nd.position.x + (nd.width ?? NODE_WIDTH) / 2, 0);
  const sumY = nodes.reduce((s, nd) => s + nd.position.y + (nd.height ?? NODE_HEIGHT) / 2, 0);
  let cx = sumX / n;
  let cy = sumY / n;

  // If all nodes are at roughly the same spot, default to canvas center
  const spread = Math.max(
    Math.max(...nodes.map((nd) => nd.position.x)) - Math.min(...nodes.map((nd) => nd.position.x)),
    Math.max(...nodes.map((nd) => nd.position.y)) - Math.min(...nodes.map((nd) => nd.position.y)),
  );
  if (spread < cellW) {
    const [[minX, minY], [maxX, maxY]] = CANVAS_BOUNDS;
    cx = (minX + maxX) / 2;
    cy = (minY + maxY) / 2;
  }

  // Grid origin: center the grid around (cx, cy), snap to grid
  const gridW = cols * cellW;
  const gridH = rows * cellH;
  const startX = Math.round((cx - gridW / 2) / GRID_SIZE) * GRID_SIZE;
  const startY = Math.round((cy - gridH / 2) / GRID_SIZE) * GRID_SIZE;

  // --- Assign positions (column-major: fill top-to-bottom, then next column) ---
  const posMap = new Map<string, { x: number; y: number }>();
  for (let i = 0; i < orderedIds.length; i++) {
    const col = Math.floor(i / rows);
    const row = i % rows;
    const nd = nodeMap.get(orderedIds[i])!;
    const w = nd.width ?? NODE_WIDTH;
    const h = nd.height ?? NODE_HEIGHT;
    // Center each node within its cell
    posMap.set(orderedIds[i], {
      x: Math.round((startX + col * cellW + (cellW - w) / 2) / GRID_SIZE) * GRID_SIZE,
      y: Math.round((startY + row * cellH + (cellH - h) / 2) / GRID_SIZE) * GRID_SIZE,
    });
  }

  return nodes.map((nd) => ({
    ...nd,
    position: posMap.get(nd.id) ?? nd.position,
  }));
}
