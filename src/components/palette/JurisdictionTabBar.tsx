/**
 * Shared jurisdiction tab bar for desktop and mobile palettes.
 *
 * Renders 6 jurisdiction tabs (AU, UK, US, HK, SG, LU) with flag emoji + code.
 * Uses flex-1 layout so all tabs fit without horizontal scrolling on both the
 * 256px desktop sidebar and narrowest mobile screens.
 */

import { JURISDICTIONS, type Jurisdiction } from '@/models/jurisdiction';

/** Fixed tab order matching the jurisdiction model definition */
const JURISDICTION_ORDER: Jurisdiction[] = ['AU', 'UK', 'US', 'HK', 'SG', 'LU'];

interface JurisdictionTabBarProps {
  selected: string;
  onSelect: (jurisdiction: string) => void;
  disabled?: boolean; // visually dim when search is active (used in Plan 18-02)
}

export function JurisdictionTabBar({ selected, onSelect, disabled }: JurisdictionTabBarProps) {
  return (
    <div className="flex border-b border-gray-200 px-2 flex-shrink-0">
      {JURISDICTION_ORDER.map((code) => {
        const config = JURISDICTIONS[code];
        const isActive = selected === code;
        return (
          <button
            key={code}
            onClick={() => onSelect(code)}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium border-b-2 transition-colors ${
              isActive
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
            title={config.name}
            aria-label={`${config.name} entities`}
          >
            <span className="text-sm">{config.flag}</span>
            <span>{code}</span>
          </button>
        );
      })}
    </div>
  );
}
