/**
 * Relationship type definitions for the labeled multigraph.
 *
 * Supports multiple typed connections between the same entity pair,
 * each carrying type-specific metadata (equity terms, debt terms, etc.).
 */

/** Types of relationships that can exist between entities */
export type RelationshipType =
  | 'equity'
  | 'debt'
  | 'trustee'
  | 'beneficiary'
  | 'partnership'
  | 'management'
  | 'services'
  | 'licensing';

/** Metadata carried by a relationship edge */
export interface TaxRelationshipData extends Record<string, unknown> {
  /** The type of relationship */
  relationshipType: RelationshipType;
  /** Display label for the edge */
  label: string;

  // Equity-specific fields
  /** Ownership percentage (0-100) */
  ownershipPercentage?: number;
  /** Class of shares held */
  shareClass?: 'ordinary' | 'preference' | 'redeemable';

  // Debt-specific fields
  /** Principal amount of the loan */
  principal?: number;
  /** Annual interest rate as a decimal (e.g. 0.05 for 5%) */
  interestRate?: number;
  /** Maturity date in ISO format */
  maturityDate?: string;
  /** Whether the debt is secured */
  secured?: boolean;

  // Trust-specific fields
  /** Type of beneficiary interest */
  beneficiaryType?: 'fixed' | 'discretionary';

  // General fields
  /** Free-form notes about the relationship */
  notes?: string;

  // Cross-border fields
  /** Withholding tax rate as percentage 0-100 */
  withholdingTaxRate?: number;
  /** Payment type for WHT classification */
  paymentType?: 'dividend' | 'interest' | 'royalty' | 'service-fee' | 'management-fee' | 'license-fee';
  /** Whether a treaty-reduced rate applies */
  treatyApplies?: boolean;
  /** Name of the applicable tax treaty */
  treatyName?: string;
  /** ISO 4217 currency code */
  currencyCode?: string;
  /** Transfer pricing relevance flag (auto-computed, user-overridable) */
  transferPricingRelevant?: boolean;

  // Visual routing
  /** Smooth-step path offset (px) controlling edge curvature. undefined = auto. */
  pathOffset?: number;
  /** Path rendering style. undefined/'smoothstep' = orthogonal routing, 'straight' = direct line. */
  pathStyle?: 'smoothstep' | 'straight';
}
