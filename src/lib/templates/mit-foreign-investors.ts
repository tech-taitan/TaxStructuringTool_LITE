/**
 * MIT (Managed Investment Trust) with Foreign Investors template.
 *
 * 6 entities: Domestic Investor, 2 Foreign Investors, RE Pty Ltd (responsible entity),
 * Property Fund MIT, Asset Co Pty Ltd.
 * 5 connections: 1 trustee, 3 beneficiary (fixed), 1 equity.
 */

import { nanoid } from 'nanoid';
import type { TaxNode, TaxEdge } from '@/models/graph';
import type { TemplateDefinition } from './index';
import { NODE_WIDTH, NODE_HEIGHT } from '@/lib/constants';
import { getDefaultRelationshipData } from '@/lib/validation/relationship-schemas';

export const mitForeignInvestorsTemplate: TemplateDefinition = {
  id: 'mit-foreign-investors',
  name: 'MIT with Foreign Investors',
  description: 'Managed Investment Trust with domestic and foreign investors, responsible entity, and asset company.',
  category: 'Trust',
  entityCount: 6,
  connectionCount: 5,
  create: (baseX = 200, baseY = 100) => {
    const ids = {
      domesticInvestor: nanoid(),
      foreignInvestor1: nanoid(),
      foreignInvestor2: nanoid(),
      rePtyLtd: nanoid(),
      mit: nanoid(),
      assetCo: nanoid(),
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
      makeNode(ids.domesticInvestor, 'au-individual', 'Domestic Investor', 0, 0),
      makeNode(ids.foreignInvestor1, 'au-individual', 'Foreign Investor 1', 220, 0),
      makeNode(ids.foreignInvestor2, 'au-individual', 'Foreign Investor 2', 440, 0),
      makeNode(ids.rePtyLtd, 'au-pty-ltd', 'RE Pty Ltd', 0, 200),
      makeNode(ids.mit, 'au-mit', 'Property Fund MIT', 220, 400),
      makeNode(ids.assetCo, 'au-pty-ltd', 'Asset Co Pty Ltd', 220, 600),
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
      makeEdge(ids.rePtyLtd, ids.mit, 'trustee', { label: 'Trustee' }),
      makeEdge(ids.domesticInvestor, ids.mit, 'beneficiary', {
        label: 'Beneficiary',
        beneficiaryType: 'fixed',
      }),
      makeEdge(ids.foreignInvestor1, ids.mit, 'beneficiary', {
        label: 'Beneficiary',
        beneficiaryType: 'fixed',
      }),
      makeEdge(ids.foreignInvestor2, ids.mit, 'beneficiary', {
        label: 'Beneficiary',
        beneficiaryType: 'fixed',
      }),
      makeEdge(ids.mit, ids.assetCo, 'equity', {
        label: 'Equity 100%',
        ownershipPercentage: 100,
      }),
    ];

    return { nodes, edges };
  },
};
