'use client';

/**
 * Connection properties panel for viewing and editing relationship attributes.
 *
 * Right sidebar that opens when an edge is selected on the canvas.
 * Uses local form state with debounced auto-save -- changes are validated
 * and committed to the store automatically after a short delay.
 *
 * Key={edgeId} on the mount point forces re-mount when switching edges,
 * cleanly resetting local form state (same pattern as PropertiesPanel).
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Percent,
  DollarSign,
  Shield,
  Users,
  Handshake,
  FileText,
  ArrowRight,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { useGraphStore } from '@/stores/graph-store';
import { getRelationshipSchema, getDefaultRelationshipData } from '@/lib/validation/relationship-schemas';
import type { RelationshipType, TaxRelationshipData } from '@/models/relationships';

interface ConnectionPropertiesPanelProps {
  edgeId: string;
}

/** Zod issue shape (compatible with Zod v4) */
interface ValidationIssue {
  path: (string | number)[];
  message: string;
}

/** Edge color mapping by relationship type (mirrors RelationshipEdge) */
const EDGE_COLORS: Record<RelationshipType, string> = {
  equity: '#2563EB',
  debt: '#DC2626',
  trustee: '#7C3AED',
  beneficiary: '#7C3AED',
  partnership: '#059669',
  management: '#6B7280',
  services: '#6B7280',
  licensing: '#6B7280',
};

/** Relationship type display configuration */
const RELATIONSHIP_TYPE_OPTIONS: {
  value: RelationshipType;
  label: string;
  icon: typeof Percent;
}[] = [
  { value: 'equity', label: 'Equity', icon: Percent },
  { value: 'debt', label: 'Debt', icon: DollarSign },
  { value: 'trustee', label: 'Trustee', icon: Shield },
  { value: 'beneficiary', label: 'Beneficiary', icon: Users },
  { value: 'partnership', label: 'Partnership', icon: Handshake },
  { value: 'management', label: 'Management', icon: FileText },
  { value: 'services', label: 'Services', icon: FileText },
  { value: 'licensing', label: 'Licensing', icon: FileText },
];

/** Convert a Zod error path to a human-readable field label */
function pathToLabel(path: (string | number)[]): string {
  const labelMap: Record<string, string> = {
    label: 'Label',
    ownershipPercentage: 'Ownership %',
    shareClass: 'Share Class',
    principal: 'Principal',
    interestRate: 'Interest Rate',
    maturityDate: 'Maturity Date',
    secured: 'Secured',
    beneficiaryType: 'Beneficiary Type',
    notes: 'Notes',
    relationshipType: 'Relationship Type',
  };
  const key = path.join('.');
  return labelMap[key] ?? path[path.length - 1]?.toString() ?? 'Unknown field';
}

/** Auto-save debounce delay in ms */
const AUTO_SAVE_DELAY = 400;

