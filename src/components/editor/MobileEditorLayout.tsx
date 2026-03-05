'use client';

/**
 * Mobile editor layout for phone-sized screens (<768px).
 *
 * Renders a full-screen canvas with a floating bottom toolbar for
 * undo, redo, add (palette), and connect actions. Uses 100dvh to
 * handle iOS Safari's dynamic address bar correctly.
 *
 * Mount points for bottom sheets (palette, properties) are reserved
 * for Phase 12 and Phase 13 respectively.
 */

import Canvas from '@/components/canvas/Canvas';
import { MobilePalette } from '@/components/mobile/MobilePalette';
import { MobilePropertiesSheet } from '@/components/mobile/MobilePropertiesSheet';
import { MobileAnalysisOverlay } from '@/components/mobile/MobileAnalysisOverlay';
import { MobileConnectionBanner } from '@/components/mobile/MobileConnectionBanner';
import { useUIStore } from '@/stores/ui-store';
import { Undo2, Redo2, Plus, Link, Sparkles } from 'lucide-react';

export interface MobileEditorLayoutProps {
  structureId: string | null;
  structureName: string;
  onSave?: () => void;
  isSaving?: boolean;
  canSave?: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasDraft: boolean;
  restoreDraft: () => void;
  discardDraft: () => void;
}

export default function MobileEditorLayout({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  hasDraft,
  restoreDraft,
  discardDraft,
}: MobileEditorLayoutProps) {
  const setMobilePaletteOpen = useUIStore((s) => s.setMobilePaletteOpen);
  const setMobileTool = useUIStore((s) => s.setMobileTool);
  const mobileTool = useUIStore((s) => s.mobileTool);
  const setPendingConnectionSource = useUIStore((s) => s.setPendingConnectionSource);
  const setMobileAnalysisOpen = useUIStore((s) => s.setMobileAnalysisOpen);

  return (
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden">
      {/* Draft restore banner */}
      {hasDraft && (
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border-b border-blue-200 text-sm">
          <span className="text-blue-800">
            You have unsaved work from a previous session.
          </span>
          <button
            onClick={restoreDraft}
            className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
          >
            Restore
          </button>
          <button
            onClick={discardDraft}
            className="px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 rounded"
          >
            Discard
          </button>
        </div>
      )}

      {/* Full-screen canvas area */}
      <div className="flex-1 relative">
        <Canvas />
        <MobileConnectionBanner />

        {/* Floating bottom toolbar */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30
                     flex items-center gap-1 px-3 py-2
                     bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
                     rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
        >
          {/* Undo */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700 disabled:opacity-30"
            aria-label="Undo"
          >
            <Undo2 className="w-5 h-5" />
          </button>

          {/* Redo */}
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700 disabled:opacity-30"
            aria-label="Redo"
          >
            <Redo2 className="w-5 h-5" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

          {/* Add (opens palette bottom sheet -- wired for Phase 12) */}
          <button
            onClick={() => setMobilePaletteOpen(true)}
            className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700 disabled:opacity-30"
            aria-label="Add entity"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Connect (toggles connect mode -- Phase 14) */}
          <button
            onClick={() => {
              if (mobileTool === 'connect') {
                setMobileTool(null);
                setPendingConnectionSource(null);
              } else {
                setMobileTool('connect');
              }
            }}
            className={`p-2.5 rounded-full ${
              mobileTool === 'connect'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700'
            }`}
            aria-label={mobileTool === 'connect' ? 'Exit connect mode' : 'Connect entities'}
          >
            <Link className="w-5 h-5" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

          {/* Analyze (opens AI analysis overlay) */}
          <button
            onClick={() => setMobileAnalysisOpen(true)}
            className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700"
            aria-label="Analyze structure"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom sheets */}
      <MobilePalette />
      <MobilePropertiesSheet />
      <MobileAnalysisOverlay />
    </div>
  );
}
