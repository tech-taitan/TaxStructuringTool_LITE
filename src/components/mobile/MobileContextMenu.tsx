'use client';

/**
 * Floating context action menu for mobile long-press on entity nodes.
 *
 * Positioned near the press point with viewport-edge clamping to stay
 * within screen bounds. Provides Delete, Copy, Connect, and Properties
 * actions with 44px minimum touch targets.
 *
 * Dismisses on tap outside (touchstart) or after tapping an action.
 * Entrance animation via CSS keyframes for smooth appearance.
 */

import { useRef, useLayoutEffect, useState, useEffect, useCallback } from 'react';
import { Trash2, Copy, Link, Settings } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useGraphStore } from '@/stores/graph-store';
import { useClipboard } from '@/hooks/useClipboard';

interface MobileContextMenuProps {
  /** Screen X coordinate of the long-press */
  x: number;
  /** Screen Y coordinate of the long-press */
  y: number;
  /** ID of the long-pressed node */
  nodeId: string;
  /** Handler to close the menu */
  onClose: () => void;
}

/** Padding from viewport edges in pixels */
const EDGE_PADDING = 16;

export function MobileContextMenu({ x, y, nodeId, onClose }: MobileContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });

  const { copy } = useClipboard();

  // Position clamping: measure menu and clamp to viewport
  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const menuWidth = rect.width;
    const menuHeight = rect.height;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Determine if press is in lower half -> position menu above
    const isBottomHalf = y > vh / 2;

    let clampedY = isBottomHalf ? y - menuHeight - EDGE_PADDING : y + EDGE_PADDING;
    let clampedX = x - menuWidth / 2; // center horizontally on press point

    // Clamp to viewport bounds
    clampedX = Math.max(EDGE_PADDING, Math.min(clampedX, vw - menuWidth - EDGE_PADDING));
    clampedY = Math.max(EDGE_PADDING, Math.min(clampedY, vh - menuHeight - EDGE_PADDING));

    setPos({ top: clampedY, left: clampedX });
  }, [x, y]);

  // Dismiss on tap outside (touchstart, not mousedown -- mobile only)
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    return () => document.removeEventListener('touchstart', handleTouchStart);
  }, [onClose]);

  // Action: Delete
  const handleDelete = useCallback(() => {
    const edges = useGraphStore.getState().edges;
    const connectionCount = edges.filter(
      (e) => e.source === nodeId || e.target === nodeId
    ).length;
    useUIStore.getState().setDeleteConfirm({ nodeIds: [nodeId], connectionCount });
    onClose();
  }, [nodeId, onClose]);

  // Action: Copy
  const handleCopy = useCallback(() => {
    // Select the target node before copying
    useGraphStore.getState().onNodesChange([
      { id: nodeId, type: 'select', selected: true },
    ]);
    copy();
    onClose();
  }, [nodeId, copy, onClose]);

  // Action: Connect
  const handleConnect = useCallback(() => {
    useUIStore.getState().setPendingConnectionSource(nodeId);
    useUIStore.getState().setMobileTool('connect');
    onClose();
  }, [nodeId, onClose]);

  // Action: Properties
  const handleProperties = useCallback(() => {
    useUIStore.getState().setMobilePropertiesOpen(true);
    onClose();
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[180px] context-menu--animate-in"
      style={{ top: pos.top, left: pos.left }}
    >
      {/* Delete */}
      <button
        className="w-full px-4 min-h-[44px] text-sm text-left active:bg-gray-100 dark:active:bg-gray-700 flex items-center gap-3 text-red-600"
        onClick={handleDelete}
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>

      {/* Copy */}
      <button
        className="w-full px-4 min-h-[44px] text-sm text-left active:bg-gray-100 dark:active:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
        onClick={handleCopy}
      >
        <Copy className="w-4 h-4" />
        Copy
      </button>

      {/* Connect */}
      <button
        className="w-full px-4 min-h-[44px] text-sm text-left active:bg-gray-100 dark:active:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
        onClick={handleConnect}
      >
        <Link className="w-4 h-4" />
        Connect
      </button>

      {/* Properties */}
      <button
        className="w-full px-4 min-h-[44px] text-sm text-left active:bg-gray-100 dark:active:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
        onClick={handleProperties}
      >
        <Settings className="w-4 h-4" />
        Properties
      </button>
    </div>
  );
}
