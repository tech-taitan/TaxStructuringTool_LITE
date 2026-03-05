'use client';

/**
 * Horizontal editor toolbar rendered above the canvas.
 *
 * Contains grouped action buttons for History (Undo/Redo), Clipboard (Copy/Paste),
 * Edit (Delete/Select All), View (Zoom In/Zoom Out/Fit View), and Filter
 * (connection type visibility toggle / highlight-dim mode).
 *
 * Each button shows a native tooltip via the title attribute and displays
 * a disabled visual state when its action is unavailable.
 */

import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import {
  Undo2,
  Redo2,
  Trash2,
  Save,
  Loader2,
  Copy,
  ClipboardPaste,
  BoxSelect,
  ZoomIn,
  ZoomOut,
  Maximize,
  Filter,
  Grid3x3,
  Paintbrush,
  BookOpen,
  Download,
  Hand,
  MousePointer2,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround,
  Ruler,
  Moon,
  Sun,
  ChevronsLeftRight,
  ChevronsRightLeft,
  LayoutGrid,
} from 'lucide-react';
import type { RelationshipType } from '@/models/relationships';
import type { ConnectionFilter, InteractionMode } from '@/stores/ui-store';

/** Context for toolbar expanded state -- buttons auto-show labels when expanded */
const ToolbarExpandedContext = createContext(false);

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

/** Ordered list of all relationship types for filter UI */
const RELATIONSHIP_TYPES: RelationshipType[] = [
  'equity', 'debt', 'trustee', 'beneficiary',
  'partnership', 'management', 'services', 'licensing',
];

interface EditorToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onSelectAll: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  canUndo: boolean;
  canRedo: boolean;
  canPaste: boolean;
  hasSelection: boolean;
  connectionFilter: ConnectionFilter;
  onToggleConnectionType: (type: RelationshipType) => void;
  onSetHighlightedType: (type: RelationshipType | null) => void;
  onSetFilterMode: (mode: 'all' | 'toggle' | 'highlight') => void;
  onAutoLayout: () => void;
  onShowTemplates: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  canvasBgColor: string;
  onSetCanvasBgColor: (color: string) => void;
  showLegend: boolean;
  onToggleLegend: () => void;

  interactionMode: InteractionMode;
  onSetInteractionMode: (mode: InteractionMode) => void;
  onAlign?: (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDistribute?: (type: 'horizontal' | 'vertical') => void;
  multiSelected?: boolean;
  onExportPng?: () => void;
  onExportSvg?: () => void;
  onExportPdf?: () => void;
  canExport?: boolean;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  canSave?: boolean;
}

/** Extract a short label from a title string (strips keyboard shortcut hints) */
function shortLabel(title: string): string {
  // Remove parenthetical shortcuts like "(Ctrl+Z)" and trim
  return title.replace(/\s*\([^)]*\)\s*/g, '').trim();
}

/** Single toolbar button with icon, tooltip, optional text label, and disabled state */
function ToolbarButton({
  onClick,
  disabled = false,
  title,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  label?: string;
  children: React.ReactNode;
}) {
  const expanded = useContext(ToolbarExpandedContext);
  const displayLabel = label ?? (expanded ? shortLabel(title) : undefined);

  if (expanded && displayLabel) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-2 rounded transition-colors flex flex-col items-center gap-0.5 min-w-[52px] ${disabled
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
          }`}
      >
        {children}
        <span className="text-[10px] leading-tight whitespace-nowrap">
          {displayLabel}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors flex items-center gap-1 ${disabled
        ? 'text-gray-300 cursor-not-allowed'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
        }`}
    >
      {children}
      {displayLabel && (
        <span className="text-xs whitespace-nowrap hidden sm:inline">
          {displayLabel}
        </span>
      )}
    </button>
  );
}

/** Visual separator between button groups */
function Divider() {
  const expanded = useContext(ToolbarExpandedContext);
  if (expanded) return <div className="w-px h-10 bg-gray-200 mx-1" />;
  return <div className="w-px h-6 bg-gray-300 mx-1.5" />;
}

