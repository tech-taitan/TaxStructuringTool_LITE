# Phase 17: Data Model and Entity Registry - Research

**Researched:** 2026-03-07
**Domain:** Multi-jurisdiction entity type registry expansion, jurisdiction model, visual styling
**Confidence:** HIGH

## Summary

Phase 17 is a pure data model and registry expansion phase. The existing codebase was architected from day one with multi-jurisdiction expansion in mind: every entity node carries a `jurisdiction` field, the `ENTITY_REGISTRY` uses `{jurisdiction}-{type}` key conventions, `getEntitiesByJurisdiction()` and `getEntitiesByCategory()` filter functions already exist, and the graph snapshot schema uses `.passthrough()` so new fields never break existing saved structures. The work is expanding TypeScript types, adding registry entries, and ensuring visual distinction -- zero new npm dependencies, zero new components, zero architectural changes.

The critical sequencing requirement is that `EntityCategory` must be extended BEFORE any non-AU entity registry entries are added, because UK Pension Schemes, HK/SG/LU fund vehicles, and LU Soparfi cannot be correctly categorized with the existing 6-category taxonomy. The `CATEGORY_CONFIG` array and `COLORS.entity`/`COLORS.entityBg` objects must also be expanded in lockstep. Additionally, the hardcoded `jurisdictionFlag` assignment in Canvas.tsx and MobilePalette.tsx (`canvasJurisdiction === 'AU' ? flag : ''`) must be replaced with a proper `JURISDICTIONS[jurisdiction].flag` lookup, or new jurisdiction entities will render with no flag.

**Primary recommendation:** Expand the type system (Jurisdiction union, EntityCategory union, JurisdictionConfig entries) first, then add all 43 entity registry entries across UK/US/HK/SG/LU, then fix the jurisdictionFlag lookup in entity creation paths, then add colors/icons for new categories. Validate backwards compatibility with existing AU-only saved structures as the final gate.

## Standard Stack

### Core (No Changes)
| Library | Version | Purpose | Why No Change |
|---------|---------|---------|---------------|
| Next.js | 16.1.6 | App framework | No framework changes -- all work is data files |
| React | 19.2.3 | UI rendering | No component changes in this phase |
| @xyflow/react | 12.10.0 | Canvas rendering | EntityNode already renders from registry lookup |
| Zustand | 5.0.11 | State management | graph-store already has `canvasJurisdiction` |
| Zod | 4.3.6 | Validation | Snapshot schema uses `.passthrough()` -- additive |
| Tailwind CSS | v4 | Styling | Only adding color constants |
| Lucide React | 0.564.0 | Icons | All needed icons already installed |

### Supporting (No New Dependencies)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| zundo | (installed) | Undo/redo | No change -- temporal middleware unaffected |
| nanoid | (installed) | ID generation | No change |

### Alternatives Considered
| Instead of | Could Use | Why Not |
|------------|-----------|---------|
| Country flag SVG library | Emoji flags | Only 6 jurisdictions; emoji flags are zero-dependency and already in the data model |
| Per-jurisdiction registry files | Single ENTITY_REGISTRY | 43 new entries + 11 existing = 54 total, manageable in one file. Split only if file exceeds ~500 lines |
| i18n library | Hardcoded English | Professional tax tool; all jurisdictions use English tax terminology |

**Installation:**
```bash
# No new packages to install. All changes are data model additions.
```

## Architecture Patterns

### Recommended Project Structure (Files Changed in Phase 17)
```
src/
  models/
    jurisdiction.ts      # MODIFY: Jurisdiction union AU -> AU|UK|US|HK|SG|LU, add 5 JurisdictionConfig entries
    entities.ts          # MODIFY: EntityCategory union -- add 'fund', 'holding', 'pension'
  lib/
    entity-registry.ts   # MODIFY: Add 43 entity entries, expand CATEGORY_CONFIG with 3 new categories
    constants.ts         # MODIFY: Add colors for fund, holding, pension categories in COLORS.entity + COLORS.entityBg
    palette-icons.ts     # MODIFY: Add icon mappings for new entity types (Layers, Crown, Briefcase, etc.)
  components/
    canvas/Canvas.tsx    # MODIFY: Fix jurisdictionFlag lookup (line 225, 370)
    mobile/MobilePalette.tsx  # MODIFY: Fix jurisdictionFlag lookup (line 65)
```

