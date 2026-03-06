/**
 * Zod validation schemas for each entity type.
 *
 * Provides per-entity-type field validation using Zod v4.
 * Each schema extends a base schema with type-specific registration
 * and tax status fields. Registration and tax status objects use
 * .optional().default({}) so partial data validates cleanly.
 *
 * @module entity-schemas
 */

import { z } from 'zod';

// ─── Reusable field validators ──────────────────────────────────────────────

/** ABN validator reused across multiple entity types */
const abnField = z
  .string()
  .regex(/^\d{11}$/, 'ABN must be 11 digits')
  .optional()
  .or(z.literal(''));

/** UK Companies House number -- 8 alphanumeric characters */
const ukCompanyNumberField = z
  .string()
  .regex(/^[A-Z0-9]{8}$/i, 'Company Number must be 8 alphanumeric characters')
  .optional()
  .or(z.literal(''));

/** UK Unique Taxpayer Reference -- 10 digits */
const utrField = z
  .string()
  .regex(/^\d{10}$/, 'UTR must be 10 digits')
  .optional()
  .or(z.literal(''));

/** UK National Insurance Number -- 2 letters + 6 digits + A/B/C/D */
const ninoField = z
  .string()
  .regex(
    /^[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]\d{6}[ABCD]$/i,
    'NINO must be 2 letters + 6 digits + A/B/C/D'
  )
  .optional()
  .or(z.literal(''));

/** US Employer Identification Number -- XX-XXXXXXX */
const einField = z
  .string()
  .regex(/^\d{2}-\d{7}$/, 'EIN must be in XX-XXXXXXX format')
  .optional()
  .or(z.literal(''));

/** US Social Security Number -- XXX-XX-XXXX */
const ssnField = z
  .string()
  .regex(/^\d{3}-\d{2}-\d{4}$/, 'SSN must be in XXX-XX-XXXX format')
  .optional()
  .or(z.literal(''));

/** HK Companies Registry number -- 7-8 digits */
const hkCrNumberField = z
  .string()
  .regex(/^\d{7,8}$/, 'CR Number must be 7-8 digits')
  .optional()
  .or(z.literal(''));

/** HK Business Registration Number -- 8 digits */
const hkBrnField = z
  .string()
  .regex(/^\d{8}$/, 'BRN must be 8 digits')
  .optional()
  .or(z.literal(''));

/** HK Identity Card -- letter(s) + 6 digits + check character */
const hkidField = z
  .string()
  .regex(
    /^[A-Z]{1,2}\d{6}[0-9A]$/i,
    'HKID must be letter(s) + 6 digits + check character'
  )
  .optional()
  .or(z.literal(''));

/** SG Unique Entity Number -- 9-10 alphanumeric characters */
const uenField = z
  .string()
  .regex(/^[A-Z0-9]{9,10}$/i, 'UEN must be 9-10 alphanumeric characters')
  .optional()
  .or(z.literal(''));

/** SG National Registration Identity Card / Foreign Identification Number */
const nricField = z
  .string()
  .regex(
    /^[STFGM]\d{7}[A-Z]$/i,
    'NRIC/FIN must be letter + 7 digits + letter'
  )
  .optional()
  .or(z.literal(''));

/** LU Registre de Commerce et des Societes number -- letter + up to 6 digits */
const rcsNumberField = z
  .string()
  .regex(/^[A-Z]\s?\d{1,6}$/i, 'RCS Number must be letter + up to 6 digits')
  .optional()
  .or(z.literal(''));

/** LU National identification number -- 13 digits */
const luNationalIdField = z
  .string()
  .regex(/^\d{13}$/, 'Tax ID must be 13 digits')
  .optional()
  .or(z.literal(''));

// ─── Base schema ────────────────────────────────────────────────────────────

/** Base schema common to all entity types */
const baseEntitySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  jurisdiction: z.string().min(2),
  notes: z.string().max(2000).optional().default(''),
  status: z.enum(['existing', 'proposed', 'removed']).optional(),
});

// ─── AU schemas ─────────────────────────────────────────────────────────────

