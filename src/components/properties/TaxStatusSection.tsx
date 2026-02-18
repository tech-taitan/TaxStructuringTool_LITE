'use client';

/**
 * Tax Status section of the properties panel.
 *
 * Collapsible section rendering entity-type-specific tax status fields:
 * Base Rate Entity, Tax Rate, Tax Residency, MIT/AMIT elections.
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { TaxEntityData } from '@/models/graph';
import { getEntityConfig } from '@/lib/entity-registry';

interface TaxStatusSectionProps {
  formData: TaxEntityData;
  onChange: (updates: Partial<TaxEntityData>) => void;
  errors: Record<string, string>;
  entityType: string;
}

export default function TaxStatusSection({
  formData,
  onChange,
  errors,
  entityType,
}: TaxStatusSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const config = getEntityConfig(entityType);
  const category = config?.category ?? 'company';

  const taxStatus = formData.taxStatus ?? {};

  const updateTaxStatus = (field: string, value: string | boolean | number | undefined) => {
    onChange({
      taxStatus: {
        ...taxStatus,
        [field]: value,
      },
    });
  };

  /** Tax Residency field shared across all entity types */
  const renderTaxResidency = () => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        Tax Residency
      </label>
      <select
        value={taxStatus.taxResidency ?? ''}
        onChange={(e) => updateTaxStatus('taxResidency', e.target.value)}
        className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500 ${
          errors['taxStatus.taxResidency'] ? 'border-red-400' : 'border-gray-300'
        }`}
      >
        <option value="">Select...</option>
        <option value="AU">Australian Resident</option>
        <option value="Foreign">Foreign Resident</option>
      </select>
      {errors['taxStatus.taxResidency'] && (
        <p className="text-xs text-red-500 mt-1">{errors['taxStatus.taxResidency']}</p>
      )}
    </div>
  );

  const renderFields = () => {
    switch (category) {
      case 'company':
        return (
          <>
            {/* Base Rate Entity */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="baseRateEntity"
                checked={taxStatus.baseRateEntity ?? false}
                onChange={(e) => updateTaxStatus('baseRateEntity', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="baseRateEntity" className="text-sm text-gray-700">
                Base Rate Entity (25%)
              </label>
            </div>
            {/* Tax Rate */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={taxStatus.taxRate != null ? taxStatus.taxRate * 100 : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateTaxStatus('taxRate', val === '' ? undefined : parseFloat(val) / 100);
                }}
                className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors['taxStatus.taxRate'] ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors['taxStatus.taxRate'] && (
                <p className="text-xs text-red-500 mt-1">{errors['taxStatus.taxRate']}</p>
              )}
            </div>
            {renderTaxResidency()}
          </>
        );

      case 'trust':
        return (
          <>
            {/* MIT Election */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="mitElection"
                checked={taxStatus.mitElection ?? false}
                onChange={(e) => updateTaxStatus('mitElection', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="mitElection" className="text-sm text-gray-700">
                MIT Election
              </label>
            </div>
            {/* AMIT Election */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="amitElection"
                checked={taxStatus.amitElection ?? false}
                onChange={(e) => updateTaxStatus('amitElection', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="amitElection" className="text-sm text-gray-700">
                AMIT Election
              </label>
            </div>
            {renderTaxResidency()}
          </>
        );

      case 'partnership':
        return <>{renderTaxResidency()}</>;

      case 'vc':
        return <>{renderTaxResidency()}</>;

      case 'individual':
        return (
          <>
            {renderTaxResidency()}
            {/* Tax Rate */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={taxStatus.taxRate != null ? taxStatus.taxRate * 100 : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateTaxStatus('taxRate', val === '' ? undefined : parseFloat(val) / 100);
                }}
                className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors['taxStatus.taxRate'] ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors['taxStatus.taxRate'] && (
                <p className="text-xs text-red-500 mt-1">{errors['taxStatus.taxRate']}</p>
              )}
            </div>
          </>
        );

      case 'smsf':
        return <>{renderTaxResidency()}</>;

      default:
        return null;
    }
  };

  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        className="flex items-center justify-between w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        Tax Status
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {renderFields()}
        </div>
      )}
    </div>
  );
}
