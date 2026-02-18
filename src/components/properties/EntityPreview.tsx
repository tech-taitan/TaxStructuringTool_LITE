'use client';

/**
 * Mini visual preview of an entity node at the top of the properties panel.
 *
 * Renders a scaled-down version of the entity's canvas appearance
 * (shape, color, name) without handles or interactive elements.
 */

import type { EntityShape } from '@/models/entities';

interface EntityPreviewProps {
  entityType: string;
  name: string;
  color: string;
  shape: EntityShape;
}

export default function EntityPreview({ name, color, shape }: EntityPreviewProps) {
  // Background: white with subtle tint from entity color at 10% opacity
  const bgColor = `${color}1A`;

  return (
    <div className="w-[80px] h-[60px] overflow-hidden mb-4 mx-auto">
      <div
        className="origin-top-left"
        style={{
          width: 160,
          height: 120,
          transform: 'scale(0.5)',
        }}
      >
        <div
          className={`entity-node entity-node--${shape}`}
          style={{
            borderColor: color,
            borderWidth: 1,
            background: `linear-gradient(135deg, white 60%, ${bgColor} 100%)`,
            cursor: 'default',
            minWidth: 140,
            minHeight: 70,
          }}
        >
          <div className="flex items-center gap-1.5">
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm truncate text-gray-900">
                {name}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