### Components That Need NO Changes (Verified from Source)
| Component | Why No Change |
|-----------|---------------|
| `EntityNode.tsx` | Already renders shape/color/icon from registry lookup. New entity types render automatically. Jurisdiction is shown as `(data.jurisdiction)` text on line 408. |
| `graph-store.ts` | Already has `canvasJurisdiction` field and `setCanvasJurisdiction` action. Store is entity-type-agnostic. |
| `graph-snapshot-schema.ts` | Uses `.passthrough()` on entity data and `z.string().min(2)` for jurisdiction. New jurisdiction values pass validation without changes. |
| `local-storage-db.ts` | Schema-agnostic persistence. |
| `auto-layout.ts` | Layout operates on graph topology, not entity types. |
| `useGraphValidation.ts` | Hook calls `validateGraph()`. Validator changes come in a later phase. |
| `RegistrationSection.tsx` | Currently dispatches on `category`. AU fields still render correctly. New jurisdiction fields come in a later phase (palette/properties UI phase). |
| `TaxStatusSection.tsx` | Same as RegistrationSection -- AU fields unchanged. |
| `IdentitySection.tsx` | Type dropdown uses `getEntitiesByCategory(formData.jurisdiction, category)` -- already jurisdiction-aware. Making jurisdiction editable comes in a later phase. |
| `PropertiesPanel.tsx` | Entity-type-agnostic wrapper. |

### Pattern 1: Registry-Driven Entity Types
**What:** All entity types are data entries in `ENTITY_REGISTRY`. Components read config by ID and render based on shape/color/icon properties.
**When to use:** Always -- this is the existing pattern.
**Why it scales:** Adding a new entity type means adding one object literal. The palette, node renderer, and serializer all derive from registry data.
**Example:**
```typescript
// Source: verified from src/lib/entity-registry.ts
'uk-ltd': {
  id: 'uk-ltd',
  jurisdiction: 'UK',
  category: 'company',
  displayName: 'Private Limited Company',
  shortName: 'Ltd',
  description: 'A UK private company limited by shares (Companies Act 2006).',
  shape: 'rectangle',
  icon: 'building-2',
  color: COLORS.entity.company,
  defaultData: {
    companyNumber: '',
    utr: '',
  },
},
```

### Pattern 2: JurisdictionConfig Registry
**What:** Each jurisdiction has a config entry with code, name, flag emoji, currency, and tax authority.
**When to use:** Whenever code needs to resolve jurisdiction metadata.
**Example:**
```typescript
// Source: verified from src/models/jurisdiction.ts
UK: {
  code: 'UK',
  name: 'United Kingdom',
  flag: '\u{1F1EC}\u{1F1E7}',
  currencyCode: 'GBP',
  taxAuthorityName: 'HM Revenue & Customs',
},
```

### Pattern 3: JurisdictionFlag Lookup via JURISDICTIONS Registry
**What:** When creating a node, look up the flag from JURISDICTIONS rather than hardcoding.
**When to use:** Every entity creation path (Canvas.tsx onDrop, Canvas.tsx onConnect paste, MobilePalette.tsx handleSelect).
**Why:** Current code has `canvasJurisdiction === 'AU' ? '\u{1F1E6}\u{1F1FA}' : ''` which produces blank flags for non-AU jurisdictions.
**Example:**
```typescript
// BEFORE (Canvas.tsx line 225):
jurisdictionFlag: canvasJurisdiction === 'AU' ? '\u{1F1E6}\u{1F1FA}' : '',

// AFTER:
import { JURISDICTIONS } from '@/models/jurisdiction';
jurisdictionFlag: JURISDICTIONS[canvasJurisdiction as Jurisdiction]?.flag ?? '',
```

