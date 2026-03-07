'use client';

import { memo, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Handle,
  Position,
  NodeResizeControl,
  ResizeControlVariant,
  type NodeProps,
  type Node,
} from '@xyflow/react';
import type { TaxEntityData } from '@/models/graph';
import { getEntityConfig } from '@/lib/entity-registry';
import { useGraphStore } from '@/stores/graph-store';
import { useUIStore } from '@/stores/ui-store';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
import { useLongPress } from '@/hooks/useLongPress';
import { COLORS, JURISDICTION_COLORS, MIN_NODE_WIDTH, MIN_NODE_HEIGHT } from '@/lib/constants';
import type { EntityCategory } from '@/models/entities';
import { AlertTriangle } from 'lucide-react';

type EntityNodeProps = NodeProps<Node<TaxEntityData>>;

/** Stable empty array to avoid new reference on every render in useSyncExternalStore */
const EMPTY_WARNINGS: string[] = [];

/** Corner positions for proportional resize handles */
const CORNER_POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

/** Edge positions for free resize handles */
const EDGE_POSITIONS = ['top', 'right', 'bottom', 'left'] as const;

/** Shapes that use clip-path (CSS border is clipped, use drop-shadow for border effect) */
const CLIP_PATH_SHAPES = new Set(['triangle', 'diamond', 'hexagon', 'shield']);

/** Compact shapes where text needs smaller font + multi-line wrapping */
const COMPACT_SHAPES = new Set(['triangle', 'oval', 'diamond', 'hexagon', 'shield']);

/**
 * Compute absolute position styles for intermediate (corner/vertex) handles.
 *
 * Each shape has different geometry, so the 4 intermediate handles are placed
 * at shape-appropriate positions:
 *   Rectangle/Rounded/Person: corners of the bounding box
 *   Oval: 45-degree points on the ellipse
 *   Triangle: bottom-left vertex, bottom-right vertex, and upper-edge midpoints
 *   Diamond: midpoints of each diagonal edge
 *   Hexagon: the 4 non-cardinal vertices
 *   Shield: shoulder and lower vertices
 */
function getIntermediateHandleStyle(
  shape: string,
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
): React.CSSProperties {
  // Shape-specific positions (percentages of node bounding box)
  const positions: Record<string, Record<string, { left: string; top: string }>> = {
    // Rectangle / Rounded / Person: at the corners
    rectangle:  { 'top-left': { left: '0%', top: '0%' }, 'top-right': { left: '100%', top: '0%' }, 'bottom-left': { left: '0%', top: '100%' }, 'bottom-right': { left: '100%', top: '100%' } },
    rounded:    { 'top-left': { left: '10%', top: '0%' }, 'top-right': { left: '90%', top: '0%' }, 'bottom-left': { left: '10%', top: '100%' }, 'bottom-right': { left: '90%', top: '100%' } },
    person:     { 'top-left': { left: '10%', top: '10%' }, 'top-right': { left: '90%', top: '10%' }, 'bottom-left': { left: '0%', top: '100%' }, 'bottom-right': { left: '100%', top: '100%' } },
    // Oval: 45-degree points
    oval:       { 'top-left': { left: '15%', top: '15%' }, 'top-right': { left: '85%', top: '15%' }, 'bottom-left': { left: '15%', top: '85%' }, 'bottom-right': { left: '85%', top: '85%' } },
    // Triangle (50% 0%, 0% 100%, 100% 100%): upper-edge midpoints + bottom vertices
    triangle:   { 'top-left': { left: '25%', top: '50%' }, 'top-right': { left: '75%', top: '50%' }, 'bottom-left': { left: '6%', top: '94%' }, 'bottom-right': { left: '94%', top: '94%' } },
    // Diamond (50% 0%, 100% 50%, 50% 100%, 0% 50%): midpoints of diagonal edges
    diamond:    { 'top-left': { left: '25%', top: '25%' }, 'top-right': { left: '75%', top: '25%' }, 'bottom-left': { left: '25%', top: '75%' }, 'bottom-right': { left: '75%', top: '75%' } },
    // Hexagon (25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%): 4 non-cardinal vertices
    hexagon:    { 'top-left': { left: '25%', top: '6%' }, 'top-right': { left: '75%', top: '6%' }, 'bottom-left': { left: '25%', top: '94%' }, 'bottom-right': { left: '75%', top: '94%' } },
    // Shield (50% 0%, 100% 15%, 100% 65%, 50% 100%, 0% 65%, 0% 15%): shoulders + lower sides
    shield:     { 'top-left': { left: '6%', top: '15%' }, 'top-right': { left: '94%', top: '15%' }, 'bottom-left': { left: '6%', top: '65%' }, 'bottom-right': { left: '94%', top: '65%' } },
  };

  const shapePositions = positions[shape] ?? positions.rectangle;
  const pos = shapePositions[corner];
  return { position: 'absolute', left: pos.left, top: pos.top };
}

