# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-06)

**Core value:** Tax lawyers can draw a structure and instantly understand its tax implications
**Current focus:** Milestone v2.0 -- Multi-Jurisdiction -- Defining requirements

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-06 — Milestone v2.0 started

Progress: v1.0 (17/17 plans) + v1.1 (10/10 plans) = 27 plans shipped | v2.0: 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 26
- Average duration: 8 min
- Total execution time: ~3.2 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-canvas-foundation | 4/4 | 37 min | 9 min |
| 02-entity-system | 2/2 | ~15 min | ~8 min |
| 03-canvas-interactions | 2/2 | 11 min | 6 min |
| 04-connection-system | 2/2 | 8 min | 4 min |
| 05-smart-canvas | 2/2 | 22 min | 11 min |
| 06-ai-analysis-engine | 2/2 | 39 min | 20 min |
| 07-local-persistence | 3/3 | 10 min | 3 min |
| 10-mobile-foundation | 1/1 | 3 min | 3 min |
| 11-responsive-layout-shell | 2/2 | 7 min | 4 min |
| 12-mobile-entity-management | 1/1 | 5 min | 5 min |
| 13-mobile-properties-editing | 2/2 | 12 min | 6 min |
| 14-mobile-connection-drawing | 1/1 | 4 min | 4 min |
| 15-hover-audit-toolbar-completion | 2/2 | 6 min | 3 min |
| 16-performance-real-device-testing | 1/1 | 5 min | 5 min |

**Recent Trend:**
- Last 5 plans: 4 min, 4 min, 2 min, 4 min, 5 min
- Trend: Stable

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap v1.1]: 7 phases (10-16) derived from 32 requirements at comprehensive depth
- [Roadmap v1.1]: Phase 10 is infrastructure-only (no user-facing requirements)
- [Roadmap v1.1]: Zero-new-dependencies as primary approach; vaul/@use-gesture as fallback
- [Roadmap v1.1]: Hover audit deferred to Phase 15 (after all interactions exist)
- [Research]: connectOnClick integration needs verification in Phase 14 before building UI around it
- [Research]: iOS Safari virtual keyboard + visualViewport API needs fix cycle budget in Phase 13
- [07-03]: Thumbnail capture at pixelRatio: 1 to keep localStorage footprint small; explicit save only (not auto-save)
- [10-01]: Zero new dependencies -- all mobile primitives built with native APIs (matchMedia, rAF, touch events)
- [10-01]: Spring animation uses simple stiffness/damping model (~80 lines) instead of adding a physics library
- [10-01]: BottomSheet uses translateY transforms via ref (no React state during drag) for 60fps touch performance
- [11-01]: No floating structure name header in mobile editor -- maximizes canvas real estate like Figma mobile
- [11-01]: Template picker and delete dialog render on all screen sizes via fragment wrapper
- [11-02]: Double-click-to-create disabled on touch -- FAB in Phase 12 replaces it
- [11-02]: Context menus disabled on touch -- long-press menus in Phase 13 replace them
- [11-02]: HelperLines hidden on all touch devices (not just mobile) -- precision feature
- [12-01]: CATEGORY_CONFIG uses iconName strings (not JSX) for framework-agnostic sharing between desktop and mobile
- [12-01]: BottomSheet touch handlers moved to drag handle only, enabling content area scrolling
- [12-01]: Scale-in animation uses CSS scale property (not transform: scale) to avoid conflicting with React Flow transforms
- [13-01]: BottomSheet imperative ref API via forwardRef + useImperativeHandle for external snap control
- [13-01]: RELATIONSHIP_TYPES extracted to shared lib file for desktop modal and mobile picker sync
- [13-01]: PropertiesPanel autoFocus prop (default true) suppresses keyboard popup on mobile
- [13-01]: touch-target CSS class in @media (pointer: coarse) for 44px delete button targets
- [13-02]: Combined wrapper approach for EntityNode touch handlers -- captures coords before delegating to useLongPress
- [13-02]: Analysis overlay uses placeholder content with disabled buttons -- ready for streaming AI when backend exists
- [13-02]: Double pointer-events-auto (Tailwind + inline) on overlay for guaranteed modal behavior
- [14-01]: pendingConnection useState hoisted above onNodeClick for connect mode setPendingConnection access
- [14-01]: connectOnClick disabled only during connect mode to prevent handle-tap conflicts while preserving desktop behavior
- [14-01]: Handle base opacity bumped from 0.3 to 0.5 for always-visible discovery on touch (MCONN-01)
- [15-01]: pointerdown event (not mousedown) for close-on-tap-outside to handle both mouse and touch
- [15-01]: Save and Export PNG conditionally rendered only when respective props provided
- [15-02]: All raw CSS :hover rules wrapped in @media (hover: hover) to prevent touch ghost hover
- [15-02]: Edge .selected rule kept outside media query -- selection is touch equivalent of hover
- [15-02]: Tablet MiniMap already works via !isMobile guard (MPOL-03 satisfied, no code changes)
- [15-02]: pointerdown replaces mousedown in all 4 toolbar dropdowns for tablet touch compatibility
- [16-01]: Viewport culling via onlyRenderVisibleElements prop (built-in React Flow, zero custom code)
- [16-01]: Drag transition suppression via CSS class toggle (not per-node state) for zero re-render overhead
- [16-01]: Safe-area utilities as plain CSS classes (not Tailwind plugin) since Tailwind v4 dropped pb-safe
- [16-01]: Backdrop-blur conditionally removed on mobile only; desktop retains frosted glass aesthetic

### Pending Todos

None.

### Blockers/Concerns

- Library versions verified: Next.js 16.1.6, React Flow 12.10.0, Zustand 5.0.11, React 19.2.3
- React Flow 12.10.0 touch props confirmed: zoomOnPinch, panOnDrag, preventScrolling, connectOnClick all present
- HTML5 DnD is non-functional on touch -- replaced by tap-to-add in Phase 12
- Hover audit complete: all 4 raw CSS :hover rules guarded, active feedback on all interactive components

## Session Continuity

Last session: 2026-03-06
Stopped at: Starting v2.0 Multi-Jurisdiction milestone — research phase
Resume file: None
