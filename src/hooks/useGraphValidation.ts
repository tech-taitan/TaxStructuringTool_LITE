/**
 * Hook that runs debounced graph validation and stores results in UI store.
 *
 * Key design decisions:
 * - Validation state lives in UI store (NOT graph store) to avoid polluting undo/redo history
 * - Uses useMemo to extract topology-only data (node IDs, entity types, edge source/target/data)
 *   so position-only changes during drag do NOT trigger re-validation
 * - Debounced at 300ms to avoid excessive validation runs during rapid editing
 * - Deep compares validation results before writing to UI store to prevent unnecessary re-renders
 */

'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useGraphStore } from '@/stores/graph-store';
import { useUIStore } from '@/stores/ui-store';
import { validateGraph } from '@/lib/validation/graph-validator';

const DEBOUNCE_MS = 300;

/**
 * Activate debounced graph validation at the editor page level.
 *
 * Reads nodes/edges from graph store, runs validateGraph on topology changes,
 * and writes results to UI store's validationWarnings map.
 */
export function useGraphValidation(): void {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const setValidationWarnings = useUIStore((s) => s.setValidationWarnings);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevResultRef = useRef<string>('');

  // Extract topology-only data: ignores positions, selection state, etc.
  // This ensures dragging nodes does NOT trigger re-validation.
  const topologyKey = useMemo(() => {
    const nodeData = nodes.map((n) => ({
      id: n.id,
      entityType: n.data.entityType,
    }));
    const edgeData = edges.map((e) => ({
      source: e.source,
      target: e.target,
      relationshipType: e.data?.relationshipType,
      ownershipPercentage: e.data?.ownershipPercentage,
    }));
    return JSON.stringify({ nodeData, edgeData });
  }, [nodes, edges]);

  useEffect(() => {
    // Clear any pending debounce
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      const { nodes: currentNodes, edges: currentEdges } = useGraphStore.getState();
      const warnings = validateGraph(currentNodes, currentEdges);

      // Group warnings by nodeId into Map<string, string[]>
      const warningMap = new Map<string, string[]>();
      for (const w of warnings) {
        const existing = warningMap.get(w.nodeId) ?? [];
        existing.push(w.message);
        warningMap.set(w.nodeId, existing);
      }

      // Deep compare: only update if results actually changed
      const serialized = JSON.stringify(
        Array.from(warningMap.entries()).sort(([a], [b]) => a.localeCompare(b))
      );
      if (serialized !== prevResultRef.current) {
        prevResultRef.current = serialized;
        setValidationWarnings(warningMap);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // topologyKey is the stable dependency -- not nodes/edges directly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topologyKey, setValidationWarnings]);
}
