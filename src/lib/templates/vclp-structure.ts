/**
 * Standard VCLP (Venture Capital Limited Partnership) structure template.
 *
 * 6 entities: 2 individual investors (LPs), GP Pty Ltd, Fund Manager Pty Ltd,
 * VCLP fund, Target Co Pty Ltd.
 * 5 connections: 2 partnership (LP), 1 partnership (GP), 1 management, 1 equity.
 */

import { nanoid } from 'nanoid';
import type { TaxNode, TaxEdge } from '@/models/graph';
import type { TemplateDefinition } from './index';
import { NODE_WIDTH, NODE_HEIGHT } from '@/lib/constants';
import { getDefaultRelationshipData } from '@/lib/validation/relationship-schemas';

export const vclpTemplate: TemplateDefinition = {
  id: 'vclp-structure',
  name: 'Standard VCLP Structure',
  description: 'Venture Capital Limited Partnership with GP, Fund Manager, two LPs, and a target company.',
  category: 'Venture Capital',
  entityCount: 6,
  connectionCount: 5,
  create: (baseX = 200, baseY = 100) => {
    const ids = {
      investor1: nanoid(),
      investor2: nanoid(),
      gp: nanoid(),
      fundManager: nanoid(),
      vclp: nanoid(),
      targetCo: nanoid(),
    };

    const makeNode = (
      id: string,
      entityType: string,
      name: string,
      x: number,
      y: number
    ): TaxNode => ({
      id,
      type: 'entity',
      position: { x: baseX + x, y: baseY + y },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      data: {
        entityType,
        name,
        jurisdiction: 'AU',
        jurisdictionFlag: '\u{1F1E6}\u{1F1FA}',
        registration: {},
        taxStatus: {},
        notes: '',
      },
    });

    const nodes: TaxNode[] = [
      makeNode(ids.investor1, 'au-individual', 'Investor 1', 0, 0),
      makeNode(ids.investor2, 'au-individual', 'Investor 2', 400, 0),
      makeNode(ids.gp, 'au-pty-ltd', 'GP Pty Ltd', 0, 200),
      makeNode(ids.fundManager, 'au-pty-ltd', 'Fund Manager Pty Ltd', 400, 200),
      makeNode(ids.vclp, 'au-vclp', 'Innovation Fund VCLP', 200, 400),
      makeNode(ids.targetCo, 'au-pty-ltd', 'Target Co Pty Ltd', 200, 600),
    ];

    const makeEdge = (
      source: string,
      target: string,
      type: Parameters<typeof getDefaultRelationshipData>[0],
      overrides?: Partial<TaxEdge['data']>
    ): TaxEdge => ({
      id: nanoid(),
      source,
      target,
      type: 'relationship',
      data: { ...getDefaultRelationshipData(type), ...overrides },
    });

    const edges: TaxEdge[] = [
      makeEdge(ids.investor1, ids.vclp, 'partnership', { label: 'Limited Partner' }),
      makeEdge(ids.investor2, ids.vclp, 'partnership', { label: 'Limited Partner' }),
      makeEdge(ids.gp, ids.vclp, 'partnership', { label: 'General Partner' }),
      makeEdge(ids.fundManager, ids.vclp, 'management', { label: 'Management' }),
      makeEdge(ids.vclp, ids.targetCo, 'equity', { label: 'Equity 100%', ownershipPercentage: 100 }),
    ];

    return { nodes, edges };
  },
};