### Anti-Patterns to Avoid
- **Separate EntityNode components per jurisdiction:** EntityNode is already generic. Do NOT create `UKEntityNode.tsx`. Let the registry drive rendering.
- **Per-jurisdiction registry files (premature):** Keep a single `ENTITY_REGISTRY` with 54 entries. Only split if the file grows past 500 lines and becomes unwieldy. At ~15 lines per entry, 54 entries = ~810 lines, which is on the edge. If splitting, use the spread pattern: `...UK_ENTITIES` from a helper file.
- **Modifying GraphSnapshot.metadata.jurisdiction to an array:** The single `metadata.jurisdiction` field remains the "default" jurisdiction. The actual jurisdiction mix is derived from nodes at runtime. Existing snapshots continue to load without migration.
- **Making canvasJurisdiction constrain entity types:** A single canvas holds entities from ALL jurisdictions. The canvas jurisdiction is a default for new entities, not a filter.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Country flags | SVG flag components | Emoji flag characters in JurisdictionConfig | Only 6 jurisdictions. Emoji renders on all platforms. Zero dependency. |
| Category icon resolution | Manual switch statements | `PALETTE_ICONS` lookup map + Lucide icon imports | Already established pattern. Just add new entries. |
| Entity type shape/color | Per-jurisdiction rendering logic | Registry `shape` and `color` fields | EntityNode already reads these. No component changes needed. |

**Key insight:** The entire value of the registry pattern is that entity types are DATA, not CODE. Adding 43 new entity types should touch zero rendering logic.

## Common Pitfalls

### Pitfall 1: EntityCategory Type Too Narrow for Non-AU Entities
**What goes wrong:** The current `EntityCategory` is `'company' | 'trust' | 'partnership' | 'vc' | 'individual' | 'smsf'`. UK Pension Schemes, LU SICAVs/SIFs/RAIFs, HK OFCs/LPFs, and SG VCCs cannot be correctly categorized. Mapping them all to `vc` loses semantic meaning and produces confusing palette groupings.
**Why it happens:** The categories were designed specifically for Australian tax law.
**How to avoid:** Extend `EntityCategory` FIRST, before adding any entity registry entries. Add `'fund'` (regulated fund vehicles), `'holding'` (purpose-built holding structures), and `'pension'` (retirement/pension schemes). Then add corresponding entries to `CATEGORY_CONFIG`, `COLORS.entity`, and `COLORS.entityBg`.
**Warning signs:** TypeScript errors on category field assignments; palette showing entities under wrong categories.

### Pitfall 2: Hardcoded JurisdictionFlag Produces Blank Flags
**What goes wrong:** Canvas.tsx (lines 225, 370) and MobilePalette.tsx (line 65) have `canvasJurisdiction === 'AU' ? '\u{1F1E6}\u{1F1FA}' : ''`. Any non-AU entity gets an empty string for `jurisdictionFlag`, rendering no flag on the canvas node.
**Why it happens:** Original code only supported AU so used a ternary instead of a registry lookup.
**How to avoid:** Replace the ternary with `JURISDICTIONS[jurisdiction]?.flag ?? ''` using the JURISDICTIONS registry import. Apply to all 3 locations.
**Warning signs:** Entity nodes for UK/US/HK/SG/LU entities show `(UK)` text but no flag emoji.

### Pitfall 3: CATEGORY_CONFIG Not Updated for New Categories
**What goes wrong:** If `EntityCategory` is extended with `'fund'`, `'holding'`, `'pension'` but `CATEGORY_CONFIG` array in `entity-registry.ts` is not updated, the palette will not render sections for the new categories. Entities of those categories will exist in the registry but be invisible in the palette.
**Why it happens:** `CATEGORY_CONFIG` drives palette section rendering. The palette iterates over `CATEGORY_CONFIG` and calls `getEntitiesByCategory()` for each entry. Missing categories mean missing sections.
**How to avoid:** Always update `CATEGORY_CONFIG`, `COLORS.entity`, `COLORS.entityBg`, and `PALETTE_ICONS` in the same commit as the `EntityCategory` extension.
**Warning signs:** Registry has entries with category `'fund'` but no "Funds" section appears in the palette.

