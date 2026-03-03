/**
 * UI state store for selection, hover, palette, context menu, delete confirmation,
 * connection filtering, and validation warnings.
 *
 * Holds which node/edge is selected or hovered, plus palette sidebar state.
 * Phase 3 adds contextMenu and deleteConfirm state for canvas interactions.
 * Phase 5 adds connectionFilter for type-based edge filtering and
 * validationWarnings for graph validation results (outside undo/redo history).
 * Phase 6 adds rightPanelMode for switching between properties and history views.
 *
 * Key insight: selectedNodeId continues to drive the properties panel (shows when
 * exactly 1 node selected). Multi-selection state lives in React Flow's node.selected
 * boolean. The useOnSelectionChange hook syncs: 1 node -> set selectedNodeId,
 * 0 or 2+ -> set null.
 */

import { create } from 'zustand';
import type { RelationshipType } from '@/models/relationships';

/** All relationship types for connection filtering */
const ALL_RELATIONSHIP_TYPES: RelationshipType[] = [
  'equity', 'debt', 'trustee', 'beneficiary',
  'partnership', 'management', 'services', 'licensing',
];

/** Right panel mode: properties editor or version history */
export type RightPanelMode = 'properties' | 'history';

/** Canvas interaction mode: drag (pan) or select (marquee) */
export type InteractionMode = 'drag' | 'select';

/** Mobile tool mode for touch canvas interactions */
export type MobileTool = 'select' | 'pan' | 'connect';

/** Connection filter mode */
type FilterMode = 'all' | 'toggle' | 'highlight';

/** Connection filter state */
export interface ConnectionFilter {
  visibleTypes: Set<RelationshipType>;
  highlightedType: RelationshipType | null;
  mode: FilterMode;
}

/** UI state for selections, hover, palette, and interaction dialogs */
interface UIState {
  /** ID of the currently selected node, or null */
  selectedNodeId: string | null;
  /** ID of the currently selected edge, or null */
  selectedEdgeId: string | null;
  /** ID of the node currently being hovered, or null */
  hoveredNodeId: string | null;
  /** Whether the left palette sidebar is collapsed */
  isPaletteCollapsed: boolean;
  /** Current search filter text in the palette */
  paletteSearchQuery: string;
  /** Context menu position and target node, or null when hidden */
  contextMenu: { x: number; y: number; nodeId: string } | null;
  /** Delete confirmation dialog state, or null when hidden */
  deleteConfirm: { nodeIds: string[]; connectionCount: number } | null;
  /** Connection filter state for toggling visibility and highlighting by type */
  connectionFilter: ConnectionFilter;
  /** Validation warnings from graph validator, keyed by nodeId */
  validationWarnings: Map<string, string[]>;
  /** Which panel is shown on the right: properties editor or version history */
  rightPanelMode: RightPanelMode;
  /** Whether the grid background is visible */
  showGrid: boolean;
  /** Whether snap-to-grid is enabled */
  snapToGrid: boolean;
  /** Canvas background color */
  canvasBgColor: string;
  /** Whether the auto legend is visible on the canvas */
  showLegend: boolean;

  /** Canvas interaction mode: drag (pan) or select (marquee) */
  interactionMode: InteractionMode;

  /** Whether dark mode is active */
  darkMode: boolean;

  /** Whether the mobile entity palette bottom sheet is open */
  isMobilePaletteOpen: boolean;
  /** Whether the mobile properties bottom sheet is open */
  isMobilePropertiesOpen: boolean;
  /** Active mobile tool mode, null = default behavior */
  mobileTool: MobileTool | null;
  /** Node ID of pending connection source in tap-to-connect flow, null when not connecting */
  pendingConnectionSource: string | null;

  /** Set mobile palette open state */
  setMobilePaletteOpen: (open: boolean) => void;
  /** Set mobile properties open state */
  setMobilePropertiesOpen: (open: boolean) => void;
  /** Set active mobile tool */
  setMobileTool: (tool: MobileTool | null) => void;
  /** Set pending connection source node ID */
  setPendingConnectionSource: (nodeId: string | null) => void;

