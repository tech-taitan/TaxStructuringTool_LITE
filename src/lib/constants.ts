/**
 * Shared constants used across the application.
 *
 * Grid dimensions, canvas bounds, zoom range, default viewport,
 * and the corporate blue color palette.
 */

/** Grid cell size in pixels -- used for both snapGrid and Background gap */
export const GRID_SIZE = 20;

/** Soft warning threshold for entity count on the canvas */
export const ENTITY_SOFT_LIMIT = 50;

/** Expanded palette sidebar width in pixels (Tailwind w-64) */
export const PALETTE_WIDTH_EXPANDED = 256;

/** Collapsed palette strip width in pixels (Tailwind w-12) */
export const PALETTE_WIDTH_COLLAPSED = 48;

/** Approximate entity node width for overlap detection (matches min-width: 180px in .entity-node CSS) */
export const NODE_WIDTH = 180;

/** Approximate entity node height for overlap detection (matches min-height: 70px in .entity-node CSS) */
export const NODE_HEIGHT = 70;

/** Major grid line interval (every Nth fine grid line) */
export const MAJOR_GRID_MULTIPLIER = 5;

/** Canvas node placement bounds: [[minX, minY], [maxX, maxY]] */
export const CANVAS_BOUNDS: [[number, number], [number, number]] = [
  [0, 0],
  [10000, 8000],
];

/** Viewport panning bounds with padding beyond node bounds */
export const CANVAS_TRANSLATE_EXTENT: [[number, number], [number, number]] = [
  [-200, -200],
  [10200, 8200],
];

/** Zoom range: 10% to 200% per user decision */
export const ZOOM_RANGE = {
  min: 0.1,
  max: 2,
} as const;

/** Default viewport position and zoom */
export const DEFAULT_VIEWPORT = {
  x: 0,
  y: 0,
  zoom: 1,
} as const;

// --- Phase 3: Canvas Interactions ---

/** Minimum entity node width during resize (must remain readable) */
export const MIN_NODE_WIDTH = 120;
/** Minimum entity node height during resize (must remain readable) */
export const MIN_NODE_HEIGHT = 50;
/** Snap threshold in pixels for alignment helper lines */
export const SNAP_THRESHOLD = 5;
/** Paste offset in pixels (down-right from original) */
export const PASTE_OFFSET = 30;
/** Maximum undo history depth */
export const UNDO_LIMIT = 50;

// --- Phase 5: Smart Canvas ---

/** Auto-layout: vertical space between hierarchy ranks */
export const LAYOUT_RANK_SEP = 120;
/** Auto-layout: horizontal space between nodes in same rank */
export const LAYOUT_NODE_SEP = 60;
/** Auto-layout: space between parallel edges */
export const LAYOUT_EDGE_SEP = 30;
/** Auto-layout: horizontal/vertical margin */
export const LAYOUT_MARGIN = 40;

/** Corporate blue color palette for the professional law-firm aesthetic */
export const COLORS = {
  grid: {
    /** Fine grid line color (gray-200) */
    fine: '#e5e7eb',
    /** Major grid line color (gray-300) */
    major: '#d1d5db',
    /** Fine grid line width in pixels */
    fineWidth: 0.5,
    /** Major grid line width in pixels */
    majorWidth: 1,
  },
  entity: {
    /** Company nodes (blue-600) */
    company: '#2563EB',
    /** Trust nodes (violet-600) */
    trust: '#7C3AED',
    /** Partnership nodes (emerald-600) */
    partnership: '#059669',
    /** Venture capital nodes (amber-600) */
    vc: '#D97706',
    /** Individual nodes (slate-500) */
    individual: '#64748B',
    /** SMSF nodes (teal-600) */
    smsf: '#0D9488',
    /** Fund nodes (violet-500) */
    fund: '#8B5CF6',
    /** Holding vehicle nodes (cyan-600) */
    holding: '#0891B2',
    /** Pension scheme nodes (orange-600) */
    pension: '#EA580C',
    /** Selected entity highlight (blue-500) */
    selected: '#3B82F6',
    /** Validation error border (red-500) */
    error: '#EF4444',
  },
  /** Solid background fill colors per entity category */
  entityBg: {
    company: '#DBEAFE',
    trust: '#EDE9FE',
    partnership: '#D1FAE5',
    vc: '#FEF3C7',
    individual: '#F1F5F9',
    smsf: '#CCFBF1',
    fund: '#F5F3FF',
    holding: '#CFFAFE',
    pension: '#FFF7ED',
  },
} as const;

/** Jurisdiction border accent colors -- 6 visually distinct colors, one per jurisdiction */
export const JURISDICTION_COLORS: Record<string, string> = {
  AU: '#15803D', // green-700 -- Australian green
  UK: '#1E40AF', // blue-800 -- British blue
  US: '#B91C1C', // red-700 -- American red
  HK: '#EA580C', // orange-600 -- Hong Kong orange
  SG: '#7C3AED', // violet-600 -- Singapore purple
  LU: '#0891B2', // cyan-600 -- Luxembourg teal
};
