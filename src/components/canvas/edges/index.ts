import type { EdgeTypes } from '@xyflow/react';
import RelationshipEdge from './RelationshipEdge';

/**
 * Edge type registry for React Flow.
 *
 * Maps the 'relationship' type string to the RelationshipEdge component.
 * When an edge has `type: 'relationship'`, React Flow renders it
 * using the RelationshipEdge component with multigraph offset support.
 */
export const edgeTypes: EdgeTypes = {
  relationship: RelationshipEdge,
};
