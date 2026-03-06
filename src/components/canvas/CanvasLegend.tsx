'use client';

/**
 * Auto-populated canvas legend showing entity types and relationship types
 * currently present on the canvas. Positioned bottom-left as a floating card.
 *
 * - Entity section: shows category color swatch + shape label for each unique category
 * - Relationship section: shows colored line + label for each unique relationship type
 * - Auto-filters to only show types that exist on the canvas
 * - Interactive: click entity category to select all of that type
 */

import { useMemo } from 'react';
import { useGraphStore } from '@/stores/graph-store';
import { useUIStore } from '@/stores/ui-store';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
import { COLORS } from '@/lib/constants';
import { getEntityConfig } from '@/lib/entity-registry';
import type { EntityCategory } from '@/models/entities';
import type { RelationshipType } from '@/models/relationships';

/** Entity category display configuration */
const CATEGORY_CONFIG: Record<EntityCategory, { label: string; shape: string }> = {
  company: { label: 'Company', shape: 'Rectangle' },
  trust: { label: 'Trust', shape: 'Triangle' },
  partnership: { label: 'Partnership', shape: 'Triangle' },
  fund: { label: 'Fund', shape: 'Triangle' },
  holding: { label: 'Holding Vehicle', shape: 'Rectangle' },
  vc: { label: 'Venture Capital', shape: 'Triangle' },
  individual: { label: 'Individual', shape: 'Oval' },
  smsf: { label: 'SMSF', shape: 'Triangle' },
  pension: { label: 'Pension Scheme', shape: 'Shield' },
};

/** Entity category colors (from COLORS.entity) */
const CATEGORY_COLORS: Record<EntityCategory, string> = {
  company: COLORS.entity.company,
  trust: COLORS.entity.trust,
  partnership: COLORS.entity.partnership,
  fund: COLORS.entity.fund,
  holding: COLORS.entity.holding,
  vc: COLORS.entity.vc,
  individual: COLORS.entity.individual,
  smsf: COLORS.entity.smsf,
  pension: COLORS.entity.pension,
};

/** Relationship type display labels */
const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  equity: 'Equity / Ownership',
  debt: 'Debt / Loan',
  trustee: 'Trustee',
  beneficiary: 'Beneficiary',
  partnership: 'Partnership Interest',
  management: 'Management',
  services: 'Services',
  licensing: 'Licensing',
};

/** Edge color mapping (mirrors RelationshipEdge.tsx) */
const EDGE_COLORS: Record<RelationshipType, string> = {
  equity: '#2563EB',
  debt: '#DC2626',
  trustee: '#7C3AED',
  beneficiary: '#7C3AED',
  partnership: '#059669',
  management: '#6B7280',
  services: '#6B7280',
  licensing: '#6B7280',
};

/** Relationship types that use dashed lines */
const DASHED_TYPES = new Set<RelationshipType>(['debt', 'management', 'services', 'licensing']);