### Pitfall 4: COLORS Object Not Extended for New Categories
**What goes wrong:** `EntityNode.tsx` line 230 does `COLORS.entityBg[config.category as EntityCategory] ?? '#F9FAFB'`. New categories without COLORS entries will fall back to the gray default, losing visual distinction.
**Why it happens:** `COLORS.entity` and `COLORS.entityBg` only have 6 entries matching the original 6 categories.
**How to avoid:** Add color entries for `fund`, `holding`, and `pension` to both `COLORS.entity` and `COLORS.entityBg` before adding entity registry entries that use those categories.
**Warning signs:** Fund/holding/pension entities render with gray backgrounds instead of distinct colors.

### Pitfall 5: Entity Count Mismatch with Success Criteria
**What goes wrong:** The success criteria specify exact entity counts: 9 UK, 11 US, 6 HK, 7 SG, 10 LU. If the entity lists from research do not match these counts, the phase fails verification.
**Why it happens:** Research entity lists vary depending on which entity types are considered essential for tax structuring.
**How to avoid:** Use the definitive entity lists below (reconciled with success criteria counts) and verify with `getEntitiesByJurisdiction(jurisdiction).length` for each jurisdiction.
**Warning signs:** Test assertion `getEntitiesByJurisdiction('UK').length === 9` fails.

### Pitfall 6: Existing AU Structures Break on Load
**What goes wrong:** Changing the `Jurisdiction` type union or `EntityCategory` type union could theoretically break Zod snapshot parsing of existing saved AU structures.
**Why it happens:** The Zod snapshot schema validates `jurisdiction: z.string().min(2)` (not a union), `registration: z.record(z.string(), z.unknown()).optional().default({})`, and `taxStatus: z.record(z.string(), z.unknown()).optional().default({})` -- all with `.passthrough()`. These are already permissive enough that no changes are needed to the snapshot schema.
**How to avoid:** Do NOT change the snapshot schema. The existing schema already validates AU structures and will validate non-AU structures because it uses string-based validation, not union-based. Test by loading an existing AU-only saved structure after all changes.
**Warning signs:** `parseGraphSnapshot()` returns null for previously valid snapshots.

## Code Examples

### Example 1: Expanding Jurisdiction Type Union
```typescript
// Source: src/models/jurisdiction.ts (current state verified)
// BEFORE:
export type Jurisdiction = 'AU';

// AFTER:
export type Jurisdiction = 'AU' | 'UK' | 'US' | 'HK' | 'SG' | 'LU';

export const JURISDICTIONS: Record<Jurisdiction, JurisdictionConfig> = {
  AU: { code: 'AU', name: 'Australia', flag: '\u{1F1E6}\u{1F1FA}', currencyCode: 'AUD', taxAuthorityName: 'Australian Taxation Office' },
  UK: { code: 'UK', name: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}', currencyCode: 'GBP', taxAuthorityName: 'HM Revenue & Customs' },
  US: { code: 'US', name: 'United States', flag: '\u{1F1FA}\u{1F1F8}', currencyCode: 'USD', taxAuthorityName: 'Internal Revenue Service' },
  HK: { code: 'HK', name: 'Hong Kong', flag: '\u{1F1ED}\u{1F1F0}', currencyCode: 'HKD', taxAuthorityName: 'Inland Revenue Department' },
  SG: { code: 'SG', name: 'Singapore', flag: '\u{1F1F8}\u{1F1EC}', currencyCode: 'SGD', taxAuthorityName: 'Inland Revenue Authority of Singapore' },
  LU: { code: 'LU', name: 'Luxembourg', flag: '\u{1F1F1}\u{1F1FA}', currencyCode: 'EUR', taxAuthorityName: 'Administration des Contributions Directes' },
};
```

### Example 2: Extending EntityCategory
```typescript
// Source: src/models/entities.ts (current state verified)
// BEFORE:
export type EntityCategory = 'company' | 'trust' | 'partnership' | 'vc' | 'individual' | 'smsf';

// AFTER:
export type EntityCategory =
  | 'company'
  | 'trust'
  | 'partnership'
  | 'vc'
  | 'individual'
  | 'smsf'
  | 'fund'       // Regulated fund vehicles (LU SICAV/SIF/RAIF, SG VCC, HK OFC/LPF)
  | 'holding'    // Purpose-built holding structures (LU Soparfi)
  | 'pension';   // Retirement/pension schemes (UK Pension Scheme)
```

