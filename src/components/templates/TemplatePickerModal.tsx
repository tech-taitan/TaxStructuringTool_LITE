'use client';

/**
 * Modal overlay for selecting and loading pre-built structure templates.
 *
 * Displays a grid of template cards from the template registry.
 * Clicking a card calls onSelect with the chosen template.
 * Closes on Escape key, click-outside, or the close button.
 */

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { templateRegistry, type TemplateDefinition } from '@/lib/templates';

interface TemplatePickerModalProps {
  onSelect: (template: TemplateDefinition) => void;
  onClose: () => void;
}

export default function TemplatePickerModal({
  onSelect,
  onClose,
}: TemplatePickerModalProps) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Load Template
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Choose a pre-built structure to add to your canvas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {templateRegistry.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className="text-left p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                  {template.name}
                </h3>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap ml-2">
                  {template.category}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                {template.description}
              </p>
              <div className="flex gap-3 text-[11px] text-gray-400">
                <span>{template.entityCount} entities</span>
                <span>{template.connectionCount} connections</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
