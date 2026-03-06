---
phase: 19-properties-field-validation
verified: 2026-03-07T00:00:00Z
status: passed
score: 13/13 must-haves verified
re_verification: false
gaps: []
human_verification:
  - test: Open UK Ltd entity, expand Registration, verify Company Number and UTR fields appear not ABN/ACN
    expected: Two text inputs Company Number maxLength 8 and UTR maxLength 10 visible; no ABN or ACN
    why_human: Visual field rendering cannot be verified programmatically without running the app
  - test: Open UK Ltd entity, expand Tax Status, verify Corporation Tax Rate and Small Profits Rate and UK Resident residency appear
    expected: Number input for Corporation Tax Rate, checkbox for Small Profits Rate, UK-specific residency options
    why_human: Visual field rendering and dropdown option content cannot be verified without running the app
  - test: Open US C Corp entity, expand Registration, verify EIN with placeholder and State of Formation dropdown
    expected: EIN text input with placeholder XX-XXXXXXX, State of Formation select with 51 options
    why_human: Visual rendering of dropdown options requires running the app
  - test: Enter invalid UK Company Number AB, wait for debounce, verify inline error and ErrorSummary show human-readable label
    expected: Red border on input, inline error text, ErrorSummary lists Company Number not raw path companyNumber
    why_human: Validation trigger flow and error display chain require interactive testing
  - test: Open AU Pty Ltd entity, verify Registration shows ABN/ACN and Tax Status shows Base Rate Entity
    expected: AU behavior identical to pre-phase; no non-AU fields visible for AU entities
    why_human: Regression check requires visual comparison in running app
  - test: Open any UK entity and check Identity section Jurisdiction field for full name display
    expected: Full jurisdiction name from JURISDICTIONS registry shown eg United Kingdom not UK
    why_human: Visual display of JURISDICTIONS registry lookup requires running the app
---

# Phase 19: Properties Field Validation -- Verification Report

**Phase Goal:** Users can view and edit jurisdiction-specific registration and tax status fields for any entity, with format validation that matches each jurisdiction official registration number patterns
**Verified:** 2026-03-07
**Status:** passed
**Re-verification:** No -- initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Zod schema exists for every non-AU entity type with correct regex validators on registration fields | VERIFIED | entity-schemas.ts: 12 reusable regex field validators and 28 non-AU schemas; all 54 entity type IDs mapped in schemaMap |
| 2 | TaxEntityData.registration and .taxStatus include all jurisdiction-specific fields as optional properties | VERIFIED | graph.ts lines 31-89: registration 20 fields (7 AU + 13 new), taxStatus 19 fields (5 AU + 14 new), all optional |
| 3 | Graph validator TRUST_TYPES and PARTNERSHIP_TYPES include non-AU trust and partnership entity IDs | VERIFIED | graph-validator.ts: TRUST_TYPES 10 entries (5 AU + 5 non-AU), PARTNERSHIP_TYPES 16 entries (4 AU + 12 non-AU) |
| 4 | Existing AU entity schemas and validation continue to work identically | VERIFIED | AU schemas unchanged; TypeScript compiles zero errors |
| 5 | User opens a UK entity and sees Company Number and UTR in Registration, not ABN/ACN | VERIFIED (code) | RegistrationSection.tsx renderUkFields() case company renders Company Number + UTR; renderFields() switch dispatches on jurisdiction |
| 6 | User opens a US entity and sees EIN and State of Formation in Registration, not ABN/ACN | VERIFIED (code) | renderUsFields() case company and partnership render EIN + renderStateOfFormation() with full 50-state + DC dropdown |
| 7 | User opens HK/SG/LU entities and sees jurisdiction-appropriate registration fields | VERIFIED (code) | renderHkFields() CR Number/BRN/HKID, renderSgFields() UEN/NRIC, renderLuFields() RCS Number/CSSF/Tax ID all present |
| 8 | User opens a UK company and sees Corporation Tax Rate and Small Profits Rate in Tax Status | VERIFIED (code) | TaxStatusSection.tsx renderUkFields() case company: TaxNumberField for corporationTaxRate + TaxCheckbox for smallProfitsRate |
| 9 | User opens a US LLC and sees Check-the-Box Election in Tax Status | VERIFIED (code) | renderUsFields() handles us-llc-disregarded and us-llc-partnership -- both render TaxSelectField for checkTheBoxElection |
| 10 | User sees jurisdiction-correct tax residency options for non-AU entities | VERIFIED (code) | RESIDENCY_OPTIONS map (lines 95-126) defines jurisdiction-specific options for all 6 jurisdictions |
| 11 | User enters invalid registration format and sees inline validation error with human-readable label | VERIFIED (code) | PropertiesPanel.tsx calls getEntitySchema(), surfaces Zod issues; RegTextField renders error prop; ErrorSummary.tsx labelMap has 45 entries |
| 12 | User sees full jurisdiction name (not code) in Identity section | VERIFIED (code) | IdentitySection.tsx line 174: JURISDICTIONS[formData.jurisdiction as Jurisdiction]?.name -- uses JURISDICTIONS registry |
| 13 | Existing AU entities display identical Registration and Tax Status fields with no regressions | VERIFIED (code) | renderAuFields() in both components contains verbatim copy of original AU rendering; zero TypeScript errors |

