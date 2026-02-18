/**
 * Zod validation schemas for each relationship type.
 *
 * Provides per-relationship-type field validation using Zod v4.
 * Each schema extends a base schema with type-specific fields
 * (equity terms, debt terms, beneficiary type, etc.).
 *
 * Also exports getDefaultRelationshipData() for creating new
 * connections with sensible defaults.
 *
 * @module relationship-schemas
 */

import { z } from 'zod';
import type { RelationshipType, TaxRelationshipData } from '@/models/relationships';

/** Base schema common to all relationship types */
const baseRelationshipSchema = z.object({
  relationshipType: z.enum([
    'equity',
    'debt',
    'trustee',
    'beneficiary',
    'partnership',
    'management',
    'services',
    'licensing',
  ]),
  label: z.string().min(1, 'Label is required'),
  notes: z.string().max(2000).optional().default(''),
  pathOffset: z.number().optional(),
  pathStyle: z.enum(['smoothstep', 'straight']).optional(),
});

/** Equity (ownership/shareholding) relationship schema */
const equitySchema = baseRelationshipSchema.extend({
  relationshipType: z.literal('equity'),
  ownershipPercentage: z.number().min(0, 'Min 0%').max(100, 'Max 100%'),
  shareClass: z.enum(['ordinary', 'preference', 'redeemable']).optional(),
});

/** Debt (loan/debt instrument) relationship schema */
const debtSchema = baseRelationshipSchema.extend({
  relationshipType: z.literal('debt'),
  principal: z.number().min(0, 'Principal must be positive'),
  interestRate: z.number().min(0).max(1, 'Rate must be 0-100%').optional(),
  maturityDate: z.string().optional().or(z.literal('')),
  secured: z.boolean().optional(),
});

/** Trustee relationship schema */
const trusteeSchema = baseRelationshipSchema.extend({
  relationshipType: z.literal('trustee'),
});

/** Beneficiary relationship schema */
const beneficiarySchema = baseRelationshipSchema.extend({
  relationshipType: z.literal('beneficiary'),
  beneficiaryType: z.enum(['fixed', 'discretionary']).optional(),
});

/** Partnership relationship schema */
const partnershipRelSchema = baseRelationshipSchema.extend({
  relationshipType: z.literal('partnership'),
});

/** Agreement relationship schema (management, services, licensing) */
const agreementSchema = baseRelationshipSchema.extend({
  relationshipType: z.enum(['management', 'services', 'licensing']),
});

/** Schema map from relationship type to Zod schema */
const schemaMap: Record<RelationshipType, z.ZodType> = {
  equity: equitySchema,
  debt: debtSchema,
  trustee: trusteeSchema,
  beneficiary: beneficiarySchema,
  partnership: partnershipRelSchema,
  management: agreementSchema,
  services: agreementSchema,
  licensing: agreementSchema,
};

/**
 * Get the Zod validation schema for a given relationship type.
 * Falls back to baseRelationshipSchema for unknown types.
 */
export function getRelationshipSchema(type: RelationshipType): z.ZodType {
  return schemaMap[type] ?? baseRelationshipSchema;
}

/**
 * Get sensible default relationship data for a given type.
 * Used when creating a new connection via the type picker modal.
 */
export function getDefaultRelationshipData(
  type: RelationshipType
): TaxRelationshipData {
  const label =
    type.charAt(0).toUpperCase() + type.slice(1);

  const base: TaxRelationshipData = {
    relationshipType: type,
    label,
    notes: '',
  };

  switch (type) {
    case 'equity':
      return {
        ...base,
        ownershipPercentage: 100,
        shareClass: 'ordinary',
      };
    case 'debt':
      return {
        ...base,
        principal: 0,
        interestRate: 0.05,
        secured: false,
      };
    case 'beneficiary':
      return {
        ...base,
        beneficiaryType: 'discretionary',
      };
    case 'trustee':
    case 'partnership':
    case 'management':
    case 'services':
    case 'licensing':
    default:
      return base;
  }
}