/** Mini shape icon for the legend */
function ShapeIcon({ category }: { category: EntityCategory }) {
  const color = CATEGORY_COLORS[category];
  const bg = COLORS.entityBg[category];

  switch (category) {
    case 'company':
      return (
        <svg width="16" height="12" viewBox="0 0 16 12">
          <rect x="1" y="1" width="14" height="10" rx="1" fill={bg} stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'trust':
    case 'partnership':
    case 'fund':
    case 'vc':
    case 'smsf':
      return (
        <svg width="16" height="14" viewBox="0 0 16 14">
          <polygon points="8,1 1,13 15,13" fill={bg} stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'holding':
      return (
        <svg width="16" height="12" viewBox="0 0 16 12">
          <rect x="1" y="1" width="14" height="10" rx="1" fill={bg} stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'pension':
      return (
        <svg width="16" height="14" viewBox="0 0 16 14">
          <path d="M8,1 L14,5 L14,13 L2,13 L2,5 Z" fill={bg} stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'individual':
      return (
        <svg width="16" height="12" viewBox="0 0 16 12">
          <ellipse cx="8" cy="6" rx="7" ry="5" fill={bg} stroke={color} strokeWidth="1.5" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="12" viewBox="0 0 16 12">
          <rect x="1" y="1" width="14" height="10" rx="1" fill={bg} stroke={color} strokeWidth="1.5" />
        </svg>
      );
  }
}

export default function CanvasLegend() {
  const { isMobile } = useDeviceCapabilities();
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const showLegend = useUIStore((s) => s.showLegend);

  // Compute unique entity categories present on canvas
  const activeCategories = useMemo(() => {
    const categories = new Set<EntityCategory>();
    for (const node of nodes) {
      const config = getEntityConfig(node.data.entityType);
      if (config) categories.add(config.category);
    }
    // Return in a stable order
    const ordered: EntityCategory[] = ['company', 'trust', 'partnership', 'fund', 'holding', 'vc', 'individual', 'smsf', 'pension'];
    return ordered.filter((c) => categories.has(c));
  }, [nodes]);

  // Compute unique relationship types present on canvas
  const activeRelationships = useMemo(() => {
    const types = new Set<RelationshipType>();
    for (const edge of edges) {
      if (edge.data?.relationshipType) {
        types.add(edge.data.relationshipType as RelationshipType);
      }
    }
    const ordered: RelationshipType[] = [
      'equity', 'debt', 'trustee', 'beneficiary',
      'partnership', 'management', 'services', 'licensing',
    ];
    return ordered.filter((t) => types.has(t));
  }, [edges]);

  // Check if any cross-border edges exist on the canvas
  const hasCrossBorderEdges = useMemo(() => {
    for (const edge of edges) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (
        sourceNode &&
        targetNode &&
        sourceNode.data.jurisdiction !== targetNode.data.jurisdiction
      ) {
        return true;
      }
    }
    return false;
  }, [nodes, edges]);

  // Check if any non-default status is used
  const hasStatusVariants = useMemo(() => {
    return nodes.some((n) => n.data.status === 'proposed' || n.data.status === 'removed');
  }, [nodes]);

  if (!showLegend || (activeCategories.length === 0 && activeRelationships.length === 0)) {
    return null;
  }

  return (
    <div className={`absolute bottom-4 left-4 z-10 rounded-lg shadow-lg border border-gray-200 p-3 min-w-[180px] max-w-[240px] ${isMobile ? 'bg-white dark:bg-gray-800' : 'bg-white/90 backdrop-blur-sm'}`}>
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Legend
      </div>

      {/* Entity categories */}
      {activeCategories.length > 0 && (
        <div className="mb-2">
          <div className="text-[10px] font-medium text-gray-400 uppercase mb-1">Entities</div>
          <div className="space-y-1">
            {activeCategories.map((category) => (
              <div key={category} className="flex items-center gap-2">
                <ShapeIcon category={category} />
                <span className="text-xs text-gray-700">
                  {CATEGORY_CONFIG[category].label}
                </span>
                <span className="text-[10px] text-gray-400 ml-auto">
                  {CATEGORY_CONFIG[category].shape}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relationship types */}
      {activeRelationships.length > 0 && (
        <div>
          {activeCategories.length > 0 && (
            <div className="border-t border-gray-100 my-2" />
          )}
          <div className="text-[10px] font-medium text-gray-400 uppercase mb-1">Relationships</div>
          <div className="space-y-1">
            {activeRelationships.map((type) => (
              <div key={type} className="flex items-center gap-2">
                <svg width="20" height="8" viewBox="0 0 20 8">
                  <line
                    x1="0" y1="4" x2="20" y2="4"
                    stroke={EDGE_COLORS[type]}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={DASHED_TYPES.has(type) ? '4 2' : undefined}
                  />
                </svg>
                <span className="text-xs text-gray-700">
                  {RELATIONSHIP_LABELS[type]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cross-border indicator */}
      {hasCrossBorderEdges && (
        <div>
          <div className="border-t border-gray-100 my-2" />
          <div className="text-[10px] font-medium text-gray-400 uppercase mb-1">Cross-Border</div>
          <div className="flex items-center gap-2">
            <svg width="20" height="8" viewBox="0 0 20 8">
              <line x1="0" y1="4" x2="20" y2="4"
                stroke="#F59E0B" strokeWidth="6" opacity="0.3" strokeLinecap="round" />
              <line x1="0" y1="4" x2="20" y2="4"
                stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-xs text-gray-700">Cross-Border Connection</span>
          </div>
        </div>
      )}

      {/* Status indicators */}
      {hasStatusVariants && (
        <div>
          <div className="border-t border-gray-100 my-2" />
          <div className="text-[10px] font-medium text-gray-400 uppercase mb-1">Status</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <svg width="16" height="12" viewBox="0 0 16 12">
                <rect x="1" y="1" width="14" height="10" rx="1" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeDasharray="3 2" />
              </svg>
              <span className="text-xs text-gray-700">Proposed</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="12" viewBox="0 0 16 12">
                <rect x="1" y="1" width="14" height="10" rx="1" fill="none" stroke="#6B7280" strokeWidth="1.5" opacity="0.4" />
              </svg>
              <span className="text-xs text-gray-700">To Be Removed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
