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

  // ─── United Kingdom (UK) ───────────────────────────────────────────

  'uk-ltd': {
    id: 'uk-ltd',
    jurisdiction: 'UK',
    category: 'company',
    displayName: 'Private Limited Company',
    shortName: 'Ltd',
    description: 'A standard UK private company limited by shares under the Companies Act 2006.',
    shape: 'rectangle',
    icon: 'building-2',
    color: COLORS.entity.company,
    defaultData: {
      companyNumber: '',
      utr: '',
    },
  },

  'uk-plc': {
    id: 'uk-plc',
    jurisdiction: 'UK',
    category: 'company',
    displayName: 'Public Limited Company',
    shortName: 'PLC',
    description: 'A UK public limited company that can offer shares to the public and trade on a stock exchange.',
    shape: 'rectangle',
    icon: 'building-2',
    color: COLORS.entity.company,
    defaultData: {
      companyNumber: '',
      utr: '',
    },
  },

  'uk-llp': {
    id: 'uk-llp',
    jurisdiction: 'UK',
    category: 'partnership',
    displayName: 'Limited Liability Partnership',
    shortName: 'LLP',
    description: 'A UK partnership where members have limited liability, taxed as a transparent partnership.',
    shape: 'triangle',
    icon: 'handshake',
    color: COLORS.entity.partnership,
    defaultData: {
      companyNumber: '',
      utr: '',
    },
  },

  'uk-lp': {
    id: 'uk-lp',
    jurisdiction: 'UK',
    category: 'partnership',
    displayName: 'Limited Partnership',
    shortName: 'LP',
    description: 'A UK limited partnership with general and limited partners, commonly used for fund structures.',
    shape: 'triangle',
    icon: 'file-signature',
    color: COLORS.entity.partnership,
    defaultData: {
      lpNumber: '',
      utr: '',
    },
  },

  'uk-gp': {
    id: 'uk-gp',
    jurisdiction: 'UK',
    category: 'partnership',
    displayName: 'General Partnership',
    shortName: 'GP',
    description: 'A UK general partnership where all partners share unlimited liability and management.',
    shape: 'triangle',
    icon: 'handshake',
    color: COLORS.entity.partnership,
    defaultData: {
      utr: '',
    },
  },

  'uk-unit-trust': {
    id: 'uk-unit-trust',
    jurisdiction: 'UK',
    category: 'trust',
    displayName: 'Unit Trust',
    shortName: 'Unit Trust',
    description: 'A UK trust where investors hold units representing a proportionate share of the fund assets.',
    shape: 'triangle',
    icon: 'shield',
    color: COLORS.entity.trust,
    defaultData: {
      utr: '',
      trusteeName: '',
    },
  },

  'uk-discretionary-trust': {
    id: 'uk-discretionary-trust',
    jurisdiction: 'UK',
    category: 'trust',
    displayName: 'Discretionary Trust',
    shortName: 'Disc. Trust',
    description: 'A UK trust where the trustees have discretion over how income and capital are distributed to beneficiaries.',
    shape: 'triangle',
    icon: 'shield-check',
    color: COLORS.entity.trust,
    defaultData: {
      utr: '',
      trusteeName: '',
    },
  },

  'uk-individual': {
    id: 'uk-individual',
    jurisdiction: 'UK',
    category: 'individual',
    displayName: 'Individual',
    shortName: 'Individual',
    description: 'A UK-resident natural person subject to income tax, capital gains tax, and inheritance tax.',
    shape: 'oval',
    icon: 'user',
    color: COLORS.entity.individual,
    defaultData: {
      nino: '',
      utr: '',
    },
  },

  'uk-pension-scheme': {
    id: 'uk-pension-scheme',
    jurisdiction: 'UK',
    category: 'pension',
    displayName: 'Pension Scheme',
    shortName: 'Pension',
    description: 'A UK registered pension scheme providing tax-relieved retirement savings under HMRC rules.',
    shape: 'shield',
    icon: 'piggy-bank',
    color: COLORS.entity.pension,
    defaultData: {
      hmrcReference: '',
    },
  },

  // ─── United States (US) ────────────────────────────────────────────

  'us-c-corp': {
    id: 'us-c-corp',
    jurisdiction: 'US',
    category: 'company',
    displayName: 'C Corporation',
    shortName: 'C Corp',
    description: 'A US corporation taxed at the entity level under Subchapter C of the Internal Revenue Code.',
    shape: 'rectangle',
    icon: 'building-2',
    color: COLORS.entity.company,
    defaultData: {
      ein: '',
      stateOfFormation: '',
    },
  },

  'us-s-corp': {
    id: 'us-s-corp',
    jurisdiction: 'US',
    category: 'company',
    displayName: 'S Corporation',
    shortName: 'S Corp',
    description: 'A US corporation that has elected pass-through taxation under Subchapter S of the Internal Revenue Code.',
    shape: 'rectangle',
    icon: 'building-2',
    color: COLORS.entity.company,
    defaultData: {
      ein: '',
      stateOfFormation: '',
      sCorpElection: false,
    },
  },

  'us-llc-disregarded': {
    id: 'us-llc-disregarded',
    jurisdiction: 'US',
    category: 'company',
    displayName: 'LLC (Disregarded Entity)',
    shortName: 'LLC (DE)',
    description: 'A single-member US LLC treated as a disregarded entity for federal tax purposes.',
    shape: 'rounded',
    icon: 'building-2',
    color: COLORS.entity.company,
    defaultData: {
      ein: '',
      stateOfFormation: '',
    },
  },

  'us-llc-partnership': {
    id: 'us-llc-partnership',
    jurisdiction: 'US',
    category: 'partnership',
    displayName: 'LLC (Partnership-Taxed)',
    shortName: 'LLC (P)',
    description: 'A multi-member US LLC taxed as a partnership under the default check-the-box classification.',
    shape: 'triangle',
    icon: 'handshake',
    color: COLORS.entity.partnership,
    defaultData: {
      ein: '',
      stateOfFormation: '',
    },
  },

  'us-gp': {
    id: 'us-gp',
    jurisdiction: 'US',
    category: 'partnership',
    displayName: 'General Partnership',
    shortName: 'GP',
    description: 'A US general partnership where all partners share unlimited liability and management responsibilities.',
    shape: 'triangle',
    icon: 'handshake',
    color: COLORS.entity.partnership,
    defaultData: {
      ein: '',
    },
  },

  'us-lp': {
    id: 'us-lp',
    jurisdiction: 'US',
    category: 'partnership',
    displayName: 'Limited Partnership',
    shortName: 'LP',
    description: 'A US limited partnership with general partners managing the business and limited partners as passive investors.',
    shape: 'triangle',
    icon: 'file-signature',
    color: COLORS.entity.partnership,
    defaultData: {
      ein: '',
      stateOfFormation: '',
    },
  },

  'us-lllp': {
    id: 'us-lllp',
    jurisdiction: 'US',
    category: 'partnership',
    displayName: 'Limited Liability Limited Partnership',
    shortName: 'LLLP',
    description: 'A US limited partnership where general partners also enjoy limited liability protection.',
    shape: 'triangle',
    icon: 'file-signature',
    color: COLORS.entity.partnership,
    defaultData: {
      ein: '',
      stateOfFormation: '',
    },
  },

  'us-grantor-trust': {
    id: 'us-grantor-trust',
    jurisdiction: 'US',
    category: 'trust',
    displayName: 'Grantor Trust',
    shortName: 'Grantor Trust',
    description: 'A US trust where the grantor retains certain powers, causing income to be taxed to the grantor personally.',
    shape: 'triangle',
    icon: 'shield',
    color: COLORS.entity.trust,
    defaultData: {
      ein: '',
      trusteeName: '',
    },
  },

  'us-non-grantor-trust': {
    id: 'us-non-grantor-trust',
    jurisdiction: 'US',
    category: 'trust',
    displayName: 'Non-Grantor Trust',
    shortName: 'Non-Grantor Trust',
    description: 'A US trust taxed as a separate entity, with its own tax brackets and filing requirements.',
    shape: 'triangle',
    icon: 'shield-check',
    color: COLORS.entity.trust,
    defaultData: {
      ein: '',
      trusteeName: '',
    },
  },

  'us-individual': {
    id: 'us-individual',
    jurisdiction: 'US',
    category: 'individual',
    displayName: 'Individual',
    shortName: 'Individual',
    description: 'A US-resident natural person subject to federal income tax, state tax, and estate tax.',
    shape: 'oval',
    icon: 'user',
    color: COLORS.entity.individual,
    defaultData: {
      ssn: '',
      taxResidency: 'US',
    },
  },

  'us-501c3': {
    id: 'us-501c3',
    jurisdiction: 'US',
    category: 'company',
    displayName: 'Tax-Exempt Organization',
    shortName: '501(c)(3)',
    description: 'A US tax-exempt organization under IRC Section 501(c)(3), typically a charitable or educational entity.',
    shape: 'hexagon',
    icon: 'landmark',
    color: COLORS.entity.company,
    defaultData: {
      ein: '',
      exemptionType: '501(c)(3)',
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