/** Capitalize first letter */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Preset background colors for the canvas */
const BG_COLOR_PRESETS = [
  { color: '#FFFFFF', label: 'White' },
  { color: '#F9FAFB', label: 'Gray 50' },
  { color: '#F3F4F6', label: 'Gray 100' },
  { color: '#E5E7EB', label: 'Gray 200' },
  { color: '#F1F5F9', label: 'Slate 100' },
  { color: '#EFF6FF', label: 'Blue 50' },
  { color: '#F0FDF4', label: 'Green 50' },
  { color: '#FFFBEB', label: 'Amber 50' },
];

/** Background color picker dropdown */
function BgColorDropdown({
  currentColor,
  onSelect,
}: {
  currentColor: string;
  onSelect: (color: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <ToolbarButton
        onClick={() => setIsOpen(!isOpen)}
        title="Canvas Background Color"
      >
        <Paintbrush className="w-4 h-4" />
      </ToolbarButton>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50 w-40">
          <div className="text-xs font-medium text-gray-500 mb-2">Background</div>
          <div className="grid grid-cols-4 gap-1.5">
            {BG_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.color}
                title={preset.label}
                onClick={() => {
                  onSelect(preset.color);
                  setIsOpen(false);
                }}
                className={`w-7 h-7 rounded border-2 transition-colors ${currentColor.toUpperCase() === preset.color
                  ? 'border-blue-500'
                  : 'border-gray-200 hover:border-gray-400 active:border-gray-500'
                  }`}
                style={{ backgroundColor: preset.color }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Filter dropdown for connection type visibility and highlight mode */
function FilterDropdown({
  connectionFilter,
  onToggleConnectionType,
  onSetHighlightedType,
  onSetFilterMode,
}: {
  connectionFilter: ConnectionFilter;
  onToggleConnectionType: (type: RelationshipType) => void;
  onSetHighlightedType: (type: RelationshipType | null) => void;
  onSetFilterMode: (mode: 'all' | 'toggle' | 'highlight') => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <ToolbarButton
        onClick={() => setIsOpen(!isOpen)}
        title="Filter Connections"
      >
        <Filter className="w-4 h-4" />
      </ToolbarButton>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50 w-56">
          {/* Mode tabs */}
          <div className="flex gap-1 mb-3">
            {(['all', 'toggle', 'highlight'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onSetFilterMode(mode)}
                className={`flex-1 text-xs py-1 px-2 rounded font-medium transition-colors ${connectionFilter.mode === mode
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-100 active:bg-gray-200'
                  }`}
              >
                {capitalize(mode)}
              </button>
            ))}
          </div>

          {/* Mode content */}
          {connectionFilter.mode === 'all' && (
            <p className="text-xs text-gray-500 text-center py-2">
              All connections visible
            </p>
          )}

          {connectionFilter.mode === 'toggle' && (
            <div className="space-y-1.5">
              {RELATIONSHIP_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 active:bg-gray-100 rounded px-1 py-0.5"
                >
                  <input
                    type="checkbox"
                    checked={connectionFilter.visibleTypes.has(type)}
                    onChange={() => onToggleConnectionType(type)}
                    className="rounded text-blue-600"
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: EDGE_COLORS[type] }}
                  />
                  <span className="text-gray-700">{capitalize(type)}</span>
                </label>
              ))}
            </div>
          )}

          {connectionFilter.mode === 'highlight' && (
            <div className="space-y-1.5">
              {RELATIONSHIP_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 active:bg-gray-100 rounded px-1 py-0.5"
                >
                  <input
                    type="radio"
                    name="highlight-type"
                    checked={connectionFilter.highlightedType === type}
                    onChange={() => onSetHighlightedType(type)}
                    className="text-blue-600"
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: EDGE_COLORS[type] }}
                  />
                  <span className="text-gray-700">{capitalize(type)}</span>
                </label>
              ))}
              {connectionFilter.highlightedType && (
                <button
                  onClick={() => onSetHighlightedType(null)}
                  className="text-xs text-blue-600 hover:text-blue-700 w-full text-center mt-1"
                >
                  Clear highlight
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Alignment & distribution dropdown */
function AlignDropdown({
  onAlign,
  onDistribute,
  disabled,
}: {
  onAlign: (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDistribute: (type: 'horizontal' | 'vertical') => void;
  disabled: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <ToolbarButton
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        title="Align & Distribute (select 2+ entities)"
      >
        <Ruler className="w-4 h-4" />
      </ToolbarButton>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50 w-48">
          <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-1 mb-1">
            Align
          </div>
          <div className="grid grid-cols-3 gap-1 mb-2">
            <button onClick={() => handleAction(() => onAlign('left'))} title="Align Left" className="p-1.5 rounded hover:bg-gray-100 active:bg-gray-200 text-gray-600">
              <AlignStartVertical className="w-4 h-4" />
            </button>
            <button onClick={() => handleAction(() => onAlign('center'))} title="Align Center" className="p-1.5 rounded hover:bg-gray-100 active:bg-gray-200 text-gray-600">
              <AlignCenterVertical className="w-4 h-4" />
            </button>
            <button onClick={() => handleAction(() => onAlign('right'))} title="Align Right" className="p-1.5 rounded hover:bg-gray-100 active:bg-gray-200 text-gray-600">
              <AlignEndVertical className="w-4 h-4" />
            </button>
            <button onClick={() => handleAction(() => onAlign('top'))} title="Align Top" className="p-1.5 rounded hover:bg-gray-100 active:bg-gray-200 text-gray-600">
              <AlignStartHorizontal className="w-4 h-4" />
            </button>
            <button onClick={() => handleAction(() => onAlign('middle'))} title="Align Middle" className="p-1.5 rounded hover:bg-gray-100 active:bg-gray-200 text-gray-600">
              <AlignCenterHorizontal className="w-4 h-4" />
            </button>
            <button onClick={() => handleAction(() => onAlign('bottom'))} title="Align Bottom" className="p-1.5 rounded hover:bg-gray-100 active:bg-gray-200 text-gray-600">
              <AlignEndHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-1 mb-1">
            Distribute
          </div>
          <div className="grid grid-cols-2 gap-1">
            <button onClick={() => handleAction(() => onDistribute('horizontal'))} title="Distribute Horizontally" className="p-1.5 rounded hover:bg-gray-100 active:bg-gray-200 text-gray-600 flex items-center gap-1 text-xs">
              <AlignHorizontalSpaceAround className="w-4 h-4" />
              <span>Horizontal</span>
            </button>
            <button onClick={() => handleAction(() => onDistribute('vertical'))} title="Distribute Vertically" className="p-1.5 rounded hover:bg-gray-100 active:bg-gray-200 text-gray-600 flex items-center gap-1 text-xs">
              <AlignVerticalSpaceAround className="w-4 h-4" />
              <span>Vertical</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Export format dropdown */
function ExportDropdown({
  onExportPng,
  onExportSvg,
  onExportPdf,
  canExport,
}: {
  onExportPng?: () => void;
  onExportSvg?: () => void;
  onExportPdf?: () => void;
  canExport: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <ToolbarButton
        onClick={() => setIsOpen(!isOpen)}
        disabled={!canExport}
        title="Export Diagram"
      >
        <Download className="w-4 h-4" />
      </ToolbarButton>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 w-40">
          <button
            onClick={() => { onExportPng?.(); setIsOpen(false); }}
            className="w-full text-left text-xs px-3 py-1.5 text-gray-700 hover:bg-gray-100 active:bg-gray-200"
          >
            Export as PNG
          </button>
          <button
            onClick={() => { onExportSvg?.(); setIsOpen(false); }}
            className="w-full text-left text-xs px-3 py-1.5 text-gray-700 hover:bg-gray-100 active:bg-gray-200"
          >
            Export as SVG
          </button>
          <button
            onClick={() => { onExportPdf?.(); setIsOpen(false); }}
            className="w-full text-left text-xs px-3 py-1.5 text-gray-700 hover:bg-gray-100 active:bg-gray-200"
          >
            Export as PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default function EditorToolbar({
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onDelete,
  onSelectAll,
  onZoomIn,
  onZoomOut,
  onFitView,
  canUndo,
  canRedo,
  canPaste,
  hasSelection,
  connectionFilter,
  onToggleConnectionType,
  onSetHighlightedType,
  onSetFilterMode,
  onAutoLayout,
  onShowTemplates,
  showGrid,
  onToggleGrid,
  canvasBgColor,
  onSetCanvasBgColor,
  showLegend,
  onToggleLegend,

  interactionMode,
  onSetInteractionMode,
  onAlign,
  onDistribute,
  multiSelected = false,
  onExportPng,
  onExportSvg,
  onExportPdf,
  canExport = false,
  darkMode = false,
  onToggleDarkMode,
  onSave,
  isSaving = false,
  canSave = false,
}: EditorToolbarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <ToolbarExpandedContext.Provider value={expanded}>
      <div className={`bg-white border-b border-gray-200 flex items-center px-2 overflow-x-auto ${expanded ? 'h-auto py-1.5 flex-wrap gap-0' : 'h-10 gap-0.5'}`}>

        {/* Group 0: Save */}
        {onSave && (
          <>
            <ToolbarButton
              onClick={onSave}
              disabled={!canSave || isSaving}
              title="Save (Ctrl+S)"
              label="Save"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
            </ToolbarButton>
            <Divider />
          </>
        )}

        {/* Group 1: History */}
        <ToolbarButton onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" label="Undo">
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)" label="Redo">
          <Redo2 className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Group 2: Clipboard */}
        <ToolbarButton onClick={onCopy} disabled={!hasSelection} title="Copy (Ctrl+C)">
          <Copy className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={onPaste} disabled={!canPaste} title="Paste (Ctrl+V)">
          <ClipboardPaste className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Group 3: Interaction Mode + Edit */}
        <ToolbarButton
          onClick={() => onSetInteractionMode(interactionMode === 'drag' ? 'select' : 'drag')}
          title={interactionMode === 'drag' ? 'Switch to Select Mode (V)' : 'Switch to Drag Mode (H)'}
        >
          {interactionMode === 'drag' ? (
            <Hand className="w-4 h-4" />
          ) : (
            <MousePointer2 className="w-4 h-4 text-blue-600" />
          )}
        </ToolbarButton>
        <ToolbarButton onClick={onDelete} disabled={!hasSelection} title="Delete (Del)" label="Delete">
          <Trash2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={onSelectAll} title="Select All (Ctrl+A)">
          <BoxSelect className="w-4 h-4" />
        </ToolbarButton>
        {onAlign && onDistribute && (
          <AlignDropdown
            onAlign={onAlign}
            onDistribute={onDistribute}
            disabled={!multiSelected}
          />
        )}

        <Divider />

        {/* Group 4: View */}
        <ToolbarButton onClick={onZoomIn} title="Zoom In">
          <ZoomIn className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={onZoomOut} title="Zoom Out">
          <ZoomOut className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={onFitView} title="Fit View">
          <Maximize className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={onToggleGrid} title={showGrid ? 'Hide Grid' : 'Show Grid'}>
          <Grid3x3 className={`w-4 h-4 ${showGrid ? '' : 'text-gray-300'}`} />
        </ToolbarButton>
        <BgColorDropdown
          currentColor={canvasBgColor}
          onSelect={onSetCanvasBgColor}
        />
        <ToolbarButton onClick={onToggleLegend} title={showLegend ? 'Hide Legend' : 'Show Legend'}>
          <BookOpen className={`w-4 h-4 ${showLegend ? '' : 'text-gray-300'}`} />
        </ToolbarButton>
        {onToggleDarkMode && (
          <ToolbarButton onClick={onToggleDarkMode} title={darkMode ? 'Light Mode' : 'Dark Mode'}>
            {darkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4" />}
          </ToolbarButton>
        )}

        <Divider />

        {/* Group 5: Filter */}
        <FilterDropdown
          connectionFilter={connectionFilter}
          onToggleConnectionType={onToggleConnectionType}
          onSetHighlightedType={onSetHighlightedType}
          onSetFilterMode={onSetFilterMode}
        />

        <Divider />

        {/* Group 6: Smart */}
        <ToolbarButton onClick={onAutoLayout} title="Auto Align">
          <LayoutGrid className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={onShowTemplates} title="Load Template">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        </ToolbarButton>

        <Divider />

        {/* Group 7: Export */}
        <ExportDropdown
          onExportPng={onExportPng}
          onExportSvg={onExportSvg}
          onExportPdf={onExportPdf}
          canExport={canExport}
        />



        {/* Expand / Collapse toggle -- pushed to right edge */}
        <div className="ml-auto" />
        <button
          onClick={() => setExpanded((v) => !v)}
          title={expanded ? 'Collapse toolbar labels' : 'Expand toolbar labels'}
          className="p-1.5 rounded transition-colors text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:bg-gray-200"
        >
          {expanded ? (
            <ChevronsRightLeft className="w-4 h-4" />
          ) : (
            <ChevronsLeftRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </ToolbarExpandedContext.Provider>
  );
}
