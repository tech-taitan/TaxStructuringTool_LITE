'use client';

/**
 * Identity section of the properties panel.
 *
 * Collapsible section containing Name, Type (dropdown), and Jurisdiction fields.
 * Type dropdown shows only entities in the same category, disabled for
 * single-type categories (individual, SMSF).
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { TaxEntityData } from '@/models/graph';
import type { EntityShape } from '@/models/entities';
import { getEntityConfig, getEntitiesByCategory } from '@/lib/entity-registry';
import { JURISDICTIONS, type Jurisdiction } from '@/models/jurisdiction';

/** All available shapes with display labels */
const SHAPE_OPTIONS: { value: EntityShape; label: string }[] = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'oval', label: 'Oval' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'hexagon', label: 'Hexagon' },
  { value: 'person', label: 'Person' },
  { value: 'shield', label: 'Shield' },
];

interface IdentitySectionProps {
  formData: TaxEntityData;
  onChange: (updates: Partial<TaxEntityData>) => void;
  errors: Record<string, string>;
  nameInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function IdentitySection({
  formData,
  onChange,
  errors,
  nameInputRef,
}: IdentitySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const currentConfig = getEntityConfig(formData.entityType);
  const category = currentConfig?.category ?? 'company';

  // Get all entity types in the same category for the type dropdown
  const categoryTypes = getEntitiesByCategory(formData.jurisdiction, category);
  const isSingleType = categoryTypes.length <= 1;

  const handleTypeChange = (newTypeId: string) => {
    const newConfig = getEntityConfig(newTypeId);
    if (!newConfig) return;

    const updates: Partial<TaxEntityData> = {
      entityType: newTypeId,
    };

    // If the user hasn't customized the name (still "New ..."), update it
    if (formData.name.startsWith('New ')) {
      updates.name = `New ${newConfig.shortName}`;
    }

    onChange(updates);
  };

  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        className="flex items-center justify-between w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        Identity
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Name field */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Name
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={formData.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.name ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Type dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Type
            </label>
            <select
              value={formData.entityType}
              onChange={(e) => handleTypeChange(e.target.value)}
              disabled={isSingleType}
              className={`w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 ${
                isSingleType ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
              }`}
            >
              {categoryTypes.map((cfg) => (
                <option key={cfg.id} value={cfg.id}>
                  {cfg.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Shape dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Shape
            </label>
            <select
              value={formData.shapeOverride ?? currentConfig?.shape ?? 'rectangle'}
              onChange={(e) => {
                const newShape = e.target.value as EntityShape;
                // Clear override if it matches the default
                if (newShape === currentConfig?.shape) {
                  onChange({ shapeOverride: undefined });
                } else {
                  onChange({ shapeOverride: newShape });
                }
              }}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500"
            >
              {SHAPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}{opt.value === currentConfig?.shape ? ' (default)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Status
            </label>
            <select
              value={formData.status ?? 'existing'}
              onChange={(e) => {
                const newStatus = e.target.value as 'existing' | 'proposed' | 'removed';
                onChange({ status: newStatus === 'existing' ? undefined : newStatus });
              }}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="existing">Existing</option>
              <option value="proposed">Proposed</option>
              <option value="removed">To Be Removed</option>
            </select>
          </div>

          {/* Jurisdiction (read-only) */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Jurisdiction
            </label>
            <div className="px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-600">
              {JURISDICTIONS[formData.jurisdiction as Jurisdiction]?.name ?? formData.jurisdiction}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
