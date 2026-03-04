# Phase 12: Mobile Entity Creation - Research

**Researched:** 2026-03-04
**Domain:** Mobile touch entity placement, bottom sheet palette, React Flow programmatic node creation
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

1. **Palette Bottom Sheet Layout**
   - No search bar. 11 entity types across 6 categories -- small enough to scan visually.
   - All categories expanded (flat list). Category headers as section dividers, not collapsible accordions.
   - List row items (like desktop). Each entity type displayed as a row with color bar + icon + entity name.
   - Half-height initial snap. Sheet opens at the `half` snap point (~45% visible).

2. **Single Placement Flow (Close After Tap)**
   - Sheet closes immediately after placement (springs to collapsed).
   - Scale-in animation on placement (~150ms scale-from-zero on the new node).
   - One tap, one entity, sheet gone. Re-open Plus button for another entity.

3. **Overlap Avoidance -- Spiral Search with Minimum Gap**
   - Spiral search pattern from viewport center at grid-step increments.
   - Minimum 20px gap between bounding boxes.
   - Grid snapping to 20px grid (GRID_SIZE constant).

### Claude's Discretion

None specified -- all decisions are locked.

### Deferred Ideas (OUT OF SCOPE)

None captured during discussion.
</user_constraints>

## Summary

Phase 12 adds mobile entity creation to the Tax Structuring Tool. The user taps the existing Plus button in `MobileEditorLayout.tsx`'s floating toolbar, which opens a bottom sheet palette showing all 11 entity types organized by 6 category headers. Tapping an entity type creates a new node at the viewport center (with grid snap and overlap avoidance), closes the sheet, and plays a scale-in animation on the new node.

The implementation is well-scoped because all the foundational pieces already exist: the `BottomSheet` component (Phase 10) with snap points and spring animations, the `isMobilePaletteOpen` state and `setMobilePaletteOpen` setter in the UI store, the Plus button wiring in `MobileEditorLayout`, the `ENTITY_REGISTRY` and `CATEGORY_CONFIG` data structures, the `resolveOverlap` utility, and the `addNode` action in the graph store. The primary new work is: (1) a `MobilePalette` component that renders entity types as tappable list rows inside the BottomSheet, (2) a placement function that computes the viewport center in flow coordinates, snaps to grid, resolves overlap with the 20px gap rule, and adds the node, and (3) a CSS scale-in animation class for the newly placed node.

**Primary recommendation:** Build a single `MobilePalette.tsx` component that composes the existing `BottomSheet` with category-grouped entity rows, delegates placement to a shared `placeEntityAtViewportCenter` utility extracted alongside the existing `resolveOverlap`, and applies a `scale-in` CSS animation class to the new node's wrapper via a transient `isNew` flag.

## Standard Stack

### Core (Already Installed -- Zero New Dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@xyflow/react` | ^12.10.0 | Canvas, node management, `useReactFlow()` for viewport APIs | Already used for all canvas operations |
| `zustand` | ^5.0.11 | State management (`ui-store`, `graph-store`) | Already used for all app state |
| `nanoid` | ^5.1.6 | Unique ID generation for new nodes | Already used in `Canvas.tsx` `onDrop` |
| `lucide-react` | ^0.564.0 | Entity type icons in palette rows | Already used in `PaletteItem.tsx` |

### Supporting (Already Present)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zundo` | ^2.3.0 | Temporal middleware for undo/redo | Entity placement goes through `addNode` which is tracked by temporal |
| `immer` | ^11.1.4 | Immutable state updates in graph store | Used internally by graph store mutations |

### Alternatives Considered

None -- the zero-new-dependencies constraint is locked. All needed APIs are available in the existing stack.

**Installation:** No installation needed. Zero new dependencies.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── mobile/
│   │   ├── BottomSheet.tsx          # Existing -- Phase 10
│   │   └── MobilePalette.tsx        # NEW -- mobile entity palette
│   ├── palette/
│   │   ├── EntityPalette.tsx        # Existing desktop palette (data source)
│   │   ├── PaletteCategory.tsx      # Existing -- reuse CATEGORY_CONFIG
│   │   └── PaletteItem.tsx          # Existing desktop item (reference only)
│   └── editor/
│       └── MobileEditorLayout.tsx   # Existing -- add BottomSheet mount
├── lib/
│   ├── entity-registry.ts           # Existing -- ENTITY_REGISTRY, getEntitiesByCategory
│   ├── constants.ts                 # Existing -- GRID_SIZE, NODE_WIDTH, NODE_HEIGHT
│   └── utils/
│       └── overlap.ts               # Existing -- resolveOverlap (modify gap logic)
└── stores/
    ├── ui-store.ts                  # Existing -- isMobilePaletteOpen
    └── graph-store.ts               # Existing -- addNode
