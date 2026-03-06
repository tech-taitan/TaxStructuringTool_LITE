# Phase 19: Properties and Field Validation - Research

**Researched:** 2026-03-07
**Domain:** Multi-jurisdiction entity properties UI, registration/tax-status field rendering, Zod regex validation schemas
**Confidence:** HIGH

## Summary

Phase 19 extends the existing AU-only properties panel to display jurisdiction-specific registration fields (Company Number, UTR, NINO for UK; EIN, SSN/ITIN for US; CR Number, BRN, HKID for HK; UEN, NRIC/FIN for SG; RCS Number, CSSF Approval, Tax ID for LU) and tax status fields (Corporation Tax rate, Small Profits, IHT for UK; check-the-box, S Corp election for US; two-tier profits tax for HK; Section 13O/13U for SG; SOPARFI flag, participation exemption for LU) when an entity of the corresponding jurisdiction is selected. It also adds inline format validation for registration numbers using Zod regex schemas.

The codebase is well-positioned for this work. The existing `PropertiesPanel` is entity-type-agnostic -- it delegates to `RegistrationSection` and `TaxStatusSection` which dispatch on `category` via a `switch` statement. The existing `entity-schemas.ts` already uses Zod v4 with `.regex()` validators and a `schemaMap` keyed by entity type ID. The `TaxEntityData` interface in `graph.ts` has typed `registration` and `taxStatus` objects that currently only contain AU fields and need to be expanded. The `graph-snapshot-schema.ts` uses `.passthrough()` with `z.record(z.string(), z.unknown())` for both registration and taxStatus, so new fields are automatically handled for serialization.

The primary architectural decision is how to dispatch field rendering: the current approach dispatches on `category` (company/trust/partnership etc.), but Phase 19 requires jurisdiction-specific fields within the same category (e.g., a UK company shows Company Number + UTR while an AU company shows ABN + ACN). The solution is to dispatch on `jurisdiction` first, then on `category` within each jurisdiction, or alternatively dispatch on `entityType` directly. The `entityType` dispatch is most precise but creates a large switch statement; the `jurisdiction + category` dispatch keeps the switch manageable while being sufficiently granular.

**Primary recommendation:** Refactor RegistrationSection and TaxStatusSection to dispatch on `jurisdiction` (extracted from entity config) first, then on `category` within each jurisdiction block. Add Zod schemas for all non-AU entity types in entity-schemas.ts with `.regex()` validators for registration numbers. Expand `TaxEntityData.registration` and `TaxEntityData.taxStatus` interfaces in graph.ts to include all new fields. Update the `ErrorSummary` label map for new field paths. Existing AU properties must continue to work with zero regressions.

## Standard Stack

### Core (No Changes)
| Library | Version | Purpose | Why No Change |
|---------|---------|---------|---------------|
| Next.js | 16.1.6 | App framework | No framework changes |
| React | 19.2.3 | UI rendering | Same component patterns |
| @xyflow/react | 12.10.0 | Canvas rendering | Properties panel is independent of canvas |
| Zustand | 5.0.11 | State management | graph-store updateNodeData already handles arbitrary data |
| Zod | 4.3.6 | Validation schemas | Already used for entity-schemas.ts with .regex() |
| Tailwind CSS | v4 | Styling | Same input/label patterns |
| Lucide React | 0.564.0 | Icons | No new icons needed for properties |

### Supporting (No New Dependencies)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| react-markdown | 10.1.0 | Notes preview | No change |
| zundo | 2.3.0 | Undo/redo | No change -- properties changes go through updateNodeData |

### Alternatives Considered
| Instead of | Could Use | Why Not |
|------------|-----------|---------|
| react-hook-form | Controlled inputs + Zod | Already using controlled inputs with debounced auto-save. Adding react-hook-form would require rewriting the entire properties panel. The current pattern works well for the 5-15 fields per entity type. |
| yup | Zod | Zod already installed and in use. Switching validators would be pointless churn. |
| Per-field real-time validation | Debounced schema validation | Current 400ms debounce on the full schema is adequate. Individual field validation would add complexity without meaningful UX improvement for the number of fields involved. |
| Dynamic form generation from schema | Handwritten field components | Entity types have heterogeneous field types (text, checkbox, number, select, date). A dynamic form generator would add abstraction without reducing code -- the switch cases ARE the field definitions. |

**Installation:**
```bash
# No new packages to install. All changes use existing dependencies.
```

## Architecture Patterns

### Recommended Project Structure (Files Changed in Phase 19)
```
src/
  models/
    graph.ts                    # MODIFY: Expand TaxEntityData.registration and .taxStatus interfaces
  lib/
    validation/
      entity-schemas.ts         # MODIFY: Add Zod schemas for UK, US, HK, SG, LU entity types with .regex()
      graph-validator.ts        # MODIFY: Add non-AU entity type IDs to TRUST_TYPES, PARTNERSHIP_TYPES Sets
  components/
    properties/
      RegistrationSection.tsx   # MODIFY: Dispatch on jurisdiction, render jurisdiction-specific registration fields
      TaxStatusSection.tsx      # MODIFY: Dispatch on jurisdiction, render jurisdiction-specific tax status fields
      IdentitySection.tsx       # MODIFY: Fix jurisdiction display (currently hardcodes 'Australia')
      ErrorSummary.tsx          # MODIFY: Expand pathToLabel map for new field paths
```

### Components That Need NO Changes
| Component | Why No Change |
|-----------|---------------|
| `PropertiesPanel.tsx` | Entity-type-agnostic wrapper. Passes formData and entityType to children. Already uses `getEntitySchema(formData.entityType)` for validation. |
| `EntityPreview.tsx` | Renders shape/color/name only -- no field dependencies. |
| `NotesSection.tsx` | Free-form text, not jurisdiction-specific. |
| `MobilePropertiesSheet.tsx` | Wrapper around PropertiesPanel. Properties panel changes flow through automatically. |
| `graph-snapshot-schema.ts` | Uses `.passthrough()` and `z.record(z.string(), z.unknown())` for registration/taxStatus. New fields pass validation without changes. |
| `graph-store.ts` | `updateNodeData` uses `Object.assign(node.data, data)`. New fields merge naturally. |
| `entity-registry.ts` | `defaultData` for non-AU entities already contains the correct field keys (e.g., `companyNumber`, `ein`, `uen`). Phase 17 already added these. |

