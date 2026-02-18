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

/** ABN validator reused across multiple entity types */
const abnField = z
  .string()
  .regex(/^\d{11}$/, 'ABN must be 11 digits')
  .optional()
  .or(z.literal(''));

/** Base schema common to all entity types */
const baseEntitySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  jurisdiction: z.string().min(2),
  notes: z.string().max(2000).optional().default(''),
  status: z.enum(['existing', 'proposed', 'removed']).optional(),
});

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

/** Schema map from entity type ID to Zod schema */
const schemaMap: Record<string, z.ZodType> = {
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
};

/**
 * Get the Zod validation schema for a given entity type.
 * Falls back to baseEntitySchema for unknown types.
 */
export function getEntitySchema(entityType: string): z.ZodType {
  return schemaMap[entityType] ?? baseEntitySchema;
}
