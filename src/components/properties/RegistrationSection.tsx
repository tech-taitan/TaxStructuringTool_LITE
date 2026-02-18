'use client';

/**
 * Registration section of the properties panel.
 *
 * Collapsible section rendering entity-type-specific registration fields:
 * ABN, ACN (company), Trust Deed Date (trust/SMSF), Partnership Agreement
 * Date, TFN (individual), Innovation Australia / APRA registration (VC/SMSF).
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { TaxEntityData } from '@/models/graph';
import { getEntityConfig } from '@/lib/entity-registry';

interface RegistrationSectionProps {
  formData: TaxEntityData;
  onChange: (updates: Partial<TaxEntityData>) => void;
  errors: Record<string, string>;
  entityType: string;
}

export default function RegistrationSection({
  formData,
  onChange,
  errors,
  entityType,
}: RegistrationSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const config = getEntityConfig(entityType);
  const category = config?.category ?? 'company';

  const registration = formData.registration ?? {};

  const updateRegistration = (field: string, value: string | boolean) => {
    onChange({
      registration: {
        ...registration,
        [field]: value,
      },
    });
  };

  const renderFields = () => {
    switch (category) {
      case 'company':
        return (
          <>
            {/* ABN */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                ABN
              </label>
              <input
                type="text"
                maxLength={11}
                value={registration.abn ?? ''}
                onChange={(e) => updateRegistration('abn', e.target.value)}
                className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors['registration.abn'] ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors['registration.abn'] && (
                <p className="text-xs text-red-500 mt-1">{errors['registration.abn']}</p>
              )}
            </div>
            {/* ACN */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                ACN
              </label>
              <input
                type="text"
                maxLength={9}
                value={registration.acn ?? ''}
                onChange={(e) => updateRegistration('acn', e.target.value)}
                className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors['registration.acn'] ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors['registration.acn'] && (
                <p className="text-xs text-red-500 mt-1">{errors['registration.acn']}</p>
              )}
            </div>
          </>
        );

      case 'trust':
        return (
          <>
            {/* ABN */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                ABN
              </label>
              <input
                type="text"
                maxLength={11}
                value={registration.abn ?? ''}
                onChange={(e) => updateRegistration('abn', e.target.value)}
                className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors['registration.abn'] ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors['registration.abn'] && (
                <p className="text-xs text-red-500 mt-1">{errors['registration.abn']}</p>
              )}
            </div>
            {/* Trust Deed Date */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Trust Deed Date
              </label>
              <input
                type="date"
                value={registration.trustDeedDate ?? ''}
                onChange={(e) => updateRegistration('trustDeedDate', e.target.value)}
                className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors['registration.trustDeedDate'] ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors['registration.trustDeedDate'] && (
                <p className="text-xs text-red-500 mt-1">{errors['registration.trustDeedDate']}</p>
              )}
            </div>
          </>
        );

      case 'partnership':
        return (
          <>
            {/* ABN */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                ABN
              </label>
              <input
                type="text"
                maxLength={11}
                value={registration.abn ?? ''}
                onChange={(e) => updateRegistration('abn', e.target.value)}
                className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors['registration.abn'] ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors['registration.abn'] && (
                <p className="text-xs text-red-500 mt-1">{errors['registration.abn']}</p>
              )}
            </div>
            {/* Partnership Agreement Date */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Partnership Agreement Date
              </label>
              <input
                type="date"
                value={registration.partnershipAgreementDate ?? ''}
                onChange={(e) => updateRegistration('partnershipAgreementDate', e.target.value)}
                className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors['registration.partnershipAgreementDate'] ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors['registration.partnershipAgreementDate'] && (
                <p className="text-xs text-red-500 mt-1">{errors['registration.partnershipAgreementDate']}</p>
              )}
            </div>
          </>
        );

      case 'vc':
        return (
          <>
            {/* ABN */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                ABN
              </label>
              <input
                type="text"
                maxLength={11}
                value={registration.abn ?? ''}
                onChange={(e) => updateRegistration('abn', e.target.value)}
                className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors['registration.abn'] ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors['registration.abn'] && (
                <p className="text-xs text-red-500 mt-1">{errors['registration.abn']}</p>
              )}
            </div>
            {/* Registered with Innovation Australia */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="registeredWithInnovationAustralia"
                checked={registration.registeredWithInnovationAustralia ?? false}
                onChange={(e) => updateRegistration('registeredWithInnovationAustralia', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="registeredWithInnovationAustralia" className="text-sm text-gray-700">
                Registered with Innovation Australia
              </label>
            </div>
          </>
        );

      case 'individual':
        return (
          <>
            {/* TFN */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                TFN
              </label>
              <input
                type="text"
                value={registration.tfn ?? ''}
                onChange={(e) => updateRegistration('tfn', e.target.value)}
                className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors['registration.tfn'] ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors['registration.tfn'] && (
                <p className="text-xs text-red-500 mt-1">{errors['registration.tfn']}</p>
              )}
            </div>
          </>
        );

      case 'smsf':
        return (
          <>
            {/* ABN */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                ABN
              </label>
              <input
                type="text"
                maxLength={11}
                value={registration.abn ?? ''}
                onChange={(e) => updateRegistration('abn', e.target.value)}
                className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors['registration.abn'] ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors['registration.abn'] && (
                <p className="text-xs text-red-500 mt-1">{errors['registration.abn']}</p>
              )}
            </div>
            {/* Trust Deed Date */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Trust Deed Date
              </label>
              <input
                type="date"
                value={registration.trustDeedDate ?? ''}
                onChange={(e) => updateRegistration('trustDeedDate', e.target.value)}
                className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors['registration.trustDeedDate'] ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors['registration.trustDeedDate'] && (
                <p className="text-xs text-red-500 mt-1">{errors['registration.trustDeedDate']}</p>
              )}
            </div>
            {/* Registered with APRA */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="registeredWithAPRA"
                checked={registration.registeredWithAPRA ?? false}
                onChange={(e) => updateRegistration('registeredWithAPRA', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="registeredWithAPRA" className="text-sm text-gray-700">
                Registered with APRA
              </label>
            </div>
          </>
        );

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
        Registration
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
