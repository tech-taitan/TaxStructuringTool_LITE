/**
 * SVG overlay component that renders blue dotted alignment snap guides.
 *
 * Rendered inside <ReactFlow> as a child. Reads the viewport transform
 * from React Flow's internal store to position lines correctly in screen
 * coordinates regardless of pan/zoom state.
 */

'use client';

import { useStore } from '@xyflow/react';

interface HelperLinesProps {
  /** Y-coordinate of horizontal alignment line (flow space) */
  horizontal?: number;
  /** X-coordinate of vertical alignment line (flow space) */
  vertical?: number;
}

export default function HelperLines({ horizontal, vertical }: HelperLinesProps) {
  const transform = useStore((s) => s.transform);

  if (horizontal == null && vertical == null) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-50"
      style={{ width: '100%', height: '100%' }}
    >
      {vertical != null && (
        <line
          x1={vertical * transform[2] + transform[0]}
          y1={0}
          x2={vertical * transform[2] + transform[0]}
          y2="100%"
          stroke="#3B82F6"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      )}
      {horizontal != null && (
        <line
          x1={0}
          y1={horizontal * transform[2] + transform[1]}
          x2="100%"
          y2={horizontal * transform[2] + transform[1]}
          stroke="#3B82F6"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      )}
    </svg>
  );
}
