'use client';

/**
 * Draggable entity type item in the palette sidebar.
 *
 * Uses HTML5 Drag and Drop API to initiate drag. Sets the entity type ID
 * as 'application/reactflow' data transfer, and uses a pre-rendered ghost
 * element (by ID) for the drag image.
 */

import type { EntityTypeConfig } from '@/models/entities';
import {
  Building2,
  Shield,
  ShieldCheck,
  ShieldHalf,
  Landmark,
  Handshake,
  FileSignature,
  TrendingUp,
  Rocket,
  User,
  type LucideIcon,
} from 'lucide-react';

/** Map icon name strings from entity registry to lucide components */
const PALETTE_ICONS: Record<string, LucideIcon> = {
  'building-2': Building2,
  'shield': Shield,
  'shield-check': ShieldCheck,
  'shield-half': ShieldHalf,
  'landmark': Landmark,
  'handshake': Handshake,
  'file-signature': FileSignature,
  'trending-up': TrendingUp,
  'rocket': Rocket,
  'user': User,
};

interface PaletteItemProps {
  config: EntityTypeConfig;
}

export default function PaletteItem({ config }: PaletteItemProps) {
  const IconComponent = PALETTE_ICONS[config.icon];

  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', config.id);
    event.dataTransfer.effectAllowed = 'move';
    const ghost = document.getElementById(`ghost-${config.id}`);
    if (ghost) {
      event.dataTransfer.setDragImage(ghost, 60, 35);
    }
  };

  return (
    <div
      draggable={true}
      onDragStart={onDragStart}
      title={config.description}
      className="palette-item group relative flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
    >
      <div
        className="flex-shrink-0 w-1 h-6 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {IconComponent && (
        <IconComponent className="w-4 h-4 flex-shrink-0 text-gray-600" />
      )}
      <span className="text-sm text-gray-700 truncate">{config.displayName}</span>
      {/* Hover tooltip with description */}
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block pointer-events-none">
        <div className="bg-gray-900 text-white text-xs rounded-md px-3 py-2 shadow-lg whitespace-normal max-w-56 leading-relaxed">
          {config.description}
        </div>
      </div>
    </div>
  );
}