/**
 * Custom React Flow node component for rendering tax entities.
 *
 * Dispatches to different visual shapes based on entity type category
 * (rectangle for companies, rounded for trusts, diamond for partnerships,
 * hexagon for VCs, person for individuals, shield for SMSFs).
 *
 * Displays entity name, jurisdiction flag, type label, optional metrics,
 * and validation warning indicators. Supports double-click inline rename.
 *
 * When selected, shows 8 resize handles: 4 corner handles (proportional)
 * and 4 edge handles (free width/height resize).
 */
const EntityNode = memo(({ id, data, selected }: EntityNodeProps) => {
  const config = getEntityConfig(data.entityType);
  const updateNodeData = useGraphStore((s) => s.updateNodeData);
  const { isTouchDevice } = useDeviceCapabilities();
  const lastPlacedNodeId = useUIStore((s) => s.lastPlacedNodeId);
  const isNew = id === lastPlacedNodeId;

  // Read live validation warnings from UI store (not from node data, to avoid undo pollution)
  const validationWarnings = useUIStore((s) => s.validationWarnings.get(id) ?? EMPTY_WARNINGS);

  // Inline rename state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(data.name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus and select input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // prevent React Flow double-click zoom
    setIsEditing(true);
    setEditName(data.name);
  }, [data.name]);

  const commitRename = useCallback(() => {
    if (editName.trim()) {
      updateNodeData(id, { name: editName.trim() });
    }
    setIsEditing(false);
  }, [editName, id, updateNodeData]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitRename();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  }, [commitRename]);

  // Long-press for mobile context menu
  const touchCoordsRef = useRef({ x: 0, y: 0 });

  const longPressHandlers = useLongPress({
    onStart: undefined,
    onFinish: () => {
      // Select the node
      useUIStore.getState().setSelectedNode(id);
      useGraphStore.getState().onNodesChange([
        { id, type: 'select', selected: true },
      ]);
      // Show context menu at touch position
      useUIStore.getState().setMobileContextMenu({
        x: touchCoordsRef.current.x,
        y: touchCoordsRef.current.y,
        nodeId: id,
      });
      // Haptic feedback
      navigator.vibrate?.(10);
    },
    onCancel: undefined,
  });

  // Combined touch start handler: capture coordinates then delegate to long-press
  const combinedTouchStart = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      touchCoordsRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      longPressHandlers.onTouchStart(e);
    },
    [longPressHandlers],
  );

  // Conditionally apply touch handlers only on touch devices
  const touchHandlerProps = useMemo(
    () =>
      isTouchDevice
        ? {
            onTouchStart: combinedTouchStart,
            onTouchMove: longPressHandlers.onTouchMove,
            onTouchEnd: longPressHandlers.onTouchEnd,
            onTouchCancel: longPressHandlers.onTouchCancel,
          }
        : {},
    [isTouchDevice, combinedTouchStart, longPressHandlers],
  );

  // Fallback for unknown entity types
  if (!config) {
    return (
      <div
        className="entity-node entity-node--rectangle"
        style={{
          borderColor: '#9CA3AF',
          borderWidth: 1,
          background: '#F9FAFB',
        }}
      >
        <Handle type="source" position={Position.Top} id="top" />
        <Handle type="source" position={Position.Left} id="left" />
        <Handle type="source" position={Position.Bottom} id="bottom" />
        <Handle type="source" position={Position.Right} id="right" />
        <Handle type="source" position={Position.Left} id="top-left" style={{ left: '0%', top: '0%', position: 'absolute' }} />
        <Handle type="source" position={Position.Right} id="top-right" style={{ left: '100%', top: '0%', position: 'absolute' }} />
        <Handle type="source" position={Position.Left} id="bottom-left" style={{ left: '0%', top: '100%', position: 'absolute' }} />
        <Handle type="source" position={Position.Right} id="bottom-right" style={{ left: '100%', top: '100%', position: 'absolute' }} />
        <div className="font-semibold text-sm text-gray-500">
          Unknown Entity
        </div>
      </div>
    );
  }

  const hasDataValidationError =
    data.validationErrors != null && data.validationErrors.length > 0;
  const hasValidationWarning = validationWarnings.length > 0;
  const hasAnyValidation = hasDataValidationError || hasValidationWarning;

  // Determine border color: validation error > selected > entity color
  const borderColor = hasAnyValidation
    ? '#F59E0B' // amber-500 for live validation warnings
    : selected
      ? COLORS.entity.selected
      : config.color;

  // Resolve shape: user override or registry default
  const shape = data.shapeOverride ?? config.shape;

  // Entity status (existing / proposed / removed)
  const status = data.status ?? 'existing';

  // Solid background color from entity category
  const bgColor = COLORS.entityBg[config.category as EntityCategory] ?? '#F9FAFB';

  // Compact shapes use smaller fonts and line clamping
  const isCompact = COMPACT_SHAPES.has(shape);

  // Build node style: clip-path shapes use drop-shadow (CSS border gets clipped), others use CSS border
  const isClipPath = CLIP_PATH_SHAPES.has(shape);
  const jurisdictionColor = JURISDICTION_COLORS[data.jurisdiction] ?? undefined;
  const nodeStyle: React.CSSProperties = isClipPath
    ? {
        filter: `drop-shadow(0 0 ${selected ? 2 : 1}px ${borderColor})`,
        background: bgColor,
        border: 'none',
        ...(status === 'removed' ? { opacity: 0.4 } : {}),
      }
    : {
        borderTopWidth: selected ? 2 : 1,
        borderRightWidth: selected ? 2 : 1,
        borderBottomWidth: selected ? 2 : 1,
        borderLeftWidth: jurisdictionColor ? 3 : (hasValidationWarning ? 3 : (selected ? 2 : 1)),
        borderTopColor: borderColor,
        borderRightColor: borderColor,
        borderBottomColor: borderColor,
        borderLeftColor: jurisdictionColor ?? (hasValidationWarning ? '#F59E0B' : borderColor),
        borderStyle: status === 'proposed' ? 'dashed' : 'solid',
        background: bgColor,
        ...(status === 'removed' ? { opacity: 0.4 } : {}),
      };

  return (
    <div
      className={`entity-node entity-node--${shape}${isTouchDevice ? ' active:scale-[0.98] transition-transform duration-75' : ''}${isNew ? ' entity-node--scale-in' : ''}`}
      style={nodeStyle}
      {...touchHandlerProps}
      onAnimationEnd={() => {
        if (isNew) {
          useUIStore.getState().setLastPlacedNodeId(null);
        }
      }}
    >
      {/* 8 resize handles -- only visible when selected, hidden on touch devices */}
      {selected && !isTouchDevice && (
        <>
          {/* 4 corner handles: proportional resize */}
          {CORNER_POSITIONS.map((pos) => (
            <NodeResizeControl
              key={pos}
              position={pos as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'}
              variant={ResizeControlVariant.Handle}
              keepAspectRatio={true}
              minWidth={MIN_NODE_WIDTH}
              minHeight={MIN_NODE_HEIGHT}
              style={{
                background: '#3B82F6',
                borderRadius: '50%',
                width: 8,
                height: 8,
                border: 'none',
              }}
            />
          ))}
          {/* 4 edge handles: free resize (width or height) */}
          {EDGE_POSITIONS.map((pos) => (
            <NodeResizeControl
              key={pos}
              position={pos as 'top' | 'right' | 'bottom' | 'left'}
              variant={ResizeControlVariant.Line}
              keepAspectRatio={false}
              minWidth={MIN_NODE_WIDTH}
              minHeight={MIN_NODE_HEIGHT}
              style={{ borderColor: '#3B82F6' }}
            />
          ))}
        </>
      )}

      {/* Connection handles: 4 cardinal + 4 intermediate = 8 total per node */}
      {/* Cardinal handles -- wider hit area so center connections are prioritised */}
      <Handle type="source" position={Position.Top} id="top"
        style={{
          width: '50%', height: 18,
          ...(shape === 'diamond' ? { top: '10%' }
            : shape === 'shield' ? { top: '6%' }
              : {}),
        }}
      />
      <Handle type="source" position={Position.Left} id="left"
        style={
          shape === 'triangle' ? { width: 18, left: '18%', top: '60%', height: '30%' }
            : shape === 'diamond' ? { width: 18, height: '50%', left: '10%' }
              : shape === 'hexagon' ? { width: 18, height: '50%', left: '6%', top: '50%' }
                : shape === 'shield' ? { width: 18, height: '50%', left: '6%', top: '40%' }
                  : { width: 18, height: '50%' }
        }
      />
      <Handle type="source" position={Position.Bottom} id="bottom"
        style={{
          width: '50%', height: 18,
          ...(shape === 'diamond' ? { bottom: '10%' }
            : shape === 'triangle' ? { bottom: '4%' }
              : shape === 'shield' ? { bottom: '10%' }
                : {}),
        }}
      />
      <Handle type="source" position={Position.Right} id="right"
        style={
          shape === 'triangle' ? { width: 18, right: '18%', top: '60%', height: '30%' }
            : shape === 'diamond' ? { width: 18, height: '50%', right: '10%' }
              : shape === 'hexagon' ? { width: 18, height: '50%', right: '6%', top: '50%' }
                : shape === 'shield' ? { width: 18, height: '50%', right: '6%', top: '40%' }
                  : { width: 18, height: '50%' }
        }
      />
      {/* Intermediate handles (corners / vertices) -- smaller so cardinals win near center */}
      <Handle type="source" position={Position.Left} id="top-left"
        style={{ ...getIntermediateHandleStyle(shape, 'top-left'), width: 10, height: 10 }}
      />
      <Handle type="source" position={Position.Right} id="top-right"
        style={{ ...getIntermediateHandleStyle(shape, 'top-right'), width: 10, height: 10 }}
      />
      <Handle type="source" position={Position.Left} id="bottom-left"
        style={{ ...getIntermediateHandleStyle(shape, 'bottom-left'), width: 10, height: 10 }}
      />
      <Handle type="source" position={Position.Right} id="bottom-right"
        style={{ ...getIntermediateHandleStyle(shape, 'bottom-right'), width: 10, height: 10 }}
      />

      {/* Validation warning icon -- prefer UI store warnings (live), fallback to data errors */}
      {hasAnyValidation && (
        <div
          className="absolute -top-2 -right-2 z-10"
          title={
            hasValidationWarning
              ? validationWarnings.join('\n')
              : data.validationErrors?.join('\n') ?? ''
          }
        >
          <AlertTriangle
            className={`w-4 h-4 ${hasDataValidationError ? 'text-red-500' : 'text-amber-500'}`}
          />
        </div>
      )}

      {/* Status badge */}
      {status === 'proposed' && (
        <div className="absolute -top-2 left-1 z-10">
          <span className="bg-blue-100 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
            PROPOSED
          </span>
        </div>
      )}
      {status === 'removed' && (
        <div className="absolute -top-2 left-1 z-10">
          <span className="bg-red-100 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
            REMOVED
          </span>
        </div>
      )}

      {/* Entity content */}
      <div className="min-w-0 w-full">
        {isEditing ? (
          <input
            ref={inputRef}
            className={`nodrag nowheel nopan font-semibold bg-transparent border-b border-blue-500 outline-none w-full text-gray-900 ${isCompact ? 'text-xs' : 'text-sm'}`}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div
            className={`font-semibold text-gray-900 cursor-text leading-tight ${isCompact ? 'text-xs' : 'text-sm'}`}
            onDoubleClick={handleDoubleClick}
          >
            {data.name}
          </div>
        )}
        <div className={`text-gray-500 leading-tight ${isCompact ? 'text-[10px]' : 'text-xs'}`}>{config.shortName}</div>
        <div className={`text-gray-400 leading-tight ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>
          {data.jurisdictionFlag} {data.jurisdiction}
        </div>
      </div>

      {/* Key metrics (optional) */}
      {data.metrics && (
        <div className="text-xs text-gray-400 mt-1">
          {data.metrics.ownershipPercent != null &&
            `${data.metrics.ownershipPercent}%`}
          {data.metrics.ownershipPercent != null &&
            data.metrics.taxRate != null &&
            ' | '}
          {data.metrics.taxRate != null &&
            `${(data.metrics.taxRate * 100).toFixed(0)}% tax`}
        </div>
      )}
    </div>
  );
});

EntityNode.displayName = 'EntityNode';
export default EntityNode;
