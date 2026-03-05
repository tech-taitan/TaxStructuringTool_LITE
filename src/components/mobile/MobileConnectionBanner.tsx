'use client';

/**
 * Floating instruction banner for mobile connect mode.
 *
 * Renders at the top of the canvas area when mobileTool === 'connect'.
 * Shows the current connection flow state:
 * - No source selected: "Tap an entity to start a connection"
 * - Source selected: "Now tap a target entity to connect from {name}"
 *
 * Includes a cancel (X) button to exit connect mode.
 */

import { useUIStore } from '@/stores/ui-store';
import { useGraphStore } from '@/stores/graph-store';
import { Link, X } from 'lucide-react';

export function MobileConnectionBanner() {
  const mobileTool = useUIStore((s) => s.mobileTool);
  const pendingConnectionSource = useUIStore((s) => s.pendingConnectionSource);
  const setMobileTool = useUIStore((s) => s.setMobileTool);
  const setPendingConnectionSource = useUIStore((s) => s.setPendingConnectionSource);
  const nodes = useGraphStore((s) => s.nodes);

  if (mobileTool !== 'connect') return null;

  const sourceName = pendingConnectionSource
    ? nodes.find((n) => n.id === pendingConnectionSource)?.data.name ?? 'entity'
    : null;

  const message = sourceName
    ? `Now tap a target entity to connect from "${sourceName}"`
    : 'Tap an entity to start a connection';

  const handleCancel = () => {
    setMobileTool(null);
    setPendingConnectionSource(null);
  };

  return (
    <div
      className="absolute top-3 left-1/2 -translate-x-1/2 z-40
                 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-full shadow-lg
                 flex items-center gap-2 connection-banner--animate-in"
    >
      <Link className="w-4 h-4 flex-shrink-0" />
      <span className="whitespace-nowrap">{message}</span>
      <button
        onClick={handleCancel}
        className="ml-1 p-0.5 rounded-full active:bg-blue-700"
        aria-label="Cancel connection"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
