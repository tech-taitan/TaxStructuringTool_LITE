---
phase: 19-properties-field-validation
plan: 01
subsystem: validation
tags: [zod, typescript, regex, entity-schemas, graph-validator, multi-jurisdiction]

# Dependency graph
requires:
  - phase: 17-data-model-entity-registry
    provides: "Entity registry with 54 entity types across 6 jurisdictions"
provides:
  - "Expanded TaxEntityData interfaces with all jurisdiction registration and tax status fields"
  - "Zod schemas for all 54 entity types with regex validation on registration numbers"
  - "Expanded TRUST_TYPES and PARTNERSHIP_TYPES Sets with non-AU entity IDs"
affects: [19-02-PLAN, 20-cross-border-connections, 21-jurisdiction-validation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Reusable Zod regex field validators per jurisdiction (abnField, einField, uenField, etc.)"
    - "Schema grouping by jurisdiction with shared base schema extension"

key-files:
  created: []
  modified:
    - "src/models/graph.ts"
    - "src/lib/validation/entity-schemas.ts"
    - "src/lib/validation/graph-validator.ts"

key-decisions:
  - "All new interface fields optional to avoid breaking existing AU code"
  - "Reusable regex validators extracted before schemas for DRY validation"
  - "Schema map covers all 54 entity types with zero fallback to baseEntitySchema"

patterns-established:
  - "Jurisdiction field validators: const xyzField = z.string().regex(...).optional().or(z.literal(''))"
  - "Schema grouping: schemas per jurisdiction section, schema map entries grouped by jurisdiction"

# Metrics
duration: 3min
completed: 2026-03-07
---

# Phase 19 Plan 01: Data Model and Schema Expansion Summary

**Expanded TaxEntityData interfaces with 30 new fields and added 28 Zod schemas covering all 54 entity types with regex registration validators**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-06T20:26:21Z
- **Completed:** 2026-03-06T20:29:50Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Expanded TaxEntityData.registration with 16 new fields (UK/US/HK/SG/LU) and TaxEntityData.taxStatus with 14 new fields
- Created 12 reusable regex field validators for jurisdiction-specific registration numbers (UK company number, US EIN/SSN, HK CR/BRN, SG UEN/NRIC, LU RCS/national ID)
- Added 28 new Zod schemas for all 43 non-AU entity types, each with appropriate registration and tax status fields
- Expanded graph validator TRUST_TYPES (5 to 10) and PARTNERSHIP_TYPES (4 to 16) with all non-AU trust and partnership entity IDs
- Full schema map coverage: all 54 entity type IDs mapped to specific schemas

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand TaxEntityData interfaces and graph validator Sets** - `f2002be` (feat)
2. **Task 2: Add Zod validation schemas for all non-AU entity types** - `ab74fce` (feat)

## Files Created/Modified
- `src/models/graph.ts` - Expanded TaxEntityData.registration (23 fields) and .taxStatus (19 fields) with all jurisdiction-specific optional fields
- `src/lib/validation/entity-schemas.ts` - 12 reusable field validators, 28 new Zod schemas, schema map covering all 54 entity types
- `src/lib/validation/graph-validator.ts` - TRUST_TYPES expanded to 10 entries, PARTNERSHIP_TYPES expanded to 16 entries

## Decisions Made
- All new TaxEntityData fields are optional (?) to maintain backward compatibility with existing AU code
- Extracted 12 reusable regex field validators before schema definitions for DRY pattern (abnField, ukCompanyNumberField, einField, etc.)
- Schema map covers every entity type ID from the registry -- getEntitySchema() never falls back to baseEntitySchema for known types

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All interfaces, schemas, and validator Sets are ready for Plan 02 (UI renderers for jurisdiction-specific fields)
- PropertiesPanel can now call getEntitySchema('uk-ltd') and get ukCompanySchema with companyNumber/utr validation
- Graph validator correctly identifies non-AU trusts and partnerships for structural validation rules

---
*Phase: 19-properties-field-validation*
*Completed: 2026-03-07*
