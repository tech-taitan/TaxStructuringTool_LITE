---
phase: 21-validation-canvas-polish
plan: 01
subsystem: validation
tags: [graph-validator, jurisdiction-rules, s-corp, vcc, lpf, entity-registry]

# Dependency graph
requires:
  - phase: 17-data-model-entity-registry
    provides: "Entity registry with getEntityConfig() and multi-jurisdiction categories"
  - phase: 19-properties-field-validation
    provides: "Expanded TRUST_TYPES and PARTNERSHIP_TYPES Sets for cross-jurisdiction validation"
provides:
  - "Rule 9: US S Corp ineligible shareholder type validation"
  - "Rule 10: SG VCC fund manager requirement validation"
  - "Rule 11: HK LPF fund manager requirement validation"
affects: [21-02-PLAN, validation-panel, graph-warnings]

# Tech tracking
tech-stack:
  added: []
  patterns: ["jurisdiction-gated validation rules using entityType literal checks", "entity-registry category lookup for shareholder eligibility"]

key-files:
  created: []
  modified: ["src/lib/validation/graph-validator.ts"]

key-decisions:
  - "S_CORP_INELIGIBLE_CATEGORIES as Set constant for O(1) category lookup"
  - "US trusts explicitly eligible for S Corp (category 'trust' not in ineligible set)"

patterns-established:
  - "Jurisdiction-specific rules gate on entityType literal, not jurisdiction string, to avoid false positives"
  - "Registry-derived category/jurisdiction checks via getEntityConfig() for cross-entity validation"

# Metrics
duration: 1min
completed: 2026-03-07
---

# Phase 21 Plan 01: Jurisdiction-Specific Validation Rules Summary

**Three jurisdiction-scoped validation rules (US S Corp shareholder eligibility, SG VCC fund manager, HK LPF fund manager) added to graph-validator.ts using entity-registry category lookups**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-07T01:41:52Z
- **Completed:** 2026-03-07T01:43:04Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Rule 9: US S Corp flags ineligible shareholders (company/partnership/fund/holding/vc categories) and non-US individuals via entity-registry category lookup
- Rule 10: SG VCC warns when no management connection exists (fund manager requirement)
- Rule 11: HK LPF warns when no management connection exists (fund manager requirement)
- US individuals and US trusts correctly pass S Corp eligibility checks with no false positives

## Task Commits

Each task was committed atomically:

1. **Task 1: Add jurisdiction-specific validation rules 9-11** - `04e8f07` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `src/lib/validation/graph-validator.ts` - Added rules 9-11, S_CORP_INELIGIBLE_CATEGORIES constant, getEntityConfig import

## Decisions Made
- S_CORP_INELIGIBLE_CATEGORIES defined as a Set containing 'company', 'partnership', 'fund', 'holding', 'vc' for O(1) lookup
- US trusts are eligible S Corp shareholders (category 'trust' is not in the ineligible set, matching IRS rules for certain qualified trusts)
- Each rule gates on a specific entityType literal (not jurisdiction string) to guarantee zero false positives for entities from other jurisdictions

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Graph validator now has 11 rules covering AU, US, SG, HK, UK, and LU jurisdictions
- Ready for 21-02 (canvas polish and remaining validation UX work)
- All rules use warning severity for jurisdiction-specific structural issues

## Self-Check: PASSED

- [x] src/lib/validation/graph-validator.ts exists
- [x] Commit 04e8f07 exists
- [x] 21-01-SUMMARY.md exists

---
*Phase: 21-validation-canvas-polish*
*Completed: 2026-03-07*
