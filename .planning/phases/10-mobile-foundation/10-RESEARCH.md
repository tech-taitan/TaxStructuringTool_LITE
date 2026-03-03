# Phase 10: Mobile Foundation - Research

**Researched:** 2026-03-04
**Status:** Complete

## 1. Existing Codebase Patterns

### Zustand Store Pattern
- `ui-store.ts` uses `create<UIState>()((set) => ({...}))` flat pattern
- All fields at top level with setter functions
- Convention: boolean toggles use `toggle*()`, specific values use `set*(value)`
- Current fields: selectedNodeId, isPaletteCollapsed, contextMenu, deleteConfirm, connectionFilter, interactionMode, darkMode, etc.
- Store is imported as `useUIStore` with individual selectors: `useUIStore((s) => s.field)`

### Existing useMediaQuery Hook
- `src/hooks/useMediaQuery.ts` — already exists, reactive, SSR-safe
- Uses `matchMedia` with `change` event listener
- Returns boolean
- Already used in EditorLayout: `useMediaQuery('(max-width: 767px)')` for isMobile, `useMediaQuery('(max-width: 1024px)')` for isTablet
- **Recommendation:** Build `useDeviceCapabilities` on top of this existing hook

### EditorLayout Mobile Gate
- `src/components/editor/EditorLayout.tsx` line 262-282 — returns "Larger Screen Required" for `isMobile`
- This gate will be replaced in future phases when mobile layout exists
- The `isMobile` / `isTablet` breakpoints are already used for palette auto-collapse and right panel overlay behavior

### Modal/Overlay Pattern
- Delete confirmation dialog: `fixed inset-0 bg-black/50 z-50` for scrim, centered card on top
- This matches the BottomSheet scrim decision (semi-transparent backdrop)

### Component Naming Convention
- Components in `src/components/{domain}/ComponentName.tsx`
- BottomSheet should go in `src/components/mobile/BottomSheet.tsx` (new mobile directory)

### Hook Naming Convention
- Hooks in `src/hooks/use*.ts`
- `useDeviceCapabilities.ts`, `useLongPress.ts` follow existing pattern

## 2. BottomSheet Implementation

### Approach: Zero Dependencies
Per roadmap decision: zero-new-dependencies as primary approach. Implement with raw touch events + requestAnimationFrame spring animation.

### Spring Physics (no library)
Implement a simple damped spring using requestAnimationFrame:
```
velocity += (target - position) * stiffness
velocity *= damping
position += velocity
```
Constants: stiffness ~0.15, damping ~0.75. Stop when |velocity| < 0.5 and |distance| < 0.5.

This gives organic, velocity-responsive feel without any library. The spring function should be a standalone utility in `src/lib/spring.ts` for reuse.

### Touch Handling
- Attach `touchstart` / `touchmove` / `touchend` on the sheet container
- Track drag delta from touch start Y position
- On release: find nearest snap point, animate with spring to it
- If dragged below collapsed (0) → dismiss the sheet (call onClose)

### Snap Points
- Collapsed: translateY = 100% (off-screen below)
- Half: translateY = 55% (showing ~45% of viewport)
- Full: translateY = env(safe-area-inset-top, 20px) (~5% from top)
- Use `dvh` units for viewport height to handle iOS Safari correctly

### Backdrop/Scrim
- Separate `<div>` with `fixed inset-0` behind the sheet
- Opacity animated based on sheet position (0 at collapsed → 0.4 at full)
- Click on scrim → dismiss (call onClose)
- Use `pointer-events: none` when sheet is collapsed

### Component API
```typescript
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  snapPoints?: ('collapsed' | 'half' | 'full')[];
  initialSnap?: 'half' | 'full';
  children: React.ReactNode;
}
```

