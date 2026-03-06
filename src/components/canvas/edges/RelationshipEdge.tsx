'use client';

/**
 * Custom React Flow edge for rendering tax relationship connections.
 *
 * Uses orthogonal (smooth step / right-angle) routing to match professional
 * corporate structure diagram conventions (Jigsaw, Lexchart, StructureFlow).
 *
 * Line style differentiation by relationship category:
 *   Ownership (equity, partnership, trustee, beneficiary):
 *     Solid line, no arrowhead — direction implied by hierarchy (top-down)
 *   Action (debt, management, services, licensing):
 *     Dashed line with arrowhead — indicates agreements/transactions
 *
 * Supports multigraph rendering by offsetting source/target points
 * perpendicular to the connection line when multiple edges exist
 * between the same node pair.
 *
 * Edge curvature is adjustable by dragging a midpoint handle that
 * appears when the edge is selected or hovered.
 */

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  getStraightPath,
  useStore,
  useReactFlow,
  type EdgeProps,
  type Edge,
} from '@xyflow/react';
import { useGraphStore } from '@/stores/graph-store';
import type { TaxRelationshipData } from '@/models/relationships';

/** Edge color mapping by relationship type */
const EDGE_COLORS: Record<string, string> = {
  equity: '#2563EB',      // blue-600
  debt: '#DC2626',        // red-600
  trustee: '#7C3AED',     // violet-600
  beneficiary: '#7C3AED', // violet-600
  partnership: '#059669',  // emerald-600
  management: '#6B7280',  // gray-500
  services: '#6B7280',    // gray-500
  licensing: '#6B7280',   // gray-500
};

/** Default color for unknown relationship types */
const DEFAULT_EDGE_COLOR = '#6B7280';

/** Edge style configuration per relationship type */
const EDGE_STYLES: Record<string, { dashed: boolean; arrow: boolean; width: number }> = {
  equity: { dashed: false, arrow: false, width: 1.5 },
  debt: { dashed: true, arrow: true, width: 1.5 },
  trustee: { dashed: false, arrow: false, width: 1.5 },
  beneficiary: { dashed: false, arrow: false, width: 1.5 },
  partnership: { dashed: false, arrow: false, width: 1.5 },
  management: { dashed: true, arrow: true, width: 1 },
  services: { dashed: true, arrow: true, width: 1 },
  licensing: { dashed: true, arrow: true, width: 1 },
};

const DEFAULT_EDGE_STYLE = { dashed: false, arrow: false, width: 1.5 };

/** Perpendicular offset for multigraph edge separation (px) */
const MULTIGRAPH_OFFSET_PX = 25;

/** Corner radius for smooth step bends */
const BORDER_RADIUS = 8;

/** Default smooth step offset when pathOffset is undefined */
const DEFAULT_OFFSET = 20;

/** Clamp bounds for path offset (px) */
const OFFSET_MIN = -200;
const OFFSET_MAX = 200;