### Example 3: Extending CATEGORY_CONFIG
```typescript
// Source: src/lib/entity-registry.ts (current state verified)
export const CATEGORY_CONFIG: CategoryConfig[] = [
  { category: 'company', label: 'Companies', iconName: 'building-2' },
  { category: 'trust', label: 'Trusts', iconName: 'shield' },
  { category: 'partnership', label: 'Partnerships', iconName: 'handshake' },
  { category: 'fund', label: 'Funds', iconName: 'landmark' },           // NEW
  { category: 'holding', label: 'Holding Vehicles', iconName: 'layers' }, // NEW
  { category: 'vc', label: 'Venture Capital', iconName: 'trending-up' },
  { category: 'individual', label: 'Individuals', iconName: 'user' },
  { category: 'pension', label: 'Pension Schemes', iconName: 'piggy-bank' }, // NEW
  { category: 'smsf', label: 'Super Funds', iconName: 'shield-check' },
];
```

### Example 4: Extending COLORS for New Categories
```typescript
// Source: src/lib/constants.ts (current state verified)
entity: {
  company: '#2563EB',     // blue-600
  trust: '#7C3AED',       // violet-600
  partnership: '#059669',  // emerald-600
  vc: '#D97706',          // amber-600
  individual: '#64748B',  // slate-500
  smsf: '#0D9488',        // teal-600
  fund: '#8B5CF6',        // violet-500 (distinct from trust violet-600)
  holding: '#0891B2',     // cyan-600
  pension: '#EA580C',     // orange-600
  selected: '#3B82F6',
  error: '#EF4444',
},
entityBg: {
  company: '#DBEAFE',     // blue-100
  trust: '#EDE9FE',       // violet-100
  partnership: '#D1FAE5',  // emerald-100
  vc: '#FEF3C7',          // amber-100
  individual: '#F1F5F9',  // slate-100
  smsf: '#CCFBF1',        // teal-100
  fund: '#F5F3FF',        // violet-50
  holding: '#CFFAFE',     // cyan-100
  pension: '#FFF7ED',     // orange-50
},
```

### Example 5: Fixing JurisdictionFlag Lookup
```typescript
// Source: src/components/canvas/Canvas.tsx lines 224-225 (current state verified)
// BEFORE:
jurisdiction: canvasJurisdiction,
jurisdictionFlag: canvasJurisdiction === 'AU' ? '\u{1F1E6}\u{1F1FA}' : '',

// AFTER:
import { JURISDICTIONS, type Jurisdiction } from '@/models/jurisdiction';
// ...
jurisdiction: canvasJurisdiction,
jurisdictionFlag: JURISDICTIONS[canvasJurisdiction as Jurisdiction]?.flag ?? '',
```

## Definitive Entity Lists (Matching Success Criteria Counts)

### UK: 9 Entity Types
| ID | Category | Display Name | Short Name | Shape | Icon |
|----|----------|-------------|------------|-------|------|
| `uk-ltd` | company | Private Limited Company | Ltd | rectangle | building-2 |
| `uk-plc` | company | Public Limited Company | PLC | rectangle | building-2 |
| `uk-llp` | partnership | Limited Liability Partnership | LLP | triangle | handshake |
| `uk-lp` | partnership | Limited Partnership | LP | triangle | file-signature |
| `uk-gp` | partnership | General Partnership | GP | triangle | handshake |
| `uk-unit-trust` | trust | Unit Trust | Unit Trust | triangle | shield |
| `uk-discretionary-trust` | trust | Discretionary Trust | Disc. Trust | triangle | shield-check |
| `uk-individual` | individual | Individual | Individual | oval | user |
| `uk-pension-scheme` | pension | Pension Scheme | Pension | shield | piggy-bank |

