'use client';

/**
 * Collapsible category section in the entity palette sidebar.
 *
 * Renders a clickable header with a chevron rotation indicator,
 * and when expanded shows the list of entity items for that category.
 * Smooth CSS transition on expand/collapse.
 */

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { EntityTypeConfig } from '@/models/entities';
import PaletteItem from './PaletteItem';

interface PaletteCategoryProps {
  label: string;
  icon: React.ReactNode;
  items: EntityTypeConfig[];
  defaultOpen?: boolean;
}

export default function PaletteCategory({
  label,
  icon,
  items,
  defaultOpen = false,
}: PaletteCategoryProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (items.length === 0) return null;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
      >
        <ChevronRight
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-90' : ''
          }`}
        />
        <span className="flex-shrink-0 text-gray-500">{icon}</span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="ml-auto text-xs text-gray-400">{items.length}</span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pb-1 pl-2">
          {items.map((item) => (
            <PaletteItem key={item.id} config={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
