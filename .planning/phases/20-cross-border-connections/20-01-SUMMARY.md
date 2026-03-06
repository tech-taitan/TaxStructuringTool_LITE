---
phase: 20-cross-border-connections
plan: 01
subsystem: ui, data-model, validation
tags: [cross-border, withholding-tax, transfer-pricing, zod, react-flow]

# Dependency graph
requires:
  - phase: 17-data-model-entity-registry
    provides: Multi-jurisdiction entity registry with jurisdiction field on all entities
  - phase: 19-properties-field-validation
    provides: Zod validation schemas for entity and relationship types
provides:
  - cross-border.ts utility with isCrossBorder detection, COMMON_CURRENCIES, PAYMENT_TYPES
  - TaxRelationshipData extended with 6 optional cross-border fields
  - Zod validation for cross-border fields on all relationship schemas
  - Graph validator Rule 8 TP auto-flag on cross-border service/management/licensing
  - Fixed desktop onDrop to use entity registry jurisdiction
affects: [20-02-cross-border-visuals, 21-validation-registry-refactor]

# Tech tracking
tech-stack:
  added: []
  patterns: [cross-border detection via jurisdiction comparison, optional field extension for backward compat]

key-files:
  created:
    - src/lib/cross-border.ts
  modified:
    - src/components/canvas/Canvas.tsx
    - src/models/relationships.ts
    - src/lib/validation/relationship-schemas.ts
    - src/lib/validation/graph-snapshot-schema.ts
    - src/lib/validation/graph-validator.ts

key-decisions:
  - "onDrop uses config.jurisdiction from entity registry; onDoubleClickPane retains canvasJurisdiction for default AU entity shortcut"
  - "All 6 cross-border fields optional on base relationship schema so every type inherits them without schema-per-type changes"
  - "TP auto-flag is info severity, not warning, since it is advisory rather than structural"

patterns-established:
  - "Cross-border detection: compare sourceNode.data.jurisdiction !== targetNode.data.jurisdiction"
  - "Optional field extension: new fields on existing interfaces are always optional for backward compatibility"

# Metrics
duration: 3min
completed: 2026-03-07
---

# Phase 20 Plan 01: Cross-Border Data Layer Summary

**Cross-border detection utility, 6 optional WHT/TP metadata fields on relationship data, Zod validation schemas, and TP auto-flag rule on cross-border service connections**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-06T21:33:27Z
- **Completed:** 2026-03-06T21:36:42Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Fixed desktop drag-and-drop to use entity registry jurisdiction instead of canvasJurisdiction (matching MobilePalette behavior)
- Created cross-border.ts with isCrossBorder utility, COMMON_CURRENCIES (11 currencies), and PAYMENT_TYPES (6 types)
- Extended TaxRelationshipData with 6 optional fields: withholdingTaxRate, paymentType, treatyApplies, treatyName, currencyCode, transferPricingRelevant
- Added cross-border Zod fields to base relationship schema and graph snapshot schema
- Added graph validator Rule 8: TP relevance auto-flag on cross-border services/management/licensing connections

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix desktop jurisdiction bug, create cross-border utility, extend TaxRelationshipData** - `88d9ac1` (feat)
2. **Task 2: Extend validation schemas with cross-border fields and add TP auto-flag rule** - `349ec74` (feat)

## Files Created/Modified
- `src/lib/cross-border.ts` - Cross-border detection utility and constants (isCrossBorder, COMMON_CURRENCIES, PAYMENT_TYPES)
- `src/components/canvas/Canvas.tsx` - Fixed onDrop to use config.jurisdiction from entity registry
- `src/models/relationships.ts` - Extended TaxRelationshipData with 6 optional cross-border fields
- `src/lib/validation/relationship-schemas.ts` - Added cross-border Zod fields to base relationship schema
- `src/lib/validation/graph-snapshot-schema.ts` - Added cross-border fields for backward-compatible snapshot loading
- `src/lib/validation/graph-validator.ts` - Added TP_RELEVANT_TYPES constant and Rule 8

## Decisions Made
- onDrop uses config.jurisdiction from entity registry; onDoubleClickPane retains canvasJurisdiction for default AU entity shortcut
- All 6 cross-border fields optional on base relationship schema so every type inherits them without schema-per-type changes
- TP auto-flag is info severity, not warning, since it is advisory rather than structural

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Cross-border data layer complete -- ready for Plan 02 (cross-border edge visuals, properties panel, legend)
- All relationship types can now carry optional cross-border metadata
- isCrossBorder utility ready for use by edge rendering components

## Self-Check: PASSED

All 6 files verified present on disk. Both task commits (88d9ac1, 349ec74) verified in git log.

---
*Phase: 20-cross-border-connections*
*Completed: 2026-03-07*