export default function ConnectionPropertiesPanel({ edgeId }: ConnectionPropertiesPanelProps) {
  const edge = useGraphStore((s) => s.edges.find((e) => e.id === edgeId));
  const updateEdgeData = useGraphStore((s) => s.updateEdgeData);
  const nodes = useGraphStore((s) => s.nodes);

  // Local form state -- initialized from edge data, edited locally
  const [formData, setFormData] = useState<TaxRelationshipData>(() => ({
    ...(edge?.data ?? { relationshipType: 'equity' as RelationshipType, label: 'Equity', notes: '' }),
  }));

  const [errors, setErrors] = useState<ValidationIssue[]>([]);
  const [typeChanged, setTypeChanged] = useState(false);
  const [notesTab, setNotesTab] = useState<'edit' | 'preview'>('edit');
  const isInitialMount = useRef(true);

  // Debounced auto-save: validate and commit on every form change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      // Guard against edge deletion while panel is open
      const currentEdge = useGraphStore.getState().edges.find((e) => e.id === edgeId);
      if (!currentEdge) return;

      const schema = getRelationshipSchema(formData.relationshipType);
      const result = schema.safeParse(formData);
      if (result.success) {
        setErrors([]);
        updateEdgeData(edgeId, formData);
      } else {
        setErrors(result.error!.issues as ValidationIssue[]);
      }
    }, AUTO_SAVE_DELAY);
    return () => clearTimeout(timer);
  }, [formData, edgeId, updateEdgeData]);

  // Form change handler
  const handleChange = useCallback((updates: Partial<TaxRelationshipData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Relationship type change handler -- clears type-specific fields, preserves notes + pathOffset
  const handleTypeChange = useCallback((newType: RelationshipType) => {
    setFormData((prev) => {
      const defaults = getDefaultRelationshipData(newType);
      return {
        ...defaults,
        notes: prev.notes ?? '',
        label: defaults.label,
        pathOffset: prev.pathOffset,
      };
    });
    setErrors([]);
    setTypeChanged(true);
    setTimeout(() => setTypeChanged(false), 1500);
  }, []);

  if (!edge) return null;

  // Look up source and target entity names
  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);
  const sourceName = sourceNode?.data.name ?? 'Unknown';
  const targetName = targetNode?.data.name ?? 'Unknown';

  const edgeColor = EDGE_COLORS[formData.relationshipType] ?? '#6B7280';

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 overflow-hidden">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Connection Properties
          </h2>

          {/* Mini preview: colored line indicator */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="h-1 w-8 rounded-full"
              style={{ backgroundColor: edgeColor }}
            />
            <span className="text-sm font-medium text-gray-700">
              {formData.relationshipType.charAt(0).toUpperCase() + formData.relationshipType.slice(1)}
            </span>
          </div>

          {/* Source -> Target display */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <span className="font-medium text-gray-700 truncate max-w-[100px]" title={sourceName}>
              {sourceName}
            </span>
            <ArrowRight className="w-3 h-3 flex-shrink-0" />
            <span className="font-medium text-gray-700 truncate max-w-[100px]" title={targetName}>
              {targetName}
            </span>
          </div>
        </div>

        {/* Error summary */}
        {errors.length > 0 && (
          <div className="px-4">
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-semibold">
                  {errors.length} validation {errors.length === 1 ? 'error' : 'errors'}
                </span>
              </div>
              <ul className="space-y-1">
                {errors.map((error, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium">{pathToLabel(error.path)}</span>: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Relationship type selector */}
        <div className="px-4 py-3 border-t border-gray-100">
          <label htmlFor="relationshipType" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Relationship Type
          </label>
          <select
            id="relationshipType"
            value={formData.relationshipType}
            onChange={(e) => handleTypeChange(e.target.value as RelationshipType)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {RELATIONSHIP_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {typeChanged && (
            <p className="text-xs text-amber-600 mt-1">
              Type changed -- fields updated to match new type.
            </p>
          )}
        </div>

        {/* Type-conditional form sections */}
        {formData.relationshipType === 'equity' && (
          <div className="px-4 py-3 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5" />
              Equity Details
            </h3>

            {/* Ownership percentage */}
            <div className="mb-3">
              <label htmlFor="ownershipPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                Ownership Percentage
              </label>
              <div className="relative">
                <input
                  id="ownershipPercentage"
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={formData.ownershipPercentage ?? ''}
                  onChange={(e) =>
                    handleChange({ ownershipPercentage: e.target.value === '' ? undefined : Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
              </div>
            </div>

            {/* Share class */}
            <div>
              <label htmlFor="shareClass" className="block text-sm font-medium text-gray-700 mb-1">
                Share Class
              </label>
              <select
                id="shareClass"
                value={formData.shareClass ?? ''}
                onChange={(e) =>
                  handleChange({
                    shareClass: (e.target.value || undefined) as TaxRelationshipData['shareClass'],
                  })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select --</option>
                <option value="ordinary">Ordinary</option>
                <option value="preference">Preference</option>
                <option value="redeemable">Redeemable</option>
              </select>
            </div>
          </div>
        )}

        {formData.relationshipType === 'debt' && (
          <div className="px-4 py-3 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Debt Details
            </h3>

            {/* Principal */}
            <div className="mb-3">
              <label htmlFor="principal" className="block text-sm font-medium text-gray-700 mb-1">
                Principal Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                <input
                  id="principal"
                  type="number"
                  min={0}
                  step={1000}
                  value={formData.principal ?? ''}
                  onChange={(e) =>
                    handleChange({ principal: e.target.value === '' ? undefined : Number(e.target.value) })
                  }
                  className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Interest rate */}
            <div className="mb-3">
              <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate (annual)
              </label>
              <div className="relative">
                <input
                  id="interestRate"
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={formData.interestRate != null ? (formData.interestRate * 100).toFixed(1) : ''}
                  onChange={(e) =>
                    handleChange({
                      interestRate: e.target.value === '' ? undefined : Number(e.target.value) / 100,
                    })
                  }
                  className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5.0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
              </div>
            </div>

            {/* Maturity date */}
            <div className="mb-3">
              <label htmlFor="maturityDate" className="block text-sm font-medium text-gray-700 mb-1">
                Maturity Date
              </label>
              <input
                id="maturityDate"
                type="date"
                value={formData.maturityDate ?? ''}
                onChange={(e) => handleChange({ maturityDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Secured checkbox */}
            <div className="flex items-center gap-2">
              <input
                id="secured"
                type="checkbox"
                checked={formData.secured ?? false}
                onChange={(e) => handleChange({ secured: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="secured" className="text-sm font-medium text-gray-700">
                Secured
              </label>
            </div>
          </div>
        )}

        {formData.relationshipType === 'beneficiary' && (
          <div className="px-4 py-3 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Beneficiary Details
            </h3>

            <div>
              <label htmlFor="beneficiaryType" className="block text-sm font-medium text-gray-700 mb-1">
                Beneficiary Type
              </label>
              <select
                id="beneficiaryType"
                value={formData.beneficiaryType ?? ''}
                onChange={(e) =>
                  handleChange({
                    beneficiaryType: (e.target.value || undefined) as TaxRelationshipData['beneficiaryType'],
                  })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select --</option>
                <option value="fixed">Fixed</option>
                <option value="discretionary">Discretionary</option>
              </select>
            </div>
          </div>
        )}

        {/* Label field (all types) */}
        <div className="px-4 py-3 border-t border-gray-100">
          <label htmlFor="connectionLabel" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Label
          </label>
          <input
            id="connectionLabel"
            type="text"
            value={formData.label ?? ''}
            onChange={(e) => handleChange({ label: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Connection label"
          />
        </div>

        {/* Notes section (all types) */}
        <div className="px-4 py-3 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Notes
          </label>

          {/* Edit / Preview tabs */}
          <div className="flex gap-1 border-b border-gray-200 mb-2">
            <button
              type="button"
              onClick={() => setNotesTab('edit')}
              className={`px-3 py-1 text-xs font-medium rounded-t transition-colors ${
                notesTab === 'edit'
                  ? 'text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setNotesTab('preview')}
              className={`px-3 py-1 text-xs font-medium rounded-t transition-colors ${
                notesTab === 'preview'
                  ? 'text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Preview
            </button>
          </div>

          {notesTab === 'edit' ? (
            <textarea
              id="connectionNotes"
              value={formData.notes ?? ''}
              onChange={(e) => handleChange({ notes: e.target.value })}
              maxLength={2000}
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
              placeholder="Add notes about this connection..."
            />
          ) : (
            <div className="prose prose-sm max-w-none min-h-[6rem] px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 overflow-y-auto">
              {formData.notes ? (
                <Markdown>{formData.notes}</Markdown>
              ) : (
                <p className="text-gray-400 italic">No notes</p>
              )}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-1 text-right">
            {(formData.notes?.length ?? 0).toLocaleString()} / 2,000
          </p>
        </div>
      </div>
    </div>
  );
}
