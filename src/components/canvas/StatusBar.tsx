'use client';

/**
 * Bottom status bar showing canvas statistics.
 *
 * Displays entity count, connection count, selection count,
 * and current zoom level as a percentage.
 */

import { useStore } from '@xyflow/react';
import { useGraphStore } from '@/stores/graph-store';

export default function StatusBar() {
  const nodeCount = useGraphStore((s) => s.nodes.length);
  const edgeCount = useGraphStore((s) => s.edges.length);
  const selectedCount = useGraphStore((s) => s.nodes.filter((n) => n.selected).length);
  const zoom = useStore((s) => s.transform[2]);

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="h-6 bg-gray-50 border-t border-gray-200 flex items-center px-3 gap-4 text-[11px] text-gray-500 select-none shrink-0">
      <span>
        {nodeCount} {nodeCount === 1 ? 'entity' : 'entities'}
      </span>
      <span>
        {edgeCount} {edgeCount === 1 ? 'connection' : 'connections'}
      </span>
      {selectedCount > 0 && (
        <span className="text-blue-600 font-medium">
          {selectedCount} selected
        </span>
      )}
      <span className="ml-auto">{zoomPercent}%</span>
    </div>
  );
}
