# Phase 13: Mobile Properties Editing - Research

**Researched:** 2026-03-05
**Domain:** Mobile properties bottom sheet, long-press context menu, iOS keyboard handling, connection type picker adaptation, AI analysis mobile overlay
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

1. **Properties Sheet Trigger and Behavior**
   - Two-step open: tap selected entity. First tap selects the entity (shows selection ring). Second tap on the *same* already-selected entity opens the properties bottom sheet. This prevents accidental properties opening when the user just wants to select or move.
   - Sheet updates in-place on entity switch. While the properties sheet is open, tapping a different entity selects the new entity and the sheet updates to show the new entity's properties. No close-reopen cycle -- smooth transition for comparing entities.
   - Same pattern for connections. First tap selects the connection (highlights it). Second tap on the same selected connection opens connection properties in a bottom sheet.
   - Half-height initial snap, auto-expand on keyboard. The properties sheet opens at the `half` snap point (~45% visible). When a text input is focused and the virtual keyboard appears, the sheet expands to `full` to keep form fields visible above the keyboard. When the keyboard dismisses, the sheet returns to `half`.

2. **Long-Press Context Menu**
   - Floating action list near press location. A compact vertical list of action buttons appears near the long-press point, positioned to avoid going offscreen (above the finger if near bottom, below if near top). Styled like iOS context menus -- floating, with subtle shadow, rounded corners.
   - Four actions: Delete, Copy, Connect, Properties. Matching the roadmap spec. "Connect" starts the tap-to-connect flow with this entity as source (wired for Phase 14). "Properties" opens the properties bottom sheet.
   - Auto-select on long-press. Long-pressing an entity selects it AND shows the menu in one gesture. If the entity was already selected, the menu still appears. This means every long-press results in: entity selected + menu visible.
   - Dismiss: tap outside or tap action. Tapping anywhere outside the menu closes it without executing any action. Tapping an action executes it and closes the menu. No scrim overlay -- the canvas remains visible.

3. **AI Analysis Mobile Layout**
   - Full-screen overlay. When triggered, a full-screen sheet slides up covering the canvas entirely. Has a close/back button at the top left and the analysis title. Dedicated reading experience for the streaming analysis content.
   - Analysis is modal. While the analysis overlay is open, the canvas is not interactive. The user must close/dismiss the overlay to return to editing. This simplifies state management -- no need to handle canvas changes while analysis is visible.
   - Dedicated toolbar button. An "Analyze" icon button (e.g., Sparkles or Brain) is added directly to the floating bottom toolbar alongside the existing undo/redo/add/connect buttons.
   - PDF export included. The mobile analysis overlay includes the same "Export PDF" button as the desktop analysis panel, using the same `@react-pdf/renderer` pipeline. Button appears at the bottom of the analysis content after streaming completes.

4. **Modal Adaptations**
   - Connection type picker becomes a bottom sheet on mobile. Shows the 4 connection types as tappable rows with colored icons and one-line descriptions. Half-height snap.
   - Delete confirmation keeps centered dialog. The existing centered confirmation dialog already works on mobile (Phase 11). Only change: ensure Cancel and Delete buttons meet 44px minimum touch target height.
   - Template picker keeps centered modal. No changes needed (Phase 11 fragment wrapper).

### Claude's Discretion

None specified -- all decisions are locked.

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope.
</user_constraints>

## Summary

Phase 13 adds mobile properties editing to the Tax Structuring Tool. This phase creates five major capabilities: (1) entity properties bottom sheet triggered by tapping an already-selected entity, (2) connection properties bottom sheet with the same trigger pattern, (3) long-press context menu with delete/copy/connect/properties actions, (4) AI analysis full-screen mobile overlay with streaming and PDF export, and (5) connection type picker adapted as a bottom sheet on mobile.

The implementation is well-scoped because all foundational pieces exist: the `BottomSheet` component (Phase 10) with snap points, spring animations, and drag-handle-only touch handling; the `PropertiesPanel` and `ConnectionPropertiesPanel` desktop components with all form fields, Zod validation, and debounced auto-save; the `useLongPress` hook with configurable duration and move threshold; the `CanvasContextMenu` component with Delete/Copy/Properties actions; the `useClipboard` hook for copy operations; the `ConnectionTypePickerModal` with all 8 relationship types; the `useOnSelectionChange` hook that syncs React Flow selection to UI store; and the `MobileEditorLayout` with the floating toolbar already wiring Add and Connect buttons.

