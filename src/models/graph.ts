/**
 * Core graph types for the labeled multigraph data model.
 *
 * Extends React Flow's Node and Edge types with tax-specific data.
 * GraphSnapshot provides the serialization format for save/load.
 */

import type { Node, Edge } from '@xyflow/react';
import type { TaxRelationshipData } from './relationships';
import type { EntityShape } from './entities';

export type { RelationshipType, TaxRelationshipData } from './relationships';

/** Data carried by each entity node on the canvas */
export interface TaxEntityData extends Record<string, unknown> {
  /** Entity type ID from the registry, e.g. 'au-pty-ltd' */
  entityType: string;
  /** User-assigned entity name */
  name: string;
  /** Optional shape override (defaults to entity type's shape from registry) */
  shapeOverride?: EntityShape;
  /** Entity status for step-plan or restructuring visualization */
  status?: 'existing' | 'proposed' | 'removed';
  /** Jurisdiction code, e.g. 'AU' */
  jurisdiction: string;
  /** Emoji flag for display, e.g. flag for AU */
  jurisdictionFlag: string;

  /** Registration details */
  registration: {
    abn?: string;
    acn?: string;
    tfn?: string;
    trustDeedDate?: string;
    partnershipAgreementDate?: string;
    registeredWithInnovationAustralia?: boolean;
    registeredWithAPRA?: boolean;
  };

  /** Tax status fields */
  taxStatus: {
    baseRateEntity?: boolean;
    mitElection?: boolean;
    amitElection?: boolean;
    taxResidency?: string;
    taxRate?: number;
  };

  /** Free-form user notes */
  notes: string;

  /** Key metrics displayed on the entity node */
  metrics?: {
    ownershipPercent?: number;
    taxRate?: number;
  };

  /** Validation errors to display as warnings */
  validationErrors?: string[];
}

/** A tax entity node on the canvas */
export type TaxNode = Node<TaxEntityData>;

/** A relationship edge between two entities */
export type TaxEdge = Edge<TaxRelationshipData>;

/** Complete graph state for serialization (save/load) */
export interface GraphSnapshot {
  nodes: TaxNode[];
  edges: TaxEdge[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  metadata: {
    jurisdiction: string;
    createdAt: string;
    updatedAt: string;
  };
}
