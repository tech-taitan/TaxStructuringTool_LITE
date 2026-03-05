'use client';

/**
 * Editor layout component.
 *
 * Contains the full editor workspace: entity palette, toolbar, React Flow canvas,
 * and right-side properties panel.
 */

import { useCallback, useEffect, useState } from 'react';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import EntityPalette from '@/components/palette/EntityPalette';
import Canvas from '@/components/canvas/Canvas';
import PropertiesPanel from '@/components/properties/PropertiesPanel';
import ConnectionPropertiesPanel from '@/components/connections/ConnectionPropertiesPanel';
import EditorToolbar from '@/components/toolbar/EditorToolbar';
import { useUIStore } from '@/stores/ui-store';
import { useGraphStore } from '@/stores/graph-store';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useClipboard } from '@/hooks/useClipboard';
import { useGraphValidation } from '@/hooks/useGraphValidation';
import { useLocalBackup } from '@/hooks/useLocalBackup';
import { getLayoutedElements } from '@/lib/layout/auto-layout';
import { alignNodes, distributeNodes } from '@/lib/utils/alignment';
import { type TemplateDefinition } from '@/lib/templates';
import TemplatePickerModal from '@/components/templates/TemplatePickerModal';
import StatusBar from '@/components/canvas/StatusBar';
import { exportCanvasPng, exportCanvasSvg, exportCanvasPdf } from '@/lib/export';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
import MobileEditorLayout from '@/components/editor/MobileEditorLayout';
import { NODE_WIDTH, GRID_SIZE } from '@/lib/constants';

interface EditorLayoutProps {
  /** Structure ID -- null for anonymous/new structures */
  structureId: string | null;
  /** Structure name for display */
  structureName: string;
  /** Explicit save handler */
  onSave?: () => void;
  /** Whether a save operation is in progress */
  isSaving?: boolean;
  /** Whether saving is available (e.g. user is authenticated or structure exists) */
  canSave?: boolean;
}

