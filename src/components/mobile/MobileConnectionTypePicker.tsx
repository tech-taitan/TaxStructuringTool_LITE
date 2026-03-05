/**
 * Connection type picker as bottom sheet for mobile.
 *
 * Renders all 8 relationship types as full-width tappable rows in a
 * half-height bottom sheet. Each row shows a colored left border,
 * icon, name, and description with 48px minimum height for comfortable
 * touch targets.
 *
 * Parent controls mounting -- always renders as open when present.
 */

import { BottomSheet } from '@/components/mobile/BottomSheet';
import { RELATIONSHIP_TYPES } from '@/lib/relationship-type-config';
import type { RelationshipType } from '@/models/relationships';

interface MobileConnectionTypePickerProps {
  onSelect: (type: RelationshipType) => void;
  onCancel: () => void;
}

export function MobileConnectionTypePicker({
  onSelect,
  onCancel,
}: MobileConnectionTypePickerProps) {
  return (
    <BottomSheet isOpen={true} onClose={onCancel} initialSnap="half">
      <div className="px-4 pb-2">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Select Connection Type
        </h2>

        <div className="flex flex-col">
          {RELATIONSHIP_TYPES.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                onClick={() => onSelect(item.type)}
                className={`flex items-center gap-3 px-3 py-3 text-left active:bg-gray-50 dark:active:bg-gray-800 transition-colors ${
                  index < RELATIONSHIP_TYPES.length - 1
                    ? 'border-b border-gray-100 dark:border-gray-700'
                    : ''
                }`}
                style={{
                  borderLeftWidth: '3px',
                  borderLeftColor: item.color,
                  minHeight: '48px',
                }}
              >
                <Icon
                  className="w-5 h-5 flex-shrink-0 text-gray-400"
                  strokeWidth={1.5}
                />
                <div className="min-w-0">
                  <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.name}
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 leading-tight">
                    {item.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
