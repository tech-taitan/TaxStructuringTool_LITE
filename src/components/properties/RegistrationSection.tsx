'use client';

/**
 * Registration section of the properties panel.
 *
 * Collapsible section rendering jurisdiction-specific registration fields.
 * Dispatches on jurisdiction first, then on category/entityType within
 * each jurisdiction.
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

/** Reusable text field for registration inputs */
function RegTextField({ label, field, maxLength, placeholder, value, onChange, error }: {
  label: string; field: string; maxLength?: number; placeholder?: string;
  value: string; onChange: (field: string, value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type="text" maxLength={maxLength} placeholder={placeholder} value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500 ${
          error ? 'border-red-400' : 'border-gray-300'
        }`} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

/** Reusable checkbox for registration inputs */
function RegCheckbox({ label, field, checked, onChange }: {
  label: string; field: string; checked: boolean;
  onChange: (field: string, value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input type="checkbox" id={field} checked={checked}
        onChange={(e) => onChange(field, e.target.checked)}
        className="w-4 h-4 rounded border-gray-300" />
      <label htmlFor={field} className="text-sm text-gray-700">{label}</label>
    </div>
  );
}

/** US states + DC for State of Formation dropdown */
const US_STATES: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
];

export default function RegistrationSection({
  formData,
  onChange,
  errors,
  entityType,
}: RegistrationSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const config = getEntityConfig(entityType);
  const category = config?.category ?? 'company';
  const jurisdiction = config?.jurisdiction ?? 'AU';

  const registration = formData.registration ?? {};

  const updateRegistration = (field: string, value: string | boolean) => {
    onChange({
      registration: {
        ...registration,
        [field]: value,
      },
    });
  };

  // ─── AU fields ─────────────────────────────────────────────────────

  const renderAuFields = () => {
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

  // ─── UK fields ─────────────────────────────────────────────────────

  const renderUkFields = () => {
    switch (category) {
      case 'company':
        return (
          <>
            <RegTextField label="Company Number" field="companyNumber" maxLength={8}
              value={registration.companyNumber ?? ''} onChange={updateRegistration}
              error={errors['registration.companyNumber']} />
            <RegTextField label="UTR" field="utr" maxLength={10}
              value={registration.utr ?? ''} onChange={updateRegistration}
              error={errors['registration.utr']} />
          </>
        );
      case 'partnership':
        return (
          <>
            {entityType === 'uk-llp' && (
              <RegTextField label="Company Number" field="companyNumber" maxLength={8}
                value={registration.companyNumber ?? ''} onChange={updateRegistration}
                error={errors['registration.companyNumber']} />
            )}
            {entityType === 'uk-lp' && (
              <RegTextField label="LP Number" field="lpNumber"
                value={registration.lpNumber ?? ''} onChange={updateRegistration}
                error={errors['registration.lpNumber']} />
            )}
            <RegTextField label="UTR" field="utr" maxLength={10}
              value={registration.utr ?? ''} onChange={updateRegistration}
              error={errors['registration.utr']} />
          </>
        );
      case 'trust':
        return (
          <RegTextField label="UTR" field="utr" maxLength={10}
            value={registration.utr ?? ''} onChange={updateRegistration}
            error={errors['registration.utr']} />
        );
      case 'individual':
        return (
          <>
            <RegTextField label="NINO" field="nino" maxLength={9}
              value={registration.nino ?? ''} onChange={updateRegistration}
              error={errors['registration.nino']} />
            <RegTextField label="UTR" field="utr" maxLength={10}
              value={registration.utr ?? ''} onChange={updateRegistration}
              error={errors['registration.utr']} />
          </>
        );
      case 'pension':
        return (
          <RegTextField label="HMRC Reference" field="hmrcReference"
            value={registration.hmrcReference ?? ''} onChange={updateRegistration}
            error={errors['registration.hmrcReference']} />
        );
      default:
        return null;
    }
  };

  // ─── US fields ─────────────────────────────────────────────────────

  const renderStateOfFormation = () => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">State of Formation</label>
      <select
        value={registration.stateOfFormation ?? ''}
        onChange={(e) => updateRegistration('stateOfFormation', e.target.value)}
        className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500 ${
          errors['registration.stateOfFormation'] ? 'border-red-400' : 'border-gray-300'
        }`}
      >
        <option value="">Select...</option>
        {US_STATES.map((s) => (
          <option key={s.code} value={s.code}>{s.name}</option>
        ))}
      </select>
      {errors['registration.stateOfFormation'] && (
        <p className="text-xs text-red-500 mt-1">{errors['registration.stateOfFormation']}</p>
      )}
    </div>
  );

  const renderUsFields = () => {
    switch (category) {
      case 'company':
        return (
          <>
            <RegTextField label="EIN" field="ein" maxLength={10} placeholder="XX-XXXXXXX"
              value={registration.ein ?? ''} onChange={updateRegistration}
              error={errors['registration.ein']} />
            {renderStateOfFormation()}
          </>
        );
      case 'partnership':
        return (
          <>
            <RegTextField label="EIN" field="ein" maxLength={10} placeholder="XX-XXXXXXX"
              value={registration.ein ?? ''} onChange={updateRegistration}
              error={errors['registration.ein']} />
            {renderStateOfFormation()}
          </>
        );
      case 'trust':
        return (
          <RegTextField label="EIN" field="ein" maxLength={10} placeholder="XX-XXXXXXX"
            value={registration.ein ?? ''} onChange={updateRegistration}
            error={errors['registration.ein']} />
        );
      case 'individual':
        return (
          <RegTextField label="SSN/ITIN" field="ssn" maxLength={11} placeholder="XXX-XX-XXXX"
            value={registration.ssn ?? ''} onChange={updateRegistration}
            error={errors['registration.ssn']} />
        );
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
            <RegTextField label="CR Number" field="crNumber" maxLength={8}
              value={registration.crNumber ?? ''} onChange={updateRegistration}
              error={errors['registration.crNumber']} />
            <RegTextField label="BRN" field="brn" maxLength={8}
              value={registration.brn ?? ''} onChange={updateRegistration}
              error={errors['registration.brn']} />
          </>
        );
      case 'partnership':
        return (
          <RegTextField label="BRN" field="brn" maxLength={8}
            value={registration.brn ?? ''} onChange={updateRegistration}
            error={errors['registration.brn']} />
        );
      case 'fund':
        return (
          <RegTextField label="BRN" field="brn" maxLength={8}
            value={registration.brn ?? ''} onChange={updateRegistration}
            error={errors['registration.brn']} />
        );
      case 'individual':
        return (
          <RegTextField label="HKID" field="hkid"
            value={registration.hkid ?? ''} onChange={updateRegistration}
            error={errors['registration.hkid']} />
        );
      default:
        return null;
    }
  };

  // ─── SG fields ─────────────────────────────────────────────────────

  const renderSgFields = () => {
    switch (category) {
      case 'company':
      case 'partnership':
      case 'fund':
      case 'trust':
        return (
          <RegTextField label="UEN" field="uen" maxLength={10}
            value={registration.uen ?? ''} onChange={updateRegistration}
            error={errors['registration.uen']} />
        );
      case 'individual':
        return (
          <RegTextField label="NRIC/FIN" field="nric" maxLength={9}
            value={registration.nric ?? ''} onChange={updateRegistration}
            error={errors['registration.nric']} />
        );
      default:
        return null;
    }
  };

  // ─── LU fields ─────────────────────────────────────────────────────

  const renderLuFields = () => {
    switch (category) {
      case 'company':
      case 'partnership':
      case 'holding':
        return (
          <RegTextField label="RCS Number" field="rcsNumber"
            value={registration.rcsNumber ?? ''} onChange={updateRegistration}
            error={errors['registration.rcsNumber']} />
        );
      case 'fund':
        return (
          <>
            <RegTextField label="RCS Number" field="rcsNumber"
              value={registration.rcsNumber ?? ''} onChange={updateRegistration}
              error={errors['registration.rcsNumber']} />
            {(entityType === 'lu-sicav' || entityType === 'lu-sicar' || entityType === 'lu-sif') && (
              <RegTextField label="CSSF Approval Number" field="cssfApprovalNumber"
                value={registration.cssfApprovalNumber ?? ''} onChange={updateRegistration}
                error={errors['registration.cssfApprovalNumber']} />
            )}
          </>
        );
      case 'individual':
        return (
          <RegTextField label="Tax ID / Matricule" field="nationalId" maxLength={13}
            value={registration.nationalId ?? ''} onChange={updateRegistration}
            error={errors['registration.nationalId']} />
        );
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
