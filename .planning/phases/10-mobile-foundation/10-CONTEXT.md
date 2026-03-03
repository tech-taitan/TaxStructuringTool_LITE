# Phase 10: Mobile Foundation - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver all reusable mobile primitives in isolation — `useDeviceCapabilities` hook, `useLongPress` hook, `BottomSheet` component, and Zustand mobile UI state fields — so every subsequent phase (11-16) can compose from proven building blocks instead of building infrastructure inline.

This is an infrastructure phase with no user-facing requirements of its own. The primitives built here are consumed by Phases 11-16.

</domain>

<decisions>
## Implementation Decisions

### BottomSheet Visual Design
- **Style**: Match the existing app's visual language (toolbar/panel border-radius, shadows, colors) rather than adopting iOS or Material conventions
- **Backdrop**: Semi-transparent scrim (dark overlay, ~30-40% opacity) behind the sheet; tapping the scrim dismisses the sheet
- **Animation**: Spring physics for open/close/snap transitions — organic, velocity-responsive feel
- **Handle**: Visible drag handle pill at top center (~32x4px rounded bar) as universal "drag me" indicator

### Snap Point Behavior
- **Collapsed**: Off-screen (0px visible) — sheet is fully hidden when collapsed
- **Half**: Claude's Discretion — pick optimal percentage based on content needs (likely 40-50% of viewport)
- **Full**: Respects safe area insets (~95% viewport height) — does not cover status bar
- **Dismiss**: Dragging below collapsed position dismisses the sheet entirely with a swipe-away animation

### Long-Press Hook
- **API design**: Callbacks only (onStart, onEnd, onCancel) — hook does NOT handle visual feedback itself; consumers decide what to show
- **Duration**: Configurable with 500ms default — accept a `duration` parameter
- **Visual feedback**: Claude's Discretion — if the hook optionally supports visual hints, keep it consumer-side
- **Cancel threshold**: Claude's Discretion — pick an appropriate finger-movement threshold to cancel (somewhere in the 5-15px range)

### Device Detection Hook
- **Core detection**: Touch vs. mouse via `matchMedia('(pointer: coarse)')` (required by success criteria)
- **Screen size breakpoints**: Claude's Discretion — include if downstream phases need it, otherwise keep focused on pointer type
- **PWA detection**: Not needed — defer until the app becomes installable
- **Reactivity**: Live updates via matchMedia `change` event listeners — re-renders when input mode changes (e.g. tablet keyboard dock)
- **Orientation**: Claude's Discretion — include if low-cost and useful, otherwise defer to CSS media queries

</decisions>

<specifics>
## Specific Ideas

- Spring physics animation should feel responsive to drag velocity (fast swipe = faster animation)
- The scrim backdrop + tap-to-dismiss is a key UX pattern — users expect it from mobile sheets
- Callbacks-only long-press hook keeps the API generic and composable for different consumer use cases (entity context menu, canvas long-press, etc.)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-mobile-foundation*
*Context gathered: 2026-03-04*
