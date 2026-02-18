'use client';

/**
 * Right-click context menu for relationship edges on the canvas.
 *
 * Provides path style switching (smooth step vs straight line),
 * delete, and properties actions for the targeted edge.
 * Closes on click-outside, Escape key, or action selection.
 */

import { useEffect, useRef, useCallback } from 'react';
import { Trash2, Settings, Minus, GitCommitHorizontal } from 'lucide-react';
import type { TaxRelationshipData } from '@/models/relationships';

interface EdgeContextMenuProps {
  /** Screen X coordinate for menu position */
  x: number;
  /** Screen Y coordinate for menu position */
  y: number;
  /** ID of the right-clicked edge */
  edgeId: string;
  /** Current path style of the edge */
  pathStyle: TaxRelationshipData['pathStyle'];
  /** Handler to set path style */
  onSetPathStyle: (style: 'smoothstep' | 'straight') => void;
  /** Handler for Delete action */
  onDelete: () => void;
  /** Handler for Properties action */
  onProperties: () => void;
  /** Handler to close the menu */
  onClose: () => void;
}

export default function EdgeContextMenu({
  x,
  y,
  edgeId: _edgeId,
  pathStyle,
  onSetPathStyle,
  onDelete,
  onProperties,
  onClose,
}: EdgeContextMenuProps) {
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

  const isStraight = pathStyle === 'straight';

  return (
    <div
      ref={menuRef}
      className="bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[180px]"
      style={{
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 50,
      }}
    >
      {/* Path style options */}
      <div className="px-3 py-1.5 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
        Line Style
      </div>
      <button
        className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2 ${
          !isStraight ? 'text-blue-600 font-medium' : 'text-gray-700'
        }`}
        onClick={() => handleAction(() => onSetPathStyle('smoothstep'))}
      >
        <GitCommitHorizontal className="w-4 h-4" />
        Smooth Step
        {!isStraight && <span className="ml-auto text-blue-500 text-xs">✓</span>}
      </button>
      <button
        className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2 ${
          isStraight ? 'text-blue-600 font-medium' : 'text-gray-700'
        }`}
        onClick={() => handleAction(() => onSetPathStyle('straight'))}
      >
        <Minus className="w-4 h-4" />
        Straight Line
        {isStraight && <span className="ml-auto text-blue-500 text-xs">✓</span>}
      </button>

      {/* Divider */}
      <div className="h-px bg-gray-200 my-1" />

      <button
        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2 text-gray-700"
        onClick={() => handleAction(onProperties)}
      >
        <Settings className="w-4 h-4" />
        Properties
      </button>
      <button
        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
        onClick={() => handleAction(onDelete)}
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
}
