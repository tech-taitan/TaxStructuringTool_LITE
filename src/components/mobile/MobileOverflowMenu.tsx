'use client';

/**
 * Mobile overflow menu for secondary toolbar actions.
 *
 * Renders a "..." trigger button that opens an absolutely-positioned popover
 * with Save, Templates, Auto-Layout, and Export PNG actions. Closes on
 * tap-outside via pointerdown event listener (handles both mouse and touch).
 */

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Save, Loader2, BookOpen, LayoutGrid, Download } from 'lucide-react';

export interface MobileOverflowMenuProps {
  onSave?: () => void;
  isSaving?: boolean;
  canSave?: boolean;
  onAutoLayout: () => void;
  onShowTemplates: () => void;
  onExportPng?: () => void;
}

export function MobileOverflowMenu({
  onSave,
  isSaving = false,
  canSave = false,
  onAutoLayout,
  onShowTemplates,
  onExportPng,
}: MobileOverflowMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on tap-outside using pointerdown (handles both mouse and touch)
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const saveDisabled = !canSave || isSaving;

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700"
        aria-label="More actions"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* Save */}
          {onSave && (
            <button
              onClick={() => {
                if (!saveDisabled) onSave();
                setIsOpen(false);
              }}
              disabled={saveDisabled}
              className="w-full px-4 py-3 text-sm text-left active:bg-gray-100 flex items-center gap-3 disabled:opacity-40"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save</span>
            </button>
          )}

          {/* Templates */}
          <button
            onClick={() => {
              onShowTemplates();
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 text-sm text-left active:bg-gray-100 flex items-center gap-3"
          >
            <BookOpen className="w-4 h-4" />
            <span>Templates</span>
          </button>

          {/* Auto-Layout */}
          <button
            onClick={() => {
              onAutoLayout();
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 text-sm text-left active:bg-gray-100 flex items-center gap-3"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Auto-Layout</span>
          </button>

          {/* Export PNG */}
          {onExportPng && (
            <button
              onClick={() => {
                onExportPng();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-sm text-left active:bg-gray-100 flex items-center gap-3"
            >
              <Download className="w-4 h-4" />
              <span>Export PNG</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
