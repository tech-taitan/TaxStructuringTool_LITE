'use client';

/**
 * Dotted rectangle overlay showing the canvas boundary.
 *
 * Reads the viewport transform from React Flow's internal store
 * and maps the CANVAS_BOUNDS flow coordinates to screen pixels.
 * Stroke width and dash pattern are zoom-compensated so the border
 * always appears at a consistent visual thickness.
 */

import { useStore } from '@xyflow/react';
import { CANVAS_BOUNDS } from '@/lib/constants';

export default function CanvasBorder() {
  const transform = useStore((s) => s.transform);
  const [tx, ty, zoom] = transform;

  const [[minX, minY], [maxX, maxY]] = CANVAS_BOUNDS;

  // Convert flow coordinates to screen coordinates
  const left = minX * zoom + tx;
  const top = minY * zoom + ty;
  const width = (maxX - minX) * zoom;
  const height = (maxY - minY) * zoom;

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <rect
        x={left}
        y={top}
        width={width}
        height={height}
        fill="none"
        stroke="#9CA3AF"
        strokeWidth={1.5 / zoom}
        strokeDasharray={`${8 / zoom} ${4 / zoom}`}
        rx={2 / zoom}
      />
    </svg>
  );
}
