/**
 * Entity type configuration and category definitions.
 *
 * Defines the shape language for visual entity rendering and
 * the configuration interface for the entity type registry.
 */

/** Entity categories matching tax entity classifications */
export type EntityCategory =
  | 'company'
  | 'trust'
  | 'partnership'
  | 'vc'
  | 'individual'
  | 'smsf'
  | 'fund'
  | 'holding'
  | 'pension';

/** Visual shapes used to render entity nodes on the canvas */
export type EntityShape =
  | 'rectangle'
  | 'rounded'
  | 'triangle'
  | 'oval'
  | 'diamond'
  | 'hexagon'
  | 'person'
  | 'shield';

/** Configuration for a single entity type in the registry */
export interface EntityTypeConfig {
  /** Unique identifier, e.g. 'au-pty-ltd' */
  id: string;
  /** Jurisdiction code, e.g. 'AU' */
  jurisdiction: string;
  /** Entity category for grouping and filtering */
  category: EntityCategory;
  /** Full display name, e.g. 'Pty Ltd Company' */
  displayName: string;
  /** Short label for compact display, e.g. 'Pty Ltd' */
  shortName: string;
  /** Plain-English description for non-expert users */
  description: string;
  /** Visual shape on the canvas */
  shape: EntityShape;
  /** Lucide icon name for the entity type */
  icon: string;
  /** Primary color hex value from the corporate blue palette */
  color: string;
  /** Default data fields for new entities of this type */
  defaultData: Record<string, unknown>;
}
