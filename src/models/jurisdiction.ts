/**
 * Jurisdiction model for multi-jurisdiction support.
 *
 * Covers Australia (AU), United Kingdom (UK), United States (US),
 * Hong Kong (HK), Singapore (SG), and Luxembourg (LU).
 */

/** Supported jurisdiction codes */
export type Jurisdiction = 'AU' | 'UK' | 'US' | 'HK' | 'SG' | 'LU';

/** Configuration for a jurisdiction */
export interface JurisdictionConfig {
  /** ISO country code */
  code: string;
  /** Full country name */
  name: string;
  /** Emoji flag for display */
  flag: string;
  /** ISO currency code */
  currencyCode: string;
  /** Name of the tax authority */
  taxAuthorityName: string;
}

/** Registry of supported jurisdictions */
export const JURISDICTIONS: Record<Jurisdiction, JurisdictionConfig> = {
  AU: {
    code: 'AU',
    name: 'Australia',
    flag: '\u{1F1E6}\u{1F1FA}',
    currencyCode: 'AUD',
    taxAuthorityName: 'Australian Taxation Office',
  },
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    flag: '\u{1F1EC}\u{1F1E7}',
    currencyCode: 'GBP',
    taxAuthorityName: 'HM Revenue & Customs',
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '\u{1F1FA}\u{1F1F8}',
    currencyCode: 'USD',
    taxAuthorityName: 'Internal Revenue Service',
  },
  HK: {
    code: 'HK',
    name: 'Hong Kong',
    flag: '\u{1F1ED}\u{1F1F0}',
    currencyCode: 'HKD',
    taxAuthorityName: 'Inland Revenue Department',
  },
  SG: {
    code: 'SG',
    name: 'Singapore',
    flag: '\u{1F1F8}\u{1F1EC}',
    currencyCode: 'SGD',
    taxAuthorityName: 'Inland Revenue Authority of Singapore',
  },
  LU: {
    code: 'LU',
    name: 'Luxembourg',
    flag: '\u{1F1F1}\u{1F1FA}',
    currencyCode: 'EUR',
    taxAuthorityName: 'Administration des Contributions Directes',
  },
};