```

### Pattern 1: Viewport Center Placement via screenToFlowPosition

**What:** Convert the screen center pixel coordinates to flow (canvas) coordinates, accounting for current pan/zoom, then snap to grid.

**When to use:** Every time a mobile user taps an entity type to place it.

**Why this approach:** React Flow's `screenToFlowPosition` already handles the viewport transform math (zoom, pan offsets). The desktop `onDrop` handler uses it with `event.clientX/clientY`; for mobile we simply substitute `window.innerWidth / 2` and `window.innerHeight / 2`.

**Example:**
```typescript
// Source: existing Canvas.tsx onDrop pattern + React Flow useReactFlow API
import { useReactFlow } from '@xyflow/react';
import { GRID_SIZE } from '@/lib/constants';

function useViewportCenterPlacement() {
  const { screenToFlowPosition } = useReactFlow();

  const getViewportCenter = (): { x: number; y: number } => {
    const screenCenter = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    const flowPos = screenToFlowPosition(screenCenter);
    // Snap to grid
    return {
      x: Math.round(flowPos.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(flowPos.y / GRID_SIZE) * GRID_SIZE,
    };
  };

  return { getViewportCenter };
}
```

**Key detail:** `screenToFlowPosition` accepts `{ snapToGrid: boolean }` as a second argument, but manual grid-snap is more reliable here because we want explicit control over the rounding (matching the existing `resolveOverlap` grid alignment). The existing desktop `onDrop` also does NOT use the `snapToGrid` option -- it relies on React Flow's built-in `snapToGrid` prop.

### Pattern 2: Bottom Sheet Composition (Not Extension)

**What:** `MobilePalette` renders the `BottomSheet` component with entity content as children, rather than modifying `BottomSheet` itself.

**When to use:** Always -- the `BottomSheet` is a reusable primitive.

**Example:**
```typescript
// MobilePalette.tsx
import { BottomSheet } from '@/components/mobile/BottomSheet';
import { useUIStore } from '@/stores/ui-store';

export function MobilePalette({ onSelectEntity }: MobilePaletteProps) {
  const isOpen = useUIStore((s) => s.isMobilePaletteOpen);
  const close = useUIStore((s) => s.setMobilePaletteOpen);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => close(false)}
      initialSnap="half"
      snapPoints={['collapsed', 'half', 'full']}
    >
      {/* Category sections with tappable entity rows */}
    </BottomSheet>
  );
}
```

### Pattern 3: Scale-In Animation via CSS + Transient Node Class

**What:** When a node is placed via mobile, apply a CSS animation class that scales from 0 to 1 over ~150ms. The class is added via a transient React state (not persisted in the graph store) and removed after animation completes.

**When to use:** Only for mobile-placed entities (not desktop drag-drop or template load).

**Two implementation approaches:**

**Approach A: CSS animation on the React Flow node wrapper (preferred)**
```css
/* globals.css */
@keyframes entity-scale-in {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.entity-node--scale-in {
  animation: entity-scale-in 150ms ease-out;
}
```

Apply via a transient state variable (e.g., `lastPlacedNodeId` in ui-store), read in `EntityNode.tsx`:
```typescript
// In EntityNode.tsx
const lastPlacedId = useUIStore((s) => s.lastPlacedNodeId);
const isNew = id === lastPlacedId;

// Add class conditionally
className={`entity-node entity-node--${shape}${isNew ? ' entity-node--scale-in' : ''}`}
```

Clear `lastPlacedNodeId` after animation ends (150ms timeout or `onAnimationEnd`).

**Approach B: Inline style with onAnimationEnd**
Apply `animation` as an inline style in `EntityNode` and listen for `onAnimationEnd` to clear the flag. Slightly cleaner lifecycle but requires reading the transient flag from the store.

**Recommendation:** Approach A (CSS class) is simpler, more debuggable, and keeps animation logic in CSS where it belongs.

### Pattern 4: Reusing CATEGORY_CONFIG and getEntitiesByCategory

**What:** The desktop `EntityPalette.tsx` exports `CATEGORY_CONFIG` (an array of `{ category, label, icon }` objects) and uses `getEntitiesByCategory('AU', cat.category)` to populate each section. The mobile palette should use the same data sources.

**Current issue:** `CATEGORY_CONFIG` is defined as a `const` inside `EntityPalette.tsx`, not exported. It needs to be either:
1. Extracted to a shared module (e.g., `lib/entity-registry.ts` or a new `lib/palette-config.ts`), or
2. Duplicated in `MobilePalette.tsx` (less ideal but acceptable given it's 6 static entries).

**Recommendation:** Extract `CATEGORY_CONFIG` to `lib/entity-registry.ts` alongside `ENTITY_REGISTRY` since it's entity metadata. Both desktop and mobile palettes import from there.

### Anti-Patterns to Avoid

- **Modifying BottomSheet internals for palette-specific behavior:** BottomSheet is a generic primitive. Entity palette logic belongs in MobilePalette.
- **Storing animation state in the graph store:** Scale-in animation is UI-only, transient state. Putting it in graph-store would pollute undo history and persistence. Use ui-store.
- **Creating a new "mobile entity" creation path separate from addNode:** The mobile placement must go through the same `addNode` action in graph-store that desktop uses. This ensures undo/redo, persistence, and validation all work identically.
- **Using React state for sheet open/close instead of Zustand:** The `isMobilePaletteOpen` flag is already in ui-store. Don't duplicate it with local state.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Screen-to-flow coordinate conversion | Manual transform math | `useReactFlow().screenToFlowPosition()` | Handles zoom, pan, DPR; already used in Canvas.tsx |
| Overlap resolution | New overlap algorithm | Existing `resolveOverlap()` from `lib/utils/overlap.ts` | Already implements spiral search; just needs gap adjustment |
| Spring animation for sheet | JS spring | Existing `BottomSheet` component with `animateSpringWithVelocity` | Phase 10 built this with 60fps ref-driven animation |
| Unique node IDs | uuid or custom | `nanoid()` | Already used in Canvas.tsx for all node creation |
| Entity type data | Hardcoded entity list | `ENTITY_REGISTRY` + `getEntitiesByCategory()` | Single source of truth for all entity metadata |

**Key insight:** Nearly everything needed for mobile entity creation already exists. The new code is primarily composition and wiring, not new algorithms.

## Common Pitfalls

### Pitfall 1: BottomSheet Touch Events Conflicting with Content Scrolling

**What goes wrong:** The BottomSheet captures all `touchStart/touchMove/touchEnd` events on the sheet container for drag-to-dismiss. If the palette content inside is scrollable (more items than fit in half-height), the user can't scroll the list because the sheet intercepts the touch.

**Why it happens:** The current BottomSheet puts `onTouchStart/Move/End` on the entire sheet `div`, and the content area has `overflow-y: auto`. Touch events on scrollable children still propagate to the sheet.

**How to avoid:** The BottomSheet already has a drag handle area (`pt-3 pb-2` with the pill indicator). Touch events should only trigger sheet drag when the touch starts on the drag handle, NOT on the scrollable content area. Two approaches:
1. Move touch handlers from the sheet container to just the drag handle element.
2. In the touchStart handler, check if the target is inside the content area (has a scrollable parent) and skip sheet drag if so.

**Warning signs:** Users can't scroll through entity categories when the sheet is at half height. The sheet keeps dragging instead of scrolling content.

**Current code analysis:** Looking at `BottomSheet.tsx` lines 253-258, touch handlers are on the outer sheet `div`. This WILL conflict with content scrolling. This needs fixing in this phase.

### Pitfall 2: Viewport Center Off-Screen After Canvas Pan

**What goes wrong:** If the user has panned the canvas so that the visible viewport shows the canvas edge, the "viewport center" in flow coordinates might be outside the canvas bounds (`CANVAS_BOUNDS` = [0,0] to [10000,8000]).

**Why it happens:** `screenToFlowPosition` converts screen center to flow coordinates regardless of canvas bounds. If the user panned far right, the center could be at x=11000.

**How to avoid:** After computing the viewport center position, clamp it within `CANVAS_BOUNDS` minus `NODE_WIDTH`/`NODE_HEIGHT` margins:
```typescript
const clampedX = Math.max(CANVAS_BOUNDS[0][0], Math.min(CANVAS_BOUNDS[1][0] - NODE_WIDTH, position.x));
const clampedY = Math.max(CANVAS_BOUNDS[0][1], Math.min(CANVAS_BOUNDS[1][1] - NODE_HEIGHT, position.y));
```

**Warning signs:** Entity appears to be created but isn't visible; user has to zoom out to find it.

### Pitfall 3: Scale-In Animation Fighting React Flow's Transform

**What goes wrong:** React Flow applies `transform: translate(x, y)` to position nodes. If the scale-in animation also uses `transform: scale(0)`, it can override React Flow's positioning transform, causing the node to appear at (0,0) during the animation.

**Why it happens:** CSS `transform` is a single property -- setting `scale(0)` removes the `translate()`.

**How to avoid:** Use `transform-origin: center center` and animate with `scale` specifically via individual transform properties (CSS `scale` property, not `transform: scale()`). In modern CSS:
```css
@keyframes entity-scale-in {
  from { scale: 0; opacity: 0; }
  to { scale: 1; opacity: 1; }
}
```
The `scale` property is independent of `transform` and won't interfere with React Flow's `translate`. All modern mobile browsers support the individual `scale` CSS property.

Alternatively, wrap the animation inside the entity node's inner content div (not the React Flow wrapper), avoiding the transform conflict entirely.

**Recommendation:** Animate the inner `.entity-node` div's content, not the React Flow wrapper. This is safest.

### Pitfall 4: Overlap Gap Mismatch with Existing resolveOverlap

**What goes wrong:** The context specifies a 20px minimum gap between bounding boxes, but the existing `resolveOverlap` function checks `dx < NODE_WIDTH && dy < NODE_HEIGHT` -- this detects bounding box OVERLAP but not a 20px GAP.

**Why it happens:** The existing function was designed for "don't stack on top of each other" (zero overlap), not "maintain 20px breathing room."

**How to avoid:** Modify the `hasOverlap` function in `resolveOverlap` to use `NODE_WIDTH + GAP` and `NODE_HEIGHT + GAP`:
```typescript
const GAP = 20; // GRID_SIZE
const hasOverlap = (pos: { x: number; y: number }): boolean =>
  existingNodes.some((n) => {
    const dx = Math.abs(n.position.x - pos.x);
    const dy = Math.abs(n.position.y - pos.y);
    return dx < NODE_WIDTH + GAP && dy < NODE_HEIGHT + GAP;
  });
```

**Impact:** This changes behavior for desktop drag-drop too, which is acceptable (20px gap = 1 grid cell of breathing room is an improvement).

### Pitfall 5: MobilePalette Must Be Inside ReactFlowProvider

**What goes wrong:** The placement function needs `useReactFlow()` (for `screenToFlowPosition` and `getNodes`). If `MobilePalette` is rendered outside the `ReactFlowProvider`, the hook throws.

**Why it happens:** `MobilePalette` is mounted in `MobileEditorLayout`, which is rendered inside `EditorLayoutInner`, which is inside `ReactFlowProvider` (see `EditorLayout` wrapper). So this SHOULD be fine. But if MobilePalette uses a portal (via BottomSheet which renders via `createPortal(... document.body)`), the React context is maintained through portals, so `useReactFlow()` will still work.

**Warning signs:** "useReactFlow must be used inside ReactFlowProvider" error.

**Verification:** React portals preserve context. The BottomSheet uses `createPortal(... document.body)` which maintains the React tree context. This is safe.

## Code Examples

### Entity Placement at Viewport Center (Core Logic)

```typescript
// Source: Pattern derived from Canvas.tsx onDrop (lines 175-233)
// and Canvas.tsx onDoubleClickPane (lines 257-289)

import { useReactFlow } from '@xyflow/react';
import { nanoid } from 'nanoid';
import { useGraphStore } from '@/stores/graph-store';
import { useUIStore } from '@/stores/ui-store';
import { getEntityConfig } from '@/lib/entity-registry';
import { resolveOverlap } from '@/lib/utils/overlap';
import { GRID_SIZE, NODE_WIDTH, NODE_HEIGHT, CANVAS_BOUNDS } from '@/lib/constants';
import type { TaxNode } from '@/models/graph';

function usePlaceEntity() {
  const { screenToFlowPosition, getNodes } = useReactFlow();
  const addNode = useGraphStore((s) => s.addNode);
  const setSelectedNode = useUIStore((s) => s.setSelectedNode);
  const canvasJurisdiction = useGraphStore((s) => s.canvasJurisdiction);

  const placeEntity = (entityTypeId: string) => {
    const config = getEntityConfig(entityTypeId);
    if (!config) return;

    // 1. Compute viewport center in flow coordinates
    const screenCenter = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    const flowPos = screenToFlowPosition(screenCenter);

    // 2. Snap to grid
    const snapped = {
      x: Math.round(flowPos.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(flowPos.y / GRID_SIZE) * GRID_SIZE,
    };

    // 3. Clamp within canvas bounds
    const clamped = {
      x: Math.max(CANVAS_BOUNDS[0][0], Math.min(CANVAS_BOUNDS[1][0] - NODE_WIDTH, snapped.x)),
      y: Math.max(CANVAS_BOUNDS[0][1], Math.min(CANVAS_BOUNDS[1][1] - NODE_HEIGHT, snapped.y)),
    };

    // 4. Build new node (same structure as Canvas.tsx onDrop)
    const newNode: TaxNode = {
      id: nanoid(),
      type: 'entity',
      position: clamped,
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

    // 5. Resolve overlap with 20px gap
    const adjusted = resolveOverlap(newNode, getNodes() as TaxNode[]);

    // 6. Add to store (triggers undo tracking)
    addNode(adjusted);
    setSelectedNode(adjusted.id);

    return adjusted.id; // for animation tracking
  };

  return { placeEntity };
}
```

### Mobile Palette Row Item (Simplified from PaletteItem)

```typescript
// Source: Adapted from PaletteItem.tsx (no drag, tap-only)
import type { EntityTypeConfig } from '@/models/entities';
import { PALETTE_ICONS } from './icon-map'; // extracted from PaletteItem.tsx

interface MobilePaletteRowProps {
  config: EntityTypeConfig;
  onTap: (entityTypeId: string) => void;
}

function MobilePaletteRow({ config, onTap }: MobilePaletteRowProps) {
  const IconComponent = PALETTE_ICONS[config.icon];

  return (
    <button
      onClick={() => onTap(config.id)}
      className="flex items-center gap-3 w-full px-4 py-3 active:bg-gray-100 transition-colors"
    >
      <div
        className="flex-shrink-0 w-1 h-8 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {IconComponent && (
        <IconComponent className="w-5 h-5 flex-shrink-0 text-gray-600" />
      )}
      <span className="text-sm text-gray-700">{config.displayName}</span>
    </button>
  );
}
```

### Scale-In Animation CSS

```css
/* Source: Phase 12 requirement -- ~150ms scale animation */
@keyframes entity-scale-in {
  from {
    scale: 0;
    opacity: 0;
  }
  to {
    scale: 1;
    opacity: 1;
  }
}

.entity-node--scale-in {
  animation: entity-scale-in 150ms ease-out forwards;
  transform-origin: center center;
}
```

### Modified resolveOverlap with 20px Gap

```typescript
// Source: Modified from lib/utils/overlap.ts
const GAP = GRID_SIZE; // 20px = one grid step

const hasOverlap = (pos: { x: number; y: number }): boolean =>
  existingNodes.some((n) => {
    const dx = Math.abs(n.position.x - pos.x);
    const dy = Math.abs(n.position.y - pos.y);
    return dx < NODE_WIDTH + GAP && dy < NODE_HEIGHT + GAP;
  });
```

## Existing Wiring Inventory

Critical existing infrastructure that Phase 12 builds on:

| Component/Module | What Exists | What Phase 12 Needs |
|------------------|------------|---------------------|
| `MobileEditorLayout.tsx` | Plus button calls `setMobilePaletteOpen(true)` | Mount `MobilePalette` component + `BottomSheet` |
| `ui-store.ts` | `isMobilePaletteOpen`, `setMobilePaletteOpen` | Add `lastPlacedNodeId` for animation tracking |
| `BottomSheet.tsx` | Full snap-point sheet with spring animation | Fix touch scroll conflict (handle-only drag) |
| `EntityPalette.tsx` | `CATEGORY_CONFIG` (not exported), uses `getEntitiesByCategory` | Extract `CATEGORY_CONFIG` to shared location |
| `PaletteItem.tsx` | `PALETTE_ICONS` map (not exported) | Extract to shared location or duplicate |
| `entity-registry.ts` | `ENTITY_REGISTRY`, `getEntitiesByCategory`, `getEntityConfig` | Used as-is |
| `overlap.ts` | `resolveOverlap` with zero-gap overlap detection | Add 20px gap parameter |
| `graph-store.ts` | `addNode` action (immer + temporal tracked) | Used as-is |
| `Canvas.tsx` | `onDrop` handler (placement reference pattern) | Reference for node creation structure |
| `constants.ts` | `GRID_SIZE=20`, `NODE_WIDTH=180`, `NODE_HEIGHT=70`, `CANVAS_BOUNDS` | Used as-is |
| `globals.css` | Entity node shapes, touch overrides | Add scale-in animation keyframes |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Individual `scale` CSS property not widely supported | `scale` property supported in all modern browsers | 2023+ (baseline) | Can use `scale` instead of `transform: scale()` to avoid transform conflicts with React Flow |
| React Flow v11 `project()` | React Flow v12 `screenToFlowPosition()` | v12 (2024) | Renamed API -- already using correct v12 name in Canvas.tsx |

**Deprecated/outdated:**
- React Flow v11's `project()` method was renamed to `screenToFlowPosition()` in v12. The codebase already uses the v12 API.

## Open Questions

1. **Should the PALETTE_ICONS map be extracted or duplicated?**
   - What we know: `PALETTE_ICONS` maps icon name strings (e.g., `'building-2'`) to Lucide components. It's defined in `PaletteItem.tsx` and contains 10 entries.
   - What's unclear: Whether extracting it to a shared module is worth the refactor, or if duplicating it in MobilePalette is acceptable.
   - Recommendation: Extract it alongside `CATEGORY_CONFIG` to keep a single source of truth. Both are small, static data structures.

2. **Should the BottomSheet touch scroll fix be scoped to Phase 12 or treated as a BottomSheet bug fix?**
   - What we know: The current BottomSheet intercepts all touch events on the sheet container. For Phase 12, the palette content needs to be scrollable when there are many items at half-height.
   - What's unclear: Whether other future BottomSheet uses (Phase 13 properties sheet) will also need scrollable content.
   - Recommendation: Fix it in Phase 12 as a BottomSheet improvement. The fix is general-purpose (drag only from handle, not from content) and benefits all future sheets.

3. **Should the lastPlacedNodeId be cleared by timeout or onAnimationEnd?**
   - What we know: The scale-in animation is 150ms. We need to clear the flag to avoid re-animating on re-renders.
   - What's unclear: Whether `onAnimationEnd` reliably fires in React Flow's virtual rendering.
   - Recommendation: Use both -- `onAnimationEnd` as primary, 200ms timeout as fallback safety net.

## Sources

### Primary (HIGH confidence)
- **Codebase inspection** (all source files read directly):
  - `src/components/editor/MobileEditorLayout.tsx` -- Plus button wiring
  - `src/components/mobile/BottomSheet.tsx` -- Sheet implementation, touch handlers
  - `src/components/palette/EntityPalette.tsx` -- CATEGORY_CONFIG, desktop palette structure
  - `src/components/palette/PaletteItem.tsx` -- PALETTE_ICONS, drag implementation
  - `src/lib/entity-registry.ts` -- ENTITY_REGISTRY, getEntitiesByCategory, getEntityConfig
  - `src/lib/utils/overlap.ts` -- resolveOverlap spiral search
  - `src/lib/constants.ts` -- GRID_SIZE, NODE_WIDTH, NODE_HEIGHT, CANVAS_BOUNDS
  - `src/stores/ui-store.ts` -- isMobilePaletteOpen, setMobilePaletteOpen
  - `src/stores/graph-store.ts` -- addNode action
  - `src/components/canvas/Canvas.tsx` -- onDrop handler (placement reference)
  - `src/hooks/useDeviceCapabilities.ts` -- isMobile, isTouchDevice flags
  - `src/app/globals.css` -- entity node CSS, touch overrides
  - `src/models/entities.ts` -- EntityTypeConfig, EntityCategory types
  - `src/models/graph.ts` -- TaxNode, TaxEntityData types
  - `src/components/canvas/nodes/EntityNode.tsx` -- node rendering, class names
  - `src/lib/spring.ts` -- animateSpringWithVelocity used by BottomSheet
  - `src/components/editor/EditorLayout.tsx` -- ReactFlowProvider wrapping, mobile layout branching

- **@xyflow/react v12 TypeScript definitions** -- `screenToFlowPosition`, `getViewport`, `getNodes` API signatures confirmed from installed package types

### Secondary (MEDIUM confidence)
- CSS individual transform properties (`scale` property) -- baseline support confirmed across modern mobile browsers per web platform data

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, all APIs verified in installed packages
- Architecture: HIGH -- all existing components inspected, composition patterns clear
- Pitfalls: HIGH -- identified from direct code analysis (BottomSheet touch conflict, transform collision, overlap gap mismatch, canvas bounds clamping)

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable -- no external dependencies, all code is project-internal)
