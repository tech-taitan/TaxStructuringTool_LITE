/**
 * Pure utility function for calculating alignment helper lines.
 *
 * Compares a dragging node's edges/center against all other nodes to find
 * alignment points within a snap threshold. Returns the line coordinates
 * and the snapped position for the dragging node.
 *
 * No React dependencies -- this is a pure calculation function.
 */

export interface HelperLineResult {
  /** Y-coordinate of horizontal alignment line, or undefined if none */
  horizontalLine: number | undefined;
  /** X-coordinate of vertical alignment line, or undefined if none */
  verticalLine: number | undefined;
  /** Snapped position for the dragging node */
  snappedPosition: { x: number; y: number };
}

interface NodeRect {
  position: { x: number; y: number };
  measured?: { width?: number; height?: number };
  id: string;
}

/**
 * Calculate alignment helper lines for a dragging node against all other nodes.
 *
 * Checks 5 vertical alignment points (left-left, right-right, center-center,
 * left-right, right-left) and 5 horizontal alignment points (top-top,
 * bottom-bottom, center-center, top-bottom, bottom-top).
 *
 * @param draggingNode - The node being dragged (with proposed position)
 * @param allNodes - All nodes on the canvas (dragging node will be excluded by id)
 * @param snapThreshold - Maximum distance in pixels for snapping (default 5)
 * @param defaultWidth - Fallback width when measured is unavailable
 * @param defaultHeight - Fallback height when measured is unavailable
 * @returns Helper line coordinates and snapped position
 */
export function getHelperLines(
  draggingNode: NodeRect,
  allNodes: NodeRect[],
  snapThreshold: number = 5,
  defaultWidth: number = 180,
  defaultHeight: number = 70
): HelperLineResult {
  const others = allNodes.filter((n) => n.id !== draggingNode.id);

  let horizontalLine: number | undefined;
  let verticalLine: number | undefined;
  let snapX = draggingNode.position.x;
  let snapY = draggingNode.position.y;

  const dragW = draggingNode.measured?.width ?? defaultWidth;
  const dragH = draggingNode.measured?.height ?? defaultHeight;

  let closestXDist = snapThreshold;
  let closestYDist = snapThreshold;

  for (const other of others) {
    const otherW = other.measured?.width ?? defaultWidth;
    const otherH = other.measured?.height ?? defaultHeight;

    // Vertical alignment checks (x-axis: produces vertical lines)
    const xChecks = [
      { dragEdge: snapX, otherEdge: other.position.x },                                // left-left
      { dragEdge: snapX + dragW, otherEdge: other.position.x + otherW },               // right-right
      { dragEdge: snapX + dragW / 2, otherEdge: other.position.x + otherW / 2 },       // center-center
      { dragEdge: snapX, otherEdge: other.position.x + otherW },                        // left-right
      { dragEdge: snapX + dragW, otherEdge: other.position.x },                         // right-left
    ];

    for (const check of xChecks) {
      const dist = Math.abs(check.dragEdge - check.otherEdge);
      if (dist < closestXDist) {
        closestXDist = dist;
        verticalLine = check.otherEdge;
        snapX = snapX + (check.otherEdge - check.dragEdge);
      }
    }

    // Horizontal alignment checks (y-axis: produces horizontal lines)
    const yChecks = [
      { dragEdge: snapY, otherEdge: other.position.y },                                // top-top
      { dragEdge: snapY + dragH, otherEdge: other.position.y + otherH },               // bottom-bottom
      { dragEdge: snapY + dragH / 2, otherEdge: other.position.y + otherH / 2 },       // center-center
      { dragEdge: snapY, otherEdge: other.position.y + otherH },                        // top-bottom
      { dragEdge: snapY + dragH, otherEdge: other.position.y },                         // bottom-top
    ];

    for (const check of yChecks) {
      const dist = Math.abs(check.dragEdge - check.otherEdge);
      if (dist < closestYDist) {
        closestYDist = dist;
        horizontalLine = check.otherEdge;
        snapY = snapY + (check.otherEdge - check.dragEdge);
      }
    }
  }

  return {
    horizontalLine,
    verticalLine,
    snappedPosition: { x: snapX, y: snapY },
  };
}
