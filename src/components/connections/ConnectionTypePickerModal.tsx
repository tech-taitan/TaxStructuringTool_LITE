'use client';

/**
 * Modal for selecting a relationship type when creating a new connection.
 *
 * Displays all 8 relationship types in a 2-column grid layout organized
 * by category with colored borders, icons, and descriptions.
 * Supports Escape key and backdrop click to cancel.
 */

import { useEffect } from 'react';
import {
  Percent,
  DollarSign,
  Shield,
  Users,
  Handshake,
  FileText,
} from 'lucide-react';
import type { RelationshipType } from '@/models/relationships';

interface ConnectionTypePickerModalProps {
  onSelect: (type: RelationshipType) => void;
  onCancel: () => void;
}

/** Flat list of all relationship types for grid layout */
const RELATIONSHIP_TYPES = [
  {
    type: 'equity' as RelationshipType,
    name: 'Equity',
    description: 'Ownership / shareholding',
    color: '#2563EB',
    icon: Percent,
  },
  {
    type: 'debt' as RelationshipType,
    name: 'Debt',
    description: 'Loan / debt instrument',
    color: '#DC2626',
    icon: DollarSign,
  },
  {
    type: 'trustee' as RelationshipType,
    name: 'Trustee',
    description: 'Trust administration',
    color: '#7C3AED',
    icon: Shield,
  },
  {
    type: 'beneficiary' as RelationshipType,
    name: 'Beneficiary',
    description: 'Trust entitlement',
    color: '#7C3AED',
    icon: Users,
  },
  {
    type: 'partnership' as RelationshipType,
    name: 'Partnership',
    description: 'Partnership interest',
    color: '#059669',
    icon: Handshake,
  },
  {
    type: 'management' as RelationshipType,
    name: 'Management',
    description: 'Management agreement',
    color: '#6B7280',
    icon: FileText,
  },
  {
    type: 'services' as RelationshipType,
    name: 'Services',
    description: 'Service agreement',
    color: '#6B7280',
    icon: FileText,
  },
  {
    type: 'licensing' as RelationshipType,
    name: 'Licensing',
    description: 'Licensing agreement',
    color: '#6B7280',
    icon: FileText,
  },
];

export default function ConnectionTypePickerModal({
  onSelect,
  onCancel,
}: ConnectionTypePickerModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Select Connection Type
        </h2>

        {/* 2-column grid of relationship types */}
        <div className="grid grid-cols-2 gap-2">
          {RELATIONSHIP_TYPES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                onClick={() => onSelect(item.type)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-md border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-colors text-left group"
                style={{ borderLeftWidth: '3px', borderLeftColor: item.color }}
              >
                <Icon
                  className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-gray-600"
                  strokeWidth={1.5}
                />
                <div className="min-w-0">
                  <span className="block text-sm font-medium text-gray-900">
                    {item.name}
                  </span>
                  <span className="block text-[11px] text-gray-500 leading-tight">
                    {item.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Cancel button */}
        <div className="mt-3 flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
