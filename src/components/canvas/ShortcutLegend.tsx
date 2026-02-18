'use client';

/**
 * Keyboard shortcut legend overlay.
 *
 * Shows all available keyboard shortcuts in a floating panel.
 * Toggled with the `?` key or a toolbar button.
 */

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ShortcutLegendProps {
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    title: 'General',
    shortcuts: [
      { keys: 'Ctrl+Z', description: 'Undo' },
      { keys: 'Ctrl+Shift+Z', description: 'Redo' },
      { keys: 'Ctrl+A', description: 'Select all' },
      { keys: 'Delete', description: 'Delete selected' },
      { keys: '?', description: 'Toggle this legend' },
    ],
  },
  {
    title: 'Clipboard',
    shortcuts: [
      { keys: 'Ctrl+C', description: 'Copy selected' },
      { keys: 'Ctrl+V', description: 'Paste' },
      { keys: 'Ctrl+D', description: 'Duplicate selected' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: 'Arrow keys', description: 'Nudge selected (20px)' },
      { keys: 'Shift+Arrow', description: 'Fine nudge (1px)' },
      { keys: 'Tab', description: 'Next entity' },
      { keys: 'Shift+Tab', description: 'Previous entity' },
    ],
  },
  {
    title: 'Mode & View',
    shortcuts: [
      { keys: 'H', description: 'Drag / pan mode' },
      { keys: 'V', description: 'Select mode' },
      { keys: 'Ctrl+F', description: 'Search entities' },
    ],
  },
];

export default function ShortcutLegend({ onClose }: ShortcutLegendProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute top-4 right-4 z-30 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-72"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Keyboard Shortcuts</h3>
        <button
          onClick={onClose}
          className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {SHORTCUT_GROUPS.map((group) => (
          <div key={group.title}>
            <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.shortcuts.map((shortcut) => (
                <div
                  key={shortcut.keys}
                  className="flex items-center justify-between text-xs py-0.5"
                >
                  <span className="text-gray-600">{shortcut.description}</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono text-gray-500">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