const RelationshipEdge = memo(function RelationshipEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  data,
  style,
  selected,
}: EdgeProps<Edge<TaxRelationshipData>>) {
  const { screenToFlowPosition } = useReactFlow();

  // Find sibling edges between same node pair (either direction) for multigraph
  const siblingEdges = useStore((s) =>
    s.edges.filter(
      (e) =>
        (e.source === source && e.target === target) ||
        (e.source === target && e.target === source)
    )
  );

  // Detect cross-border edge via narrow selector (only jurisdiction data)
  const isCrossBorderEdge = useStore((s) => {
    const sourceNode = s.nodes.find((n: { id: string; data?: { jurisdiction?: string } }) => n.id === source);
    const targetNode = s.nodes.find((n: { id: string; data?: { jurisdiction?: string } }) => n.id === target);
    if (!sourceNode?.data?.jurisdiction || !targetNode?.data?.jurisdiction) return false;
    return sourceNode.data.jurisdiction !== targetNode.data.jurisdiction;
  });

  const edgeIndex = siblingEdges.findIndex((e) => e.id === id);
  const totalParallel = siblingEdges.length;

  // Axis-aligned offset for smooth step multigraph separation.
  const offsetAmount =
    totalParallel > 1
      ? (edgeIndex - (totalParallel - 1) / 2) * MULTIGRAPH_OFFSET_PX
      : 0;

  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const isVertical = Math.abs(dy) >= Math.abs(dx);

  // For vertical connections, offset horizontally; for horizontal, offset vertically
  const offsetX = isVertical ? offsetAmount : 0;
  const offsetY = isVertical ? 0 : offsetAmount;

  // User-defined path offset (curvature) -- undefined means auto
  const userOffset = data?.pathOffset;
  const isStraight = data?.pathStyle === 'straight';

  const [path, labelX, labelY] = isStraight
    ? getStraightPath({
      sourceX: sourceX + offsetX,
      sourceY: sourceY + offsetY,
      targetX: targetX + offsetX,
      targetY: targetY + offsetY,
    })
    : getSmoothStepPath({
      sourceX: sourceX + offsetX,
      sourceY: sourceY + offsetY,
      sourcePosition,
      targetX: targetX + offsetX,
      targetY: targetY + offsetY,
      targetPosition,
      borderRadius: BORDER_RADIUS,
      offset: userOffset,
    });

  // Resolve style configuration
  const typeKey = data?.relationshipType ?? '';
  const edgeColor = EDGE_COLORS[typeKey] ?? DEFAULT_EDGE_COLOR;
  const edgeConf = EDGE_STYLES[typeKey] ?? DEFAULT_EDGE_STYLE;
  const strokeWidth = selected ? edgeConf.width + 1 : edgeConf.width;

  const labelText = buildLabelText(data);

  // --- Drag handle state ---
  const updateEdgeData = useGraphStore((s) => s.updateEdgeData);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startFlowX: number;
    startFlowY: number;
    initialOffset: number;
    isVertical: boolean;
  } | null>(null);

  const showHandle = !isStraight && (selected || hovered) && (!dismissed || selected);

  // Drag start: record initial position and offset, pause undo tracking
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();

      // Capture pointer to this element so moves/up always fire here
      e.currentTarget.setPointerCapture(e.pointerId);

      const startFlow = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      dragRef.current = {
        startFlowX: startFlow.x,
        startFlowY: startFlow.y,
        initialOffset: userOffset ?? DEFAULT_OFFSET,
        isVertical,
      };
      setDragging(true);
      useGraphStore.temporal.getState().pause();
    },
    [screenToFlowPosition, userOffset, isVertical]
  );

  // Pointer move during drag (fires on the element due to pointer capture)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      e.stopPropagation();
      e.preventDefault();

      const currentFlow = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const { startFlowX, startFlowY, initialOffset, isVertical: vertical } = dragRef.current;

      // Perpendicular axis: horizontal drag for vertical connections, vertical for horizontal
      const delta = vertical
        ? currentFlow.x - startFlowX
        : currentFlow.y - startFlowY;

      const newOffset = Math.round(
        Math.max(OFFSET_MIN, Math.min(OFFSET_MAX, initialOffset + delta))
      );

      updateEdgeData(id, { pathOffset: newOffset });
    },
    [screenToFlowPosition, updateEdgeData, id]
  );

  // Pointer up: end drag, resume undo tracking
  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDragging(false);
      dragRef.current = null;
      useGraphStore.temporal.getState().resume();
    },
    []
  );

  // Double-click resets to auto offset
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      updateEdgeData(id, { pathOffset: undefined as unknown as number });
    },
    [id, updateEdgeData]
  );

  // Keep hovered while dragging even if mouse leaves
  useEffect(() => {
    if (!dragging) return;
    const onUp = () => {
      setDragging(false);
      dragRef.current = null;
      useGraphStore.temporal.getState().resume();
    };
    // Fallback: if pointer capture fails for any reason, catch window pointerup
    window.addEventListener('pointerup', onUp);
    return () => window.removeEventListener('pointerup', onUp);
  }, [dragging]);

  return (
    <>
      {/* Inline SVG marker definition for arrowhead (only for arrow-type edges) */}
      {edgeConf.arrow && (
        <defs>
          <marker
            id={`arrow-${id}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path
              d="M 0 1 L 8 5 L 0 9 z"
              fill={edgeColor}
              opacity={selected ? 1 : 0.8}
            />
          </marker>
        </defs>
      )}

      {/* Amber double-stroke highlight for cross-border edges */}
      {isCrossBorderEdge && (
        <path
          d={path}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={strokeWidth + 4}
          strokeDasharray="none"
          opacity={0.3}
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Invisible wider hit area for hover detection */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={24}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { if (!dragging) setHovered(false); }}
        style={{ pointerEvents: 'stroke' }}
      />

      <BaseEdge
        path={path}
        markerEnd={edgeConf.arrow ? `url(#arrow-${id})` : undefined}
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth,
          strokeDasharray: edgeConf.dashed ? '6 3' : undefined,
        }}
      />

      {/* Edge label (relationship info) */}
      {labelText && (
        <EdgeLabelRenderer>
          <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { if (!dragging) setHovered(false); }}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
              borderColor: selected ? '#3B82F6' : `${edgeColor}40`,
              boxShadow: selected
                ? '0 0 0 2px rgba(59,130,246,0.3)'
                : '0 1px 2px rgba(0,0,0,0.06)',
            }}
            className="nodrag nopan text-[11px] bg-white px-1.5 py-0.5 rounded border whitespace-nowrap font-medium text-gray-700"
          >
            {labelText}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Draggable curvature handle + dismiss button at midpoint */}
      <EdgeLabelRenderer>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => { if (!dragging) setHovered(false); }}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY + (labelText ? 16 : 0)}px)`,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            pointerEvents: showHandle ? 'all' : 'none',
            opacity: showHandle ? 1 : 0,
            transition: dragging ? 'none' : 'opacity 0.15s ease',
          }}
          className="nodrag nopan"
        >
          {/* Drag handle */}
          <div
            ref={handleRef}
            onPointerDown={handlePointerDown}
            onPointerMove={dragging ? handlePointerMove : undefined}
            onPointerUp={dragging ? handlePointerUp : undefined}
            onDoubleClick={handleDoubleClick}
            title="Drag to adjust curvature. Double-click to reset."
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              border: `2px solid ${edgeColor}`,
              backgroundColor: 'white',
              boxShadow: dragging
                ? '0 2px 8px rgba(0,0,0,0.25)'
                : '0 1px 3px rgba(0,0,0,0.1)',
              touchAction: 'none',
              flexShrink: 0,
            }}
            className={dragging ? 'edge-drag-handle dragging' : 'edge-drag-handle'}
          />
          {/* Dismiss button */}
          <button
            onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
            title="Hide adjustor"
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: '1px solid #D1D5DB',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              lineHeight: 1,
              color: '#9CA3AF',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
            }}
            className="nodrag nopan hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

RelationshipEdge.displayName = 'RelationshipEdge';
export default RelationshipEdge;

/**
 * Build a concise label from relationship data.
 *
 * Professional convention: ownership edges show just the percentage (e.g. "100%"),
 * since the relationship type is conveyed by line color and the legend.
 * Action edges show type + key data (e.g. "$500K @ 5.0%").
 */
function buildLabelText(data: TaxRelationshipData | undefined): string {
  if (!data) return '';

  switch (data.relationshipType) {
    case 'equity': {
      const pct = data.ownershipPercentage != null ? `${data.ownershipPercentage}%` : '';
      const cls = data.shareClass && data.shareClass !== 'ordinary'
        ? `${data.shareClass.charAt(0).toUpperCase() + data.shareClass.slice(1)} `
        : '';
      return cls + pct || 'Equity';
    }
    case 'debt': {
      if (data.principal == null) return 'Debt';
      const formatted = formatCurrency(data.principal);
      const ratePart = data.interestRate != null
        ? ` @ ${(data.interestRate * 100).toFixed(1)}%`
        : '';
      return `${formatted}${ratePart}`;
    }
    case 'beneficiary':
      return data.beneficiaryType
        ? data.beneficiaryType.charAt(0).toUpperCase() + data.beneficiaryType.slice(1)
        : 'Beneficiary';
    case 'trustee':
      return 'Trustee';
    case 'partnership':
      return 'Partnership';
    default: {
      // management, services, licensing
      return data.relationshipType.charAt(0).toUpperCase() + data.relationshipType.slice(1);
    }
  }
}

/**
 * Format a number as a compact currency string.
 * e.g. 1000000 -> "$1M", 500000 -> "$500K"
 */
function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(amount % 1_000 === 0 ? 0 : 1)}K`;
  }
  return `$${amount}`;
}
