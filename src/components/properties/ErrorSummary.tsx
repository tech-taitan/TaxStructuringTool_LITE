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
    'registration.abn': 'ABN',
    'registration.acn': 'ACN',
    'registration.tfn': 'TFN',
    'registration.trustDeedDate': 'Trust Deed Date',
    'registration.partnershipAgreementDate': 'Partnership Agreement Date',
    'registration.registeredWithInnovationAustralia': 'Innovation Australia Registration',
    'registration.registeredWithAPRA': 'APRA Registration',
    'taxStatus.baseRateEntity': 'Base Rate Entity',
    'taxStatus.taxRate': 'Tax Rate',
    'taxStatus.taxResidency': 'Tax Residency',
    'taxStatus.mitElection': 'MIT Election',
    'taxStatus.amitElection': 'AMIT Election',
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
