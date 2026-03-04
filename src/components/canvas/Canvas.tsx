'use client';

/**
 * Main React Flow canvas component.
 *
 * Renders ReactFlow with all configuration: pan/zoom, snap-to-grid, bounded
 * canvas area, the layered grid background, alignment snap guides, context
 * menu, delete confirmation, and selection sync.
 *
 * Connected to the Zustand graph store for nodes/edges state.
 * Uses temporal middleware pause/resume for drag operations.
 *
 * Handles drag-and-drop from the entity palette sidebar, drag-off-canvas
 * delete, multi-selection (Shift+click and rubber-band), alignment snap
 * guides during drag, right-click context menu, and keyboard shortcuts
 * via the centralized useKeyboardShortcuts hook.
 *
 * ReactFlowProvider is provided by the parent EditorPage component so
 * that sibling components (EditorToolbar) can also use React Flow hooks.
 *
 * Custom nodeTypes and edgeTypes are imported as module-level constants
 * (outside the component) to prevent React Flow from re-registering
 * types on every render -- a known performance requirement.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  SelectionMode,
  ConnectionMode,
  ConnectionLineType,
  useReactFlow,
  useOnSelectionChange,
  type NodeMouseHandler,
  type NodeChange,
  type Connection,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nanoid } from 'nanoid';

import { useGraphStore } from '@/stores/graph-store';
import { useUIStore } from '@/stores/ui-store';
import { useHelperLines } from '@/hooks/useHelperLines';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useClipboard } from '@/hooks/useClipboard';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
import {
  GRID_SIZE,
  CANVAS_BOUNDS,
  CANVAS_TRANSLATE_EXTENT,
  ZOOM_RANGE,
  DEFAULT_VIEWPORT,
  ENTITY_SOFT_LIMIT,
  NODE_WIDTH,
  NODE_HEIGHT,
} from '@/lib/constants';
import { getEntityConfig } from '@/lib/entity-registry';
import { resolveOverlap } from '@/lib/utils/overlap';
import type { TaxNode, TaxEdge } from '@/models/graph';
import type { RelationshipType } from '@/models/relationships';
import { getDefaultRelationshipData } from '@/lib/validation/relationship-schemas';
import ConnectionTypePickerModal from '@/components/connections/ConnectionTypePickerModal';
import CanvasBackground from './CanvasBackground';
import CanvasBorder from './CanvasBorder';
import CanvasLegend from './CanvasLegend';
import HelperLines from './HelperLines';
import CanvasContextMenu from '@/components/context-menu/CanvasContextMenu';
import EdgeContextMenu from '@/components/context-menu/EdgeContextMenu';
import ShortcutLegend from '@/components/canvas/ShortcutLegend';
import EntitySearchBar from '@/components/canvas/EntitySearchBar';
import { nodeTypes } from '@/components/canvas/nodes';
import { edgeTypes } from '@/components/canvas/edges';

/** Canvas component -- must be rendered inside ReactFlowProvider (provided by EditorPage) */
export default function Canvas() {
  const { isTouchDevice, isMobile } = useDeviceCapabilities();

  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const onEdgesChange = useGraphStore((s) => s.onEdgesChange);

  const { screenToFlowPosition, getNodes, setCenter } = useReactFlow();

  // Center viewport on the middle of the canvas on initial mount
  useEffect(() => {
    const [[minX, minY], [maxX, maxY]] = CANVAS_BOUNDS;
    setCenter((minX + maxX) / 2, (minY + maxY) / 2, { zoom: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addNode = useGraphStore((s) => s.addNode);
  const removeNodes = useGraphStore((s) => s.removeNodes);
  const removeEdge = useGraphStore((s) => s.removeEdge);
  const updateEdgeData = useGraphStore((s) => s.updateEdgeData);
  const reconnectEdge = useGraphStore((s) => s.reconnectEdge);
  const nudgeNodes = useGraphStore((s) => s.nudgeNodes);
  const selectAllNodes = useGraphStore((s) => s.selectAllNodes);
  const canvasJurisdiction = useGraphStore((s) => s.canvasJurisdiction);
  const nodeCount = useGraphStore((s) => s.nodes.length);

  const setSelectedNode = useUIStore((s) => s.setSelectedNode);
  const setSelectedEdge = useUIStore((s) => s.setSelectedEdge);
  const contextMenu = useUIStore((s) => s.contextMenu);
  const setContextMenu = useUIStore((s) => s.setContextMenu);
  const setDeleteConfirm = useUIStore((s) => s.setDeleteConfirm);
  const connectionFilter = useUIStore((s) => s.connectionFilter);
  const showGrid = useUIStore((s) => s.showGrid);
  const snapToGrid = useUIStore((s) => s.snapToGrid);
  const canvasBgColor = useUIStore((s) => s.canvasBgColor);
  const interactionMode = useUIStore((s) => s.interactionMode);

  // Derive filtered edges based on connection filter state
  const filteredEdges = useMemo(() => {
    if (connectionFilter.mode === 'all') return edges;

    return edges.map((edge) => {
      const edgeType = edge.data?.relationshipType;
      if (!edgeType) return edge;

      if (connectionFilter.mode === 'toggle') {
        return { ...edge, hidden: !connectionFilter.visibleTypes.has(edgeType) };
      }

      // highlight mode
      if (connectionFilter.highlightedType) {
        const isHighlighted = edgeType === connectionFilter.highlightedType;
        return {
          ...edge,
          style: { ...edge.style, opacity: isHighlighted ? 1 : 0.15 },
        };
      }
      return edge;
    });
  }, [edges, connectionFilter]);

  // Helper lines for alignment snap guides
  const { helperLines, applyNodesChangeWithHelperLines } = useHelperLines();

  // Custom onNodesChange that integrates helper lines
  const handleNodesChange = useCallback(
    (changes: NodeChange<TaxNode>[]) => {
      const newNodes = applyNodesChangeWithHelperLines(changes, nodes);
      useGraphStore.setState({ nodes: newNodes });
    },
    [nodes, applyNodesChangeWithHelperLines]
  );

  // Selection sync: React Flow selection -> UI store for properties panel
  useOnSelectionChange({
    onChange: ({ nodes: selectedNodes, edges: selectedEdges }) => {
      if (selectedNodes.length === 1) {
        setSelectedNode(selectedNodes[0].id);
      } else {
        setSelectedNode(null);
      }
      if (selectedEdges.length === 1 && selectedNodes.length === 0) {
        setSelectedEdge(selectedEdges[0].id);
      } else {
        setSelectedEdge(null);
      }
    },
  });

  /** Prevent default on drag over to enable drop */
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  /** Handle entity drop from palette sidebar */
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const entityTypeId = event.dataTransfer.getData('application/reactflow');
      if (!entityTypeId) return;

      const config = getEntityConfig(entityTypeId);
      if (!config) return;

      // Soft limit warning
      if (nodeCount >= ENTITY_SOFT_LIMIT) {
        console.warn(
          `You have ${nodeCount} entities. Performance may degrade beyond ${ENTITY_SOFT_LIMIT}.`
        );
      }

      // Convert screen coordinates to flow position (respects snapToGrid)
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Build new entity node with explicit width/height for NodeResizer compatibility
      const newNode: TaxNode = {
        id: nanoid(),
        type: 'entity',
        position,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        data: {
          entityType: entityTypeId,
          name: `New ${config.shortName}`,
          jurisdiction: canvasJurisdiction,
          jurisdictionFlag: canvasJurisdiction === 'AU' ? '\u{1F1E6}\u{1F1FA}' : '',
          registration: {},
          taxStatus: {},
          notes: '',
        },
      };

      // Resolve overlap by nudging to nearest free position
      const adjustedNode = resolveOverlap(
        newNode,
        getNodes() as TaxNode[]
      );

      addNode(adjustedNode);
      setSelectedNode(adjustedNode.id);
    },
    [
      screenToFlowPosition,
      getNodes,
      addNode,
      setSelectedNode,
      canvasJurisdiction,
      nodeCount,
    ]
  );

  /** Pause temporal tracking on drag start to avoid recording every pixel */
  const onNodeDragStart = useCallback(() => {
    useGraphStore.temporal.getState().pause();
  }, []);

  /** Resume temporal tracking on drag stop */
  const onNodeDragStop: NodeMouseHandler<TaxNode> = useCallback(
    () => {
      useGraphStore.temporal.getState().resume();
    },
    []
  );

  /** Click on empty canvas deselects current entity and closes context menus */
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setContextMenu(null);
    setEdgeContextMenu(null);
  }, [setSelectedNode, setSelectedEdge, setContextMenu]);

  /** Double-click on empty canvas creates a new entity at that position */
  const onDoubleClickPane = useCallback(
    (event: React.MouseEvent) => {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const config = getEntityConfig('au-pty-ltd');
      if (!config) return;

      const newNode: TaxNode = {
        id: nanoid(),
        type: 'entity',
        position,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        data: {
          entityType: 'au-pty-ltd',
          name: 'New Entity',
          jurisdiction: canvasJurisdiction,
          jurisdictionFlag: canvasJurisdiction === 'AU' ? '\u{1F1E6}\u{1F1FA}' : '',
          registration: {},
          taxStatus: {},
          notes: '',
        },
      };

      const adjustedNode = resolveOverlap(newNode, getNodes() as TaxNode[]);
      addNode(adjustedNode);
      setSelectedNode(adjustedNode.id);
    },
    [screenToFlowPosition, getNodes, addNode, setSelectedNode, canvasJurisdiction]
  );

  /** Right-click on a node opens the context menu */
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: TaxNode) => {
      event.preventDefault();
      setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
    },
    [setContextMenu]
  );

  /** Request delete with confirmation dialog */
  const handleDeleteRequest = useCallback(
    (nodeIds: string[]) => {
      const connectionCount = edges.filter(
        (e) => nodeIds.includes(e.source) || nodeIds.includes(e.target)
      ).length;
      setDeleteConfirm({ nodeIds, connectionCount });
    },
    [edges, setDeleteConfirm]
  );

  // Edge context menu state
  const [edgeContextMenu, setEdgeContextMenu] = useState<{
    x: number; y: number; edgeId: string;
  } | null>(null);

  /** Right-click on an edge opens the edge context menu */
  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setEdgeContextMenu({ x: event.clientX, y: event.clientY, edgeId: edge.id });
    },
    []
  );

  // Connection drawing state -- intercepts onConnect to show type picker
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(
    null
  );

  /** Intercept connection event to show type picker instead of creating edge directly */
  const handleConnect = useCallback((connection: Connection) => {
    setPendingConnection(connection);
  }, []);

  /** Prevent self-connections (entity to itself) */
  const isValidConnection = useCallback(
    (connection: TaxEdge | Connection) => {
      return connection.source !== connection.target;
    },
    []
  );

  /** Type picker confirmed -- create typed edge and close modal */
  const handleConnectionTypeSelected = useCallback(
    (type: RelationshipType) => {
      if (!pendingConnection) return;
      const newEdge: TaxEdge = {
        id: nanoid(),
        source: pendingConnection.source,
        target: pendingConnection.target,
        sourceHandle: pendingConnection.sourceHandle ?? undefined,
        targetHandle: pendingConnection.targetHandle ?? undefined,
        type: 'relationship',
        data: getDefaultRelationshipData(type),
      };
      useGraphStore.getState().addEdge(newEdge);
      setPendingConnection(null);
    },
    [pendingConnection]
  );

  /** Type picker cancelled -- discard pending connection */
  const handleConnectionCancel = useCallback(() => {
    setPendingConnection(null);
  }, []);

  /** Reconnect an existing edge to a different node (drag edge endpoint) */
  const handleReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      if (newConnection.source === newConnection.target) return;
      reconnectEdge(
        oldEdge.id,
        newConnection.source,
        newConnection.target,
        newConnection.sourceHandle ?? undefined,
        newConnection.targetHandle ?? undefined
      );
    },
    [reconnectEdge]
  );

  /** Pause undo tracking while reconnecting */
  const handleReconnectStart = useCallback(() => {
    useGraphStore.temporal.getState().pause();
  }, []);

  /** Resume undo tracking after reconnection */
  const handleReconnectEnd = useCallback(() => {
    useGraphStore.temporal.getState().resume();
  }, []);

  // Undo/redo and clipboard hooks
  const { undo, redo } = useUndoRedo();
  const { copy, paste } = useClipboard();

  // Shortcut legend and search bar visibility
  const [showShortcutLegend, setShowShortcutLegend] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);

  const setInteractionMode = useUIStore((s) => s.setInteractionMode);
  const darkMode = useUIStore((s) => s.darkMode);

  /** Nudge selected nodes by (dx, dy) pixels */
  const handleNudge = useCallback(
    (dx: number, dy: number) => {
      const selectedIds = nodes.filter((n) => n.selected).map((n) => n.id);
      if (selectedIds.length === 0) return;
      nudgeNodes(selectedIds, dx, dy);
    },
    [nodes, nudgeNodes]
  );

  /** Duplicate selected nodes (copy + paste in one action) */
  const handleDuplicate = useCallback(() => {
    copy();
    paste();
  }, [copy, paste]);

  /** Cycle selection through nodes (Tab / Shift+Tab) */
  const handleCycleNode = useCallback(
    (direction: 1 | -1) => {
      if (nodes.length === 0) return;
      const currentIndex = nodes.findIndex((n) => n.selected);
      let nextIndex: number;
      if (currentIndex === -1) {
        nextIndex = direction === 1 ? 0 : nodes.length - 1;
      } else {
        nextIndex = (currentIndex + direction + nodes.length) % nodes.length;
      }
      // Deselect all, select the next one
      useGraphStore.getState().onNodesChange(
        nodes.map((n, i) => ({
          id: n.id,
          type: 'select' as const,
          selected: i === nextIndex,
        }))
      );
      setSelectedNode(nodes[nextIndex].id);
    },
    [nodes, setSelectedNode]
  );

  // Centralized keyboard shortcuts (replaces inline useEffect handler)
  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onCopy: copy,
    onPaste: paste,
    onDelete: () => {
      const selectedNodeIds = nodes.filter((n) => n.selected).map((n) => n.id);
      if (selectedNodeIds.length > 0) {
        handleDeleteRequest(selectedNodeIds);
      } else {
        const selectedEdgeIds = edges.filter((e) => e.selected).map((e) => e.id);
        for (const id of selectedEdgeIds) {
          removeEdge(id);
        }
      }
    },
    onSelectAll: selectAllNodes,
    onDuplicate: handleDuplicate,
    onNudge: handleNudge,
    onCycleNode: handleCycleNode,
    onSetInteractionMode: setInteractionMode,
    onToggleShortcutLegend: () => setShowShortcutLegend((v) => !v),
    onSearch: () => setShowSearchBar((v) => !v),
  });

  return (
    <div className={`w-full h-full canvas-mode-${interactionMode}`}>
      <ReactFlow
        nodes={nodes}
        edges={filteredEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onReconnect={handleReconnect}
        onReconnectStart={handleReconnectStart}
        onReconnectEnd={handleReconnectEnd}
        connectionRadius={30}
        reconnectRadius={25}
        isValidConnection={isValidConnection}
        connectionMode={ConnectionMode.Loose}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{ type: 'relationship' }}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        onDoubleClick={isTouchDevice ? undefined : onDoubleClickPane}
        onEdgeContextMenu={isTouchDevice ? undefined : onEdgeContextMenu}
        onNodeContextMenu={isTouchDevice ? undefined : onNodeContextMenu}
        panOnDrag={isTouchDevice ? true : interactionMode === 'drag'}
        selectionOnDrag={isTouchDevice ? false : interactionMode === 'select'}
        selectionKeyCode={isTouchDevice ? null : (interactionMode === 'select' ? null : 'Shift')}
        selectionMode={SelectionMode.Full}
        zoomOnPinch={true}
        preventScrolling={true}
        nodesDraggable={true}
        multiSelectionKeyCode="Shift"
        deleteKeyCode={null}
        snapToGrid={snapToGrid}
        snapGrid={[GRID_SIZE, GRID_SIZE]}
        minZoom={ZOOM_RANGE.min}
        maxZoom={ZOOM_RANGE.max}
        nodeExtent={CANVAS_BOUNDS}
        translateExtent={CANVAS_TRANSLATE_EXTENT}
        defaultViewport={DEFAULT_VIEWPORT}
        fitView={false}
        style={{ backgroundColor: darkMode ? '#111827' : canvasBgColor }}
        colorMode={darkMode ? 'dark' : 'light'}
        proOptions={{ hideAttribution: true }}
      >
        {showGrid && <CanvasBackground />}
        <CanvasBorder />
        {!isTouchDevice && (
          <HelperLines
            horizontal={helperLines.horizontal}
            vertical={helperLines.vertical}
          />
        )}
        {!isMobile && <Controls />}
        {!isMobile && (
          <MiniMap
            pannable
            zoomable
            nodeStrokeWidth={2}
            nodeColor="#e5e7eb"
            maskColor="rgba(243, 244, 246, 0.7)"
            style={{ width: 160, height: 100 }}
            position="bottom-left"
          />
        )}
        <CanvasLegend />
      </ReactFlow>
      {contextMenu && (
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          onDelete={() => handleDeleteRequest([contextMenu.nodeId])}
          onCopy={() => {
            // Select the context menu target node before copying
            useGraphStore.getState().onNodesChange([
              { id: contextMenu.nodeId, type: 'select', selected: true },
            ]);
            copy();
            setContextMenu(null);
          }}
          onProperties={() => {
            setSelectedNode(contextMenu.nodeId);
            setContextMenu(null);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}
      {edgeContextMenu && (
        <EdgeContextMenu
          x={edgeContextMenu.x}
          y={edgeContextMenu.y}
          edgeId={edgeContextMenu.edgeId}
          pathStyle={
            edges.find((e) => e.id === edgeContextMenu.edgeId)?.data?.pathStyle
          }
          onSetPathStyle={(style) => {
            updateEdgeData(edgeContextMenu.edgeId, { pathStyle: style });
            setEdgeContextMenu(null);
          }}
          onDelete={() => {
            removeEdge(edgeContextMenu.edgeId);
            setEdgeContextMenu(null);
          }}
          onProperties={() => {
            setSelectedEdge(edgeContextMenu.edgeId);
            setEdgeContextMenu(null);
          }}
          onClose={() => setEdgeContextMenu(null)}
        />
      )}
      {pendingConnection && (
        <ConnectionTypePickerModal
          onSelect={handleConnectionTypeSelected}
          onCancel={handleConnectionCancel}
        />
      )}
      {showSearchBar && (
        <EntitySearchBar onClose={() => setShowSearchBar(false)} />
      )}
      {showShortcutLegend && (
        <ShortcutLegend onClose={() => setShowShortcutLegend(false)} />
      )}
    </div>
  );
}