**Score:** 13/13 truths verified (6 require human confirmation of visual rendering in running app)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| src/models/graph.ts | Expanded TaxEntityData with all jurisdiction fields; contains companyNumber | VERIFIED | Lines 40-59 registration: 13 non-AU fields. Lines 71-88 taxStatus: 14 non-AU fields. All optional. |
| src/lib/validation/entity-schemas.ts | Zod schemas for all 6 jurisdiction entity types with regex validators; contains uk-ltd in schemaMap | VERIFIED | 12 regex validators (lines 14-114), 28 new schemas, schemaMap with 54 entries for all 54 registry entity type IDs |
| src/lib/validation/graph-validator.ts | Expanded TRUST_TYPES and PARTNERSHIP_TYPES with non-AU entity IDs; contains uk-unit-trust | VERIFIED | TRUST_TYPES (lines 27-42): 10 entries; PARTNERSHIP_TYPES (lines 45-68): 16 entries |
| src/components/properties/RegistrationSection.tsx | Jurisdiction-dispatched registration field rendering for all 6 jurisdictions; contains jurisdiction extraction | VERIFIED | config?.jurisdiction at line 122; renderFields() switch at lines 603-613; 6 renderer functions plus helpers |
| src/components/properties/TaxStatusSection.tsx | Jurisdiction-dispatched tax status field rendering for all 6 jurisdictions; contains jurisdiction extraction | VERIFIED | config?.jurisdiction at line 138; renderFields() switch at lines 539-548; RESIDENCY_OPTIONS map; helpers |
| src/components/properties/IdentitySection.tsx | JURISDICTIONS registry lookup for jurisdiction display name; contains JURISDICTIONS import | VERIFIED | Import on line 16; usage at line 174 |
| src/components/properties/ErrorSummary.tsx | Expanded label map for all jurisdiction field paths; contains registration.companyNumber entry | VERIFIED | labelMap (lines 24-82): 45 entries covering all AU and non-AU registration and tax status field paths |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| entity-schemas.ts | PropertiesPanel.tsx getEntitySchema() | schemaMap lookup by entity type ID | WIRED | PropertiesPanel.tsx line 16 imports getEntitySchema; line 80 calls getEntitySchema(formData.entityType) on every form change |
| graph-validator.ts | TRUST_TYPES.has(entityType) | Set membership check during validation | WIRED | Lines 87 and 223 call TRUST_TYPES.has; line 155 calls PARTNERSHIP_TYPES.has |
| RegistrationSection.tsx | getEntityConfig(entityType).jurisdiction | jurisdiction extraction from entity config | WIRED | Line 120: config = getEntityConfig(entityType); line 122: jurisdiction = config?.jurisdiction |
| TaxStatusSection.tsx | getEntityConfig(entityType).jurisdiction | jurisdiction extraction from entity config | WIRED | Line 136: config = getEntityConfig(entityType); line 138: jurisdiction = config?.jurisdiction |
| IdentitySection.tsx | JURISDICTIONS registry | import and lookup for display name | WIRED | Line 16 imports JURISDICTIONS; line 174 uses JURISDICTIONS[formData.jurisdiction as Jurisdiction]?.name |

---

### Requirements Coverage