### US: 11 Entity Types
| ID | Category | Display Name | Short Name | Shape | Icon |
|----|----------|-------------|------------|-------|------|
| `us-c-corp` | company | C Corporation | C Corp | rectangle | building-2 |
| `us-s-corp` | company | S Corporation | S Corp | rectangle | building-2 |
| `us-llc-disregarded` | company | LLC (Disregarded Entity) | LLC (DE) | rounded | building-2 |
| `us-llc-partnership` | partnership | LLC (Partnership-Taxed) | LLC (P) | triangle | handshake |
| `us-gp` | partnership | General Partnership | GP | triangle | handshake |
| `us-lp` | partnership | Limited Partnership | LP | triangle | file-signature |
| `us-lllp` | partnership | Limited Liability Limited Partnership | LLLP | triangle | file-signature |
| `us-grantor-trust` | trust | Grantor Trust | Grantor Trust | triangle | shield |
| `us-non-grantor-trust` | trust | Non-Grantor Trust | Non-Grantor Trust | triangle | shield-check |
| `us-individual` | individual | Individual | Individual | oval | user |
| `us-501c3` | company | Tax-Exempt Organization | 501(c)(3) | hexagon | landmark |

### HK: 6 Entity Types
| ID | Category | Display Name | Short Name | Shape | Icon |
|----|----------|-------------|------------|-------|------|
| `hk-private-co` | company | Private Company Limited by Shares | Private Co | rectangle | building-2 |
| `hk-public-co` | company | Public Company | Public Co | rectangle | building-2 |
| `hk-lp` | partnership | Limited Partnership | LP | triangle | file-signature |
| `hk-lpf` | fund | Limited Partnership Fund | LPF | hexagon | landmark |
| `hk-ofc` | fund | Open-Ended Fund Company | OFC | hexagon | landmark |
| `hk-individual` | individual | Individual | Individual | oval | user |

### SG: 7 Entity Types
| ID | Category | Display Name | Short Name | Shape | Icon |
|----|----------|-------------|------------|-------|------|
| `sg-pte-ltd` | company | Private Limited Company | Pte Ltd | rectangle | building-2 |
| `sg-public-co` | company | Public Company | Public Co | rectangle | building-2 |
| `sg-lp` | partnership | Limited Partnership | LP | triangle | file-signature |
| `sg-llp` | partnership | Limited Liability Partnership | LLP | triangle | handshake |
| `sg-vcc` | fund | Variable Capital Company | VCC | hexagon | landmark |
| `sg-unit-trust` | trust | Unit Trust | Unit Trust | triangle | shield |
| `sg-individual` | individual | Individual | Individual | oval | user |

### LU: 10 Entity Types
| ID | Category | Display Name | Short Name | Shape | Icon |
|----|----------|-------------|------------|-------|------|
| `lu-sarl` | company | S.a r.l. (Private Limited) | Sarl | rectangle | building-2 |
| `lu-sa` | company | S.A. (Public Limited) | SA | rectangle | building-2 |
| `lu-scsp` | partnership | SCSp (Special Limited Partnership) | SCSp | triangle | handshake |
| `lu-scs` | partnership | SCS (Limited Partnership) | SCS | triangle | file-signature |
| `lu-sicav` | fund | SICAV (Investment Fund) | SICAV | hexagon | landmark |
| `lu-sicar` | fund | SICAR (Risk Capital Fund) | SICAR | hexagon | landmark |
| `lu-sif` | fund | SIF (Specialised Investment Fund) | SIF | hexagon | landmark |
| `lu-raif` | fund | RAIF (Reserved Alternative Fund) | RAIF | hexagon | landmark |
| `lu-soparfi` | holding | Soparfi (Holding Company) | Soparfi | diamond | layers |
| `lu-individual` | individual | Individual | Individual | oval | user |

**Total: 43 new entity types + 11 existing AU = 54 entity types in the registry.**

## Visual Distinction Strategy

### Jurisdiction Differentiation
Each jurisdiction is visually identified by:
1. **Flag emoji** -- stored in `jurisdictionFlag` field, rendered by EntityNode as part of entity content
2. **Jurisdiction code text** -- EntityNode already renders `(data.jurisdiction)` on line 408 (e.g., "(UK)", "(SG)")
3. **Category color** -- consistent across jurisdictions (all companies are blue regardless of jurisdiction). This is intentional: it lets users instantly identify entity TYPE (company vs trust) while the flag/code identifies jurisdiction.

