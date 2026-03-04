# Phase 11: Responsive Layout Shell - Research

**Researched:** 2026-03-04
**Status:** Complete

## 1. Existing Codebase Patterns

### EditorLayout Structure (src/components/editor/EditorLayout.tsx)
- Outer wrapper: `ReactFlowProvider` → `EditorLayoutInner`
- Inner layout: `flex h-screen w-screen overflow-hidden`
  - Left: `EntityPalette` (fixed width sidebar, 256px expanded / 48px collapsed)
  - Center: `flex-1 flex flex-col` containing:
    - Draft restore banner (conditional)
    - `EditorToolbar` (horizontal bar)
    - `flex-1 flex overflow-hidden relative` row containing Canvas + Right Panel
  - Right panel: `w-80 border-l` (desktop) or `absolute right-0 ... z-20 shadow-lg` (tablet overlay)
- Mobile gate at line 262-282: `if (isMobile)` returns "Larger Screen Required" message
- Breakpoints: `useMediaQuery('(max-width: 767px)')` for isMobile, `useMediaQuery('(max-width: 1024px)')` for isTablet
- Tablet auto-collapse: `useEffect` collapses palette on `isTablet` change
- Delete confirmation dialog: `fixed inset-0 bg-black/50 z-50` overlay, centered card
- Template picker modal: separate component with overlay

### Canvas Component (src/components/canvas/Canvas.tsx)
- ReactFlow configured with: panOnDrag, selectionOnDrag, snapToGrid, nodeExtent, Controls, MiniMap
- panOnDrag driven by `interactionMode === 'drag'`
- No touch-specific props currently set (zoomOnPinch, preventScrolling not configured)
- MiniMap: `pannable zoomable` with fixed 160x100 style, position bottom-left
- Controls: default React Flow controls rendered inside ReactFlow
- Context menus: both node and edge, positioned at click coordinates
- Connection type picker modal: shown on onConnect intercept
- Keyboard shortcuts: centralized via `useKeyboardShortcuts` hook

### EntityNode (src/components/canvas/nodes/EntityNode.tsx)
- 8 resize handles: 4 corner (proportional) + 4 edge (free), only when `selected`
- 8 connection handles: 4 cardinal (wide hit area) + 4 intermediate (10x10px)
- Handle sizes: cardinal handles use `width: '50%', height: 18` or `width: 18, height: '50%'`
- Intermediate handles: 10x10px positioned at shape vertices
- Shapes: rectangle, rounded, diamond, hexagon, person, shield, triangle, oval
- Inline rename on double-click

### Entity Node CSS (src/app/globals.css)
- `.entity-node`: min-width 180px, min-height 70px, padding 12px 16px
- `.react-flow__handle`: opacity 0, 14x14px, invisible ::after hit area (8px padding = 30x30 effective)
- Handles appear on hover/selection via React Flow's built-in CSS
- Handle visibility controlled by React Flow's CSS classes (`.react-flow__node:hover .react-flow__handle`)
- Entity hover: box-shadow transition, clip-path shapes use filter drop-shadow

### Dashboard Page (src/app/dashboard/page.tsx)
- Structure: `min-h-screen bg-gray-50` with header + main
- Header: `max-w-6xl mx-auto px-6 py-4 flex items-center justify-between`
  - Left: back button + title/subtitle
  - Right: "New Structure" button with Plus icon
- Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`
- Cards: thumbnail (aspect-4/3), footer with name + date + delete button
- Delete button: `opacity-0 group-hover:opacity-100` (hover-only, needs touch fix in Phase 15)
- Empty state: centered with icon + title + CTA button
- Delete confirmation: same pattern as EditorLayout (fixed overlay + centered card)

### Root Layout (src/app/layout.tsx)
- No viewport meta tag configured — Next.js provides default
- Uses Geist + Geist_Mono fonts
- No `<meta name="viewport">` override

### Phase 10 Deliverables (Already Built)
- `useDeviceCapabilities` hook: isTouchDevice, isMobile, isTablet, isDesktop — reactive via useMediaQuery
- `useLongPress` hook: callbacks (onStart, onFinish, onCancel), 500ms default, movement threshold
- `BottomSheet` component: createPortal to body, translateY spring animation, snap points (collapsed/half/full), scrim, drag handle, dark mode support, z-index 60-61
- `spring.ts`: `animateSpringWithVelocity` function, RAF-based spring physics
- Zustand mobile state: `isMobilePaletteOpen`, `isMobilePropertiesOpen`, `mobileTool`, `pendingConnectionSource` with setters

## 2. Plan 11-01: Layout Shell + Dashboard

### Remove Mobile Gate
- Delete the `if (isMobile)` block (lines 262-282) in EditorLayout.tsx
- Replace with breakpoint-based layout branching using `useDeviceCapabilities`

### MobileEditorLayout Component
Create `src/components/editor/MobileEditorLayout.tsx`:
- Full-screen canvas: `h-[100dvh] w-screen` with Canvas filling entire viewport
- Floating bottom toolbar: positioned at bottom with safe area inset padding
  - Primary actions: undo, redo (from existing hooks), add (opens palette sheet), connect (Phase 14)
  - Thumb-reachable positioning: `fixed bottom-0 inset-x-0` with padding
  - Styling: floating pill with backdrop-blur, rounded-full, shadow, z-30
  - Actions fire through existing store/hooks (useUndoRedo, useUIStore setters)
- Shell slots for future bottom sheets:
  - Palette bottom sheet mount: `{isMobilePaletteOpen && <BottomSheet>...empty...</BottomSheet>}`
  - Properties bottom sheet mount: `{isMobilePropertiesOpen && <BottomSheet>...empty...</BottomSheet>}`
  - These render empty BottomSheet containers now; Phase 12-13 will fill content
- Structure name: minimal floating header pill showing structure name (read-only on mobile)
- Delete dialog: same modal pattern but with mobile-friendly sizing
- Template picker: same modal but full-width on mobile

### Breakpoint Branching in EditorLayout
Replace the mobile gate with conditional rendering:
```
if (isMobile) return <MobileEditorLayout {...props} />;
// else: existing tablet/desktop layout continues unchanged
```
This ensures desktop layout is COMPLETELY UNCHANGED.

### TabletEditorLayout Adjustments
Tablet layout already works in the existing code (isTablet overlay behavior). Key adjustments:
- Use `useDeviceCapabilities` instead of raw `useMediaQuery`
- Landscape tablet (1024px+) should get the desktop layout — already handled by breakpoints since isTablet is 768-1024px and >1024 is desktop
- Portrait tablet: palette visible by default (not auto-collapsed), properties overlay on right

### Dashboard Responsiveness
Modify `src/app/dashboard/page.tsx`:
- Phone layout: single-column full-width cards
  - Grid already has `grid-cols-1` as default, `sm:grid-cols-2 lg:grid-cols-3` — already responsive!
  - Header: stack vertically on phone (title on one line, button below)
  - Reduce padding: `px-4` on mobile, `px-6` on larger
- New Structure CTA on phone: full-width button at top of card list (more discoverable than FAB for a dashboard)
- Delete button: on mobile, always visible (remove `opacity-0 group-hover:opacity-100` on touch)

### Viewport Meta Tag
Add viewport meta tag in root layout.tsx:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no" />
```
- `viewport-fit=cover`: enables safe area insets for notch devices
- `maximum-scale=1, user-scalable=no`: prevents double-tap zoom on inputs (React Flow handles pinch zoom internally)

## 3. Plan 11-02: Touch Canvas + Node Adjustments