/** Inner layout that must be inside ReactFlowProvider */
function EditorLayoutInner({
  structureId,
  structureName: _structureName,
  onSave,
  isSaving = false,
  canSave = false,
}: EditorLayoutProps) {
  // Responsive breakpoints
  const { isMobile, isTablet } = useDeviceCapabilities();

  const selectedNodeId = useUIStore((s) => s.selectedNodeId);
  const selectedEdgeId = useUIStore((s) => s.selectedEdgeId);
  const deleteConfirm = useUIStore((s) => s.deleteConfirm);
  const setDeleteConfirm = useUIStore((s) => s.setDeleteConfirm);
  const setSelectedNode = useUIStore((s) => s.setSelectedNode);
  const connectionFilter = useUIStore((s) => s.connectionFilter);
  const toggleConnectionType = useUIStore((s) => s.toggleConnectionType);
  const setHighlightedType = useUIStore((s) => s.setHighlightedType);
  const setFilterMode = useUIStore((s) => s.setFilterMode);
  const showGrid = useUIStore((s) => s.showGrid);
  const toggleGrid = useUIStore((s) => s.toggleGrid);
  const canvasBgColor = useUIStore((s) => s.canvasBgColor);
  const setCanvasBgColor = useUIStore((s) => s.setCanvasBgColor);
  const showLegend = useUIStore((s) => s.showLegend);
  const toggleLegend = useUIStore((s) => s.toggleLegend);
  const interactionMode = useUIStore((s) => s.interactionMode);
  const setInteractionMode = useUIStore((s) => s.setInteractionMode);
  const darkMode = useUIStore((s) => s.darkMode);
  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode);

  const isPaletteCollapsed = useUIStore((s) => s.isPaletteCollapsed);
  const togglePalette = useUIStore((s) => s.togglePalette);

  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const removeNodes = useGraphStore((s) => s.removeNodes);
  const selectAllNodes = useGraphStore((s) => s.selectAllNodes);

  const hasSelection = useGraphStore((s) => s.nodes.some((n) => n.selected));
  const multiSelected = useGraphStore((s) => s.nodes.filter((n) => n.selected).length >= 2);

  // React Flow hooks for zoom/fitView
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // Undo/redo and clipboard hooks
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  const { copy, paste, canPaste } = useClipboard();

  // Auto-collapse palette on tablet viewport
  useEffect(() => {
    if (isTablet && !isPaletteCollapsed) {
      togglePalette();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTablet]);

  // Activate debounced graph validation
  useGraphValidation();

  // localStorage draft backup for anonymous sessions
  const { hasDraft, restoreDraft, discardDraft } = useLocalBackup(structureId);

  // Warn before unloading if there are unsaved changes on the canvas
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const { nodes } = useGraphStore.getState();
      if (nodes.length > 0) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Modal state
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  // Derived: should the right panel be visible?
  const showRightPanel = !!selectedNodeId || !!selectedEdgeId;

  /** Align selected nodes */
  const handleAlign = useCallback(
    (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
      const { nodes } = useGraphStore.getState();
      const aligned = alignNodes(nodes, type);
      useGraphStore.setState({ nodes: aligned });
    },
    []
  );

  /** Distribute selected nodes */
  const handleDistribute = useCallback(
    (type: 'horizontal' | 'vertical') => {
      const { nodes } = useGraphStore.getState();
      const distributed = distributeNodes(nodes, type);
      useGraphStore.setState({ nodes: distributed });
    },
    []
  );

  /** Auto-align: arrange all entities into a neat grid with equal spacing */
  const handleAutoLayout = useCallback(() => {
    const { nodes, edges } = useGraphStore.getState();
    if (nodes.length === 0) return;
    const layoutedNodes = getLayoutedElements(nodes, edges);

    useGraphStore.temporal.getState().pause();
    useGraphStore.setState({ nodes: layoutedNodes });
    useGraphStore.temporal.getState().resume();

    fitView({ padding: 0.1, duration: 300 });
  }, [fitView]);

  /** Load a template structure onto the canvas */
  const handleLoadTemplate = useCallback(
    (template: TemplateDefinition) => {
      const { nodes: existingNodes } = useGraphStore.getState();
      let baseX = 200;
      const baseY = 100;
      if (existingNodes.length > 0) {
        const maxX = Math.max(
          ...existingNodes.map((n) => n.position.x + (n.width ?? NODE_WIDTH))
        );
        baseX = Math.round((maxX + 200) / GRID_SIZE) * GRID_SIZE;
      }

      const { nodes: newNodes, edges: newEdges } = template.create(
        baseX,
        baseY
      );
      useGraphStore.getState().pasteNodes(newNodes, newEdges);
      fitView({ padding: 0.1, duration: 300 });
      setShowTemplatePicker(false);
    },
    [fitView]
  );

  /** Export canvas as PNG */
  const handleExportPng = useCallback(() => {
    const { nodes } = useGraphStore.getState();
    const name = _structureName || 'structure';
    exportCanvasPng(nodes, `${name}.png`);
  }, [_structureName]);

  /** Export canvas as SVG */
  const handleExportSvg = useCallback(() => {
    const { nodes } = useGraphStore.getState();
    const name = _structureName || 'structure';
    exportCanvasSvg(nodes, `${name}.svg`);
  }, [_structureName]);

  /** Export canvas as PDF */
  const handleExportPdf = useCallback(() => {
    const { nodes } = useGraphStore.getState();
    const name = _structureName || 'structure';
    exportCanvasPdf(nodes, `${name}.pdf`);
  }, [_structureName]);

  /** Handle delete from toolbar */
  const handleToolbarDelete = useCallback(() => {
    const selectedNodeIds = nodes.filter((n) => n.selected).map((n) => n.id);
    if (selectedNodeIds.length > 0) {
      const connectionCount = edges.filter(
        (e) =>
          selectedNodeIds.includes(e.source) ||
          selectedNodeIds.includes(e.target)
      ).length;
      setDeleteConfirm({ nodeIds: selectedNodeIds, connectionCount });
    }
  }, [nodes, edges, setDeleteConfirm]);

  /** Confirm delete */
  const confirmDelete = useCallback(() => {
    if (!deleteConfirm) return;
    removeNodes(deleteConfirm.nodeIds);
    setDeleteConfirm(null);
    setSelectedNode(null);
  }, [deleteConfirm, removeNodes, setDeleteConfirm, setSelectedNode]);

  /** Cancel delete */
  const cancelDelete = useCallback(() => {
    setDeleteConfirm(null);
  }, [setDeleteConfirm]);

  // Close delete dialog on Escape key
  useEffect(() => {
    if (!deleteConfirm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteConfirm, cancelDelete]);

  // Build display text for delete dialog
  const deleteEntityNames = deleteConfirm
    ? deleteConfirm.nodeIds
      .map((id) => nodes.find((n) => n.id === id)?.data.name)
      .filter(Boolean)
    : [];

  const deleteTitle =
    deleteConfirm && deleteConfirm.nodeIds.length === 1
      ? 'Delete Entity?'
      : `Delete ${deleteConfirm?.nodeIds.length ?? 0} Entities?`;

  const deleteDescription = deleteConfirm
    ? deleteConfirm.nodeIds.length === 1
      ? `Delete "${deleteEntityNames[0]}" and ${deleteConfirm.connectionCount} connection${deleteConfirm.connectionCount !== 1 ? 's' : ''}?`
      : `Delete ${deleteConfirm.nodeIds.length} entities and ${deleteConfirm.connectionCount} connection${deleteConfirm.connectionCount !== 1 ? 's' : ''}?`
    : '';

  // Layout content: mobile vs tablet/desktop
  const layoutContent = isMobile ? (
    <MobileEditorLayout
      structureId={structureId}
      structureName={_structureName}
      onSave={onSave}
      isSaving={isSaving}
      canSave={canSave}
      onUndo={undo}
      onRedo={redo}
      canUndo={canUndo}
      canRedo={canRedo}
      hasDraft={hasDraft}
      restoreDraft={restoreDraft}
      discardDraft={discardDraft}
    />
  ) : (
    <div className={`flex h-screen w-screen overflow-hidden ${darkMode ? 'dark' : ''}`}>
      {/* Left palette -- fixed width */}
      <EntityPalette />

      {/* Main content area: toolbar above canvas */}
      <div className="flex-1 flex flex-col">
        {/* Draft restore banner for anonymous sessions */}
        {hasDraft && (
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border-b border-blue-200 text-sm">
            <span className="text-blue-800">
              You have unsaved work from a previous session.
            </span>
            <button
              onClick={restoreDraft}
              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
            >
              Restore
            </button>
            <button
              onClick={discardDraft}
              className="px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 rounded"
            >
              Discard
            </button>
          </div>
        )}

        {/* Editor toolbar */}
        <EditorToolbar
          onUndo={undo}
          onRedo={redo}
          onCopy={copy}
          onPaste={paste}
          onDelete={handleToolbarDelete}
          onSelectAll={selectAllNodes}
          onZoomIn={() => zoomIn()}
          onZoomOut={() => zoomOut()}
          onFitView={() => fitView()}
          canUndo={canUndo}
          canRedo={canRedo}
          canPaste={canPaste()}
          hasSelection={hasSelection}
          connectionFilter={connectionFilter}
          onToggleConnectionType={toggleConnectionType}
          onSetHighlightedType={setHighlightedType}
          onSetFilterMode={setFilterMode}
          onAutoLayout={handleAutoLayout}
          onShowTemplates={() => setShowTemplatePicker(true)}

          showGrid={showGrid}
          onToggleGrid={toggleGrid}
          canvasBgColor={canvasBgColor}
          onSetCanvasBgColor={setCanvasBgColor}
          showLegend={showLegend}
          onToggleLegend={toggleLegend}

          interactionMode={interactionMode}
          onSetInteractionMode={setInteractionMode}
          onAlign={handleAlign}
          onDistribute={handleDistribute}
          multiSelected={multiSelected}
          onExportPng={handleExportPng}
          onExportSvg={handleExportSvg}
          onExportPdf={handleExportPdf}
          canExport={nodes.length > 0}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onSave={onSave}
          isSaving={isSaving}
          canSave={canSave}
        />

        {/* Canvas + right panel -- flex row, canvas fills remaining space */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Canvas */}
          <div className="flex-1 relative">
            <Canvas />
          </div>

          {/* Right panel -- fixed 320px (tablet: overlay from right edge) */}
          {showRightPanel && (
            <div className={
              isTablet
                ? 'absolute right-0 top-0 bottom-0 w-80 border-l border-gray-200 bg-white overflow-y-auto z-20 shadow-lg'
                : 'w-80 border-l border-gray-200 bg-white overflow-y-auto'
            }>
              {selectedNodeId ? (
                <PropertiesPanel
                  key={selectedNodeId}
                  nodeId={selectedNodeId}
                />
              ) : selectedEdgeId ? (
                <ConnectionPropertiesPanel
                  key={selectedEdgeId}
                  edgeId={selectedEdgeId}
                />
              ) : null}
            </div>
          )}
        </div>

        {/* Bottom status bar */}
        <StatusBar />
      </div>
    </div>
  );

  return (
    <>
      {layoutContent}

      {/* Template picker modal -- renders on ALL screen sizes */}
      {showTemplatePicker && (
        <TemplatePickerModal
          onSelect={handleLoadTemplate}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}

      {/* Delete confirmation dialog -- renders on ALL screen sizes */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={cancelDelete}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {deleteTitle}
            </h3>
            <p className="text-sm text-gray-600 mb-6">{deleteDescription}</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded touch-target"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded touch-target"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** EditorLayout wrapper that provides ReactFlowProvider */
export default function EditorLayout(props: EditorLayoutProps) {
  return (
    <ReactFlowProvider>
      <EditorLayoutInner {...props} />
    </ReactFlowProvider>
  );
}