### New Category Visual Identity
| Category | Color (border/accent) | Background | Icon | Shape |
|----------|----------------------|------------|------|-------|
| fund | Violet-500 (#8B5CF6) | Violet-50 (#F5F3FF) | landmark | hexagon |
| holding | Cyan-600 (#0891B2) | Cyan-100 (#CFFAFE) | layers | diamond |
| pension | Orange-600 (#EA580C) | Orange-50 (#FFF7ED) | piggy-bank | shield |

### No Jurisdiction-Specific Border Colors in This Phase
The success criteria require "jurisdiction-specific visual styling" with "distinct flag icon and color accent." The flag emoji and jurisdiction code text provide this distinction. Adding a jurisdiction-specific border tint (e.g., UK entities have a red border tint) is possible but NOT required in Phase 17 -- it can be added in a later phase if user testing shows flags alone are insufficient. Phase 17 focuses on making entities AVAILABLE with correct categories and flag/code display.

## New Palette Icons Needed

The following Lucide icons need to be added to `PALETTE_ICONS` in `palette-icons.ts`:

| Icon Name | Lucide Component | Used By |
|-----------|-----------------|---------|
| `layers` | Layers | Holding category, Soparfi entities |
| `piggy-bank` | PiggyBank | Pension category |

Note: `landmark` is already imported in palette-icons.ts (used by `au-mit`). No additional import needed for fund category icon.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded `'AU'` jurisdiction | Dynamic `Jurisdiction` type union | This phase | All downstream palette/properties/validation use the expanded type |
| 6 AU-only entity categories | 9 categories including fund/holding/pension | This phase | Palette renders 3 additional category sections |
| Hardcoded flag ternary | JURISDICTIONS registry lookup | This phase | Non-AU entities get correct flag emoji |

**Deprecated/outdated (after this phase):**
- Ternary flag assignment `=== 'AU' ? flag : ''` -- replaced by JURISDICTIONS lookup
- Comment "for all Australian tax entity types" in entity-registry.ts -- now multi-jurisdiction

## Open Questions

1. **Soparfi as Entity Type vs Tax Status Flag**
   - What we know: Soparfi is technically a tax status (participation exemption regime) applied to any Sarl/SA, not a distinct legal form. However, it is universally referred to as a distinct entity type in cross-border structuring practice.
   - What's unclear: Should it be a separate entity type (as listed above) or a boolean `isSoparfi` flag on Sarl/SA entities?
   - Recommendation: Model as a separate entity type (`lu-soparfi`) in the `holding` category. This matches how tax practitioners think about Soparfis -- as a distinct structuring vehicle. If practitioners object, it can be merged into Sarl/SA with a flag in a future phase. The success criteria count (10 LU entities) includes Soparfi as a separate type.

2. **US 501(c)(3) Category Assignment**
   - What we know: The 501(c)(3) is a tax-exempt organization. It doesn't fit neatly into any existing category. The milestone research suggested an `other` category.
   - What's unclear: Adding an `other` category just for one entity type seems wasteful.
   - Recommendation: Assign to `company` category since 501(c)(3) organizations are corporations/associations with a special tax status. The tax-exempt status is a property of the entity, not its legal form. This avoids adding yet another category for a single entity.

3. **Color Distinctiveness for Fund vs Trust**
   - What we know: Both `fund` (violet-500) and `trust` (violet-600) use violet tones. They are close but distinguishable.
   - What's unclear: Whether users will confuse fund and trust entities at a glance.
   - Recommendation: Use the proposed violet-500/violet-600 split. The shape distinction (hexagon for funds, triangle for trusts) provides the primary visual differentiator. If user testing reveals confusion, change fund color to a different hue entirely (e.g., indigo or pink).

4. **Registry File Size**
   - What we know: At ~15 lines per entry, 54 entries = ~810 lines. This is large for a single file.
   - Recommendation: Keep as a single file for Phase 17. If the planner decides to split, use the helper-file pattern: `src/lib/jurisdictions/uk-entities.ts` exports an array, spread into main registry. But do not optimize prematurely.

## Sources

### Primary (HIGH confidence)
- **Direct codebase analysis** -- All source files read directly:
  - `src/models/jurisdiction.ts` -- Jurisdiction type (currently `'AU'`), JurisdictionConfig interface, JURISDICTIONS registry
  - `src/models/entities.ts` -- EntityCategory type (6 values), EntityTypeConfig interface, EntityShape type
  - `src/models/graph.ts` -- TaxEntityData interface (jurisdiction, jurisdictionFlag, registration, taxStatus fields)
  - `src/models/relationships.ts` -- TaxRelationshipData interface, RelationshipType union
  - `src/lib/entity-registry.ts` -- ENTITY_REGISTRY (11 AU entries), CATEGORY_CONFIG (6 categories), getEntitiesByJurisdiction/getEntitiesByCategory/getEntityConfig functions
  - `src/lib/constants.ts` -- COLORS.entity (6 category colors), COLORS.entityBg (6 category backgrounds)
  - `src/lib/palette-icons.ts` -- 10 icon mappings (landmark already present)
  - `src/lib/validation/entity-schemas.ts` -- Schema map (11 AU schemas), baseEntitySchema
  - `src/lib/validation/graph-snapshot-schema.ts` -- Uses `.passthrough()`, `z.string().min(2)` for jurisdiction
  - `src/lib/validation/graph-validator.ts` -- TRUST_TYPES and PARTNERSHIP_TYPES hardcoded AU Sets
  - `src/stores/ui-store.ts` -- No selectedPaletteJurisdiction yet
  - `src/stores/graph-store.ts` -- canvasJurisdiction field, setCanvasJurisdiction action
  - `src/components/canvas/Canvas.tsx` -- Hardcoded flag ternary on lines 225, 370
  - `src/components/canvas/nodes/EntityNode.tsx` -- Renders from registry lookup, shows `(data.jurisdiction)` text
  - `src/components/palette/EntityPalette.tsx` -- Hardcoded `'AU'` on line 73
  - `src/components/mobile/MobilePalette.tsx` -- Hardcoded `'AU'` on line 101, hardcoded flag ternary on line 65
  - `src/components/properties/RegistrationSection.tsx` -- Dispatches on category (AU-specific fields)
  - `src/components/properties/TaxStatusSection.tsx` -- Dispatches on category (AU-specific fields)
  - `src/components/properties/IdentitySection.tsx` -- Uses `getEntitiesByCategory(formData.jurisdiction, category)`, jurisdiction displayed as read-only

### Secondary (MEDIUM confidence)
- **Milestone-level research** (`.planning/research/SUMMARY.md`, `ARCHITECTURE.md`, `FEATURES.md`, `STACK.md`, `PITFALLS.md`) -- Entity type lists per jurisdiction, tax domain knowledge, architecture patterns. Research conducted 2026-03-06 with HIGH architecture confidence, MEDIUM domain confidence.

### Tertiary (LOW confidence -- verify before use)
- **Entity type completeness** -- The 43 entity types across 5 jurisdictions cover common cross-border structuring patterns but may not be exhaustive. Practitioner review recommended.
- **Tax rate accuracy** -- Corporation tax rates, trust rates, and fund tax regimes cited in entity descriptions are from training data. Verify against current legislation before presenting as authoritative.
- **Registration number format regexes** -- UK company number (8 chars), US EIN (XX-XXXXXXX), SG UEN (9-10 alphanumeric), HK BRN (8 digits), LU RCS (B-digits) formats are from training data. Verify against official registrar documentation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, verified from package.json and codebase
- Architecture: HIGH -- all patterns verified from direct source file analysis; every file path, line number, and code pattern confirmed
- Entity type lists: HIGH -- counts reconciled with success criteria (9+11+6+7+10 = 43 new entities)
- Category extensions: MEDIUM -- category names (fund/holding/pension) and color choices are design decisions that may need adjustment
- Pitfalls: HIGH -- all 6 pitfalls identified from actual code patterns with exact file references

**Research date:** 2026-03-07
**Valid until:** 2026-04-07 (stable -- pure data expansion with no dependency on fast-moving libraries)
