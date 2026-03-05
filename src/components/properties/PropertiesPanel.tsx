'use client';

/**
 * Main properties panel container for viewing and editing entity attributes.
 *
 * Right sidebar that opens when an entity is selected on the canvas.
 * Uses local form state with debounced auto-save -- changes are validated
 * and committed to the store automatically after a short delay.
 *
 * Key={nodeId} on the mount point forces re-mount when switching entities,
 * cleanly resetting local form state (per research pitfall #7).
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useGraphStore } from '@/stores/graph-store';
import { getEntitySchema } from '@/lib/validation/entity-schemas';
import { getEntityConfig } from '@/lib/entity-registry';
import type { TaxEntityData } from '@/models/graph';

import EntityPreview from './EntityPreview';
import ErrorSummary from './ErrorSummary';
import IdentitySection from './IdentitySection';
import RegistrationSection from './RegistrationSection';
import TaxStatusSection from './TaxStatusSection';
import NotesSection from './NotesSection';

interface PropertiesPanelProps {
  nodeId: string;
  /** Whether to auto-focus the name input on mount (default true). Set false for mobile to prevent keyboard popup. */
  autoFocus?: boolean;
}

/** Zod issue shape (compatible with Zod v4) */
interface ValidationIssue {
  path: (string | number)[];
  message: string;
}

/** Auto-save debounce delay in ms */
const AUTO_SAVE_DELAY = 400;

export default function PropertiesPanel({ nodeId, autoFocus = true }: PropertiesPanelProps) {
  const node = useGraphStore((state) => state.nodes.find((n) => n.id === nodeId));
  const updateNodeData = useGraphStore((state) => state.updateNodeData);

  // Local form state -- initialized from store, edited locally
  const [formData, setFormData] = useState<TaxEntityData>(() => ({
    ...(node?.data ?? {
      entityType: '',
      name: '',
      jurisdiction: 'AU',
      jurisdictionFlag: '',
      registration: {},
      taxStatus: {},
      notes: '',
    }),
  }));

  const [errors, setErrors] = useState<ValidationIssue[]>([]);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  // Auto-focus name field when panel opens (suppressed on mobile to prevent keyboard popup)
  useEffect(() => {
    if (autoFocus === false) return;
    const timeout = setTimeout(() => {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }, 50);
    return () => clearTimeout(timeout);
  }, [autoFocus]);

  // Debounced auto-save: validate and commit on every form change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const schema = getEntitySchema(formData.entityType);
      const result = schema.safeParse(formData);
      if (result.success) {
        setErrors([]);
        updateNodeData(nodeId, formData);
      } else {
        setErrors(result.error!.issues as ValidationIssue[]);
      }
    }, AUTO_SAVE_DELAY);
    return () => clearTimeout(timer);
  }, [formData, nodeId, updateNodeData]);

  // Form change handler -- supports nested updates for registration/taxStatus
  const handleChange = useCallback((updates: Partial<TaxEntityData>) => {
    setFormData((prev) => {
      const next = { ...prev };
      for (const [key, value] of Object.entries(updates)) {
        if (
          (key === 'registration' || key === 'taxStatus') &&
          typeof value === 'object' &&
          value !== null
        ) {
          // Merge nested objects
          next[key] = {
            ...(prev[key] as Record<string, unknown>),
            ...(value as Record<string, unknown>),
          } as typeof next[typeof key];
        } else {
          (next as Record<string, unknown>)[key] = value;
        }
      }
      return next;
    });
  }, []);

  // Convert error issues to field map for inline display
  const fieldErrors: Record<string, string> = {};
  for (const issue of errors) {
    const key = issue.path.join('.');
    fieldErrors[key] = issue.message;
  }

  // Handle field click from error summary -- scroll to field
  const handleFieldClick = useCallback((path: string) => {
    // Try to find and focus an input related to this path
    const parts = path.split('.');
    const fieldName = parts[parts.length - 1];
    const input = document.querySelector(
      `[id="${fieldName}"], input[type="text"], input[type="number"], input[type="date"], textarea`
    );
    if (input instanceof HTMLElement) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.focus();
    }
  }, []);

  if (!node) return null;

  const config = getEntityConfig(formData.entityType);
  const entityColor = config?.color ?? '#6B7280';
  const entityShape = config?.shape ?? 'rectangle';

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 overflow-hidden">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Properties
          </h2>

          {/* Mini entity preview */}
          <EntityPreview
            entityType={formData.entityType}
            name={formData.name}
            color={entityColor}
            shape={entityShape}
          />
        </div>

        {/* Error summary */}
        {errors.length > 0 && (
          <div className="px-4">
            <ErrorSummary errors={errors} onFieldClick={handleFieldClick} />
          </div>
        )}

        {/* Collapsible sections */}
        <IdentitySection
          formData={formData}
          onChange={handleChange}
          errors={fieldErrors}
          nameInputRef={nameInputRef}
        />

        <RegistrationSection
          formData={formData}
          onChange={handleChange}
          errors={fieldErrors}
          entityType={formData.entityType}
        />

        <TaxStatusSection
          formData={formData}
          onChange={handleChange}
          errors={fieldErrors}
          entityType={formData.entityType}
        />

        <NotesSection
          formData={formData}
          onChange={handleChange}
          errors={fieldErrors}
        />
      </div>
    </div>
  );
}
