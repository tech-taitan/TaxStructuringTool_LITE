/**
 * Shared relationship type configuration data.
 *
 * Defines the 8 relationship types with their display metadata (name, description,
 * color, icon). Used by both the desktop ConnectionTypePickerModal and the mobile
 * MobileConnectionTypePicker to keep them in sync.
 */

import {
  Percent,
  DollarSign,
  Shield,
  Users,
  Handshake,
  FileText,
} from 'lucide-react';
import type { RelationshipType } from '@/models/relationships';

export interface RelationshipTypeConfig {
  type: RelationshipType;
  name: string;
  description: string;
  color: string;
  icon: typeof Percent;
}

/** Flat list of all relationship types with display metadata */
export const RELATIONSHIP_TYPES: RelationshipTypeConfig[] = [
  {
    type: 'equity',
    name: 'Equity',
    description: 'Ownership / shareholding',
    color: '#2563EB',
    icon: Percent,
  },
  {
    type: 'debt',
    name: 'Debt',
    description: 'Loan / debt instrument',
    color: '#DC2626',
    icon: DollarSign,
  },
  {
    type: 'trustee',
    name: 'Trustee',
    description: 'Trust administration',
    color: '#7C3AED',
    icon: Shield,
  },
  {
    type: 'beneficiary',
    name: 'Beneficiary',
    description: 'Trust entitlement',
    color: '#7C3AED',
    icon: Users,
  },
  {
    type: 'partnership',
    name: 'Partnership',
    description: 'Partnership interest',
    color: '#059669',
    icon: Handshake,
  },
  {
    type: 'management',
    name: 'Management',
    description: 'Management agreement',
    color: '#6B7280',
    icon: FileText,
  },
  {
    type: 'services',
    name: 'Services',
    description: 'Service agreement',
    color: '#6B7280',
    icon: FileText,
  },
  {
    type: 'licensing',
    name: 'Licensing',
    description: 'Licensing agreement',
    color: '#6B7280',
    icon: FileText,
  },
];