### React Flow Touch Props
Add to the ReactFlow component in Canvas.tsx:
```typescript
zoomOnPinch={true}          // Enable pinch-to-zoom (everywhere, not just empty canvas)
preventScrolling={true}      // Prevent page scroll when interacting with canvas
panOnDrag={isTouchDevice ? true : interactionMode === 'drag'} // Always pan on touch
selectionOnDrag={isTouchDevice ? false : interactionMode === 'select'} // No marquee on touch
```
- `zoomOnPinch`: React Flow handles multi-touch pinch natively, works everywhere on canvas
- Touch always pans (context-sensitive: entity touch starts move, empty canvas touch pans — React Flow default)
- Disable marquee selection on touch (no rubber-band multi-select on phone)

### Touch Handle CSS
In globals.css, add touch-specific handle styles:
```css
@media (pointer: coarse) {
  .react-flow__handle {
    /* Always visible on touch since no hover discovery */
    opacity: 0.3;
  }
  .react-flow__handle::after {
    /* 44px minimum touch target */
    top: -15px;
    left: -15px;
    right: -15px;
    bottom: -15px;
  }
}
```
- Handles always subtly visible on touch (no hover to discover them)
- Hit area expands to 44px (14px handle + 15px padding each side = 44px)

### Hide Resize Handles on Touch
In EntityNode.tsx, wrap resize controls in a device check:
```typescript
{selected && !isTouchDevice && (
  <>
    {/* 4 corner handles + 4 edge handles */}
  </>
)}
```
- Import and use `useDeviceCapabilities` for `isTouchDevice`
- Entities are fixed-size on touch devices (no fiddly resize)

### Touch-Friendly Node Adjustments
- Entity node already has min-width 180px which is reasonable on mobile
- No CSS changes needed to entity node sizes (visual size stays the same)
- The enlarged handle hit areas (44px) handle touch accessibility
- Connection handles stay same visual size but get larger invisible tap targets

### Hide Desktop-Only UI on Mobile
- Hide `Controls` component on mobile (React Flow zoom controls — use pinch instead)
- Hide `MiniMap` on mobile (takes too much screen real estate on phone)
- Show MiniMap on tablet (MPOL-03 for Phase 15, but we can conditionally render now)
- Hide `StatusBar` on mobile (no room)
- Hide `HelperLines` on touch (alignment guides are a desktop precision feature)

### Disable Desktop-Only Interactions on Touch
- Double-click to create entity: disable on touch (will be replaced by tap-to-add in Phase 12)
- Context menu on right-click: already N/A on touch (no right-click)
- Keyboard shortcuts: N/A on touch (no physical keyboard typically)

## 4. File Plan

| File | Action | Purpose |
|------|--------|---------|
| `src/components/editor/EditorLayout.tsx` | Modify | Remove mobile gate, add breakpoint branching to MobileEditorLayout |
| `src/components/editor/MobileEditorLayout.tsx` | Create | Full-screen canvas layout with floating toolbar and bottom sheet slots |
| `src/components/canvas/Canvas.tsx` | Modify | Add touch props (zoomOnPinch, preventScrolling), hide Controls/MiniMap/StatusBar on mobile |
| `src/components/canvas/nodes/EntityNode.tsx` | Modify | Hide resize handles on touch devices |
| `src/app/globals.css` | Modify | Add touch handle CSS (@media pointer:coarse) |
| `src/app/layout.tsx` | Modify | Add viewport meta tag |
| `src/app/dashboard/page.tsx` | Modify | Responsive header, mobile-friendly delete button |

## 5. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Breaking existing desktop layout | Desktop path unchanged — only mobile gate replaced with conditional branch |
| React Flow touch conflicts with BottomSheet | BottomSheet uses z-index 60-61, above canvas. touchAction: none prevents passthrough |
| iOS Safari viewport issues | viewport-fit=cover + dvh units (BottomSheet already uses 100dvh) |
| Tablet palette collapse behavior change | Portrait tablet: palette visible by default. Existing auto-collapse useEffect adjusted |
| Double-tap zoom interfering with React Flow | user-scalable=no in viewport meta prevents browser zoom; RF handles pinch internally |

## RESEARCH COMPLETE