/** Company (Pty Ltd) schema */
const companySchema = baseEntitySchema.extend({
  entityType: z.literal('au-pty-ltd'),
  registration: z
    .object({
      abn: abnField,
      acn: z
        .string()
        .regex(/^\d{9}$/, 'ACN must be 9 digits')
        .optional()
        .or(z.literal('')),
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      baseRateEntity: z.boolean().optional(),
      taxRate: z.number().min(0).max(1).optional(),
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** Trust schema (unit, discretionary, hybrid, MIT) */
const trustSchema = baseEntitySchema.extend({
  entityType: z.enum([
    'au-unit-trust',
    'au-discretionary-trust',
    'au-hybrid-trust',
    'au-mit',
  ]),
  registration: z
    .object({
      abn: abnField,
      trustDeedDate: z.string().optional().or(z.literal('')),
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      mitElection: z.boolean().optional(),
      amitElection: z.boolean().optional(),
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** Partnership schema (general, limited) */
const partnershipSchema = baseEntitySchema.extend({
  entityType: z.enum(['au-general-partnership', 'au-limited-partnership']),
  registration: z
    .object({
      abn: abnField,
      partnershipAgreementDate: z.string().optional().or(z.literal('')),
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** Venture Capital schema (VCLP, ESVCLP) */
const vcSchema = baseEntitySchema.extend({
  entityType: z.enum(['au-vclp', 'au-esvclp']),
  registration: z
    .object({
      abn: abnField,
      registeredWithInnovationAustralia: z.boolean().optional(),
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** Individual schema */
const individualSchema = baseEntitySchema.extend({
  entityType: z.literal('au-individual'),
  registration: z
    .object({
      tfn: z.string().optional().or(z.literal('')),
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
      taxRate: z.number().min(0).max(1).optional(),
    })
    .optional()
    .default({}),
});

/** Self-Managed Super Fund schema */
const smsfSchema = baseEntitySchema.extend({
  entityType: z.literal('au-smsf'),
  registration: z
    .object({
      abn: abnField,
      trustDeedDate: z.string().optional().or(z.literal('')),
      registeredWithAPRA: z.boolean().optional(),
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

// ─── UK schemas ─────────────────────────────────────────────────────────────

/** UK Company schema (Ltd, PLC) */
const ukCompanySchema = baseEntitySchema.extend({
  entityType: z.enum(['uk-ltd', 'uk-plc']),
  registration: z
    .object({
      companyNumber: ukCompanyNumberField,
      utr: utrField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      corporationTaxRate: z.number().min(0).max(1).optional(),
      smallProfitsRate: z.boolean().optional(),
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** UK LLP schema */
const ukLlpSchema = baseEntitySchema.extend({
  entityType: z.literal('uk-llp'),
  registration: z
    .object({
      companyNumber: ukCompanyNumberField,
      utr: utrField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** UK LP schema */
const ukLpSchema = baseEntitySchema.extend({
  entityType: z.literal('uk-lp'),
  registration: z
    .object({
      lpNumber: z.string().optional().or(z.literal('')),
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** UK GP schema */
const ukGpSchema = baseEntitySchema.extend({
  entityType: z.literal('uk-gp'),
  registration: z
    .object({
      utr: utrField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** UK Trust schema (unit trust, discretionary trust) */
const ukTrustSchema = baseEntitySchema.extend({
  entityType: z.enum(['uk-unit-trust', 'uk-discretionary-trust']),
  registration: z
    .object({
      utr: utrField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** UK Individual schema */
const ukIndividualSchema = baseEntitySchema.extend({
  entityType: z.literal('uk-individual'),
  registration: z
    .object({
      nino: ninoField,
      utr: utrField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      ihtRelevant: z.boolean().optional(),
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** UK Pension Scheme schema */
const ukPensionSchema = baseEntitySchema.extend({
  entityType: z.literal('uk-pension-scheme'),
  registration: z
    .object({
      hmrcReference: z.string().optional().or(z.literal('')),
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

// ─── US schemas ─────────────────────────────────────────────────────────────

/** US Corporation schema (C Corp, S Corp) */
const usCorpSchema = baseEntitySchema.extend({
  entityType: z.enum(['us-c-corp', 'us-s-corp']),
  registration: z
    .object({
      ein: einField,
      stateOfFormation: z.string().optional().or(z.literal('')),
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      sCorpElection: z.boolean().optional(),
      federalTaxRate: z.number().min(0).max(1).optional(),
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** US LLC schema (disregarded entity, partnership-taxed) */
const usLlcSchema = baseEntitySchema.extend({
  entityType: z.enum(['us-llc-disregarded', 'us-llc-partnership']),
  registration: z
    .object({
      ein: einField,
      stateOfFormation: z.string().optional().or(z.literal('')),
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      checkTheBoxElection: z.string().optional(),
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** US Partnership schema (GP, LP, LLLP) */
const usPartnershipSchema = baseEntitySchema.extend({
  entityType: z.enum(['us-gp', 'us-lp', 'us-lllp']),
  registration: z
    .object({
      ein: einField,
      stateOfFormation: z.string().optional().or(z.literal('')),
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** US Trust schema (grantor, non-grantor) */
const usTrustSchema = baseEntitySchema.extend({
  entityType: z.enum(['us-grantor-trust', 'us-non-grantor-trust']),
  registration: z
    .object({
      ein: einField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** US Individual schema */
const usIndividualSchema = baseEntitySchema.extend({
  entityType: z.literal('us-individual'),
  registration: z
    .object({
      ssn: ssnField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** US 501(c)(3) Tax-Exempt Organization schema */
const us501c3Schema = baseEntitySchema.extend({
  entityType: z.literal('us-501c3'),
  registration: z
    .object({
      ein: einField,
      stateOfFormation: z.string().optional().or(z.literal('')),
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

// ─── HK schemas ─────────────────────────────────────────────────────────────

/** HK Company schema (private, public) */
const hkCompanySchema = baseEntitySchema.extend({
  entityType: z.enum(['hk-private-co', 'hk-public-co']),
  registration: z
    .object({
      crNumber: hkCrNumberField,
      brn: hkBrnField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      twoTierProfitsTax: z.boolean().optional(),
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** HK Limited Partnership schema */
const hkLpSchema = baseEntitySchema.extend({
  entityType: z.literal('hk-lp'),
  registration: z
    .object({
      brn: hkBrnField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** HK Limited Partnership Fund schema */
const hkLpfSchema = baseEntitySchema.extend({
  entityType: z.literal('hk-lpf'),
  registration: z
    .object({
      brn: hkBrnField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** HK Open-Ended Fund Company schema */
const hkOfcSchema = baseEntitySchema.extend({
  entityType: z.literal('hk-ofc'),
  registration: z
    .object({
      brn: hkBrnField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** HK Individual schema */
const hkIndividualSchema = baseEntitySchema.extend({
  entityType: z.literal('hk-individual'),
  registration: z
    .object({
      hkid: hkidField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

// ─── SG schemas ─────────────────────────────────────────────────────────────

/** SG Company schema (Pte Ltd, Public Co) */
const sgCompanySchema = baseEntitySchema.extend({
  entityType: z.enum(['sg-pte-ltd', 'sg-public-co']),
  registration: z
    .object({
      uen: uenField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      partialTaxExemption: z.boolean().optional(),
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** SG Partnership schema (LP, LLP) */
const sgPartnershipSchema = baseEntitySchema.extend({
  entityType: z.enum(['sg-lp', 'sg-llp']),
  registration: z
    .object({
      uen: uenField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** SG Variable Capital Company schema */
const sgVccSchema = baseEntitySchema.extend({
  entityType: z.literal('sg-vcc'),
  registration: z
    .object({
      uen: uenField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      section13Election: z.string().optional(),
      vccSubFundStructure: z.boolean().optional(),
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** SG Unit Trust schema */
const sgUnitTrustSchema = baseEntitySchema.extend({
  entityType: z.literal('sg-unit-trust'),
  registration: z
    .object({
      uen: uenField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      section13Election: z.string().optional(),
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** SG Individual schema */
const sgIndividualSchema = baseEntitySchema.extend({
  entityType: z.literal('sg-individual'),
  registration: z
    .object({
      nric: nricField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

// ─── LU schemas ─────────────────────────────────────────────────────────────

/** LU Company schema (Sarl, SA) */
const luCompanySchema = baseEntitySchema.extend({
  entityType: z.enum(['lu-sarl', 'lu-sa']),
  registration: z
    .object({
      rcsNumber: rcsNumberField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      participationExemption: z.boolean().optional(),
      ipBoxElection: z.boolean().optional(),
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** LU Partnership schema (SCSp, SCS) */
const luPartnershipSchema = baseEntitySchema.extend({
  entityType: z.enum(['lu-scsp', 'lu-scs']),
  registration: z
    .object({
      rcsNumber: rcsNumberField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** LU Soparfi (Financial Holding Company) schema */
const luSoparfiSchema = baseEntitySchema.extend({
  entityType: z.literal('lu-soparfi'),
  registration: z
    .object({
      rcsNumber: rcsNumberField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      soparfiFlag: z.boolean().optional(),
      participationExemption: z.boolean().optional(),
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** LU Fund schema (SICAV, SICAR, SIF) */
const luFundSchema = baseEntitySchema.extend({
  entityType: z.enum(['lu-sicav', 'lu-sicar', 'lu-sif']),
  registration: z
    .object({
      rcsNumber: rcsNumberField,
      cssfApprovalNumber: z.string().optional().or(z.literal('')),
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      subscriptionTaxRate: z.number().min(0).max(1).optional(),
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** LU RAIF (Reserved Alternative Investment Fund) schema */
const luRaifSchema = baseEntitySchema.extend({
  entityType: z.literal('lu-raif'),
  registration: z
    .object({
      rcsNumber: rcsNumberField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

/** LU Individual schema */
const luIndividualSchema = baseEntitySchema.extend({
  entityType: z.literal('lu-individual'),
  registration: z
    .object({
      nationalId: luNationalIdField,
    })
    .optional()
    .default({}),
  taxStatus: z
    .object({
      taxResidency: z.string().optional(),
    })
    .optional()
    .default({}),
});

// ─── Schema map ─────────────────────────────────────────────────────────────

/** Schema map from entity type ID to Zod schema */
const schemaMap: Record<string, z.ZodType> = {
  // AU
  'au-pty-ltd': companySchema,
  'au-unit-trust': trustSchema,
  'au-discretionary-trust': trustSchema,
  'au-hybrid-trust': trustSchema,
  'au-mit': trustSchema,
  'au-general-partnership': partnershipSchema,
  'au-limited-partnership': partnershipSchema,
  'au-vclp': vcSchema,
  'au-esvclp': vcSchema,
  'au-individual': individualSchema,
  'au-smsf': smsfSchema,
  // UK
  'uk-ltd': ukCompanySchema,
  'uk-plc': ukCompanySchema,
  'uk-llp': ukLlpSchema,
  'uk-lp': ukLpSchema,
  'uk-gp': ukGpSchema,
  'uk-unit-trust': ukTrustSchema,
  'uk-discretionary-trust': ukTrustSchema,
  'uk-individual': ukIndividualSchema,
  'uk-pension-scheme': ukPensionSchema,
  // US
  'us-c-corp': usCorpSchema,
  'us-s-corp': usCorpSchema,
  'us-llc-disregarded': usLlcSchema,
  'us-llc-partnership': usLlcSchema,
  'us-gp': usPartnershipSchema,
  'us-lp': usPartnershipSchema,
  'us-lllp': usPartnershipSchema,
  'us-grantor-trust': usTrustSchema,
  'us-non-grantor-trust': usTrustSchema,
  'us-individual': usIndividualSchema,
  'us-501c3': us501c3Schema,
  // HK
  'hk-private-co': hkCompanySchema,
  'hk-public-co': hkCompanySchema,
  'hk-lp': hkLpSchema,
  'hk-lpf': hkLpfSchema,
  'hk-ofc': hkOfcSchema,
  'hk-individual': hkIndividualSchema,
  // SG
  'sg-pte-ltd': sgCompanySchema,
  'sg-public-co': sgCompanySchema,
  'sg-lp': sgPartnershipSchema,
  'sg-llp': sgPartnershipSchema,
  'sg-vcc': sgVccSchema,
  'sg-unit-trust': sgUnitTrustSchema,
  'sg-individual': sgIndividualSchema,
  // LU
  'lu-sarl': luCompanySchema,
  'lu-sa': luCompanySchema,
  'lu-scsp': luPartnershipSchema,
  'lu-scs': luPartnershipSchema,
  'lu-soparfi': luSoparfiSchema,
  'lu-sicav': luFundSchema,
  'lu-sicar': luFundSchema,
  'lu-sif': luFundSchema,
  'lu-raif': luRaifSchema,
  'lu-individual': luIndividualSchema,
};

/**
 * Get the Zod validation schema for a given entity type.
 * Falls back to baseEntitySchema for unknown types.
 */
export function getEntitySchema(entityType: string): z.ZodType {
  return schemaMap[entityType] ?? baseEntitySchema;
}