The primary new work is: (1) a `MobilePropertiesSheet` component that wraps `PropertiesPanel`/`ConnectionPropertiesPanel` in a `BottomSheet` with two-step open logic and keyboard-aware snap expansion, (2) a `MobileContextMenu` component positioned near the long-press point with smart edge-of-screen avoidance, (3) a `MobileAnalysisOverlay` full-screen sheet for streaming AI analysis with PDF export, (4) a `MobileConnectionTypePicker` that renders connection types as tappable rows in a bottom sheet, (5) iOS Safari virtual keyboard detection using `visualViewport` resize events to drive sheet snap point changes, and (6) a "two-step tap" interaction layer in Canvas that distinguishes "select" from "open properties" based on whether the tapped entity was already selected.

**Primary recommendation:** Build the mobile properties sheet by composing the existing `BottomSheet` with the existing `PropertiesPanel`/`ConnectionPropertiesPanel` components as children, adding a `useKeyboardAwareSnap` hook that listens for `visualViewport` resize events to toggle between `half` and `full` snap points, and implementing the two-step open logic by comparing `selectedNodeId` against the tapped node's ID in a mobile-specific `onNodeClick` handler.

## Standard Stack

### Core (Already Installed -- Zero New Dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@xyflow/react` | ^12.10.0 | Canvas, node selection, `useOnSelectionChange`, `onNodeClick` handler | Already used for all canvas operations |
| `zustand` | ^5.0.11 | State management (`ui-store.isMobilePropertiesOpen`, `selectedNodeId`, `selectedEdgeId`) | Already used for all app state |
| `lucide-react` | ^0.564.0 | Icons for context menu actions (Trash2, Copy, Link, Settings, Sparkles) | Already used throughout UI |
| `react-markdown` | * | Markdown rendering in notes preview | Already used in `NotesSection` and `ConnectionPropertiesPanel` |

### Supporting (Already Present)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zundo` | ^2.3.0 | Temporal middleware for undo/redo | Delete/copy actions go through tracked store mutations |
| `immer` | ^11.1.4 | Immutable state updates in graph store | Used internally by graph store |
| `nanoid` | ^5.1.6 | ID generation | Needed if copy creates new nodes |

### New Dependency Required

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@react-pdf/renderer` | ^4.x | PDF generation from analysis results | Analysis overlay "Export PDF" button -- CONTEXT says "same `@react-pdf/renderer` pipeline" but this is NOT currently installed. Needs investigation in Phase 13 or may be deferred if AI analysis is not yet built. |

**NOTE:** The CONTEXT.md references AI analysis with streaming results and PDF export via `@react-pdf/renderer`. However, no AI analysis panel, streaming infrastructure, or `@react-pdf/renderer` dependency currently exists in the codebase. The `exportCanvasPdf` function in `src/lib/export.ts` exists but uses a different mechanism. The AI analysis feature (MPROP-04) may require significant backend work not covered by this phase's scope. See Open Questions.

### Alternatives Considered

None -- the zero-new-dependencies constraint is locked (except `@react-pdf/renderer` which the user explicitly named).

**Installation:** No installation needed for the core work. `@react-pdf/renderer` may be needed for MPROP-04 if the AI analysis backend exists.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── mobile/
│   │   ├── BottomSheet.tsx                    # Existing -- Phase 10
│   │   ├── MobilePalette.tsx                  # Existing -- Phase 12
│   │   ├── MobilePropertiesSheet.tsx          # NEW -- wraps PropertiesPanel/ConnectionPropertiesPanel
│   │   ├── MobileContextMenu.tsx              # NEW -- long-press action menu
│   │   ├── MobileConnectionTypePicker.tsx     # NEW -- connection type picker as bottom sheet
│   │   └── MobileAnalysisOverlay.tsx          # NEW -- full-screen AI analysis overlay
│   ├── properties/
│   │   ├── PropertiesPanel.tsx                # Existing -- entity properties (reused as-is)
│   │   ├── ConnectionPropertiesPanel.tsx       # MOVED from connections/ or imported
│   │   ├── IdentitySection.tsx                # Existing -- reused inside mobile sheet
│   │   ├── RegistrationSection.tsx            # Existing -- reused inside mobile sheet
│   │   ├── TaxStatusSection.tsx               # Existing -- reused inside mobile sheet
│   │   └── NotesSection.tsx                   # Existing -- reused inside mobile sheet
│   ├── canvas/
│   │   └── Canvas.tsx                         # Modify -- add mobile onNodeClick handler
│   └── editor/
│       └── MobileEditorLayout.tsx             # Modify -- mount new sheets, add analyze button
├── hooks/
│   ├── useLongPress.ts                        # Existing -- Phase 10 (used in context menu)
│   └── useKeyboardAwareSnap.ts                # NEW -- visualViewport keyboard detection
└── stores/
    └── ui-store.ts                            # Modify -- add context menu state, analysis overlay state
```

### Pattern 1: Two-Step Tap to Open Properties

