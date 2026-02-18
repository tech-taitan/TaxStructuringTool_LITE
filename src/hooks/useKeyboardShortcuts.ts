/**
 * Centralized keyboard shortcuts hook.
 *
 * Registers all editor keyboard shortcuts on the window and prevents
 * them from firing when the user is typing in an input, textarea, or
 * contentEditable element (palette search, inline rename, properties fields).
 *
 * Shortcuts handled:
 * - Delete: delete selected entities/edges
 * - Ctrl+Z: undo
 * - Ctrl+Shift+Z: redo
 * - Ctrl+C: copy selected entities
 * - Ctrl+V: paste from internal clipboard
 * - Ctrl+A: select all entities
 * - Ctrl+D: duplicate selected entities
 * - Arrow keys: nudge selected entities by grid size
 * - Tab / Shift+Tab: cycle through entities
 * - H / V: switch interaction mode (drag / select)
 * - ?: toggle keyboard shortcut legend
 */

import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onSelectAll: () => void;
  onDuplicate?: () => void;
  onNudge?: (dx: number, dy: number) => void;
  onCycleNode?: (direction: 1 | -1) => void;
  onSetInteractionMode?: (mode: 'drag' | 'select') => void;
  onToggleShortcutLegend?: () => void;
  onSearch?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea/contentEditable
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const ctrl = event.ctrlKey || event.metaKey;

      // Ctrl+Shift+Z: redo (check before Ctrl+Z)
      if (ctrl && event.shiftKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        handlers.onRedo();
        return;
      }
      // Ctrl+Z: undo
      if (ctrl && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        handlers.onUndo();
        return;
      }
      // Ctrl+F: search entities
      if (ctrl && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        handlers.onSearch?.();
        return;
      }
      // Ctrl+D: duplicate
      if (ctrl && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        handlers.onDuplicate?.();
        return;
      }
      // Ctrl+C: copy
      if (ctrl && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        handlers.onCopy();
        return;
      }
      // Ctrl+V: paste
      if (ctrl && event.key.toLowerCase() === 'v') {
        event.preventDefault();
        handlers.onPaste();
        return;
      }
      // Ctrl+A: select all
      if (ctrl && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        handlers.onSelectAll();
        return;
      }
      // Delete: delete selected
      if (event.key === 'Delete') {
        event.preventDefault();
        handlers.onDelete();
        return;
      }
      // Arrow keys: nudge selected nodes
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        const step = event.shiftKey ? 1 : 20; // fine nudge with Shift
        const dx = event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0;
        const dy = event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0;
        handlers.onNudge?.(dx, dy);
        return;
      }
      // Tab / Shift+Tab: cycle through entities
      if (event.key === 'Tab') {
        event.preventDefault();
        handlers.onCycleNode?.(event.shiftKey ? -1 : 1);
        return;
      }
      // H: switch to drag mode
      if (event.key.toLowerCase() === 'h' && !ctrl) {
        handlers.onSetInteractionMode?.('drag');
        return;
      }
      // V: switch to select mode
      if (event.key.toLowerCase() === 'v' && !ctrl) {
        handlers.onSetInteractionMode?.('select');
        return;
      }
      // ?: toggle shortcut legend
      if (event.key === '?') {
        handlers.onToggleShortcutLegend?.();
        return;
      }
    },
    [handlers]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
