'use client';

/**
 * Full-screen AI analysis overlay for mobile.
 *
 * Slides up from the bottom of the screen when opened. Contains a close
 * button, scrollable content area with placeholder text, and disabled
 * export button. Truly modal -- pointer-events-auto blocks all canvas
 * interaction beneath.
 *
 * Ready to integrate streaming AI content when the backend is built.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Sparkles, FileDown } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';

export function MobileAnalysisOverlay() {
  const isOpen = useUIStore((s) => s.isMobileAnalysisOpen);
  const setOpen = useUIStore((s) => s.setMobileAnalysisOpen);

  // Mount/unmount with animation: render when open, animate in, animate out before unmount
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Open: mount then animate in on next frame
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Allow DOM to paint at translateY(100%) before triggering transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      // Animate out, then unmount
      setIsVisible(false);
    }
  }, [isOpen]);

  // Unmount after slide-out transition completes
  const handleTransitionEnd = useCallback(() => {
    if (!isVisible) {
      setIsRendered(false);
    }
  }, [isVisible]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  if (!isRendered) return null;

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[70] bg-white dark:bg-gray-900 flex flex-col pointer-events-auto transition-transform duration-300 ease-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ pointerEvents: 'auto' }}
      onTransitionEnd={handleTransitionEnd}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-gray-700"
          aria-label="Close analysis"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Title */}
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          AI Analysis
        </h2>

        {/* Placeholder for export -- balanced with close button */}
        <div className="w-9 h-9" />
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto mt-16">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          </div>

          {/* Heading */}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Analyze Structure
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
            Tap the Analyze button to generate an AI-powered tax analysis of
            your structure. Analysis will cover formation steps, transaction
            mechanics, and tax implications.
          </p>

          {/* Disabled analyze button */}
          <button
            disabled
            className="bg-blue-600 text-white rounded-lg px-6 py-3 opacity-50 cursor-not-allowed text-sm font-medium"
          >
            Analyze Structure
          </button>

          {/* Coming soon badge */}
          <span className="mt-4 text-xs text-gray-400 dark:text-gray-500">
            Coming soon
          </span>
        </div>
      </div>

      {/* Footer area */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed"
        >
          <FileDown className="w-4 h-4" />
          Export PDF
        </button>
      </div>
    </div>
  );
}