| Requirement | Status | Evidence |
|-------------|--------|---------|
| PROP-01: UK registration fields | SATISFIED | renderUkFields() in RegistrationSection; ukCompanySchema, ukLlpSchema, ukLpSchema, ukGpSchema, ukTrustSchema, ukIndividualSchema, ukPensionSchema |
| PROP-02: US registration fields | SATISFIED | renderUsFields() in RegistrationSection; usCorpSchema, usLlcSchema, usPartnershipSchema, usTrustSchema, usIndividualSchema, us501c3Schema |
| PROP-03: HK/SG/LU registration fields | SATISFIED | renderHkFields(), renderSgFields(), renderLuFields() in RegistrationSection; corresponding schemas in entity-schemas.ts |
| PROP-04: UK/US/HK/SG/LU tax status fields | SATISFIED | renderUkFields(), renderUsFields(), renderHkFields(), renderSgFields(), renderLuFields() in TaxStatusSection |
| PROP-05: Jurisdiction-aware tax residency | SATISFIED | RESIDENCY_OPTIONS map in TaxStatusSection provides jurisdiction-specific options for all 6 jurisdictions |
| PROP-06: Format validation with human-readable labels | SATISFIED | 12 regex validators in entity-schemas.ts; 45-entry labelMap in ErrorSummary; PropertiesPanel wires Zod errors to field components |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None found | -- | -- | -- | -- |

The return null occurrences in switch default cases are intentional -- they prevent rendering for unknown categories and are not stubs. The placeholder prop in RegTextField is a valid UI format hint (e.g. XX-XXXXXXX for EIN), not an implementation placeholder. No TODOs, FIXMEs, empty implementations, or console.log stubs detected in any of the 7 files modified in this phase.

---

### Human Verification Required

Six items require human visual confirmation in the running application. All automated code-level checks passed.

#### 1. UK Entity Registration Fields

**Test:** Place a UK Ltd entity on the canvas, open the properties panel, expand the Registration section
**Expected:** Two text inputs labelled Company Number (maxLength 8) and UTR (maxLength 10) are visible; no ABN or ACN fields present
**Why human:** Visual field rendering cannot be verified without running the app

#### 2. UK Entity Tax Status Fields

**Test:** Open the same UK Ltd entity, expand Tax Status section
**Expected:** Number input for Corporation Tax Rate (%), checkbox for Small Profits Rate, and residency dropdown with UK Resident/Non-Resident options (not Australian Resident/Foreign Resident)
**Why human:** Visual rendering and dropdown option text require a live browser

#### 3. US Entity Fields

**Test:** Place a US C Corp, open properties, expand Registration
**Expected:** EIN text input with placeholder XX-XXXXXXX and a State of Formation dropdown listing all 50 states plus DC (51 options total)
**Why human:** Dropdown option list and placeholder display cannot be confirmed without rendering

#### 4. Validation Error Flow

**Test:** Enter AB in the Company Number field for a UK Ltd entity, wait approximately 400ms for the debounce timer
**Expected:** Red border on Company Number input, inline error text stating the format requirement, ErrorSummary shows Company Number with human-readable label (not raw path companyNumber)
**Why human:** Debounced validation trigger and error display chain require interactive testing

#### 5. AU Regression Check

**Test:** Open an AU Pty Ltd entity, expand Registration and Tax Status
**Expected:** Registration shows ABN and ACN fields; Tax Status shows Base Rate Entity (25%) checkbox and Tax Rate (%) input -- identical to pre-phase behavior; no UK/US/HK/SG/LU fields visible
**Why human:** Visual regression check requires live comparison against expected behavior

#### 6. Jurisdiction Display Name in Identity Section

**Test:** Open any UK entity, check the Identity section
**Expected:** Jurisdiction field displays United Kingdom not UK; similarly United States for US, Hong Kong for HK, Singapore for SG, Luxembourg for LU
**Why human:** JURISDICTIONS registry lookup result in read-only field requires visual verification

---

### Gaps Summary

No gaps found. All 13 observable truths are verified at code level:

- The data model (graph.ts) is substantively expanded with all required optional fields for 6 jurisdictions
- The validation schemas (entity-schemas.ts) are complete with 12 regex field validators, 28 non-AU schemas, and a schemaMap covering all 54 entity type IDs -- wired to PropertiesPanel via getEntitySchema()
- The graph validator (graph-validator.ts) correctly includes all non-AU trust and partnership IDs in the Sets used for structural validation rules
- The UI components (RegistrationSection.tsx, TaxStatusSection.tsx, IdentitySection.tsx, ErrorSummary.tsx) implement jurisdiction-first dispatch, jurisdiction-aware rendering, and full error label coverage
- TypeScript compiles with zero errors (confirmed via npx tsc --noEmit)
- All 4 commits from the summaries (f2002be, ab74fce, 181f892, e56975a) exist and are verified in git history

Six truths are code-verified but require human visual confirmation of the running application to complete end-to-end validation. These are standard UI verification items that cannot be confirmed programmatically.

---

_Verified: 2026-03-07_
_Verifier: Claude (gsd-verifier)_