**What:** First tap selects the entity (React Flow's built-in selection). Second tap on the *same already-selected* entity opens the properties bottom sheet. When the sheet is already open, tapping a different entity updates the sheet content in-place.

**When to use:** Every time a mobile user taps an entity node on the canvas.

**Implementation approach:**

```typescript
// In Canvas.tsx -- add onNodeClick handler for mobile
const onNodeClick = useCallback(
  (_event: React.MouseEvent, node: TaxNode) => {
    if (!isMobile) return; // Desktop uses sidebar, not bottom sheet

    const currentSelectedId = useUIStore.getState().selectedNodeId;
    const isPropertiesOpen = useUIStore.getState().isMobilePropertiesOpen;

    if (currentSelectedId === node.id) {
      // Second tap on same node -- open properties sheet
      if (!isPropertiesOpen) {
        useUIStore.getState().setMobilePropertiesOpen(true);
      }
      // If already open, tapping same node again is a no-op
    }
    // React Flow's built-in selection handles the first tap automatically
    // via useOnSelectionChange -> setSelectedNode
  },
  [isMobile],
);
```

**Key insight:** React Flow's `onNodeClick` fires AFTER the selection change, so by the time our handler runs, `selectedNodeId` has already been updated to the clicked node. We need to compare against the *previous* value. Two approaches:
1. Store `prevSelectedNodeId` in a ref and compare in the click handler
2. Use `onNodeClick` and check if `node.id === currentSelectedId` -- this works because `useOnSelectionChange` fires on the NEXT render, not synchronously during the click.

**Verified behavior:** The `useOnSelectionChange` hook in Canvas.tsx syncs selection to `ui-store.selectedNodeId`. The `onNodeClick` handler can read the *current* (pre-update) `selectedNodeId` to determine if this is a re-tap.

### Pattern 2: Keyboard-Aware Sheet Snap with visualViewport

**What:** When a text input inside the properties bottom sheet receives focus and the iOS virtual keyboard appears, the sheet auto-expands from `half` to `full` snap point. When keyboard dismisses, sheet returns to `half`.

**When to use:** Whenever the mobile properties sheet contains focused form inputs.

**Implementation approach:**

```typescript
// useKeyboardAwareSnap.ts
export function useKeyboardAwareSnap(
  isOpen: boolean,
  springTo: (snapPercent: number) => void,
) {
  const isKeyboardOpenRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    const vv = window.visualViewport;
    if (!vv) return;

    // Capture initial viewport height (no keyboard)
    const initialHeight = vv.height;
    const KEYBOARD_THRESHOLD = 100; // px -- minimum height reduction to count as keyboard

    const handleResize = () => {
      const heightDiff = initialHeight - vv.height;
      const keyboardVisible = heightDiff > KEYBOARD_THRESHOLD;

      if (keyboardVisible && !isKeyboardOpenRef.current) {
        isKeyboardOpenRef.current = true;
        springTo(SNAP_PERCENTS.full); // expand to full
      } else if (!keyboardVisible && isKeyboardOpenRef.current) {
        isKeyboardOpenRef.current = false;
        springTo(SNAP_PERCENTS.half); // return to half
      }
    };

    vv.addEventListener('resize', handleResize);
    return () => vv.removeEventListener('resize', handleResize);
  }, [isOpen, springTo]);
}
```

**Gotcha -- iOS Safari delayed update:** Closing the virtual keyboard in iOS does not immediately update the visual viewport height. A short delay (~300ms) may be needed after blur events before checking viewport size. However, listening to the `visualViewport.resize` event (rather than polling) handles this correctly on modern iOS (17+).

**Gotcha -- dvh vs visualViewport:** The `BottomSheet` already uses `100dvh` for its height, which correctly accounts for the iOS Safari dynamic address bar. The `visualViewport` API is needed specifically for detecting keyboard *appearance/disappearance* events, not for sizing. The `dvh` unit does NOT account for the virtual keyboard on iOS Safari (Safari does not support `interactive-widget: resizes-content`).

### Pattern 3: Long-Press Context Menu with Position Clamping

**What:** On long-press of an entity node, show a floating action menu near the press point. The menu must be clamped to stay within viewport bounds.

**When to use:** When the user performs a sustained touch (500ms) on an entity node.

**Implementation approach:**

```typescript
// Positioning logic for MobileContextMenu
function clampMenuPosition(
  pressX: number,
  pressY: number,
  menuWidth: number,
  menuHeight: number,
): { x: number; y: number } {
  const MARGIN = 16;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Horizontal: prefer right of press, flip left if off-screen
  let x = pressX + MARGIN;
  if (x + menuWidth > vw - MARGIN) {
    x = pressX - menuWidth - MARGIN;
  }
  x = Math.max(MARGIN, Math.min(vw - menuWidth - MARGIN, x));

  // Vertical: prefer below press, flip above if near bottom
  let y = pressY + MARGIN;
  if (y + menuHeight > vh - MARGIN) {
    y = pressY - menuHeight - MARGIN;
  }
  y = Math.max(MARGIN, Math.min(vh - menuHeight - MARGIN, y));

  return { x, y };
}
```

**Integration with useLongPress:** The existing `useLongPress` hook returns touch handlers. On `onFinish`, the handler should: (1) select the entity, (2) set context menu state with position and nodeId, (3) optionally provide haptic feedback via `navigator.vibrate(10)`.

**Key insight:** The long-press hook fires `onFinish` after the timer, but the touch event coordinates come from `onTouchStart`. Store the touch coordinates in a ref during `onStart` and use them in `onFinish` for menu positioning.

### Pattern 4: In-Place Entity Switch While Sheet Is Open

**What:** When the properties sheet is open and the user taps a different entity, the sheet stays open and re-renders with the new entity's data.

**When to use:** Any time the user taps a different entity while the bottom sheet is showing properties.

**Implementation approach:**

The existing `PropertiesPanel` accepts `nodeId` as a prop and uses `key={nodeId}` at the mount point to force re-mount when switching entities. The same pattern works inside the mobile bottom sheet:

```tsx
<BottomSheet isOpen={isMobilePropertiesOpen} onClose={handleClose}>
  {selectedNodeId && (
    <PropertiesPanel key={selectedNodeId} nodeId={selectedNodeId} />
  )}
  {selectedEdgeId && !selectedNodeId && (
    <ConnectionPropertiesPanel key={selectedEdgeId} edgeId={selectedEdgeId} />
  )}
</BottomSheet>
```

The `key` prop forces React to unmount and remount the panel, which resets all local form state (the `useState` initializer re-reads from the store). This is the existing pattern from `EditorLayout.tsx` line 364-375.

### Pattern 5: Connection Type Picker as Bottom Sheet

**What:** On mobile, replace the centered modal `ConnectionTypePickerModal` with a bottom sheet showing the same 8 relationship types as tappable rows.

**When to use:** When a new connection is drawn on mobile and needs a type selection.

**Implementation approach:**

Use device detection to conditionally render:
```tsx
{pendingConnection && (
  isMobile ? (
    <MobileConnectionTypePicker
      onSelect={handleConnectionTypeSelected}
      onCancel={handleConnectionCancel}
    />
  ) : (
    <ConnectionTypePickerModal
      onSelect={handleConnectionTypeSelected}
      onCancel={handleConnectionCancel}
    />
  )
)}
```

The `MobileConnectionTypePicker` reuses the same `RELATIONSHIP_TYPES` data array from `ConnectionTypePickerModal` and renders inside a `BottomSheet` with half-height snap.

### Anti-Patterns to Avoid

- **React state during touch drag:** Never use `useState` to track touch position -- use refs. The `BottomSheet` already follows this pattern with `currentYRef`, `velocityRef`, etc. Any new touch-driven UI must follow suit.
- **Auto-focus on mount in mobile sheet:** The desktop `PropertiesPanel` auto-focuses the name input on mount (line 63-66). This would immediately trigger the virtual keyboard on mobile, which is unwanted. Disable auto-focus when rendered inside the mobile bottom sheet.
- **Mounting properties panel before node is selected:** The `PropertiesPanel` returns null if `!node` (line 133). Always guard rendering with `selectedNodeId` check.
- **Putting scroll handlers on BottomSheet content that conflict with drag handle:** Phase 12 moved touch handlers to the drag handle only, enabling content scrolling. Do NOT re-add touch handlers to the content area.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Entity form fields | Rebuild form inputs for mobile | Reuse `PropertiesPanel`/`ConnectionPropertiesPanel` directly as children of `BottomSheet` | 4 sections x multiple fields each -- desktop components already handle validation, auto-save, nested state, markdown preview |
| Sheet snap points | Custom snap logic | Existing `BottomSheet` snap point system (`collapsed`/`half`/`full`) | Already handles spring physics, velocity, drag tracking |
| Long-press detection | Custom timer + touch logic | Existing `useLongPress` hook | Already handles move threshold cancellation, cleanup |
| Copy operation | Manual node cloning | Existing `useClipboard().copy()` | Handles selected nodes, edge copying, ID regeneration |
| Delete with confirmation | Custom delete flow | Existing `handleDeleteRequest` + `deleteConfirm` dialog | Already handles multi-node delete with connection counting |
| Keyboard detection | Polling `window.innerHeight` | `visualViewport.resize` event | Only reliable signal for iOS Safari keyboard state |

**Key insight:** The largest time savings come from rendering the existing desktop properties panels inside the mobile bottom sheet. The 4 form sections (Identity, Registration, TaxStatus, Notes) plus ConnectionPropertiesPanel represent hundreds of lines of form logic, validation, and auto-save behavior that must NOT be duplicated.

## Common Pitfalls

### Pitfall 1: Desktop Auto-Focus Triggers Mobile Keyboard on Sheet Open

**What goes wrong:** `PropertiesPanel` auto-focuses the name input 50ms after mount. On mobile, this immediately opens the virtual keyboard, pushing the half-height sheet to full and creating a jarring experience.
**Why it happens:** The desktop panel was designed assuming a hardware keyboard.
**How to avoid:** Pass a prop like `autoFocus={false}` to suppress the auto-focus behavior when rendered inside the mobile bottom sheet. Or conditionally skip auto-focus using `useDeviceCapabilities().isMobile`.
**Warning signs:** Keyboard appears immediately when sheet opens without user tapping any input.

### Pitfall 2: onNodeClick Fires Before Selection Sync

**What goes wrong:** The "two-step tap" logic fails because `selectedNodeId` in the UI store doesn't reflect the just-clicked node when `onNodeClick` fires.
**Why it happens:** React Flow's `useOnSelectionChange` fires on the next render cycle, not synchronously during the click event.
**How to avoid:** In `onNodeClick`, read the *current* `selectedNodeId` from the store. If it matches the clicked node's ID, this is a "re-tap" (second tap). If it doesn't match, this is a "new selection" (first tap). The selection change will update the store on the next render.
**Warning signs:** Properties sheet opens on first tap instead of second.

### Pitfall 3: iOS Safari Keyboard Dismissal Timing

**What goes wrong:** The sheet snaps back to `half` too early or too late after keyboard dismiss, or doesn't snap at all.
**Why it happens:** iOS Safari delays the `visualViewport` resize event after keyboard dismissal. The `blur` event fires immediately, but the viewport height update comes 200-500ms later.
**How to avoid:** Listen to `visualViewport.resize` rather than `focus`/`blur` events. Use a threshold-based check (e.g., viewport height decreased by more than 100px = keyboard open).
**Warning signs:** Sheet flickers between snap points, or remains at full height after keyboard is dismissed.

### Pitfall 4: Context Menu Stale After Entity Deleted

**What goes wrong:** User long-presses entity, sees context menu, taps Delete. Delete confirmation dialog opens. User confirms deletion. Context menu is still visible but pointing at a deleted node.
**Why it happens:** The context menu state (`contextMenu: { x, y, nodeId }`) persists after the node is removed from the graph store.
**How to avoid:** Clear context menu state when the delete confirmation is triggered AND when delete is confirmed. Also clear on any node removal via a store subscriber or effect.
**Warning signs:** Orphaned menu floating on canvas with no target entity.

### Pitfall 5: BottomSheet Content Height Doesn't Account for Drag Handle

**What goes wrong:** Properties form fields are hidden behind the drag handle, or scrollable area is too short.
**Why it happens:** The `BottomSheet` content area uses `maxHeight: calc(100dvh - 48px)` to account for the drag handle (48px). If additional headers or toolbars are added, the content area overflows.
**How to avoid:** Keep the BottomSheet content wrapper simple. The existing `maxHeight: calc(100dvh - 48px)` works for the drag handle. If adding a sticky header inside the sheet, subtract its height from the content area.
**Warning signs:** Last form fields are unreachable by scrolling.

### Pitfall 6: Long-Press Conflicts with Node Drag

**What goes wrong:** User tries to long-press but accidentally moves finger slightly, triggering a drag instead. Or long-press fires successfully but then the node starts dragging when the finger lifts.
**Why it happens:** React Flow's node drag handler and the long-press handler both respond to touch events on the node.
**How to avoid:** The `useLongPress` hook has a `moveThreshold` (default 10px). If the finger moves more than 10px, the long-press is cancelled and React Flow's drag takes over. When the long-press fires successfully, prevent the subsequent `touchend` from triggering additional actions by setting a "consumed" flag. Also consider calling `e.stopPropagation()` or `e.preventDefault()` in the long-press finish handler.
**Warning signs:** Context menu appears and node simultaneously starts moving.

## Code Examples

### Example 1: MobilePropertiesSheet Component Structure

```tsx
// Source: Derived from existing BottomSheet.tsx + PropertiesPanel.tsx patterns
import { BottomSheet } from '@/components/mobile/BottomSheet';
import PropertiesPanel from '@/components/properties/PropertiesPanel';
import ConnectionPropertiesPanel from '@/components/connections/ConnectionPropertiesPanel';
import { useUIStore } from '@/stores/ui-store';
import { useKeyboardAwareSnap } from '@/hooks/useKeyboardAwareSnap';

export function MobilePropertiesSheet() {
  const isOpen = useUIStore((s) => s.isMobilePropertiesOpen);
  const setOpen = useUIStore((s) => s.setMobilePropertiesOpen);
  const selectedNodeId = useUIStore((s) => s.selectedNodeId);
  const selectedEdgeId = useUIStore((s) => s.selectedEdgeId);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      snapPoints={['collapsed', 'half', 'full']}
      initialSnap="half"
    >
      {selectedNodeId && (
        <PropertiesPanel
          key={selectedNodeId}
          nodeId={selectedNodeId}
          autoFocus={false} // Prevent auto-keyboard on mobile
        />
      )}
      {selectedEdgeId && !selectedNodeId && (
        <ConnectionPropertiesPanel
          key={selectedEdgeId}
          edgeId={selectedEdgeId}
        />
      )}
    </BottomSheet>
  );
}
```

### Example 2: Long-Press Integration with useLongPress

```tsx
// Source: Derived from existing useLongPress.ts + CanvasContextMenu.tsx patterns
// Inside EntityNode or a wrapper component:

const touchCoordsRef = useRef({ x: 0, y: 0 });

const longPressHandlers = useLongPress({
  duration: 500,
  moveThreshold: 10,
  onStart: () => {
    // Capture touch position for menu placement
    // (accessed via the touchstart event in the handler)
  },
  onFinish: () => {
    // Select entity + show context menu
    useUIStore.getState().setSelectedNode(nodeId);
    useUIStore.getState().setMobileContextMenu({
      x: touchCoordsRef.current.x,
      y: touchCoordsRef.current.y,
      nodeId,
    });
    // Haptic feedback
    navigator.vibrate?.(10);
  },
});
```

### Example 3: MobileContextMenu Component

```tsx
// Source: Derived from existing CanvasContextMenu.tsx pattern
import { useEffect, useRef } from 'react';
import { Trash2, Copy, Link, Settings } from 'lucide-react';

interface MobileContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  onDelete: () => void;
  onCopy: () => void;
  onConnect: () => void;
  onProperties: () => void;
  onClose: () => void;
}

export default function MobileContextMenu({
  x, y, nodeId, onDelete, onCopy, onConnect, onProperties, onClose,
}: MobileContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Clamp position to stay on-screen
  const [pos, setPos] = useState({ x, y });
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    setPos(clampMenuPosition(x, y, rect.width, rect.height));
  }, [x, y]);

  // Dismiss on touch outside
  useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('touchstart', handleTouch);
    return () => document.removeEventListener('touchstart', handleTouch);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-xl shadow-lg border border-gray-200 py-1 min-w-[160px]"
      style={{ top: pos.y, left: pos.x }}
    >
      {/* 4 action buttons with 44px min touch targets */}
      <button className="... min-h-[44px]" onClick={() => { onDelete(); onClose(); }}>
        <Trash2 /> Delete
      </button>
      <button className="... min-h-[44px]" onClick={() => { onCopy(); onClose(); }}>
        <Copy /> Copy
      </button>
      <button className="... min-h-[44px]" onClick={() => { onConnect(); onClose(); }}>
        <Link /> Connect
      </button>
      <button className="... min-h-[44px]" onClick={() => { onProperties(); onClose(); }}>
        <Settings /> Properties
      </button>
    </div>
  );
}
```

### Example 4: Keyboard-Aware Snap Hook

```typescript
// Source: Derived from visualViewport API research
import { useRef, useEffect } from 'react';

const SNAP_PERCENTS = { collapsed: 100, half: 55, full: 5 };
const KEYBOARD_THRESHOLD = 100; // pixels

export function useKeyboardAwareSnap(
  isOpen: boolean,
  springTo: (targetPercent: number) => void,
) {
  const isKeyboardOpenRef = useRef(false);
  const initialHeightRef = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      isKeyboardOpenRef.current = false;
      return;
    }

    const vv = window.visualViewport;
    if (!vv) return;

    initialHeightRef.current = vv.height;

    const handleResize = () => {
      const heightDiff = initialHeightRef.current - vv.height;
      const keyboardNowVisible = heightDiff > KEYBOARD_THRESHOLD;

      if (keyboardNowVisible && !isKeyboardOpenRef.current) {
        isKeyboardOpenRef.current = true;
        springTo(SNAP_PERCENTS.full);
      } else if (!keyboardNowVisible && isKeyboardOpenRef.current) {
        isKeyboardOpenRef.current = false;
        springTo(SNAP_PERCENTS.half);
      }
    };

    vv.addEventListener('resize', handleResize);
    return () => vv.removeEventListener('resize', handleResize);
  }, [isOpen, springTo]);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `window.innerHeight` for keyboard detection | `visualViewport.resize` event | 2022+ (iOS 15+) | Only reliable cross-browser keyboard detection |
| `100vh` for mobile heights | `100dvh` (dynamic viewport height) | 2023+ | Handles iOS Safari address bar changes |
| `interactive-widget: resizes-content` viewport meta | Not supported in Safari | Still pending as of 2026 | iOS Safari does not resize layout viewport for keyboard -- must use visualViewport API |
| `onContextMenu` for right-click menus | `useLongPress` for touch menus | N/A (touch vs mouse) | Touch devices cannot right-click; long-press replaces context menu |

**Deprecated/outdated:**
- Polling `window.innerHeight` to detect keyboard: Unreliable on iOS Safari. Use `visualViewport.resize` event instead.
- Using `focus`/`blur` events alone to detect keyboard: `blur` fires before viewport resizes. `visualViewport.resize` is the correct signal.

## iOS Safari Virtual Keyboard: Research Summary

**Confidence: MEDIUM** (based on multiple web sources, not Context7-verified)

### The Core Problem

iOS Safari does NOT resize the layout viewport when the virtual keyboard appears. Instead, it slides the viewport upward. This means:
- `window.innerHeight` does NOT change when keyboard opens
- `100vh` / `100dvh` do NOT change when keyboard opens
- Fixed-position elements (like bottom sheets) stay at their original position
- Content behind the keyboard becomes unreachable

### The Solution

Listen to `window.visualViewport.resize` events:
- `visualViewport.height` DOES change when keyboard opens (decreases by keyboard height)
- Compare against initial height to detect keyboard state
- Spring the bottom sheet to full height when keyboard is detected
- Spring back to half when keyboard dismisses

### Key Gotchas (from Research)

1. **Safari 15+ fires resize events** -- older versions did NOT (this is resolved in modern iOS)
2. **Closing keyboard delays viewport update** by 200-500ms -- listen to `resize` event, not `blur`
3. **`interactive-widget: resizes-content`** is NOT supported in Safari -- cannot use this meta tag
4. **Three events needed** for full coverage: `visualViewport.resize`, `window.resize`, `orientationchange`
5. **Threshold-based detection** is more reliable than exact height comparison (keyboard heights vary by device and input type)

### Browser Support (as of 2026)

- `window.visualViewport`: All modern browsers, iOS Safari 13+
- `visualViewport.resize` event: iOS Safari 15+, Chrome 60+, Firefox 63+
- `dvh` unit: iOS Safari 15.4+, Chrome 108+, Firefox 101+

## BottomSheet Enhancement Requirements

The existing `BottomSheet` component needs several modifications for Phase 13:

### 1. External Snap Point Control

Currently, the `BottomSheet` only receives `initialSnap` and manages snap state internally. For keyboard-aware expansion, the parent needs to command a snap change. Two approaches:

**Option A -- Imperative ref API:**
```tsx
const sheetRef = useRef<BottomSheetRef>(null);
// In keyboard hook:
sheetRef.current?.snapTo('full');
```

**Option B -- Controlled snap prop:**
```tsx
<BottomSheet currentSnap={isKeyboardOpen ? 'full' : 'half'} />
```

**Recommendation:** Option A (imperative ref) is better because it avoids re-render during animation and matches the existing ref-based animation model. The `springTo` function is already internal to `BottomSheet` -- expose it via `useImperativeHandle`.

### 2. Content Updates Without Remount

When the user taps a different entity while the sheet is open, `key={selectedNodeId}` forces a React remount of the properties panel inside the sheet. The `BottomSheet` wrapper itself must NOT remount -- only the children should change. This is naturally handled by keeping `key` on the `PropertiesPanel` child, not on the `BottomSheet`.

### 3. Close-on-Selection-Clear

When the user taps empty canvas space (deselects), the properties sheet should close. Wire `setMobilePropertiesOpen(false)` into the `onPaneClick` handler when on mobile.

## Open Questions

1. **AI Analysis Backend: Does It Exist?**
   - What we know: MPROP-04 requires "streaming AI analysis results" and the CONTEXT mentions a "Sparkles or Brain" toolbar button. No analysis panel, streaming infrastructure, or backend endpoint currently exists in the codebase. No `@react-pdf/renderer` is installed.
   - What's unclear: Whether the AI analysis backend and desktop panel are being built concurrently, or if MPROP-04 depends on prior work not yet scoped.
   - Recommendation: Scope the mobile overlay UI (full-screen sheet with close button, scrollable content area, export button) but use mock/placeholder content if the backend doesn't exist. Mark MPROP-04 as partially implementable -- the mobile overlay container can be built, but actual streaming integration depends on backend availability.

2. **Long-Press Coordinates in React Flow**
   - What we know: The `useLongPress` hook returns touch handlers, but these need to be attached to the entity node DOM element. React Flow wraps nodes in transform containers.
   - What's unclear: Whether `onTouchStart` coordinates from the `useLongPress` handlers represent screen coordinates or need transformation from the React Flow coordinate space.
   - Recommendation: Use `clientX`/`clientY` from the touch event, which are always screen coordinates regardless of React Flow transforms. The existing `CanvasContextMenu` uses `event.clientX`/`event.clientY` for positioning, confirming this approach works.

3. **Existing `isMobilePropertiesOpen` State Wiring**
   - What we know: The UI store already has `isMobilePropertiesOpen` (boolean) and `setMobilePropertiesOpen` setter, added during Phase 10/12 planning. However, nothing currently reads or writes this state.
   - What's unclear: Whether this state needs additional fields (e.g., distinguishing entity vs connection mode).
   - Recommendation: Use the existing boolean as-is. The sheet content is determined by `selectedNodeId` vs `selectedEdgeId` -- no need for a separate mode flag.

4. **Context Menu State Location**
   - What we know: The desktop `contextMenu` state in UI store uses `{ x, y, nodeId }` shape. A new `mobileContextMenu` state could follow the same pattern.
   - What's unclear: Whether to reuse the existing `contextMenu` state (since desktop and mobile are mutually exclusive) or create a separate `mobileContextMenu` field.
   - Recommendation: Reuse the existing `contextMenu` state. On mobile, the `CanvasContextMenu` is never shown (context menus are disabled on touch -- per Phase 11-02 decision). The `MobileContextMenu` can read the same state. This avoids adding new store fields.

## Sources

### Primary (HIGH confidence)
- **Codebase analysis** -- Direct reading of all relevant source files:
  - `src/components/mobile/BottomSheet.tsx` -- snap points, spring animation, drag handle touch
  - `src/components/properties/PropertiesPanel.tsx` -- form fields, auto-save, validation
  - `src/components/connections/ConnectionPropertiesPanel.tsx` -- connection form fields
  - `src/components/connections/ConnectionTypePickerModal.tsx` -- relationship type data
  - `src/components/context-menu/CanvasContextMenu.tsx` -- desktop context menu pattern
  - `src/components/editor/MobileEditorLayout.tsx` -- floating toolbar, bottom sheet mounts
  - `src/components/canvas/Canvas.tsx` -- selection sync, node click, context menu
  - `src/hooks/useLongPress.ts` -- long-press detection hook
  - `src/hooks/useClipboard.ts` -- copy/paste operations
  - `src/stores/ui-store.ts` -- selection state, mobile state fields
  - `src/stores/graph-store.ts` -- node/edge CRUD operations

### Secondary (MEDIUM confidence)
- [Martijn Hols: Document height in iOS Safari with OSK](https://martijnhols.nl/blog/how-to-get-document-height-ios-safari-osk) -- visualViewport API usage for keyboard detection
- [Francisco Moretti: Fix mobile keyboard overlap with dvh](https://www.franciscomoretti.com/blog/fix-mobile-keyboard-overlap-with-visualviewport) -- dvh recommendation over visualViewport observers for general layout, but visualViewport still needed for event detection
- [HTMHell: interactive-widget viewport control](https://www.htmhell.dev/adventcalendar/2024/4/) -- interactive-widget NOT supported in Safari, confirmed Chrome 108+/Firefox 132+ only
- [WICG visualViewport Issue #79](https://github.com/WICG/visual-viewport/issues/79) -- Safari 15 visualViewport limitations
- [WICG visualViewport Issue #78](https://github.com/WICG/visual-viewport/issues/78) -- iOS 15 height reporting issues
- [RyoSogawa/react-ios-keyboard-viewport](https://github.com/RyoSogawa/react-ios-keyboard-viewport) -- Reference React hook for iOS keyboard viewport adjustment

### Tertiary (LOW confidence)
- `@react-pdf/renderer` pipeline claim from CONTEXT.md -- not verifiable as no AI analysis infrastructure exists in codebase. Assumed to be aspirational or concurrent work.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed, zero new dependencies for core work
- Architecture: HIGH -- all patterns derived from direct codebase analysis of existing components
- Properties panel reuse: HIGH -- desktop components are well-structured and directly composable
- iOS keyboard handling: MEDIUM -- web sources agree on approach, but iOS Safari edge cases may surface during testing
- AI analysis overlay: LOW -- no backend or desktop panel exists to reference; mobile overlay design is straightforward but content/streaming integration is unverifiable
- Long-press interaction: HIGH -- `useLongPress` hook exists and is well-tested

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (30 days -- stable domain, existing infrastructure)
