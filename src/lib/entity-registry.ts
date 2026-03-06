/**
 * Entity type registry for all tax entity types.
 *
 * Each entry defines the visual appearance (shape, color, icon) and
 * default data for a specific entity type. Adding new jurisdictions
 * means adding registry entries -- not modifying components.
 */

import type { EntityTypeConfig, EntityCategory } from '@/models/entities';
import { COLORS } from './constants';

/** Category configuration for the palette (shared between desktop and mobile) */
export interface CategoryConfig {
  category: EntityCategory;
  label: string;
  iconName: string;
}

/** Ordered list of entity categories for palette rendering */
export const CATEGORY_CONFIG: CategoryConfig[] = [
  { category: 'company', label: 'Companies', iconName: 'building-2' },
  { category: 'trust', label: 'Trusts', iconName: 'shield' },
  { category: 'partnership', label: 'Partnerships', iconName: 'handshake' },
  { category: 'fund', label: 'Funds', iconName: 'landmark' },
  { category: 'holding', label: 'Holding Vehicles', iconName: 'layers' },
  { category: 'vc', label: 'Venture Capital', iconName: 'trending-up' },
  { category: 'individual', label: 'Individuals', iconName: 'user' },
  { category: 'smsf', label: 'Super Funds', iconName: 'shield-check' },
  { category: 'pension', label: 'Pension Schemes', iconName: 'piggy-bank' },
];

