---
phase: 14-mobile-connection-drawing
plan: 01
subsystem: ui
tags: [react-flow, mobile, touch, connection, zustand, css-animation]

# Dependency graph
requires:
  - phase: 11-responsive-layout-shell
    provides: "MobileEditorLayout with floating toolbar and touch handle visibility"
  - phase: 12-mobile-entity-management
    provides: "MobilePalette, mobileTool/pendingConnectionSource in ui-store"
  - phase: 13-mobile-properties-editing
    provides: "MobilePropertiesSheet, MobileContextMenu, two-step tap pattern"
provides:
  - "Connect mode toggle in mobile toolbar with active state styling"
  - "Tap-to-connect state machine: source tap -> target tap -> type picker"
  - "MobileConnectionBanner floating instruction banner"
  - "Source entity blue ring highlight during connect flow"
  - "Enhanced handle visibility (0.5 opacity) on touch devices"
affects: [15-hover-interaction-audit, 16-mobile-polish]

# Tech tracking
tech-stack:
  added: []
  patterns: ["mobileTool state-driven connect mode with conditional connectOnClick", "styledNodes useMemo for class injection on specific node"]

key-files:
  created:
    - src/components/mobile/MobileConnectionBanner.tsx
  modified:
    - src/components/canvas/Canvas.tsx
    - src/components/editor/MobileEditorLayout.tsx
    - src/app/globals.css

key-decisions:
  - "Hoisted pendingConnection useState above onNodeClick to allow connect mode to call setPendingConnection directly"
  - "connectOnClick disabled only during connect mode to prevent handle-tap conflicts while preserving desktop behavior"
  - "Handle base opacity bumped from 0.3 to 0.5 for always-visible discovery on touch (MCONN-01)"

patterns-established:
  - "State-driven mode switching: mobileTool === 'connect' gates all connect-mode behavior in Canvas"
  - "styledNodes pattern: useMemo wrapping nodes array with conditional className injection"

# Metrics
duration: 4min
completed: 2026-03-05
---

# Phase 14 Plan 01: Mobile Connection Drawing Summary

**Tap-to-connect flow with connect mode toggle, floating instruction banner, source highlight ring, and enhanced touch handle visibility**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-05T10:51:26Z
- **Completed:** 2026-03-05T10:55:37Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Connect button in mobile toolbar toggles connect mode on/off with blue active state and dynamic aria-label
- Two-tap state machine: first tap sets source (with blue ring highlight), second tap on different node triggers MobileConnectionTypePicker
- MobileConnectionBanner shows contextual instruction text ("Tap an entity..." / "Now tap target to connect from {name}") with cancel button
- Handle base opacity increased to 0.5 on touch devices for better discoverability
- Pane clicks in connect mode clear pending source without exiting mode; self-tap deselects source

## Task Commits

Each task was committed atomically:

1. **Task 1: Connect mode toggle and tap-to-connect state machine** - `78eb7fe` (feat)
2. **Task 2: MobileConnectionBanner, source highlight, handle visibility** - `7321997` (feat)

**Plan metadata:** (pending final commit)

## Files Created/Modified
- `src/components/mobile/MobileConnectionBanner.tsx` - Floating instruction banner for connect mode state
- `src/components/canvas/Canvas.tsx` - onNodeClick connect mode intercept, styledNodes, connectOnClick conditional, pane click handling
- `src/components/editor/MobileEditorLayout.tsx` - Connect button toggle with active state, banner mount
- `src/app/globals.css` - Source highlight ring CSS, handle opacity bump to 0.5, banner animation

## Decisions Made
- Hoisted `pendingConnection` useState declaration above `onNodeClick` to resolve block-scoped variable reference error (setPendingConnection used in connect mode intercept)
- connectOnClick set to `false` only during connect mode to prevent React Flow's built-in handle-tap connection from conflicting with custom tap-to-connect
- Handle base opacity bumped from 0.3 to 0.5 per MCONN-01 requirement for always-visible handles

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Hoisted pendingConnection useState declaration**
- **Found during:** Task 1 (Canvas.tsx connect mode intercept)
- **Issue:** TypeScript error TS2448 -- `setPendingConnection` used before its `useState` declaration (block-scoped variable)
- **Fix:** Moved `const [pendingConnection, setPendingConnection] = useState<Connection | null>(null)` from line 408 to before `onNodeClick` callback, removed duplicate declaration
- **Files modified:** src/components/canvas/Canvas.tsx
- **Verification:** `npx tsc --noEmit` passes, `npm run build` succeeds
- **Committed in:** 78eb7fe (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Declaration ordering fix necessary for TypeScript compilation. No scope creep.

## Issues Encountered
None beyond the auto-fixed declaration ordering.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Mobile connection drawing flow complete (MCONN-01 through MCONN-04)
- Ready for Phase 15 (Hover Interaction Audit) which audits all hover-dependent interactions across the codebase
- Connect mode integrates cleanly with existing MobileConnectionTypePicker from Phase 13

---
*Phase: 14-mobile-connection-drawing*
*Completed: 2026-03-05*
