/**
 * Thumbnail capture for dashboard structure card previews.
 *
 * Captures the React Flow viewport as a small PNG data URL (400x300)
 * suitable for embedding in localStorage and displaying in the
 * dashboard card grid's aspect-[4/3] container.
 *
 * Follows the same viewport capture pattern as export.ts but at fixed
 * thumbnail dimensions with pixelRatio: 1 to keep data URL size small.
 */

import { toPng } from 'html-to-image';
import { getNodesBounds, getViewportForBounds } from '@xyflow/react';
import type { TaxNode } from '@/models/graph';

const THUMB_WIDTH = 400;
const THUMB_HEIGHT = 300;
const PADDING = 20;

/**
 * Capture the React Flow viewport as a PNG data URL thumbnail.
 *
 * @param nodes - Current graph nodes (for bounds calculation)
 * @returns Data URL string, or null if capture fails or canvas is empty
 */
export async function generateThumbnail(nodes: TaxNode[]): Promise<string | null> {
  try {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement | null;
    if (!viewport || nodes.length === 0) return null;

    const bounds = getNodesBounds(nodes);
    const transform = getViewportForBounds(bounds, THUMB_WIDTH, THUMB_HEIGHT, 0.5, 2, PADDING);

    const dataUrl = await toPng(viewport, {
      backgroundColor: '#ffffff',
      width: THUMB_WIDTH,
      height: THUMB_HEIGHT,
      style: {
        width: String(THUMB_WIDTH),
        height: String(THUMB_HEIGHT),
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
      },
      // Lower quality for smaller localStorage footprint (~10-30KB)
      pixelRatio: 1,
    });

    return dataUrl;
  } catch {
    return null;
  }
}