### Pattern 1: Jurisdiction-Based Field Dispatch
**What:** Refactor RegistrationSection and TaxStatusSection to dispatch on `jurisdiction` first (from entity config), then on `category` within each jurisdiction.
**When to use:** Always -- this replaces the current `switch (category)` pattern.
**Why:** Same category (e.g., 'company') needs different fields per jurisdiction. A UK company needs Company Number + UTR; an AU company needs ABN + ACN; a US company needs EIN + State of Formation.
**Example:**
```typescript
// Source: refactoring src/components/properties/RegistrationSection.tsx
const config = getEntityConfig(entityType);
const jurisdiction = config?.jurisdiction ?? 'AU';
const category = config?.category ?? 'company';

const renderFields = () => {
  switch (jurisdiction) {
    case 'AU':
      return renderAuFields(category);
    case 'UK':
      return renderUkFields(category);
    case 'US':
      return renderUsFields(category);
    case 'HK':
      return renderHkFields(category);
    case 'SG':
      return renderSgFields(category);
    case 'LU':
      return renderLuFields(category);
    default:
      return null;
  }
};
```

### Pattern 2: Zod Schema Per Entity Type with Regex Validators
**What:** Each non-AU entity type gets a Zod schema entry in `schemaMap` with `.regex()` validators on registration fields and typed tax status fields.
**When to use:** Every entity type must have a schema entry. The PropertiesPanel already calls `getEntitySchema(formData.entityType)`.
**Why:** The existing pattern validates on every debounced change (400ms) and shows inline errors. Adding schemas for new types makes validation work automatically.
**Example:**
```typescript
// Source: extending src/lib/validation/entity-schemas.ts
const ukCompanySchema = baseEntitySchema.extend({
  entityType: z.enum(['uk-ltd', 'uk-plc']),
  registration: z.object({
    companyNumber: z.string()
      .regex(/^[A-Z0-9]{8}$/, 'Company Number must be 8 alphanumeric characters')
      .optional()
      .or(z.literal('')),
    utr: z.string()
      .regex(/^\d{10}$/, 'UTR must be 10 digits')
      .optional()
      .or(z.literal('')),
  }).optional().default({}),
  taxStatus: z.object({
    corporationTaxRate: z.number().min(0).max(1).optional(),
    smallProfitsRate: z.boolean().optional(),
    taxResidency: z.string().optional(),
  }).optional().default({}),
});
```

