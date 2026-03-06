/**
 * Cross-border connection utilities and constants.
 *
 * Provides detection of cross-border connections (entities in different
 * jurisdictions), common currency options, and payment type classifications
 * for withholding tax metadata.
 *
 * @module cross-border
 */

import type { TaxNode, TaxEdge } from '@/models/graph';

/**
 * Determine whether an edge connects entities in different jurisdictions.
 *
 * Pure function -- finds source and target nodes by ID and compares their
 * `data.jurisdiction` values. Returns false if either node is missing.
 *
 * @param edge - The relationship edge to check
 * @param nodes - All entity nodes on the canvas
 * @returns true if source and target jurisdictions differ
 */
export function isCrossBorder(edge: TaxEdge, nodes: TaxNode[]): boolean {
  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);

  if (!sourceNode || !targetNode) return false;

  return sourceNode.data.jurisdiction !== targetNode.data.jurisdiction;
}

/** Common currencies for cross-border connection metadata */
export const COMMON_CURRENCIES = [
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'NZD', name: 'New Zealand Dollar' },
] as const;

/** Payment types for withholding tax classification */
export const PAYMENT_TYPES = [
  { value: 'dividend', label: 'Dividend' },
  { value: 'interest', label: 'Interest' },
  { value: 'royalty', label: 'Royalty' },
  { value: 'service-fee', label: 'Service Fee' },
  { value: 'management-fee', label: 'Management Fee' },
  { value: 'license-fee', label: 'License Fee' },
] as const;