### Visual Design (from CONTEXT.md decisions)
- Match existing app visual language: `rounded-t-xl`, white background, border-gray-200 border-top, shadow-xl
- Handle pill: 32x4px rounded-full bg-gray-300 centered, mt-2 mb-1
- Match the delete dialog's shadow/border-radius style

## 3. useDeviceCapabilities Hook

### Build on useMediaQuery
```typescript
interface DeviceCapabilities {
  isTouchDevice: boolean;  // pointer: coarse
  isMobile: boolean;       // max-width: 767px
  isTablet: boolean;       // 768-1024px
  isDesktop: boolean;      // > 1024px
}
```

Decision: Include screen size breakpoints since they're already used in EditorLayout (lines 54-55) and downstream phases need them. The existing `useMediaQuery` calls in EditorLayout can be replaced with this single hook.

### Reactivity
Built on `useMediaQuery` which already handles live `change` event listeners — no additional work needed.

### No PWA / No Orientation (per CONTEXT.md)

## 4. useLongPress Hook

### API Design (from CONTEXT.md: callbacks only)
```typescript
interface LongPressOptions {
  duration?: number;        // default 500ms
  moveThreshold?: number;   // default 10px (Claude's discretion)
  onStart?: () => void;     // finger down
  onFinish?: () => void;    // long-press completed
  onCancel?: () => void;    // finger moved or lifted early
}

function useLongPress(options: LongPressOptions): {
  onTouchStart: TouchEventHandler;
  onTouchMove: TouchEventHandler;
  onTouchEnd: TouchEventHandler;
  onTouchCancel: TouchEventHandler;
}
```

### Implementation Notes
- Use `useRef` for timer ID, start position, and active flag
- `touchstart`: record position, start setTimeout, call onStart
- `touchmove`: calculate distance from start, if > threshold → cancel timer, call onCancel
- `touchend` / `touchcancel`: clear timer if still pending, call onCancel if not yet fired
- Movement threshold: 10px (moderate — forgiving on shaky fingers but prevents accidental during scroll)
- Return touch event handlers that consumers spread onto their target element

## 5. Zustand Mobile State Fields

### Fields (from success criteria)
Add to `ui-store.ts`:
```typescript
// Mobile UI state
isMobilePaletteOpen: boolean;       // default: false
isMobilePropertiesOpen: boolean;    // default: false
mobileTool: MobileTool | null;      // default: null
pendingConnectionSource: string | null; // default: null
```

### MobileTool Type
```typescript
type MobileTool = 'select' | 'pan' | 'connect';
```
Three tools that map to what the user is doing on mobile canvas. `null` = default behavior (no override).

### Setters
Follow existing convention:
- `setMobilePaletteOpen(open: boolean)`
- `setMobilePropertiesOpen(open: boolean)`
- `setMobileTool(tool: MobileTool | null)`
- `setPendingConnectionSource(nodeId: string | null)`

### Integration Note
These fields are added now but NOT consumed until Phases 11-16. No existing code needs to change — purely additive.

## 6. File Plan

| File | Action | Purpose |
|------|--------|---------|
| `src/hooks/useDeviceCapabilities.ts` | Create | Device detection hook wrapping useMediaQuery |
| `src/hooks/useLongPress.ts` | Create | Long-press gesture hook with callbacks |
| `src/lib/spring.ts` | Create | Spring animation utility (reusable) |
| `src/components/mobile/BottomSheet.tsx` | Create | BottomSheet component with snap points |
| `src/stores/ui-store.ts` | Modify | Add mobile state fields |

## 7. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Spring animation performance on low-end mobile | Use `transform: translateY()` (GPU-composited), avoid layout triggers |
| iOS Safari safe area handling | Use `env(safe-area-inset-top)` and `dvh` units |
| Touch event conflicts with React Flow | BottomSheet overlays canvas with higher z-index, stops propagation |
| SSR hydration mismatch for matchMedia | Existing useMediaQuery is already SSR-safe (returns false on server) |

## RESEARCH COMPLETE
