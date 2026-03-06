import { z } from 'zod';
import type { GraphSnapshot } from '@/models/graph';

const relationshipTypeSchema = z.enum([
  'equity',
  'debt',
  'trustee',
  'beneficiary',
  'partnership',
  'management',
  'services',
  'licensing',
]);

const taxEntityDataSchema = z
  .object({
    entityType: z.string().min(1),
    name: z.string().min(1).max(100),
    jurisdiction: z.string().min(2),
    jurisdictionFlag: z.string().default(''),
    registration: z.record(z.string(), z.unknown()).optional().default({}),
    taxStatus: z.record(z.string(), z.unknown()).optional().default({}),
    notes: z.string().max(2000).optional().default(''),
  })
  .passthrough();

const taxRelationshipDataSchema = z
  .object({
    relationshipType: relationshipTypeSchema,
    label: z.string().min(1),
    notes: z.string().max(2000).optional().default(''),
    ownershipPercentage: z.number().min(0).max(100).optional(),
    interestRate: z.number().min(0).max(1).optional(),
    principal: z.number().min(0).optional(),
    pathOffset: z.number().finite().optional(),
    pathStyle: z.enum(['smoothstep', 'straight']).optional(),

    // Cross-border fields
    withholdingTaxRate: z.number().min(0).max(100).optional(),
    paymentType: z.enum([
      'dividend', 'interest', 'royalty',
      'service-fee', 'management-fee', 'license-fee',
    ]).optional(),
    treatyApplies: z.boolean().optional(),
    treatyName: z.string().max(200).optional(),
    currencyCode: z.string().min(3).max(3).optional(),
    transferPricingRelevant: z.boolean().optional(),
  })
  .passthrough();

const taxNodeSchema = z
  .object({
    id: z.string().min(1),
    position: z.object({
      x: z.number().finite(),
      y: z.number().finite(),
    }),
    data: taxEntityDataSchema,
  })
  .passthrough();

const taxEdgeSchema = z
  .object({
    id: z.string().min(1),
    source: z.string().min(1),
    target: z.string().min(1),
    data: taxRelationshipDataSchema,
  })
  .passthrough();

const graphSnapshotSchema = z.object({
  nodes: z.array(taxNodeSchema),
  edges: z.array(taxEdgeSchema),
  viewport: z.object({
    x: z.number().finite(),
    y: z.number().finite(),
    zoom: z.number().positive(),
  }),
  metadata: z.object({
    jurisdiction: z.string().min(2),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  }),
});

const storedStructureSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1).max(120),
    graph_data: graphSnapshotSchema,
    thumbnail: z.string().nullable(),
    created_at: z.string().min(1),
    updated_at: z.string().min(1),
  })
  .passthrough();

export interface ValidStoredStructure {
  id: string;
  name: string;
  graph_data: GraphSnapshot;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

export function parseGraphSnapshot(input: unknown): GraphSnapshot | null {
  const result = graphSnapshotSchema.safeParse(input);
  return result.success ? (result.data as GraphSnapshot) : null;
}

export function parseStoredStructure(input: unknown): ValidStoredStructure | null {
  const result = storedStructureSchema.safeParse(input);
  return result.success ? (result.data as ValidStoredStructure) : null;
}

export function parseStoredStructureMap(
  input: unknown
): Record<string, ValidStoredStructure> {
  const result = z.record(z.string(), z.unknown()).safeParse(input);
  if (!result.success) return {};

  const validated: Record<string, ValidStoredStructure> = {};

  for (const [key, value] of Object.entries(result.data)) {
    const structure = parseStoredStructure(value);
    if (structure && structure.id === key) {
      validated[key] = structure;
    }
  }

  return validated;
}
