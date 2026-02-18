'use client';

/**
 * Notes section of the properties panel.
 *
 * Collapsible section with a free-form textarea for entity notes.
 * Shows character count with a 2000 character maximum.
 * Supports Edit/Preview tabs with markdown rendering.
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Markdown from 'react-markdown';
import type { TaxEntityData } from '@/models/graph';

interface NotesSectionProps {
  formData: TaxEntityData;
  onChange: (updates: Partial<TaxEntityData>) => void;
  errors: Record<string, string>;
}

const MAX_NOTES_LENGTH = 2000;

export default function NotesSection({
  formData,
  onChange,
  errors,
}: NotesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');

  const notes = formData.notes ?? '';
  const charCount = notes.length;

  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        className="flex items-center justify-between w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        Notes
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {/* Edit / Preview tabs */}
          <div className="flex gap-1 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setTab('edit')}
              className={`px-3 py-1 text-xs font-medium rounded-t transition-colors ${
                tab === 'edit'
                  ? 'text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setTab('preview')}
              className={`px-3 py-1 text-xs font-medium rounded-t transition-colors ${
                tab === 'preview'
                  ? 'text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Preview
            </button>
          </div>

          {tab === 'edit' ? (
            <textarea
              rows={4}
              maxLength={MAX_NOTES_LENGTH}
              value={notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500 resize-y ${
                errors.notes ? 'border-red-400' : 'border-gray-300'
              }`}
            />
          ) : (
            <div className="prose prose-sm max-w-none min-h-[6rem] px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-gray-50 overflow-y-auto">
              {notes ? (
                <Markdown>{notes}</Markdown>
              ) : (
                <p className="text-gray-400 italic">No notes</p>
              )}
            </div>
          )}

          <div className="flex justify-between text-xs text-gray-400">
            <span>
              {errors.notes && (
                <span className="text-red-500">{errors.notes}</span>
              )}
            </span>
            <span>
              {charCount}/{MAX_NOTES_LENGTH}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
