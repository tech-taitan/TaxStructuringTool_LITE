/**
 * Jurisdiction model for multi-jurisdiction support.
 *
 * Starts with Australia (AU). Structured for expansion to
 * Singapore (SG), New Zealand (NZ), and other jurisdictions.
 */

/** Supported jurisdiction codes */
export type Jurisdiction = 'AU';

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
};
