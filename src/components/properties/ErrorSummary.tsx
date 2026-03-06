'use client';

/**
 * Validation error summary banner for the properties panel.
 *
 * Displays a red-tinted banner listing all validation errors.
 * Each error is clickable to focus the offending field.
 */

import { AlertTriangle } from 'lucide-react';

interface ValidationError {
  path: (string | number)[];
  message: string;
}

interface ErrorSummaryProps {
  errors: ValidationError[];
  onFieldClick?: (path: string) => void;
}

/** Convert a Zod error path array to a human-readable field label */
function pathToLabel(path: (string | number)[]): string {
  const labelMap: Record<string, string> = {
    name: 'Name',
    jurisdiction: 'Jurisdiction',
    notes: 'Notes',
    // AU registration
    'registration.abn': 'ABN',
    'registration.acn': 'ACN',
    'registration.tfn': 'TFN',
    'registration.trustDeedDate': 'Trust Deed Date',
    'registration.partnershipAgreementDate': 'Partnership Agreement Date',
    'registration.registeredWithInnovationAustralia': 'Innovation Australia Registration',
    'registration.registeredWithAPRA': 'APRA Registration',
    // UK registration
    'registration.companyNumber': 'Company Number',
    'registration.utr': 'UTR',
    'registration.nino': 'NINO',
    'registration.lpNumber': 'LP Number',
    'registration.hmrcReference': 'HMRC Reference',
    // US registration
    'registration.ein': 'EIN',
    'registration.ssn': 'SSN/ITIN',
    'registration.stateOfFormation': 'State of Formation',
    // HK registration
    'registration.crNumber': 'CR Number',
    'registration.brn': 'Business Registration Number',
    'registration.hkid': 'HKID',
    // SG registration
    'registration.uen': 'UEN',
    'registration.nric': 'NRIC/FIN',
    // LU registration
    'registration.rcsNumber': 'RCS Number',
    'registration.cssfApprovalNumber': 'CSSF Approval Number',
    'registration.nationalId': 'Tax ID (Matricule)',
    // AU tax status
    'taxStatus.baseRateEntity': 'Base Rate Entity',
    'taxStatus.taxRate': 'Tax Rate',
    'taxStatus.taxResidency': 'Tax Residency',
    'taxStatus.mitElection': 'MIT Election',
    'taxStatus.amitElection': 'AMIT Election',
    // UK tax status
    'taxStatus.corporationTaxRate': 'Corporation Tax Rate',
    'taxStatus.smallProfitsRate': 'Small Profits Rate',
    'taxStatus.ihtRelevant': 'IHT Relevant',
    // US tax status
    'taxStatus.checkTheBoxElection': 'Check-the-Box Election',
    'taxStatus.sCorpElection': 'S Corp Election',
    'taxStatus.federalTaxRate': 'Federal Tax Rate',
    // HK tax status
    'taxStatus.twoTierProfitsTax': 'Two-Tier Profits Tax',
    // SG tax status
    'taxStatus.section13Election': 'Section 13O/13U Election',
    'taxStatus.partialTaxExemption': 'Partial Tax Exemption',
    'taxStatus.vccSubFundStructure': 'VCC Sub-Fund Structure',
    // LU tax status
    'taxStatus.soparfiFlag': 'SOPARFI',
    'taxStatus.participationExemption': 'Participation Exemption',
    'taxStatus.subscriptionTaxRate': 'Subscription Tax Rate',
    'taxStatus.ipBoxElection': 'IP Box Election',
  };

  const key = path.join('.');
  return labelMap[key] ?? path[path.length - 1]?.toString() ?? 'Unknown field';
}

export default function ErrorSummary({ errors, onFieldClick }: ErrorSummaryProps) {
  if (errors.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-semibold">
          {errors.length} validation {errors.length === 1 ? 'error' : 'errors'}
        </span>
      </div>
      <ul className="space-y-1">
        {errors.map((error, i) => {
          const fieldPath = error.path.join('.');
          const label = pathToLabel(error.path);
          return (
            <li key={i} className="text-sm">
              <button
                type="button"
                className="text-left hover:underline cursor-pointer"
                onClick={() => onFieldClick?.(fieldPath)}
              >
                <span className="font-medium">{label}</span>: {error.message}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
