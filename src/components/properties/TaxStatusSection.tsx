'use client';

/**
 * Tax Status section of the properties panel.
 *
 * Collapsible section rendering jurisdiction-specific tax status fields.
 * Dispatches on jurisdiction first, then on category/entityType within
 * each jurisdiction.
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

/** Reusable checkbox for tax status inputs */
function TaxCheckbox({ label, field, checked, onChange, readOnly }: {
  label: string; field: string; checked: boolean;
  onChange: (field: string, value: boolean) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <input type="checkbox" id={`tax-${field}`} checked={checked}
        onChange={(e) => { if (!readOnly) onChange(field, e.target.checked); }}
        readOnly={readOnly}
        className={`w-4 h-4 rounded border-gray-300 ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`} />
      <label htmlFor={`tax-${field}`} className="text-sm text-gray-700">{label}</label>
    </div>
  );
}

/** Reusable number field for tax rate inputs (displays %, stores decimal) */
function TaxNumberField({ label, field, value, onChange, error }: {
  label: string; field: string; value: number | undefined;
  onChange: (field: string, value: number | undefined) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label} (%)</label>
      <input
        type="number"
        min={0}
        max={100}
        step={0.5}
        value={value != null ? value * 100 : ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange(field, val === '' ? undefined : parseFloat(val) / 100);
        }}
        className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500 ${
          error ? 'border-red-400' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

/** Reusable select field for tax status dropdowns */
function TaxSelectField({ label, field, value, options, onChange, error }: {
  label: string; field: string; value: string;
  options: { value: string; label: string }[];
  onChange: (field: string, value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500 ${
          error ? 'border-red-400' : 'border-gray-300'
        }`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

/** Tax residency options per jurisdiction */
const RESIDENCY_OPTIONS: Record<string, { value: string; label: string }[]> = {
  AU: [
    { value: '', label: 'Select...' },
    { value: 'AU', label: 'Australian Resident' },
    { value: 'Foreign', label: 'Foreign Resident' },
  ],
  UK: [
    { value: '', label: 'Select...' },
    { value: 'UK', label: 'UK Resident' },
    { value: 'Non-Resident', label: 'Non-Resident' },
  ],
  US: [
    { value: '', label: 'Select...' },
    { value: 'US', label: 'US Resident' },
    { value: 'Non-Resident', label: 'Non-Resident Alien' },
  ],
  HK: [
    { value: '', label: 'Select...' },
    { value: 'HK', label: 'HK Resident' },
    { value: 'Non-Resident', label: 'Non-Resident' },
  ],
  SG: [
    { value: '', label: 'Select...' },
    { value: 'SG', label: 'SG Resident' },
    { value: 'Non-Resident', label: 'Non-Resident' },
  ],
  LU: [
    { value: '', label: 'Select...' },
    { value: 'LU', label: 'LU Resident' },
    { value: 'Non-Resident', label: 'Non-Resident' },
  ],
};

export default function TaxStatusSection({
  formData,
  onChange,
  errors,
  entityType,
}: TaxStatusSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const config = getEntityConfig(entityType);
  const category = config?.category ?? 'company';
  const jurisdiction = config?.jurisdiction ?? 'AU';

  const taxStatus = formData.taxStatus ?? {};

  const updateTaxStatus = (field: string, value: string | boolean | number | undefined) => {
    onChange({
      taxStatus: {
        ...taxStatus,
        [field]: value,
      },
    });
  };

  /** Tax Residency field with jurisdiction-appropriate options */
  const renderTaxResidency = () => {
    const options = RESIDENCY_OPTIONS[jurisdiction] ?? RESIDENCY_OPTIONS.AU;
    return (
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
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {errors['taxStatus.taxResidency'] && (
          <p className="text-xs text-red-500 mt-1">{errors['taxStatus.taxResidency']}</p>
        )}
      </div>
    );
  };

  // ─── AU fields ─────────────────────────────────────────────────────

  const renderAuFields = () => {
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

  // ─── UK fields ─────────────────────────────────────────────────────

  const renderUkFields = () => {
    switch (category) {
      case 'company':
        return (
          <>
            <TaxNumberField label="Corporation Tax Rate" field="corporationTaxRate"
              value={taxStatus.corporationTaxRate} onChange={updateTaxStatus}
              error={errors['taxStatus.corporationTaxRate']} />
            <TaxCheckbox label="Small Profits Rate" field="smallProfitsRate"
              checked={taxStatus.smallProfitsRate ?? false} onChange={updateTaxStatus} />
            {renderTaxResidency()}
          </>
        );
      case 'partnership':
        return <>{renderTaxResidency()}</>;
      case 'trust':
        return (
          <>
            <p className="text-xs text-gray-500 italic">Trust rate: 45% (standard/dividend)</p>
            {renderTaxResidency()}
          </>
        );
      case 'individual':
        return (
          <>
            <TaxCheckbox label="IHT Relevant" field="ihtRelevant"
              checked={taxStatus.ihtRelevant ?? false} onChange={updateTaxStatus} />
            {renderTaxResidency()}
          </>
        );
      case 'pension':
        return <>{renderTaxResidency()}</>;
      default:
        return null;
    }
  };

  // ─── US fields ─────────────────────────────────────────────────────

  const renderUsFields = () => {
    switch (category) {
      case 'company':
        // us-501c3 is tax-exempt -- only residency
        if (entityType === 'us-501c3') {
          return <>{renderTaxResidency()}</>;
        }
        // us-llc-disregarded: show Check-the-Box Election
        if (entityType === 'us-llc-disregarded') {
          return (
            <>
              <TaxSelectField label="Check-the-Box Election" field="checkTheBoxElection"
                value={taxStatus.checkTheBoxElection ?? ''}
                options={[
                  { value: '', label: 'Select...' },
                  { value: 'Disregarded Entity', label: 'Disregarded Entity' },
                  { value: 'Partnership', label: 'Partnership' },
                  { value: 'Corporation', label: 'Corporation' },
                ]}
                onChange={updateTaxStatus}
                error={errors['taxStatus.checkTheBoxElection']} />
              {renderTaxResidency()}
            </>
          );
        }
        return (
          <>
            {entityType === 'us-s-corp' && (
              <TaxCheckbox label="S Corp Election" field="sCorpElection"
                checked={taxStatus.sCorpElection ?? false} onChange={updateTaxStatus} />
            )}
            <TaxNumberField label="Federal Tax Rate" field="federalTaxRate"
              value={taxStatus.federalTaxRate} onChange={updateTaxStatus}
              error={errors['taxStatus.federalTaxRate']} />
            {renderTaxResidency()}
          </>
        );
      case 'partnership':
        // us-llc-partnership: show Check-the-Box Election
        if (entityType === 'us-llc-partnership') {
          return (
            <>
              <TaxSelectField label="Check-the-Box Election" field="checkTheBoxElection"
                value={taxStatus.checkTheBoxElection ?? ''}
                options={[
                  { value: '', label: 'Select...' },
                  { value: 'Disregarded Entity', label: 'Disregarded Entity' },
                  { value: 'Partnership', label: 'Partnership' },
                  { value: 'Corporation', label: 'Corporation' },
                ]}
                onChange={updateTaxStatus}
                error={errors['taxStatus.checkTheBoxElection']} />
              {renderTaxResidency()}
            </>
          );
        }
        // us-gp, us-lp, us-lllp: Tax Residency only
        return <>{renderTaxResidency()}</>;
      case 'trust':
        return <>{renderTaxResidency()}</>;
      case 'individual':
        return <>{renderTaxResidency()}</>;
      default:
        return null;
    }
  };

  // ─── HK fields ─────────────────────────────────────────────────────

  const renderHkFields = () => {
    switch (category) {
      case 'company':
        return (
          <>
            <TaxCheckbox label="Two-Tier Profits Tax" field="twoTierProfitsTax"
              checked={taxStatus.twoTierProfitsTax ?? false} onChange={updateTaxStatus} />
            <p className="text-xs text-gray-500 italic">Territorial source principle applies</p>
            {renderTaxResidency()}
          </>
        );
      case 'partnership':
        return (
          <>
            <p className="text-xs text-gray-500 italic">Territorial source principle applies</p>
            {renderTaxResidency()}
          </>
        );
      case 'fund':
        return (
          <>
            <p className="text-xs text-gray-500 italic">Territorial source principle applies</p>
            {renderTaxResidency()}
          </>
        );
      case 'individual':
        return <>{renderTaxResidency()}</>;
      default:
        return null;
    }
  };

  // ─── SG fields ─────────────────────────────────────────────────────

  const renderSgFields = () => {
    const section13Options = [
      { value: '', label: 'Select...' },
      { value: 'Section 13O', label: 'Section 13O' },
      { value: 'Section 13U', label: 'Section 13U' },
    ];
    switch (category) {
      case 'company':
        return (
          <>
            <TaxCheckbox label="Partial Tax Exemption" field="partialTaxExemption"
              checked={taxStatus.partialTaxExemption ?? false} onChange={updateTaxStatus} />
            {renderTaxResidency()}
          </>
        );
      case 'fund':
        return (
          <>
            <TaxSelectField label="Section 13O/13U Election" field="section13Election"
              value={taxStatus.section13Election ?? ''} options={section13Options}
              onChange={updateTaxStatus} error={errors['taxStatus.section13Election']} />
            <TaxCheckbox label="VCC Sub-Fund Structure" field="vccSubFundStructure"
              checked={taxStatus.vccSubFundStructure ?? false} onChange={updateTaxStatus} />
            {renderTaxResidency()}
          </>
        );
      case 'trust':
        return (
          <>
            <TaxSelectField label="Section 13O/13U Election" field="section13Election"
              value={taxStatus.section13Election ?? ''} options={section13Options}
              onChange={updateTaxStatus} error={errors['taxStatus.section13Election']} />
            {renderTaxResidency()}
          </>
        );
      case 'partnership':
        return <>{renderTaxResidency()}</>;
      case 'individual':
        return <>{renderTaxResidency()}</>;
      default:
        return null;
    }
  };

  // ─── LU fields ─────────────────────────────────────────────────────

  const renderLuFields = () => {
    switch (category) {
      case 'holding':
        // lu-soparfi
        return (
          <>
            <TaxCheckbox label="SOPARFI" field="soparfiFlag"
              checked={taxStatus.soparfiFlag ?? true} onChange={updateTaxStatus} readOnly />
            <TaxCheckbox label="Participation Exemption" field="participationExemption"
              checked={taxStatus.participationExemption ?? false} onChange={updateTaxStatus} />
            {renderTaxResidency()}
          </>
        );
      case 'company':
        return (
          <>
            <TaxCheckbox label="Participation Exemption" field="participationExemption"
              checked={taxStatus.participationExemption ?? false} onChange={updateTaxStatus} />
            <TaxCheckbox label="IP Box Election" field="ipBoxElection"
              checked={taxStatus.ipBoxElection ?? false} onChange={updateTaxStatus} />
            {renderTaxResidency()}
          </>
        );
      case 'fund':
        // lu-raif: Tax Residency only
        if (entityType === 'lu-raif') {
          return <>{renderTaxResidency()}</>;
        }
        // lu-sicav, lu-sicar, lu-sif: Subscription Tax Rate
        return (
          <>
            <TaxNumberField label="Subscription Tax Rate" field="subscriptionTaxRate"
              value={taxStatus.subscriptionTaxRate} onChange={updateTaxStatus}
              error={errors['taxStatus.subscriptionTaxRate']} />
            {renderTaxResidency()}
          </>
        );
      case 'partnership':
        return <>{renderTaxResidency()}</>;
      case 'individual':
        return <>{renderTaxResidency()}</>;
      default:
        return null;
    }
  };

  // ─── Main dispatch ─────────────────────────────────────────────────

  const renderFields = () => {
    switch (jurisdiction) {
      case 'AU': return renderAuFields();
      case 'UK': return renderUkFields();
      case 'US': return renderUsFields();
      case 'HK': return renderHkFields();
      case 'SG': return renderSgFields();
      case 'LU': return renderLuFields();
      default: return null;
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