/** Registry of all entity type configurations, keyed by entity type ID */
export const ENTITY_REGISTRY: Record<string, EntityTypeConfig> = {
  'au-pty-ltd': {
    id: 'au-pty-ltd',
    jurisdiction: 'AU',
    category: 'company',
    displayName: 'Pty Ltd Company',
    shortName: 'Pty Ltd',
    description: 'A standard Australian company. Use for operating businesses, holding companies, and corporate trustees.',
    shape: 'rectangle',
    icon: 'building-2',
    color: COLORS.entity.company,
    defaultData: {
      abn: '',
      acn: '',
      baseRateEntity: false,
      taxRate: 0.3,
    },
  },

  'au-unit-trust': {
    id: 'au-unit-trust',
    jurisdiction: 'AU',
    category: 'trust',
    displayName: 'Unit Trust',
    shortName: 'Unit Trust',
    description: 'A trust with fixed unit entitlements. Investors hold units like shares.',
    shape: 'triangle',
    icon: 'shield',
    color: COLORS.entity.trust,
    defaultData: {
      abn: '',
      trusteeName: '',
      trustDeedDate: '',
      mitElection: false,
      amitElection: false,
    },
  },

  'au-discretionary-trust': {
    id: 'au-discretionary-trust',
    jurisdiction: 'AU',
    category: 'trust',
    displayName: 'Discretionary Trust',
    shortName: 'Disc. Trust',
    description: 'A family trust where the trustee decides how to distribute income and capital.',
    shape: 'triangle',
    icon: 'shield-check',
    color: COLORS.entity.trust,
    defaultData: {
      abn: '',
      trusteeName: '',
      trustDeedDate: '',
      mitElection: false,
      amitElection: false,
    },
  },

  'au-hybrid-trust': {
    id: 'au-hybrid-trust',
    jurisdiction: 'AU',
    category: 'trust',
    displayName: 'Hybrid Trust',
    shortName: 'Hybrid Trust',
    description: 'Combines features of unit and discretionary trusts.',
    shape: 'triangle',
    icon: 'shield-half',
    color: COLORS.entity.trust,
    defaultData: {
      abn: '',
      trusteeName: '',
      trustDeedDate: '',
      mitElection: false,
      amitElection: false,
    },
  },

  'au-mit': {
    id: 'au-mit',
    jurisdiction: 'AU',
    category: 'trust',
    displayName: 'Managed Investment Trust',
    shortName: 'MIT',
    description: 'A managed investment trust for pooled investment vehicles (MIT/AMIT regime).',
    shape: 'triangle',
    icon: 'landmark',
    color: COLORS.entity.trust,
    defaultData: {
      abn: '',
      trusteeName: '',
      trustDeedDate: '',
      mitElection: false,
      amitElection: false,
    },
  },

  'au-general-partnership': {
    id: 'au-general-partnership',
    jurisdiction: 'AU',
    category: 'partnership',
    displayName: 'General Partnership',
    shortName: 'Gen. Partnership',
    description: 'All partners share management responsibility and unlimited liability.',
    shape: 'triangle',
    icon: 'handshake',
    color: COLORS.entity.partnership,
    defaultData: {
      abn: '',
      partnershipAgreementDate: '',
    },
  },

  'au-limited-partnership': {
    id: 'au-limited-partnership',
    jurisdiction: 'AU',
    category: 'partnership',
    displayName: 'Limited Partnership',
    shortName: 'Ltd Partnership',
    description: 'Has general partners (managers) and limited partners (investors).',
    shape: 'triangle',
    icon: 'file-signature',
    color: COLORS.entity.partnership,
    defaultData: {
      abn: '',
      partnershipAgreementDate: '',
    },
  },

  'au-vclp': {
    id: 'au-vclp',
    jurisdiction: 'AU',
    category: 'vc',
    displayName: 'Venture Capital Limited Partnership',
    shortName: 'VCLP',
    description: 'A tax-advantaged venture capital fund structure registered with Innovation Australia.',
    shape: 'triangle',
    icon: 'trending-up',
    color: COLORS.entity.vc,
    defaultData: {
      abn: '',
      registeredWithInnovationAustralia: false,
    },
  },

  'au-esvclp': {
    id: 'au-esvclp',
    jurisdiction: 'AU',
    category: 'vc',
    displayName: 'Early Stage VCLP',
    shortName: 'ESVCLP',
    description: 'An early-stage venture capital fund with enhanced tax concessions.',
    shape: 'triangle',
    icon: 'rocket',
    color: COLORS.entity.vc,
    defaultData: {
      abn: '',
      registeredWithInnovationAustralia: false,
    },
  },

  'au-individual': {
    id: 'au-individual',
    jurisdiction: 'AU',
    category: 'individual',
    displayName: 'Individual',
    shortName: 'Individual',
    description: 'A natural person -- taxpayer, beneficiary, or shareholder.',
    shape: 'oval',
    icon: 'user',
    color: COLORS.entity.individual,
    defaultData: {
      tfn: '',
      taxResidency: 'AU',
    },
  },

  'au-smsf': {
    id: 'au-smsf',
    jurisdiction: 'AU',
    category: 'smsf',
    displayName: 'Self-Managed Super Fund',
    shortName: 'SMSF',
    description: 'A self-managed superannuation fund with up to 6 members.',
    shape: 'triangle',
    icon: 'shield-check',
    color: COLORS.entity.smsf,
    defaultData: {
      abn: '',
      trusteeName: '',
      trustDeedDate: '',
      registeredWithAPRA: false,
    },
  },
};

/**
 * Get all entity types for a given jurisdiction.
 * @param jurisdiction - Jurisdiction code (e.g. 'AU')
 * @returns Array of entity type configs for that jurisdiction
 */
export function getEntitiesByJurisdiction(
  jurisdiction: string
): EntityTypeConfig[] {
  return Object.values(ENTITY_REGISTRY).filter(
    (e) => e.jurisdiction === jurisdiction
  );
}

/**
 * Get entity types filtered by jurisdiction and category.
 * @param jurisdiction - Jurisdiction code (e.g. 'AU')
 * @param category - Entity category to filter by
 * @returns Array of matching entity type configs
 */
export function getEntitiesByCategory(
  jurisdiction: string,
  category: EntityCategory
): EntityTypeConfig[] {
  return Object.values(ENTITY_REGISTRY).filter(
    (e) => e.jurisdiction === jurisdiction && e.category === category
  );
}

/**
 * Look up a single entity type config by its ID.
 * @param entityTypeId - The entity type ID (e.g. 'au-pty-ltd')
 * @returns The entity type config, or undefined if not found
 */
export function getEntityConfig(
  entityTypeId: string
): EntityTypeConfig | undefined {
  return ENTITY_REGISTRY[entityTypeId];
}
