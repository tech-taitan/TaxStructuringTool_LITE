'use client';

/**
 * Search filter input for the entity palette sidebar.
 *
 * Controlled input -- the parent component manages the search state
 * and any debouncing. Renders a search input with a lucide Search icon.
 */

import { Search } from 'lucide-react';

interface PaletteSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PaletteSearch({ value, onChange }: PaletteSearchProps) {
  return (
    <div className="relative px-3 py-2">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search entities..."
        className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}
