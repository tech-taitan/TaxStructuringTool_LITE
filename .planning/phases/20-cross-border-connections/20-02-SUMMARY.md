---
phase: 20-cross-border-connections
plan: 02
subsystem: ui, canvas
tags: [cross-border, withholding-tax, treaty, currency, transfer-pricing, react-flow, edge-visual]

# Dependency graph
requires:
  - phase: 20-cross-border-connections
    provides: Cross-border data layer with TaxRelationshipData fields, isCrossBorder utility, COMMON_CURRENCIES, PAYMENT_TYPES
  - phase: 19-properties-field-validation
    provides: ConnectionPropertiesPanel form pattern with auto-save and validation
provides:
  - Cross-border properties form section with WHT, treaty, currency, TP fields
  - Amber double-stroke visual differentiation on cross-border edges
  - Cross-border legend entry in CanvasLegend
affects: [21-validation-registry-refactor]

# Tech tracking
tech-stack:
  added: []
  patterns: [jurisdiction comparison for cross-border detection in edge components, narrow useStore selector for per-edge jurisdiction check]

key-files:
  created: []
  modified:
    - src/components/connections/ConnectionPropertiesPanel.tsx
    - src/components/canvas/edges/RelationshipEdge.tsx
    - src/components/canvas/CanvasLegend.tsx

key-decisions:
  - "Cross-border detection inline in each component via sourceNode/targetNode jurisdiction comparison rather than shared hook"
  - "Amber double-stroke rendered as background path with opacity 0.3, preserving relationship type colors and dash patterns"
  - "Cross-border fields preserved across relationship type changes (same as notes and pathOffset)"

patterns-established:
  - "Narrow useStore selector for per-edge jurisdiction check avoids subscribing to all node data changes"
  - "Conditional form sections based on isCrossBorderEdge computed from existing sourceNode/targetNode variables"

# Metrics
duration: 3min
completed: 2026-03-07
---

# Phase 20 Plan 02: Cross-Border Connection Visuals Summary

**Cross-border properties form with WHT/treaty/currency/TP fields, amber double-stroke edge highlight, and conditional legend entry**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-06T21:39:27Z
- **Completed:** 2026-03-06T21:42:22Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added conditional Cross-Border Details form section to ConnectionPropertiesPanel with 6 fields: WHT rate, payment type, treaty applies, treaty name, currency, transfer pricing relevant
- Added amber (#F59E0B) double-stroke highlight behind cross-border edges in RelationshipEdge, preserving all existing edge visuals
- Added Cross-Border Connection legend entry with matching amber indicator SVG in CanvasLegend
- Fields visibility is type-aware: WHT/payment/currency for equity/debt, TP for services/management/licensing, treaty for all

## Task Commits

Each task was committed atomically:

1. **Task 1: Add cross-border section to ConnectionPropertiesPanel** - `4fe7024` (feat)
2. **Task 2: Add cross-border edge visual differentiation and legend entry** - `9b39c0e` (feat)

## Files Created/Modified
- `src/components/connections/ConnectionPropertiesPanel.tsx` - Cross-border conditional form section with WHT, treaty, currency, TP fields; pathToLabel extension; handleTypeChange preservation
- `src/components/canvas/edges/RelationshipEdge.tsx` - Narrow useStore cross-border selector; amber double-stroke highlight path
- `src/components/canvas/CanvasLegend.tsx` - hasCrossBorderEdges useMemo; Cross-Border Connection legend entry with amber indicator

## Decisions Made
- Cross-border detection inline in each component via sourceNode/targetNode jurisdiction comparison rather than shared hook
- Amber double-stroke rendered as background path with opacity 0.3, preserving relationship type colors and dash patterns
- Cross-border fields preserved across relationship type changes (same as notes and pathOffset)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 20 (Cross-Border Connections) fully complete -- both data layer and UI/visuals shipped
- Cross-border properties form, edge highlighting, and legend entry all functional
- Ready for Phase 21 (Validation Registry Refactor) which will derive validation Sets from entity registry

## Self-Check: PASSED

All 3 modified files verified present on disk. Both task commits (4fe7024, 9b39c0e) verified in git log.

---
*Phase: 20-cross-border-connections*
*Completed: 2026-03-07*
