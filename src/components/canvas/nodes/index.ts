import type { NodeTypes } from '@xyflow/react';
import EntityNode from './EntityNode';

/**
 * Node type registry for React Flow.
 *
 * Maps the 'entity' type string to the EntityNode component.
 * When a node has `type: 'entity'`, React Flow renders it
 * using the EntityNode component.
 */
export const nodeTypes: NodeTypes = {
  entity: EntityNode,
};
