/**
 * Family Trust with Corporate Beneficiary template.
 *
 * 5 entities: Settlor (individual), Trustee Co Pty Ltd, Smith Family Trust
 * (discretionary), John Smith (individual), Smith Corp Pty Ltd (bucket company).
 * 4 connections: trustee, 2 beneficiary, 1 equity.
 */

import { nanoid } from 'nanoid';
import type { TaxNode, TaxEdge } from '@/models/graph';
import type { TemplateDefinition } from './index';
import { NODE_WIDTH, NODE_HEIGHT } from '@/lib/constants';
import { getDefaultRelationshipData } from '@/lib/validation/relationship-schemas';

export const familyTrustTemplate: TemplateDefinition = {
  id: 'family-trust',
  name: 'Family Trust with Corporate Beneficiary',
  description: 'Discretionary trust with individual and corporate beneficiaries, plus trustee company.',
  category: 'Trust',
  entityCount: 5,
  connectionCount: 4,
  create: (baseX = 200, baseY = 100) => {
    const ids = {
      settlor: nanoid(),
      trusteeCo: nanoid(),
      familyTrust: nanoid(),
      johnSmith: nanoid(),
      smithCorp: nanoid(),
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
      makeNode(ids.settlor, 'au-individual', 'Settlor', 0, 0),
      makeNode(ids.johnSmith, 'au-individual', 'John Smith', 400, 0),
      makeNode(ids.trusteeCo, 'au-pty-ltd', 'Trustee Co Pty Ltd', 100, 200),
      makeNode(ids.smithCorp, 'au-pty-ltd', 'Smith Corp Pty Ltd', 400, 200),
      makeNode(ids.familyTrust, 'au-discretionary-trust', 'Smith Family Trust', 200, 400),
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
      makeEdge(ids.trusteeCo, ids.familyTrust, 'trustee', { label: 'Trustee' }),
      makeEdge(ids.johnSmith, ids.familyTrust, 'beneficiary', {
        label: 'Beneficiary',
        beneficiaryType: 'discretionary',
      }),
      makeEdge(ids.smithCorp, ids.familyTrust, 'beneficiary', {
        label: 'Beneficiary',
        beneficiaryType: 'discretionary',
      }),
      makeEdge(ids.johnSmith, ids.trusteeCo, 'equity', {
        label: 'Equity 100%',
        ownershipPercentage: 100,
      }),
    ];

    return { nodes, edges };
  },
};