  /** Set the selected node (null to deselect). Non-null switches to properties view. */
  setSelectedNode: (id: string | null) => void;
  /** Set the selected edge (null to deselect). Non-null switches to properties view. */
  setSelectedEdge: (id: string | null) => void;
  /** Set the hovered node (null when mouse leaves) */
  setHoveredNode: (id: string | null) => void;
  /** Toggle the palette sidebar collapsed/expanded */
  togglePalette: () => void;
  /** Set the palette search query */
  setPaletteSearch: (query: string) => void;
  /** Set the context menu state (null to hide) */
  setContextMenu: (menu: { x: number; y: number; nodeId: string } | null) => void;
  /** Set the delete confirmation dialog state (null to hide) */
  setDeleteConfirm: (confirm: { nodeIds: string[]; connectionCount: number } | null) => void;
  /** Toggle a connection type in/out of the visible set */
  toggleConnectionType: (type: RelationshipType) => void;
  /** Set the highlighted connection type (null clears highlight) */
  setHighlightedType: (type: RelationshipType | null) => void;
  /** Set the filter mode (all/toggle/highlight) */
  setFilterMode: (mode: FilterMode) => void;
  /** Set validation warnings (replaces entire map) */
  setValidationWarnings: (warnings: Map<string, string[]>) => void;
  /** Set the right panel mode (properties or history) */
  setRightPanelMode: (mode: RightPanelMode) => void;
  /** Toggle grid background visibility */
  toggleGrid: () => void;
  /** Toggle snap-to-grid */
  toggleSnap: () => void;
  /** Set canvas background color */
  setCanvasBgColor: (color: string) => void;
  /** Toggle auto legend visibility */
  toggleLegend: () => void;

  /** Set the canvas interaction mode */
  setInteractionMode: (mode: InteractionMode) => void;

  /** Toggle dark mode */
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  selectedNodeId: null,
  selectedEdgeId: null,
  hoveredNodeId: null,
  isPaletteCollapsed: false,
  paletteSearchQuery: '',
  contextMenu: null,
  deleteConfirm: null,
  connectionFilter: {
    visibleTypes: new Set<RelationshipType>(ALL_RELATIONSHIP_TYPES),
    highlightedType: null,
    mode: 'all' as FilterMode,
  },
  validationWarnings: new Map(),
  rightPanelMode: 'properties',
  showGrid: true,
  snapToGrid: true,
  canvasBgColor: '#F3F4F6',
  showLegend: true,
  interactionMode: 'drag',
  darkMode: false,

  isMobilePaletteOpen: false,
  isMobilePropertiesOpen: false,
  mobileTool: null,
  pendingConnectionSource: null,

  setMobilePaletteOpen: (open) => set({ isMobilePaletteOpen: open }),
  setMobilePropertiesOpen: (open) => set({ isMobilePropertiesOpen: open }),
  setMobileTool: (tool) => set({ mobileTool: tool }),
  setPendingConnectionSource: (nodeId) => set({ pendingConnectionSource: nodeId }),

  setSelectedNode: (id) => set(id ? { selectedNodeId: id, rightPanelMode: 'properties' } : { selectedNodeId: id }),
  setSelectedEdge: (id) => set(id ? { selectedEdgeId: id, rightPanelMode: 'properties' } : { selectedEdgeId: id }),
  setHoveredNode: (id) => set({ hoveredNodeId: id }),
  togglePalette: () => set((state) => ({ isPaletteCollapsed: !state.isPaletteCollapsed })),
  setPaletteSearch: (query) => set({ paletteSearchQuery: query }),
  setContextMenu: (menu) => set({ contextMenu: menu }),
  setDeleteConfirm: (confirm) => set({ deleteConfirm: confirm }),

  toggleConnectionType: (type) =>
    set((state) => {
      const next = new Set(state.connectionFilter.visibleTypes);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return { connectionFilter: { ...state.connectionFilter, visibleTypes: next } };
    }),

  setHighlightedType: (type) =>
    set((state) => ({
      connectionFilter: {
        ...state.connectionFilter,
        highlightedType: type,
        mode: type ? 'highlight' : 'all',
      },
    })),

  setFilterMode: (mode) =>
    set((state) => {
      if (mode === 'all') {
        return {
          connectionFilter: {
            visibleTypes: new Set<RelationshipType>(ALL_RELATIONSHIP_TYPES),
            highlightedType: null,
            mode: 'all',
          },
        };
      }
      if (mode === 'toggle') {
        return {
          connectionFilter: {
            ...state.connectionFilter,
            highlightedType: null,
            mode: 'toggle',
          },
        };
      }
      // highlight mode
      return {
        connectionFilter: {
          ...state.connectionFilter,
          mode: 'highlight',
        },
      };
    }),

  setValidationWarnings: (warnings) => set({ validationWarnings: warnings }),
  setRightPanelMode: (mode) => set({ rightPanelMode: mode }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleSnap: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
  setCanvasBgColor: (color) => set({ canvasBgColor: color }),
  toggleLegend: () => set((state) => ({ showLegend: !state.showLegend })),

  setInteractionMode: (mode) => set({ interactionMode: mode }),

  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
}));