### Pattern 3: Shared Field Components (Extract Repetition)
**What:** Extract common field rendering into reusable helper functions to avoid duplicating input markup across jurisdiction blocks.
**When to use:** When the same input pattern (text field with label, error display, maxLength) appears more than 3 times.
**Why:** The current AU RegistrationSection has ~30 lines of JSX for each text input (label + input + error). Multiplying by 5 jurisdictions x multiple fields = excessive duplication.
**Example:**
```typescript
// Helper for a text registration field
function RegTextField({
  label, field, maxLength, value, onChange, error
}: {
  label: string; field: string; maxLength?: number;
  value: string; onChange: (field: string, value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type="text"
        id={field}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className={`w-full px-3 py-1.5 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500 ${
          error ? 'border-red-400' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Creating separate component files per jurisdiction:** Do NOT create `UkRegistrationSection.tsx`, `UsRegistrationSection.tsx`, etc. Keep the switch-based dispatch inside the existing components. The render functions are 20-50 lines each; extracting to files would scatter related logic across 6 files.
- **Making TaxEntityData.registration a discriminated union:** The registration object intentionally uses `Record<string, unknown>` semantics in the snapshot schema. Using a TS discriminated union would not add runtime safety (Zod handles that) and would make the type unwieldy.
- **Validating on every keystroke:** Keep the 400ms debounce. Registration number regex validation on every keystroke would flash errors while the user is still typing (e.g., typing "12" would immediately show "must be 8 characters" before the user finishes).
- **Removing the `.or(z.literal(''))` pattern:** Registration fields must accept empty strings (optional fields). Without `.or(z.literal(''))`, an empty field would fail regex validation, preventing the user from clearing a field.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Registration number validation | Custom validation functions | Zod `.regex()` with `.optional().or(z.literal(''))` | Already the established pattern for AU ABN/ACN. Consistent error message format. |
| Form state management | Custom form library or react-hook-form | Existing controlled inputs + debounced auto-save | Current pattern works. PropertiesPanel already manages local state + debounced schema validation. |
| Field error mapping | Custom error tracking | Zod `safeParse().error.issues` with `path.join('.')` | Already implemented in PropertiesPanel. New fields get inline errors automatically. |
| US state dropdown | Hardcoded 50-state list | Array constant of US state codes | Keep it simple -- a static array of `{ code, name }` objects. No dynamic data needed. |

**Key insight:** The properties panel infrastructure (local form state, debounced validation, error display, nested object updates) is already complete and battle-tested from Phase 5. Phase 19 is about adding DATA (schemas, field definitions, render functions) to existing INFRASTRUCTURE. The plumbing works; we are adding pipes.

## Registration Number Format Specifications

### Verified Formats (from official sources)

| Jurisdiction | Field | Format | Regex | Confidence | Source |
|-------------|-------|--------|-------|------------|--------|
| UK | Company Number | 8 characters: 8 digits, or 2 letters + 6 digits | `/^[A-Z0-9]{8}$/` | HIGH | [Companies House Developer Forum](https://forum.companieshouse.gov.uk/t/company-number-format/3097), [GOV.UK](https://www.yourcompanyformations.co.uk/blog/company-registration-number-crn-number-explained/) |
| UK | UTR | 10 digits | `/^\d{10}$/` | HIGH | [HMRC Design Patterns](https://design.tax.service.gov.uk/hmrc-design-patterns/unique-taxpayer-reference/) |
| UK | NINO | 2 letters + 6 digits + 1 letter (A/B/C/D) | `/^[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]\d{6}[ABCD]$/` | HIGH | [GOV.UK HMRC Manual NIM39110](https://www.gov.uk/hmrc-internal-manuals/national-insurance-manual/nim39110) |
| US | EIN | 2 digits + hyphen + 7 digits (XX-XXXXXXX) | `/^\d{2}-\d{7}$/` | HIGH | [IRS Publication 1635](https://www.irs.gov/pub/irs-pdf/p1635.pdf) |
| US | SSN | 3 digits + hyphen + 2 digits + hyphen + 4 digits | `/^\d{3}-\d{2}-\d{4}$/` | HIGH | [IRS/SSA](https://www.justworks.com/blog/itin-ssn-or-ein-whats-the-difference) |
| US | ITIN | 9XX-XX-XXXX (starts with 9) | `/^9\d{2}-\d{2}-\d{4}$/` | HIGH | [Wikipedia ITIN](https://en.wikipedia.org/wiki/Individual_Taxpayer_Identification_Number) |
| HK | CR Number | 7-8 digits (since UBI, BRN is the primary 8-digit ID) | `/^\d{7,8}$/` | MEDIUM | [HK Companies Registry](https://www.fstb.gov.hk/en/blog/blog021223.htm) |
| HK | BRN (Business Registration Number) | 8 digits | `/^\d{8}$/` | MEDIUM | [Air Corporate](https://air-corporate.com/blog/hong-kong-business-registration-number-and-company-registration-number/) |
| HK | HKID | 1-2 letters + 6 digits + check digit in parens | `/^[A-Z]{1,2}\d{6}[0-9A]$/` | HIGH | [Wikipedia HKID](https://en.wikipedia.org/wiki/Hong_Kong_identity_card) |
| SG | UEN | 9 or 10 alphanumeric characters | `/^[A-Z0-9]{9,10}$/` | HIGH | [ACRA UEN Guide](https://osome.com/sg/guides/uen-singapore/), [GitHub validation](https://gist.github.com/mervintankw/90d5660c6ab03a83ddf77fa8199a0e52) |
| SG | NRIC/FIN | Letter prefix (S/T/F/G/M) + 7 digits + check letter | `/^[STFGM]\d{7}[A-Z]$/` | HIGH | [Wikipedia NRIC](https://en.wikipedia.org/wiki/National_Registration_Identity_Card), [ICA](https://www.ica.gov.sg/news-and-publications/newsroom/media-release/new-m-fin-series-to-be-introduced-from-1-january-2022) |
| LU | RCS Number | Letter prefix (B for commercial) + space + digits (variable length) | `/^[A-Z]\s?\d{1,6}$/` | MEDIUM | [LBR](https://www.lbr.lu/), [Guichet.lu](https://guichet.public.lu/en/entreprises/creation-developpement/constitution/entreprise-individuelle/immatriculation-entreprise-publication-rcs.html) |
| LU | Tax ID (Matricule) | 13 digits (YYYYMMDD + 3 digits + 2 check digits) | `/^\d{13}$/` | HIGH | [OECD TIN Guide](https://www.oecd.org/content/dam/oecd/en/topics/policy-issue-focus/aeoi/luxembourg-tin.pdf) |

### Validation Philosophy
- **Permissive over strict:** Use basic format validation (character count, digit/alpha pattern) rather than deep check-digit verification. The tool is for structuring visualization, not official filing. Users may enter partial or placeholder numbers.
- **Empty is always valid:** All registration fields are optional. The `.optional().or(z.literal(''))` pattern from AU schemas MUST be applied to all new schemas.
- **Case-insensitive input, uppercase display:** For fields that require uppercase letters (UK Company Number, SG UEN), accept lowercase input but validate against uppercase. Consider adding `.toUpperCase()` on blur for UX.
- **Hyphens in EIN/SSN:** The regex should include the hyphen as part of the format (XX-XXXXXXX). Do NOT strip hyphens before validation -- users expect to type them.

## Jurisdiction Field Specifications

### UK Entity Fields

#### Registration Fields (PROP-01)
| Entity Types | Field | Type | Validation | Default |
|-------------|-------|------|------------|---------|
| uk-ltd, uk-plc, uk-llp | Company Number | text (8 chars) | `/^[A-Z0-9]{8}$/` | `''` |
| uk-lp | LP Number | text | None (no standard public format) | `''` |
| All UK | UTR | text (10 digits) | `/^\d{10}$/` | `''` |
| uk-individual | NINO | text (9 chars) | `/^[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]\d{6}[ABCD]$/` | `''` |
| uk-pension-scheme | HMRC Reference | text | None (variable format) | `''` |

#### Tax Status Fields (PROP-01)
| Entity Types | Field | Type | Default |
|-------------|-------|------|---------|
| uk-ltd, uk-plc | Corporation Tax Rate | number (%) | `undefined` |
| uk-ltd, uk-plc | Small Profits Rate | boolean | `false` |
| uk-unit-trust, uk-discretionary-trust | Trust Rate (45%) | display/info | N/A |
| uk-individual | IHT Relevant | boolean | `false` |
| All UK | Tax Residency | select (UK Resident / Non-Resident) | `''` |

### US Entity Fields

#### Registration Fields (PROP-02)
| Entity Types | Field | Type | Validation | Default |
|-------------|-------|------|------------|---------|
| All US (except individual) | EIN | text (10 chars with hyphen) | `/^\d{2}-\d{7}$/` | `''` |
| us-individual | SSN/ITIN | text (11 chars with hyphens) | `/^\d{3}-\d{2}-\d{4}$/` | `''` |
| us-c-corp, us-s-corp, us-llc-disregarded, us-llc-partnership, us-lp, us-lllp | State of Formation | select (US states) | N/A | `''` |

#### Tax Status Fields (PROP-02)
| Entity Types | Field | Type | Default |
|-------------|-------|------|---------|
| us-llc-disregarded, us-llc-partnership | Check-the-Box Election | select (disregarded/partnership/corporation) | `''` |
| us-s-corp | S Corp Election | boolean | `false` |
| us-c-corp, us-s-corp | Federal Tax Rate | number (%) | `undefined` |
| All US | Tax Residency | select (US Resident / Non-Resident Alien) | `''` |

### HK Entity Fields

#### Registration Fields (PROP-03)
| Entity Types | Field | Type | Validation | Default |
|-------------|-------|------|------------|---------|
| hk-private-co, hk-public-co | CR Number | text (7-8 digits) | `/^\d{7,8}$/` | `''` |
| All HK (except individual) | BRN | text (8 digits) | `/^\d{8}$/` | `''` |
| hk-individual | HKID | text | `/^[A-Z]{1,2}\d{6}[0-9A]$/` | `''` |

#### Tax Status Fields (PROP-03)
| Entity Types | Field | Type | Default |
|-------------|-------|------|---------|
| hk-private-co, hk-public-co | Two-Tier Profits Tax | boolean | `false` |
| All HK | Territorial Source Principle | display/info | N/A |
| All HK | Tax Residency | select (HK Resident / Non-Resident) | `''` |

### SG Entity Fields

#### Registration Fields (PROP-04)
| Entity Types | Field | Type | Validation | Default |
|-------------|-------|------|------------|---------|
| All SG (except individual) | UEN | text (9-10 chars) | `/^[A-Z0-9]{9,10}$/` | `''` |
| sg-individual | NRIC/FIN | text (9 chars) | `/^[STFGM]\d{7}[A-Z]$/` | `''` |

#### Tax Status Fields (PROP-04)
| Entity Types | Field | Type | Default |
|-------------|-------|------|---------|
| sg-vcc, sg-unit-trust | Section 13O/13U Election | select (None/13O/13U) | `''` |
| sg-pte-ltd, sg-public-co | Partial Tax Exemption | boolean | `false` |
| sg-vcc | VCC Sub-Fund Structure | boolean | `false` |
| All SG | Tax Residency | select (SG Resident / Non-Resident) | `''` |

### LU Entity Fields

#### Registration Fields (PROP-05)
| Entity Types | Field | Type | Validation | Default |
|-------------|-------|------|------------|---------|
| All LU (except individual) | RCS Number | text | `/^[A-Z]\s?\d{1,6}$/` | `''` |
| lu-sicav, lu-sicar, lu-sif | CSSF Approval Number | text | None (variable format) | `''` |
| lu-individual | Tax ID (Matricule) | text (13 digits) | `/^\d{13}$/` | `''` |

#### Tax Status Fields (PROP-05)
| Entity Types | Field | Type | Default |
|-------------|-------|------|---------|
| lu-soparfi | SOPARFI Flag | boolean (always true for this type) | `true` |
| lu-soparfi, lu-sarl, lu-sa | Participation Exemption | boolean | `false` |
| lu-sicav, lu-sif | Subscription Tax Rate | number (%) | `undefined` |
| lu-sarl, lu-sa | IP Box Election | boolean | `false` |
| All LU | Tax Residency | select (LU Resident / Non-Resident) | `''` |

## TaxEntityData Interface Expansion

### Current Registration Interface (AU-only)
```typescript
// Source: verified from src/models/graph.ts lines 30-38
registration: {
  abn?: string;
  acn?: string;
  tfn?: string;
  trustDeedDate?: string;
  partnershipAgreementDate?: string;
  registeredWithInnovationAustralia?: boolean;
  registeredWithAPRA?: boolean;
};
```

### Expanded Registration Interface (All Jurisdictions)
```typescript
registration: {
  // AU fields (existing)
  abn?: string;
  acn?: string;
  tfn?: string;
  trustDeedDate?: string;
  partnershipAgreementDate?: string;
  registeredWithInnovationAustralia?: boolean;
  registeredWithAPRA?: boolean;
  // UK fields
  companyNumber?: string;
  utr?: string;
  nino?: string;
  lpNumber?: string;
  hmrcReference?: string;
  // US fields
  ein?: string;
  ssn?: string;
  stateOfFormation?: string;
  // HK fields
  crNumber?: string;
  brn?: string;
  hkid?: string;
  // SG fields
  uen?: string;
  nric?: string;
  // LU fields
  rcsNumber?: string;
  cssfApprovalNumber?: string;
  nationalId?: string;
};
```

### Current TaxStatus Interface (AU-only)
```typescript
// Source: verified from src/models/graph.ts lines 41-47
taxStatus: {
  baseRateEntity?: boolean;
  mitElection?: boolean;
  amitElection?: boolean;
  taxResidency?: string;
  taxRate?: number;
};
```

### Expanded TaxStatus Interface (All Jurisdictions)
```typescript
taxStatus: {
  // Shared / AU fields (existing)
  baseRateEntity?: boolean;
  mitElection?: boolean;
  amitElection?: boolean;
  taxResidency?: string;
  taxRate?: number;
  // UK fields
  corporationTaxRate?: number;
  smallProfitsRate?: boolean;
  ihtRelevant?: boolean;
  // US fields
  checkTheBoxElection?: string;  // 'disregarded' | 'partnership' | 'corporation' | ''
  sCorpElection?: boolean;
  federalTaxRate?: number;
  // HK fields
  twoTierProfitsTax?: boolean;
  // SG fields
  section13Election?: string;    // '' | '13O' | '13U'
  partialTaxExemption?: boolean;
  vccSubFundStructure?: boolean;
  // LU fields
  soparfiFlag?: boolean;
  participationExemption?: boolean;
  subscriptionTaxRate?: number;
  ipBoxElection?: boolean;
};
```

## Graph Validator Refactoring

### Current State (AU-only hardcoded Sets)
```typescript
// Source: verified from src/lib/validation/graph-validator.ts lines 27-41
const TRUST_TYPES = new Set([
  'au-unit-trust', 'au-discretionary-trust', 'au-hybrid-trust', 'au-mit', 'au-smsf',
]);
const PARTNERSHIP_TYPES = new Set([
  'au-general-partnership', 'au-limited-partnership', 'au-vclp', 'au-esvclp',
]);
```

### Required Expansion
```typescript
const TRUST_TYPES = new Set([
  // AU
  'au-unit-trust', 'au-discretionary-trust', 'au-hybrid-trust', 'au-mit', 'au-smsf',
  // UK
  'uk-unit-trust', 'uk-discretionary-trust',
  // US
  'us-grantor-trust', 'us-non-grantor-trust',
  // SG
  'sg-unit-trust',
]);

const PARTNERSHIP_TYPES = new Set([
  // AU
  'au-general-partnership', 'au-limited-partnership', 'au-vclp', 'au-esvclp',
  // UK
  'uk-llp', 'uk-lp', 'uk-gp',
  // US
  'us-llc-partnership', 'us-gp', 'us-lp', 'us-lllp',
  // HK
  'hk-lp',
  // SG
  'sg-lp', 'sg-llp',
  // LU
  'lu-scsp', 'lu-scs',
]);
```

This is noted as a pitfall in the prior decisions ("Graph validator hardcodes AU entity ID Sets -- must refactor before adding jurisdiction rules").

## IdentitySection Jurisdiction Display Fix

The current code at line 173 hardcodes:
```typescript
{formData.jurisdiction === 'AU' ? 'Australia' : formData.jurisdiction}
```

This should be replaced with:
```typescript
import { JURISDICTIONS, type Jurisdiction } from '@/models/jurisdiction';
// ...
{JURISDICTIONS[formData.jurisdiction as Jurisdiction]?.name ?? formData.jurisdiction}
```

This displays "United Kingdom", "United States", "Hong Kong", etc. instead of raw codes.

## Common Pitfalls

### Pitfall 1: RegistrationSection Dispatches on Category, Not Jurisdiction
**What goes wrong:** The current `switch (category)` in RegistrationSection renders AU-specific fields for ALL companies, regardless of jurisdiction. A UK Ltd company shows ABN and ACN fields instead of Company Number and UTR.
**Why it happens:** The AU-only implementation dispatched on category because all entities were AU. Category was a sufficient discriminator.
**How to avoid:** Refactor to dispatch on `jurisdiction` first (from `getEntityConfig(entityType)?.jurisdiction`), then on `category` within each jurisdiction. Keep the existing AU switch cases as the `case 'AU':` block. Add UK/US/HK/SG/LU blocks.
**Warning signs:** Non-AU entities show ABN/ACN/TFN fields in the registration section.

### Pitfall 2: Empty String Regex Validation Failure
**What goes wrong:** A user clears a registration field (making it empty string ''), and the regex validator rejects it because '' doesn't match the pattern (e.g., `/^\d{10}$/` does not match empty string).
**Why it happens:** Zod `.regex()` is called on every value including empty strings. The existing AU schemas handle this with `.optional().or(z.literal(''))`.
**How to avoid:** ALWAYS chain `.optional().or(z.literal(''))` after `.regex()` for registration fields. This is the established pattern in the codebase (see `abnField` in entity-schemas.ts). Copy it exactly.
**Warning signs:** Users cannot clear registration fields without triggering validation errors.

### Pitfall 3: TaxStatus Tax Residency Dropdown Hardcodes AU Options
**What goes wrong:** The tax residency `<select>` in TaxStatusSection currently shows only "Australian Resident" and "Foreign Resident" for ALL entities, regardless of jurisdiction.
**Why it happens:** The dropdown was built for AU-only. The options are hardcoded at lines 57-59.
**How to avoid:** Make the tax residency options jurisdiction-aware. UK: "UK Resident" / "Non-Resident". US: "US Resident" / "Non-Resident Alien". Each jurisdiction has its own terminology.
**Warning signs:** UK entity showing "Australian Resident" in the tax residency dropdown.

### Pitfall 4: ErrorSummary Label Map Missing New Fields
**What goes wrong:** Validation errors for new fields like `registration.companyNumber` show as "companyNumber" (the raw field name) instead of "Company Number" (human-readable).
**Why it happens:** The `pathToLabel` function in ErrorSummary.tsx has a hardcoded `labelMap` that only contains AU field paths.
**How to avoid:** Expand the `labelMap` with entries for ALL new field paths: `'registration.companyNumber': 'Company Number'`, `'registration.ein': 'EIN'`, `'registration.uen': 'UEN'`, etc.
**Warning signs:** Error summary shows camelCase field names instead of human-readable labels.

### Pitfall 5: Schema Map Incomplete -- Falls Back to Base Schema
**What goes wrong:** A non-AU entity type is not added to the `schemaMap` in entity-schemas.ts. The `getEntitySchema()` function returns `baseEntitySchema` (which has no registration/taxStatus validation). All field values pass without format checking.
**Why it happens:** The schemaMap is a manual mapping. Every entity type ID must be explicitly added.
**How to avoid:** Ensure EVERY entity type ID from the entity registry has a corresponding entry in `schemaMap`. Group related types that share the same schema (e.g., `uk-ltd` and `uk-plc` can share `ukCompanySchema`). After implementation, verify: `Object.keys(ENTITY_REGISTRY).every(id => schemaMap[id])`.
**Warning signs:** Registration number with invalid format shows no error. Test by entering "ABC" in an EIN field -- should show "EIN must be XX-XXXXXXX format".

### Pitfall 6: US State of Formation Needs 50+ Options
**What goes wrong:** The US State of Formation dropdown needs to list all 50 states plus DC and territories. Hardcoding 50+ `<option>` elements inline is messy.
**Why it happens:** Only US entities need a state dropdown. No other jurisdiction has this requirement.
**How to avoid:** Create a `US_STATES` constant array (e.g., `[{ code: 'AL', name: 'Alabama' }, ...]`) in constants.ts or a new file. Render the dropdown from the array. Include DC and common territories (PR, VI, GU).
**Warning signs:** State dropdown is missing states, or the JSX becomes unreadable with 50 inline options.

### Pitfall 7: Entity DefaultData Keys Must Match Schema Field Paths
**What goes wrong:** The entity registry's `defaultData` uses key names like `companyNumber`, but the schema expects `registration.companyNumber`. The `PropertiesPanel` initializes `formData.registration` from node data. If the entity is created with `defaultData: { companyNumber: '' }` at the top level (not nested under `registration`), the field won't populate.
**Why it happens:** The `defaultData` in entity-registry.ts is spread directly into node.data. The PropertiesPanel reads `formData.registration.companyNumber`. These must align.
**How to avoid:** Verify that entity creation paths (Canvas.tsx onDrop, MobilePalette.tsx handleSelect) correctly nest defaultData fields under `registration` and `taxStatus` objects. If they don't, either fix the creation path or restructure defaultData to match the expected nesting.
**Warning signs:** New entity shows empty registration fields despite defaultData having values.

### Pitfall 8: graph.ts Interface Changes Break TypeScript Across Codebase
**What goes wrong:** Adding 20+ new optional fields to `TaxEntityData.registration` and `TaxEntityData.taxStatus` interfaces causes TypeScript errors in files that destructure or directly access these objects with specific field assumptions.
**Why it happens:** TypeScript strict mode flags type mismatches.
**How to avoid:** All new fields MUST be optional (`?`). No code currently destructures the registration/taxStatus objects into specific fields -- they are always accessed as `registration.abn`, `taxStatus.baseRateEntity`, etc. via dynamic property access. Verify with `npx tsc --noEmit` after changes.
**Warning signs:** TypeScript compilation errors in files that import from `@/models/graph`.

## Code Examples

### Example 1: UK Company Zod Schema
```typescript
// Source: extending src/lib/validation/entity-schemas.ts
const ukCompanyNumberField = z.string()
  .regex(/^[A-Z0-9]{8}$/i, 'Company Number must be 8 alphanumeric characters')
  .optional()
  .or(z.literal(''));

const utrField = z.string()
  .regex(/^\d{10}$/, 'UTR must be 10 digits')
  .optional()
  .or(z.literal(''));

const ukCompanySchema = baseEntitySchema.extend({
  entityType: z.enum(['uk-ltd', 'uk-plc']),
  registration: z.object({
    companyNumber: ukCompanyNumberField,
    utr: utrField,
  }).optional().default({}),
  taxStatus: z.object({
    corporationTaxRate: z.number().min(0).max(1).optional(),
    smallProfitsRate: z.boolean().optional(),
    taxResidency: z.string().optional(),
  }).optional().default({}),
});
```

### Example 2: US EIN Validation Schema
```typescript
const einField = z.string()
  .regex(/^\d{2}-\d{7}$/, 'EIN must be in XX-XXXXXXX format')
  .optional()
  .or(z.literal(''));

const ssnField = z.string()
  .regex(/^\d{3}-\d{2}-\d{4}$/, 'SSN must be in XXX-XX-XXXX format')
  .optional()
  .or(z.literal(''));

const usCompanySchema = baseEntitySchema.extend({
  entityType: z.enum(['us-c-corp', 'us-s-corp', 'us-501c3']),
  registration: z.object({
    ein: einField,
    stateOfFormation: z.string().optional().or(z.literal('')),
  }).optional().default({}),
  taxStatus: z.object({
    sCorpElection: z.boolean().optional(),
    federalTaxRate: z.number().min(0).max(1).optional(),
    taxResidency: z.string().optional(),
  }).optional().default({}),
});
```

### Example 3: SG UEN Validation Schema
```typescript
const uenField = z.string()
  .regex(/^[A-Z0-9]{9,10}$/i, 'UEN must be 9-10 alphanumeric characters')
  .optional()
  .or(z.literal(''));

const nricField = z.string()
  .regex(/^[STFGM]\d{7}[A-Z]$/i, 'NRIC/FIN must be letter + 7 digits + letter')
  .optional()
  .or(z.literal(''));
```

### Example 4: Jurisdiction-Aware Tax Residency Rendering
```typescript
// Source: refactoring src/components/properties/TaxStatusSection.tsx
const renderTaxResidency = (jurisdiction: string) => {
  const options: { value: string; label: string }[] = (() => {
    switch (jurisdiction) {
      case 'AU': return [
        { value: 'AU', label: 'Australian Resident' },
        { value: 'Foreign', label: 'Foreign Resident' },
      ];
      case 'UK': return [
        { value: 'UK', label: 'UK Resident' },
        { value: 'Non-Resident', label: 'Non-Resident' },
      ];
      case 'US': return [
        { value: 'US', label: 'US Resident' },
        { value: 'NRA', label: 'Non-Resident Alien' },
      ];
      case 'HK': return [
        { value: 'HK', label: 'HK Resident' },
        { value: 'Non-Resident', label: 'Non-Resident' },
      ];
      case 'SG': return [
        { value: 'SG', label: 'SG Resident' },
        { value: 'Non-Resident', label: 'Non-Resident' },
      ];
      case 'LU': return [
        { value: 'LU', label: 'LU Resident' },
        { value: 'Non-Resident', label: 'Non-Resident' },
      ];
      default: return [];
    }
  })();

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">Tax Residency</label>
      <select
        value={taxStatus.taxResidency ?? ''}
        onChange={(e) => updateTaxStatus('taxResidency', e.target.value)}
        className={`w-full px-3 py-1.5 text-sm border rounded-md ...`}
      >
        <option value="">Select...</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
};
```

### Example 5: Expanded ErrorSummary Label Map
```typescript
// Source: extending src/components/properties/ErrorSummary.tsx pathToLabel()
const labelMap: Record<string, string> = {
  // Existing AU fields
  name: 'Name',
  jurisdiction: 'Jurisdiction',
  notes: 'Notes',
  'registration.abn': 'ABN',
  'registration.acn': 'ACN',
  'registration.tfn': 'TFN',
  'registration.trustDeedDate': 'Trust Deed Date',
  'registration.partnershipAgreementDate': 'Partnership Agreement Date',
  'registration.registeredWithInnovationAustralia': 'Innovation Australia Registration',
  'registration.registeredWithAPRA': 'APRA Registration',
  'taxStatus.baseRateEntity': 'Base Rate Entity',
  'taxStatus.taxRate': 'Tax Rate',
  'taxStatus.taxResidency': 'Tax Residency',
  'taxStatus.mitElection': 'MIT Election',
  'taxStatus.amitElection': 'AMIT Election',
  // UK fields
  'registration.companyNumber': 'Company Number',
  'registration.utr': 'UTR',
  'registration.nino': 'NINO',
  'registration.lpNumber': 'LP Number',
  'registration.hmrcReference': 'HMRC Reference',
  'taxStatus.corporationTaxRate': 'Corporation Tax Rate',
  'taxStatus.smallProfitsRate': 'Small Profits Rate',
  'taxStatus.ihtRelevant': 'IHT Relevant',
  // US fields
  'registration.ein': 'EIN',
  'registration.ssn': 'SSN/ITIN',
  'registration.stateOfFormation': 'State of Formation',
  'taxStatus.checkTheBoxElection': 'Check-the-Box Election',
  'taxStatus.sCorpElection': 'S Corp Election',
  'taxStatus.federalTaxRate': 'Federal Tax Rate',
  // HK fields
  'registration.crNumber': 'CR Number',
  'registration.brn': 'Business Registration Number',
  'registration.hkid': 'HKID',
  'taxStatus.twoTierProfitsTax': 'Two-Tier Profits Tax',
  // SG fields
  'registration.uen': 'UEN',
  'registration.nric': 'NRIC/FIN',
  'taxStatus.section13Election': 'Section 13O/13U Election',
  'taxStatus.partialTaxExemption': 'Partial Tax Exemption',
  'taxStatus.vccSubFundStructure': 'VCC Sub-Fund Structure',
  // LU fields
  'registration.rcsNumber': 'RCS Number',
  'registration.cssfApprovalNumber': 'CSSF Approval Number',
  'registration.nationalId': 'Tax ID (Matricule)',
  'taxStatus.soparfiFlag': 'SOPARFI',
  'taxStatus.participationExemption': 'Participation Exemption',
  'taxStatus.subscriptionTaxRate': 'Subscription Tax Rate',
  'taxStatus.ipBoxElection': 'IP Box Election',
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Category-based field dispatch | Jurisdiction + category dispatch | Phase 19 | RegistrationSection and TaxStatusSection show correct fields per jurisdiction |
| AU-only Zod schemas | Per-jurisdiction schemas with regex validators | Phase 19 | Registration numbers validated with correct format patterns |
| Hardcoded AU-only registration interface | Expanded multi-jurisdiction registration interface | Phase 19 | All jurisdiction fields are TypeScript-typed |
| AU-only tax residency options | Jurisdiction-aware tax residency dropdowns | Phase 19 | Correct terminology per jurisdiction |
| Hardcoded 'Australia' in Identity section | JURISDICTIONS registry lookup | Phase 19 | Proper country name for all jurisdictions |

**Deprecated/outdated after this phase:**
- `switch (category)` as sole dispatch in Registration/TaxStatusSection -- replaced with `switch (jurisdiction)` outer dispatch
- Hardcoded `'Australian Resident'` / `'Foreign Resident'` in tax residency dropdown -- replaced with jurisdiction-aware options
- `formData.jurisdiction === 'AU' ? 'Australia' : formData.jurisdiction` in IdentitySection -- replaced with JURISDICTIONS lookup

## Open Questions

1. **Should defaultData in entity-registry.ts be restructured to nest under registration/taxStatus?**
   - What we know: Currently `defaultData` has flat keys like `{ companyNumber: '', utr: '' }`. But the PropertiesPanel reads `formData.registration.companyNumber`. The entity creation path in Canvas.tsx spreads defaultData into the node data.
   - What's unclear: Whether the creation path already nests these, or whether defaultData needs restructuring.
   - Recommendation: Investigate the exact entity creation code in Canvas.tsx and MobilePalette.tsx during planning. If defaultData is spread flat, either restructure defaultData to `{ registration: { companyNumber: '' }, taxStatus: {} }` or add nesting logic in the creation path.

2. **LU RCS number format: exact regex**
   - What we know: RCS numbers are prefixed with a letter (B for commercial companies) followed by a numeric identifier. Examples include "B 210660", "B 167704". The length varies.
   - What's unclear: Whether there is a strict upper bound on the numeric portion. Examples range from 1 to 6 digits.
   - Recommendation: Use a permissive regex `/^[A-Z]\s?\d{1,6}$/` that accepts 1-6 digits after the letter prefix. This covers all observed formats while rejecting clearly invalid input.

3. **CSSF Approval Number format**
   - What we know: CSSF identifiers use a letter prefix + 8 digits (e.g., "B00000001" for banks). Fund identifiers may differ.
   - What's unclear: Exact format for fund-specific CSSF approval numbers.
   - Recommendation: Use no regex validation for CSSF Approval Number. Accept any non-empty string. Flag as LOW confidence for future refinement if a Luxembourg fund practitioner provides the exact format.

4. **Should we validate check digits (HKID, SG NRIC, LU Matricule)?**
   - What we know: Some registration numbers have check digit algorithms (HKID mod-11, LU Matricule Luhn+Verhoeff). Implementing these adds accuracy but complexity.
   - What's unclear: Whether a visualization/structuring tool needs check digit validation.
   - Recommendation: Do NOT implement check digit validation. Format validation (correct number of characters, correct character types) is sufficient for a structuring tool. Check digit validation belongs in filing/compliance software, not canvas diagramming.

## Sources

### Primary (HIGH confidence)
- **Direct codebase analysis** -- All source files read and verified:
  - `src/models/graph.ts` -- TaxEntityData interface with registration and taxStatus typed objects
  - `src/models/entities.ts` -- EntityTypeConfig, EntityCategory, EntityShape types
  - `src/models/jurisdiction.ts` -- Jurisdiction type union (6 codes), JURISDICTIONS registry
  - `src/lib/entity-registry.ts` -- 54 entity type entries with defaultData fields per entity
  - `src/lib/validation/entity-schemas.ts` -- 11 AU Zod schemas with `.regex()`, `.optional().or(z.literal(''))` patterns, schemaMap keyed by entity type ID
  - `src/lib/validation/graph-validator.ts` -- TRUST_TYPES and PARTNERSHIP_TYPES hardcoded AU Sets
  - `src/lib/validation/graph-snapshot-schema.ts` -- Uses `.passthrough()`, `z.record(z.string(), z.unknown())` for registration/taxStatus
  - `src/components/properties/PropertiesPanel.tsx` -- Local form state, debounced auto-save (400ms), getEntitySchema validation
  - `src/components/properties/RegistrationSection.tsx` -- `switch (category)` dispatch, AU-only fields
  - `src/components/properties/TaxStatusSection.tsx` -- `switch (category)` dispatch, AU-only fields, hardcoded AU tax residency
  - `src/components/properties/IdentitySection.tsx` -- Hardcoded 'Australia' display for jurisdiction
  - `src/components/properties/ErrorSummary.tsx` -- Hardcoded labelMap for AU-only field paths
  - `src/components/properties/EntityPreview.tsx` -- No changes needed
  - `src/components/properties/NotesSection.tsx` -- No changes needed
  - `src/components/mobile/MobilePropertiesSheet.tsx` -- Wrapper, changes flow through automatically
  - `src/stores/graph-store.ts` -- updateNodeData uses Object.assign for flexible data merging
  - `src/lib/constants.ts` -- COLORS already has fund/holding/pension from Phase 17
- **Phase 17 research** -- `.planning/phases/17-data-model-entity-registry/17-RESEARCH.md` -- Entity registry design, defaultData patterns
- **Phase 18 research** -- `.planning/phases/18-jurisdiction-palette/18-RESEARCH.md` -- Jurisdiction tab bar, palette state management

### Secondary (MEDIUM confidence)
- **UK Company Number format** -- [Companies House Developer Forum](https://forum.companieshouse.gov.uk/t/company-number-format/3097), [1st Formations](https://www.1stformations.co.uk/blog/where-do-i-find-my-company-registration-number/) -- 8 alphanumeric characters confirmed
- **UK UTR format** -- [HMRC Design Patterns](https://design.tax.service.gov.uk/hmrc-design-patterns/unique-taxpayer-reference/) -- 10 digits confirmed
- **UK NINO format** -- [GOV.UK HMRC Manual NIM39110](https://www.gov.uk/hmrc-internal-manuals/national-insurance-manual/nim39110) -- 2 letters + 6 digits + suffix letter, with exclusion rules
- **US EIN format** -- [IRS Publication 1635](https://www.irs.gov/pub/irs-pdf/p1635.pdf), [RegexPattern.com](https://regexpattern.com/employer-identification-number/) -- XX-XXXXXXX confirmed
- **US SSN/ITIN format** -- [IRS/SSA](https://www.justworks.com/blog/itin-ssn-or-ein-whats-the-difference), [Wikipedia ITIN](https://en.wikipedia.org/wiki/Individual_Taxpayer_Identification_Number) -- XXX-XX-XXXX confirmed
- **HK CR/BRN format** -- [HK Financial Services Bureau](https://www.fstb.gov.hk/en/blog/blog021223.htm), [Air Corporate](https://air-corporate.com/blog/hong-kong-business-registration-number-and-company-registration-number/) -- 8-digit BRN confirmed
- **HK HKID format** -- [Wikipedia HKID](https://en.wikipedia.org/wiki/Hong_Kong_identity_card) -- letter(s) + 6 digits + check digit confirmed
- **SG UEN format** -- [ACRA/Osome guide](https://osome.com/sg/guides/uen-singapore/), [GitHub validation](https://gist.github.com/mervintankw/90d5660c6ab03a83ddf77fa8199a0e52) -- 9-10 alphanumeric confirmed
- **SG NRIC/FIN format** -- [Wikipedia NRIC](https://en.wikipedia.org/wiki/National_Registration_Identity_Card), [ICA press release](https://www.ica.gov.sg/news-and-publications/newsroom/media-release/new-m-fin-series-to-be-introduced-from-1-january-2022) -- prefix letter + 7 digits + check letter confirmed
- **LU RCS format** -- [LBR](https://www.lbr.lu/), [Guichet.lu](https://guichet.public.lu/en/entreprises/creation-developpement/constitution/entreprise-individuelle/immatriculation-entreprise-publication-rcs.html) -- Letter prefix + digits confirmed, variable length
- **LU Matricule format** -- [OECD TIN Guide](https://www.oecd.org/content/dam/oecd/en/topics/policy-issue-focus/aeoi/luxembourg-tin.pdf) -- 13 digits confirmed

### Tertiary (LOW confidence -- verify before use)
- **CSSF Approval Number exact format** -- Could not find official documentation specifying the exact alphanumeric format for fund-specific CSSF approval numbers. Recommend no regex validation.
- **Tax status field correctness** -- Corporation tax rates, trust rates, S Corp election rules, Section 13O/13U criteria, participation exemption rules, subscription tax rates are from training data. Practitioner review needed before presenting as authoritative in a professional tool.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, verified from package.json
- Architecture patterns: HIGH -- all patterns verified from direct source analysis; dispatch-on-jurisdiction is a straightforward refactor of the existing switch pattern
- Registration number formats: MEDIUM-HIGH -- verified against official government/registrar sources for all 6 jurisdictions. Regexes are intentionally permissive (format validation, not check-digit validation)
- Tax status fields: MEDIUM -- field names and types based on domain knowledge. Exact field labels and options may need practitioner review
- Pitfalls: HIGH -- all 8 pitfalls identified from actual code patterns with specific file references

**Research date:** 2026-03-07
**Valid until:** 2026-04-07 (stable -- pure data/schema expansion with no dependency on fast-moving libraries)
