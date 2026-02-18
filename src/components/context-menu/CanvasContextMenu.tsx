/**
 * Right-click context menu for entity nodes on the canvas.
 *
 * Positioned absolutely using fixed coordinates from the mouse event.
 * Provides Delete, Copy, and Properties actions for the targeted node.
 * Closes on click-outside, Escape key, or action selection.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Trash2, Copy, Settings } from 'lucide-react';

interface CanvasContextMenuProps {
  /** Screen X coordinate for menu position */
  x: number;
  /** Screen Y coordinate for menu position */
  y: number;
  /** ID of the right-clicked node */
  nodeId: string;
  /** Handler for Delete action */
  onDelete: () => void;
  /** Handler for Copy action */
  onCopy: () => void;
  /** Handler for Properties action */
  onProperties: () => void;
  /** Handler to close the menu */
  onClose: () => void;
}

export default function CanvasContextMenu({
  x,
  y,
  nodeId,
  onDelete,
  onCopy,
  onProperties,
  onClose,
}: CanvasContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAction = useCallback(
    (action: () => void) => {
      action();
      onClose();
    },
    [onClose]
  );

  return (
    <div
      ref={menuRef}
      className="bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px]"
      style={{
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 50,
      }}
    >
      <button
        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
        onClick={() => handleAction(onDelete)}
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
      <button
        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2 text-gray-700"
        onClick={() => handleAction(onCopy)}
      >
        <Copy className="w-4 h-4" />
        Copy
      </button>
      <button
        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2 text-gray-700"
        onClick={() => handleAction(onProperties)}
      >
        <Settings className="w-4 h-4" />
        Properties
      </button>
    </div>
  );
}
