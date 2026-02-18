'use client';

/**
 * Main entity palette sidebar container.
 *
 * Provides a collapsible left sidebar with:
 * - Toggle button to expand/collapse
 * - Search filter input (with 150ms debounce)
 * - Categorized entity type sections (all collapsed by default)
 * - Pre-rendered ghost preview elements for drag image
 *
 * In collapsed mode, shows a narrow strip with category icons and tooltips.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Shield,
  Handshake,
  TrendingUp,
  User,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { getEntitiesByCategory } from '@/lib/entity-registry';
import { ENTITY_REGISTRY } from '@/lib/entity-registry';
import type { EntityCategory } from '@/models/entities';
import PaletteSearch from './PaletteSearch';
import PaletteCategory from './PaletteCategory';

/** Category configuration for the palette */
const CATEGORY_CONFIG: {
  category: EntityCategory;
  label: string;
  icon: React.ReactNode;
}[] = [
  { category: 'company', label: 'Companies', icon: <Building2 className="w-4 h-4" /> },
  { category: 'trust', label: 'Trusts', icon: <Shield className="w-4 h-4" /> },
  { category: 'partnership', label: 'Partnerships', icon: <Handshake className="w-4 h-4" /> },
  { category: 'vc', label: 'Venture Capital', icon: <TrendingUp className="w-4 h-4" /> },
  { category: 'individual', label: 'Individuals', icon: <User className="w-4 h-4" /> },
  { category: 'smsf', label: 'Super Funds', icon: <ShieldCheck className="w-4 h-4" /> },
];

/** Pre-rendered ghost preview elements for setDragImage (must be in DOM ahead of time) */
function GhostPreviews() {
  return (
    <div className="fixed left-[-9999px] top-0" aria-hidden="true">
      {Object.values(ENTITY_REGISTRY).map((config) => (
        <div
          key={config.id}
          id={`ghost-${config.id}`}
          className={`entity-node entity-node--${config.shape}`}
          style={{
            borderColor: config.color,
            borderWidth: 1,
            background: `${config.color}1A`,
            opacity: 0.7,
            padding: '8px 12px',
            minWidth: 120,
          }}
        >
          <span className="text-sm font-semibold">{config.shortName}</span>
        </div>
      ))}
    </div>
  );
}

export default function EntityPalette() {
  const isPaletteCollapsed = useUIStore((s) => s.isPaletteCollapsed);
  const paletteSearchQuery = useUIStore((s) => s.paletteSearchQuery);
  const togglePalette = useUIStore((s) => s.togglePalette);
  const setPaletteSearch = useUIStore((s) => s.setPaletteSearch);

  // Debounced search query (150ms)
  const [debouncedQuery, setDebouncedQuery] = useState(paletteSearchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(paletteSearchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [paletteSearchQuery]);

  // Get items per category, filtered by search
  const categoriesWithItems = useMemo(() => {
    const query = debouncedQuery.toLowerCase().trim();

    return CATEGORY_CONFIG.map((cat) => {
      let items = getEntitiesByCategory('AU', cat.category);
      if (query) {
        items = items.filter((item) =>
          item.displayName.toLowerCase().includes(query)
        );
      }
      return { ...cat, items };
    });
  }, [debouncedQuery]);

  return (
    <aside
      className={`transition-all duration-200 ease-in-out overflow-hidden border-r border-gray-200 bg-white flex-shrink-0 h-full flex flex-col ${
        isPaletteCollapsed ? 'w-12' : 'w-64'
      }`}
    >
      {/* Toggle button */}
      <div className="flex items-center border-b border-gray-200 px-2 py-2 flex-shrink-0">
        <button
          onClick={togglePalette}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500"
          title={isPaletteCollapsed ? 'Expand palette' : 'Collapse palette'}
        >
          {isPaletteCollapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
        {!isPaletteCollapsed && (
          <span className="ml-2 text-sm font-semibold text-gray-700">
            Entities
          </span>
        )}
      </div>

      {isPaletteCollapsed ? (
        /* Collapsed mode: narrow icon strip with tooltips */
        <div className="flex flex-col items-center gap-1 py-2 overflow-y-auto">
          {CATEGORY_CONFIG.map((cat) => (
            <div
              key={cat.category}
              className="relative group p-2 rounded-md hover:bg-gray-100 cursor-default text-gray-500"
              title={cat.label}
            >
              {cat.icon}
              {/* Tooltip on hover */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block">
                <div className="bg-white border border-gray-200 shadow-md rounded-md px-3 py-1.5 text-sm text-gray-700 whitespace-nowrap">
                  {cat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Expanded mode: search + categories */
        <>
          <PaletteSearch value={paletteSearchQuery} onChange={setPaletteSearch} />
          <div className="flex-1 overflow-y-auto">
            {categoriesWithItems.map((cat) => (
              <PaletteCategory
                key={cat.category}
                label={cat.label}
                icon={cat.icon}
                items={cat.items}
                defaultOpen={false}
              />
            ))}
            {/* Show message when search has no results */}
            {debouncedQuery &&
              categoriesWithItems.every((cat) => cat.items.length === 0) && (
                <div className="px-4 py-8 text-sm text-gray-400 text-center">
                  No entities match &ldquo;{debouncedQuery}&rdquo;
                </div>
              )}
          </div>
        </>
      )}

      {/* Ghost previews for drag image (offscreen) */}
      <GhostPreviews />
    </aside>
  );
}
