/**
 * Pure graph validation engine for detecting invalid tax structure configurations.
 *
 * Zero store dependencies -- only imports types. Validates the graph topology
 * and returns an array of warnings/errors for affected nodes.
 *
 * Rules:
 *   1. Trust without trustee (warning)
 *   2. Circular ownership (error)
 *   3. Partnership without partners (warning)
 *   4. Equity exceeds 100% (error)
 *   5. Equity doesn't sum to 100% (info)
 *   6. SMSF member limit exceeded (warning)
 *   7. Trust without beneficiary (info)
 */

import type { TaxNode, TaxEdge } from '@/models/graph';

/** A validation warning or error associated with a specific node */
export interface ValidationWarning {
  nodeId: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

/** Trust entity types that require a trustee connection */
const TRUST_TYPES = new Set([
  'au-unit-trust',
  'au-discretionary-trust',
  'au-hybrid-trust',
  'au-mit',
  'au-smsf',
]);

/** Partnership/VC entity types that require partners or investors */
const PARTNERSHIP_TYPES = new Set([
  'au-general-partnership',
  'au-limited-partnership',
  'au-vclp',
  'au-esvclp',
]);

/**
 * Validate a graph of tax entities and relationships.
 *
 * Pure function with no side effects -- takes nodes and edges, returns warnings.
 *
 * @param nodes - All entity nodes on the canvas
 * @param edges - All relationship edges between entities
 * @returns Array of validation warnings/errors for affected nodes
 */
export function validateGraph(
  nodes: TaxNode[],
  edges: TaxEdge[]
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Rule 1: Trust without trustee
  for (const node of nodes) {
    if (TRUST_TYPES.has(node.data.entityType)) {
      const hasTrustee = edges.some(
        (e) => e.target === node.id && e.data?.relationshipType === 'trustee'
      );
      if (!hasTrustee) {
        warnings.push({
          nodeId: node.id,
          message: 'Trust has no trustee connection',
          severity: 'warning',
        });
      }
    }
  }

  // Rule 2: Circular ownership (DFS cycle detection on equity edges)
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    if (edge.data?.relationshipType === 'equity') {
      const targets = adjacency.get(edge.source) ?? [];
      targets.push(edge.target);
      adjacency.set(edge.source, targets);
    }
  }

  const visited = new Set<string>();
  const inStack = new Set<string>();
  const cycleNodes = new Set<string>();

  function dfs(nodeId: string, path: string[]): void {
    visited.add(nodeId);
    inStack.add(nodeId);
    path.push(nodeId);

    const neighbors = adjacency.get(nodeId) ?? [];
    for (const neighbor of neighbors) {
      if (inStack.has(neighbor)) {
        // Found a cycle -- mark all nodes in the cycle path
        const cycleStart = path.indexOf(neighbor);
        for (let i = cycleStart; i < path.length; i++) {
          cycleNodes.add(path[i]);
        }
      } else if (!visited.has(neighbor)) {
        dfs(neighbor, path);
      }
    }

    path.pop();
    inStack.delete(nodeId);
  }

  // Run DFS from all nodes that have outgoing equity edges
  const allNodeIds = new Set(nodes.map((n) => n.id));
  for (const nodeId of allNodeIds) {
    if (!visited.has(nodeId)) {
      dfs(nodeId, []);
    }
  }

  for (const nodeId of cycleNodes) {
    warnings.push({
      nodeId,
      message: 'Circular ownership detected',
      severity: 'error',
    });
  }

  // Rule 3: Partnership without partners
  for (const node of nodes) {
    if (PARTNERSHIP_TYPES.has(node.data.entityType)) {
      const hasPartners = edges.some(
        (e) =>
          e.target === node.id &&
          (e.data?.relationshipType === 'equity' ||
            e.data?.relationshipType === 'partnership')
      );
      if (!hasPartners) {
        warnings.push({
          nodeId: node.id,
          message: 'Partnership has no partners/investors',
          severity: 'warning',
        });
      }
    }
  }

  // Rule 4: Equity exceeds 100%
  const equityByTarget = new Map<string, number>();
  for (const edge of edges) {
    if (
      edge.data?.relationshipType === 'equity' &&
      edge.data.ownershipPercentage != null
    ) {
      const current = equityByTarget.get(edge.target) ?? 0;
      equityByTarget.set(edge.target, current + edge.data.ownershipPercentage);
    }
  }

  for (const [targetId, total] of equityByTarget) {
    if (total > 100) {
      warnings.push({
        nodeId: targetId,
        message: `Total equity ownership is ${total}% (exceeds 100%)`,
        severity: 'error',
      });
    }
  }

  // Rule 5: Equity doesn't sum to 100% (info -- non-zero but under 100%)
  for (const [targetId, total] of equityByTarget) {
    if (total > 0 && total < 100) {
      warnings.push({
        nodeId: targetId,
        message: `Equity ownership totals ${total}% (not 100%)`,
        severity: 'info',
      });
    }
  }

  // Rule 6: SMSF member limit (max 6 beneficiaries)
  for (const node of nodes) {
    if (node.data.entityType === 'au-smsf') {
      const beneficiaryCount = edges.filter(
        (e) => e.target === node.id && e.data?.relationshipType === 'beneficiary'
      ).length;
      if (beneficiaryCount > 6) {
        warnings.push({
          nodeId: node.id,
          message: `SMSF has ${beneficiaryCount} members (maximum is 6)`,
          severity: 'warning',
        });
      }
    }
  }

  // Rule 7: Trust without beneficiary (info -- trust has trustee but no beneficiaries)
  for (const node of nodes) {
    if (TRUST_TYPES.has(node.data.entityType)) {
      const hasTrustee = edges.some(
        (e) => e.target === node.id && e.data?.relationshipType === 'trustee'
      );
      const hasBeneficiary = edges.some(
        (e) => e.target === node.id && e.data?.relationshipType === 'beneficiary'
      );
      if (hasTrustee && !hasBeneficiary) {
        warnings.push({
          nodeId: node.id,
          message: 'Trust has a trustee but no beneficiaries',
          severity: 'info',
        });
      }
    }
  }

  return warnings;
}
