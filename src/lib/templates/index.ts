/**
 * Template registry for pre-built tax structure patterns.
 *
 * Each template is a factory function that generates fresh nodes and edges
 * with unique IDs on every call (no collisions on repeated loads).
 */

import type { TaxNode, TaxEdge } from '@/models/graph';

/** Definition of a loadable structure template */
export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  entityCount: number;
  connectionCount: number;
  create: (baseX?: number, baseY?: number) => { nodes: TaxNode[]; edges: TaxEdge[] };
}

// Import all templates
import { vclpTemplate } from './vclp-structure';
import { familyTrustTemplate } from './family-trust';
import { mitForeignInvestorsTemplate } from './mit-foreign-investors';

/** All available templates */
export const templateRegistry: TemplateDefinition[] = [
  vclpTemplate,
  familyTrustTemplate,
  mitForeignInvestorsTemplate,
];
