'use client';

/**
 * Entity search bar overlay for Ctrl+F search.
 *
 * Searches entity names and focuses the canvas on matching entities.
 * Cycles through matches with Enter / Shift+Enter.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useGraphStore } from '@/stores/graph-store';
import { useUIStore } from '@/stores/ui-store';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';

interface EntitySearchBarProps {
  onClose: () => void;
}

export default function EntitySearchBar({ onClose }: EntitySearchBarProps) {
  const [query, setQuery] = useState('');
  const [matchIndex, setMatchIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { fitView } = useReactFlow();
  const setSelectedNode = useUIStore((s) => s.setSelectedNode);

  const nodes = useGraphStore((s) => s.nodes);
  const matches = query.trim()
    ? nodes.filter((n) =>
        n.data.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : [];

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Focus on current match
  useEffect(() => {
    if (matches.length === 0) return;
    const safeIndex = matchIndex % matches.length;
    const node = matches[safeIndex];
    setSelectedNode(node.id);
    useGraphStore.getState().onNodesChange(
      nodes.map((n) => ({
        id: n.id,
        type: 'select' as const,
        selected: n.id === node.id,
      }))
    );
    fitView({ nodes: [{ id: node.id }], padding: 0.5, duration: 300 });
  }, [matchIndex, matches.length, query]); // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = useCallback(() => {
    if (matches.length > 0) setMatchIndex((i) => (i + 1) % matches.length);
  }, [matches.length]);

  const goPrev = useCallback(() => {
    if (matches.length > 0)
      setMatchIndex((i) => (i - 1 + matches.length) % matches.length);
  }, [matches.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        if (e.shiftKey) goPrev();
        else goNext();
      }
    },
    [onClose, goNext, goPrev]
  );

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center gap-1 px-2 py-1.5 w-72">
      <Search className="w-4 h-4 text-gray-400 shrink-0" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setMatchIndex(0);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search entities..."
        className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
      />
      {query && matches.length > 0 && (
        <span className="text-[10px] text-gray-400 shrink-0">
          {(matchIndex % matches.length) + 1}/{matches.length}
        </span>
      )}
      {query && matches.length === 0 && (
        <span className="text-[10px] text-red-400 shrink-0">No results</span>
      )}
      <button onClick={goPrev} className="p-0.5 rounded hover:bg-gray-100 text-gray-400" title="Previous match">
        <ChevronUp className="w-3.5 h-3.5" />
      </button>
      <button onClick={goNext} className="p-0.5 rounded hover:bg-gray-100 text-gray-400" title="Next match">
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onClose}
        className="p-0.5 rounded hover:bg-gray-100 text-gray-400"
        title="Close (Esc)"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
