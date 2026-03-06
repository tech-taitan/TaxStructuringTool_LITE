'use client';

/**
 * Mobile entity palette rendered inside a BottomSheet.
 *
 * Shows all entity types organized by category in a flat scrollable list.
 * Tapping an entity type places it at the viewport center (grid-snapped,
 * overlap-avoided) and closes the sheet with a scale-in animation on the
 * new entity.
 */

import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { nanoid } from 'nanoid';
import { BottomSheet } from '@/components/mobile/BottomSheet';
import { useUIStore } from '@/stores/ui-store';
import { useGraphStore } from '@/stores/graph-store';
import { CATEGORY_CONFIG, getEntitiesByCategory, getEntityConfig } from '@/lib/entity-registry';
import { JURISDICTIONS, type Jurisdiction } from '@/models/jurisdiction';
import { PALETTE_ICONS } from '@/lib/palette-icons';
import { JurisdictionTabBar } from '@/components/palette/JurisdictionTabBar';
import { resolveOverlap } from '@/lib/utils/overlap';
import { GRID_SIZE, NODE_WIDTH, NODE_HEIGHT, CANVAS_BOUNDS } from '@/lib/constants';
import type { TaxNode } from '@/models/graph';

export function MobilePalette() {
  const isOpen = useUIStore((s) => s.isMobilePaletteOpen);
  const setOpen = useUIStore((s) => s.setMobilePaletteOpen);
  const setLastPlacedNodeId = useUIStore((s) => s.setLastPlacedNodeId);
  const setSelectedNode = useUIStore((s) => s.setSelectedNode);
  const selectedPaletteJurisdiction = useUIStore((s) => s.selectedPaletteJurisdiction);
  const setSelectedPaletteJurisdiction = useUIStore((s) => s.setSelectedPaletteJurisdiction);
  const addNode = useGraphStore((s) => s.addNode);
  const { screenToFlowPosition, getNodes } = useReactFlow();

  const handleSelect = useCallback(
    (entityTypeId: string) => {
      const config = getEntityConfig(entityTypeId);
      if (!config) return;

      // 1. Compute viewport center in flow coordinates
      const screenCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      const flowPos = screenToFlowPosition(screenCenter);

      // 2. Snap to grid
      const snapped = {
        x: Math.round(flowPos.x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(flowPos.y / GRID_SIZE) * GRID_SIZE,
      };

      // 3. Clamp within canvas bounds
      const clamped = {
        x: Math.max(CANVAS_BOUNDS[0][0], Math.min(CANVAS_BOUNDS[1][0] - NODE_WIDTH, snapped.x)),
        y: Math.max(CANVAS_BOUNDS[0][1], Math.min(CANVAS_BOUNDS[1][1] - NODE_HEIGHT, snapped.y)),
      };

      // 4. Build node (same structure as Canvas.tsx onDrop)
      const newNode: TaxNode = {
        id: nanoid(),
        type: 'entity',
        position: clamped,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        data: {
          entityType: entityTypeId,
          name: `New ${config.shortName}`,
          jurisdiction: config.jurisdiction,
          jurisdictionFlag: JURISDICTIONS[config.jurisdiction as Jurisdiction]?.flag ?? '',
          registration: {},
          taxStatus: {},
          notes: '',
        },
      };

      // 5. Resolve overlap with 20px gap
      const adjusted = resolveOverlap(newNode, getNodes() as TaxNode[]);

      // 6. Add to store (undo-tracked)
      addNode(adjusted);
      setSelectedNode(adjusted.id);

      // 7. Trigger scale-in animation
      setLastPlacedNodeId(adjusted.id);
      setTimeout(() => setLastPlacedNodeId(null), 200); // fallback clear

      // 8. Close palette sheet
      setOpen(false);
    },
    [screenToFlowPosition, getNodes, addNode, setSelectedNode, setLastPlacedNodeId, setOpen],
  );

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      initialSnap="half"
      snapPoints={['collapsed', 'half', 'full']}
    >
      <div className="px-4 pb-2">
        <h2 className="text-base font-semibold text-gray-800">Add Entity</h2>
      </div>
      <JurisdictionTabBar
        selected={selectedPaletteJurisdiction}
        onSelect={setSelectedPaletteJurisdiction}
      />
      <div className="safe-area-bottom">
        {CATEGORY_CONFIG.map((cat) => {
          const items = getEntitiesByCategory(selectedPaletteJurisdiction, cat.category);
          if (items.length === 0) return null;
          const CatIcon = PALETTE_ICONS[cat.iconName];
          return (
            <div key={cat.category}>
              {/* Category header */}
              <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {CatIcon && <CatIcon className="w-3.5 h-3.5" />}
                {cat.label}
              </div>
              {/* Entity rows */}
              {items.map((item) => {
                const Icon = PALETTE_ICONS[item.icon];
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className="flex items-center gap-3 w-full px-4 py-3 active:bg-gray-100 transition-colors text-left"
                  >
                    <div
                      className="flex-shrink-0 w-1 h-8 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {Icon && <Icon className="w-5 h-5 flex-shrink-0 text-gray-600" />}
                    <span className="text-sm text-gray-700">{item.displayName}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
}
