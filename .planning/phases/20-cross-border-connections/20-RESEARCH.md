# Phase 20: Cross-Border Connections - Research

**Researched:** 2026-03-07
**Domain:** Cross-border tax connection metadata, edge visual differentiation, withholding tax / treaty / transfer pricing data modeling, React Flow custom edge styling
**Confidence:** HIGH

## Summary

Phase 20 adds cross-border intelligence to the connection system. Currently, entities carry a `jurisdiction` field (e.g., 'AU', 'UK', 'US') and connections carry relationship-type metadata (equity terms, debt terms, etc.), but the system has no concept of "cross-border" -- it cannot detect when two connected entities are in different jurisdictions, nor does it attach withholding tax, treaty, transfer pricing, or currency metadata to connections.

The work divides into four layers: (1) enabling mixed-jurisdiction entity placement on one canvas, (2) extending `TaxRelationshipData` with cross-border-specific fields, (3) adding automatic cross-border detection and transfer pricing flagging logic, and (4) visually differentiating cross-border edges from domestic ones.

The codebase is well-positioned. The `TaxRelationshipData` interface in `models/relationships.ts` uses `Record<string, unknown>` extension and follows the optional-field pattern established in Phase 19. The `RelationshipEdge` component already supports per-edge style differentiation (solid vs dashed, per-type colors, arrowheads), so adding a cross-border visual treatment is a matter of layering an additional style dimension. The `ConnectionPropertiesPanel` already renders type-conditional form sections (equity fields, debt fields, beneficiary fields), so adding cross-border-conditional sections follows the same pattern. The Zod validation schemas in `relationship-schemas.ts` can be extended with cross-border-specific fields. The `graph-validator.ts` pure function can add a transfer pricing auto-flag rule.

**Critical finding:** Desktop drag-and-drop (`Canvas.tsx` `onDrop`, line 226) currently assigns `canvasJurisdiction` to ALL dropped entities, overriding the entity type's native jurisdiction. This means dragging a UK entity onto an AU-canvas creates it as AU, not UK. The mobile palette (`MobilePalette.tsx` line 103) correctly uses `config.jurisdiction` from the entity registry. This inconsistency MUST be fixed as a prerequisite for XBRD-01 -- without it, users cannot create cross-border structures via desktop drag-and-drop.

**Primary recommendation:** Fix desktop `onDrop` to use entity registry jurisdiction (like mobile does). Extend `TaxRelationshipData` with optional cross-border fields (all optional for backward compatibility). Add a `isCrossBorder(edge, nodes)` utility function. Layer cross-border visual treatment in `RelationshipEdge` via a distinct stroke color or dash pattern overlay. Add cross-border form section in `ConnectionPropertiesPanel` that appears conditionally. Add transfer pricing auto-flag rule in `graph-validator.ts`. Update legend, snapshot schema, and relationship schemas.

## Standard Stack

### Core (No Changes)
| Library | Version | Purpose | Why No Change |
|---------|---------|---------|---------------|
| Next.js | 16.1.6 | App framework | No framework changes |
| React | 19.2.3 | UI rendering | Same component patterns |
| @xyflow/react | 12.10.0 | Canvas / edge rendering | Custom edge already exists, just needs extended styling |
| Zustand | 5.0.11 | State management | graph-store updateEdgeData already handles arbitrary data |
| Zod | 4.3.6 | Validation schemas | Extend existing relationship-schemas.ts |
| Tailwind CSS | v4 | Styling | Same form input patterns |
| Lucide React | 0.564.0 | Icons | May add Globe, FileWarning for cross-border UI |

### Supporting (No New Dependencies)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| zundo | 2.3.0 | Undo/redo | No change -- edge data changes go through updateEdgeData |
| nanoid | existing | ID generation | No change |
| react-markdown | 10.1.0 | Notes preview | No change |

### Alternatives Considered
| Instead of | Could Use | Why Not |
|------------|-----------|---------|
| Full ISO 4217 currency library (currency.js) | Static ISO code array with 10-15 common currencies | The app only needs a dropdown of currency codes, not currency conversion or formatting. A static array is simpler, zero-dependency, and sufficient. |
| Treaty database lookup API | User-entered treaty name string | Treaty rates vary by income type, beneficial owner status, and treaty article. A lookup would require maintaining a full treaty database (hundreds of treaties). User-entered text is appropriate for a structuring tool. |
| Withholding tax rate calculation engine | User-entered percentage field | WHT rates depend on entity status, treaty eligibility, and specific treaty articles. Auto-calculation would require a full tax engine. User-entered rate with optional treaty reference is the correct scope. |
| Separate "cross-border edge" component | Conditional styling in existing RelationshipEdge | A separate component would duplicate all existing edge logic (multigraph offsets, path computation, drag handles). Layering cross-border styling into the existing component is cleaner. |

**Installation:**
```bash
# No new packages to install. All changes use existing dependencies.
```

## Architecture Patterns

### Recommended Project Structure (Files Changed in Phase 20)
```
src/
  models/
    relationships.ts              # MODIFY: Add cross-border fields to TaxRelationshipData
  lib/
    cross-border.ts               # NEW: isCrossBorder() utility, COMMON_CURRENCIES constant, payment type enum
    validation/
      relationship-schemas.ts     # MODIFY: Extend schemas with cross-border fields
      graph-validator.ts          # MODIFY: Add transfer pricing auto-flag rule
      graph-snapshot-schema.ts    # MODIFY: Add new optional fields to taxRelationshipDataSchema
  components/
    canvas/
      edges/
        RelationshipEdge.tsx      # MODIFY: Add cross-border visual treatment (color overlay / dash pattern)
      CanvasLegend.tsx            # MODIFY: Add cross-border legend entry
      Canvas.tsx                  # MODIFY: Fix onDrop to use config.jurisdiction instead of canvasJurisdiction
    connections/
      ConnectionPropertiesPanel.tsx # MODIFY: Add cross-border section with WHT, treaty, currency, TP flag fields
```

### Components That Need NO Changes
| Component | Why No Change |
|-----------|---------------|
| `graph-store.ts` | `updateEdgeData` uses `Object.assign(edge.data, data)`. New fields merge naturally. `addEdge` accepts arbitrary TaxRelationshipData. |
| `EntityNode.tsx` | Entity rendering unchanged. Jurisdiction already displayed on nodes. |
| `EntityPalette.tsx` | Desktop palette already supports all jurisdiction tabs. Search already crosses jurisdictions. |
| `MobilePalette.tsx` | Already correctly uses `config.jurisdiction` for placed entities. |
| `ConnectionTypePickerModal.tsx` | Connection type selection unchanged -- cross-border metadata is set AFTER type selection in properties panel. |
| `MobileConnectionTypePicker.tsx` | Same as above. |
| `EdgeContextMenu.tsx` | Right-click menu unchanged -- cross-border fields edited in properties panel. |
| `entity-schemas.ts` | Entity validation unchanged. Cross-border is a connection concern. |
| `PropertiesPanel.tsx` | Entity properties unchanged. |

### Pattern 1: Cross-Border Detection Utility
**What:** A pure function `isCrossBorder(edge, nodes)` that checks if source and target nodes are in different jurisdictions.
**When to use:** In RelationshipEdge (visual styling), ConnectionPropertiesPanel (conditional form section), graph-validator (TP auto-flag).
**Why a utility:** The same logic is needed in 3+ locations. Duplicating jurisdiction comparison would be fragile.
**Example:**
```typescript
// Source: project architecture pattern (pure utility function)
import type { TaxNode, TaxEdge } from '@/models/graph';

/**
 * Determine if an edge connects entities in different jurisdictions.
 * Returns false if either node is missing (defensive).
 */
export function isCrossBorder(
  edge: TaxEdge,
  nodes: TaxNode[]
): boolean {
  const source = nodes.find((n) => n.id === edge.source);
  const target = nodes.find((n) => n.id === edge.target);
  if (!source || !target) return false;
  return source.data.jurisdiction !== target.data.jurisdiction;
}
```

### Pattern 2: Conditional Cross-Border Form Section
**What:** In ConnectionPropertiesPanel, render a "Cross-Border" section when the edge connects entities from different jurisdictions. This section contains: withholding tax rate, payment type, treaty reduced rate toggle, treaty name, currency code, and transfer pricing flag (read-only auto-computed).
**When to use:** Always, for any edge where `isCrossBorder()` returns true.
**Example:**
```typescript
// Inside ConnectionPropertiesPanel, after the type-specific sections:
{isCrossBorderEdge && (
  <div className="px-4 py-3 border-t border-gray-100">
    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
      <Globe className="w-3.5 h-3.5" />
      Cross-Border Details
    </h3>
    {/* WHT rate, payment type, treaty fields, currency, TP flag */}
  </div>
)}
```

### Pattern 3: Visual Differentiation in RelationshipEdge
**What:** Cross-border edges get a distinct visual treatment layered on top of existing relationship-type styling. The recommended approach is a secondary color band or a modified dash pattern.
**When to use:** When the edge's source and target nodes have different jurisdictions.
**Options (in order of visual clarity):**
1. **Double-stroke:** Render a second `<path>` element behind the main path with a wider stroke in a distinct color (e.g., amber-500 `#F59E0B`). This creates a "highlight border" effect that is visible regardless of the relationship type's own color/dash pattern.
2. **Distinct dash pattern:** Override the dash pattern for cross-border edges to use a longer dash (e.g., `12 4 4 4` dot-dash) that is visually distinct from both the solid ownership lines and the dashed action lines.
3. **Color override:** Replace the relationship-type color with a single "cross-border" color. This loses the type information, which is undesirable.

**Recommendation:** Use option 1 (double-stroke with amber highlight) as it preserves all existing visual information (relationship type color, dash pattern) while adding a clear cross-border indicator. The implementation adds ONE extra `<path>` element in the SVG before the main BaseEdge path.

```typescript
// Inside RelationshipEdge, before BaseEdge:
{isCrossBorderEdge && (
  <path
    d={path}
    fill="none"
    stroke="#F59E0B"  // amber-500
    strokeWidth={strokeWidth + 4}
    strokeDasharray="none"
    opacity={0.3}
    style={{ pointerEvents: 'none' }}
  />
)}
```

### Pattern 4: Desktop onDrop Jurisdiction Fix
**What:** Change Canvas.tsx `onDrop` to use the entity type's native jurisdiction from the registry instead of `canvasJurisdiction`.
**Why:** Currently, dragging a UK entity type from the palette onto a canvas with `canvasJurisdiction='AU'` creates the entity with `jurisdiction: 'AU'`. This defeats the purpose of cross-border structures.
**Fix:**
```typescript
// In Canvas.tsx onDrop handler, change:
//   jurisdiction: canvasJurisdiction,
//   jurisdictionFlag: JURISDICTIONS[canvasJurisdiction as Jurisdiction]?.flag ?? '',
// To:
jurisdiction: config.jurisdiction,
jurisdictionFlag: JURISDICTIONS[config.jurisdiction as Jurisdiction]?.flag ?? '',
```
**Impact:** Also fix the `onDoubleClickPane` handler (which hardcodes 'au-pty-ltd' -- this already uses `canvasJurisdiction` for jurisdiction, which happens to match 'au-pty-ltd' since the default entity type and default canvas jurisdiction are both AU. But for correctness, it should derive from the entity config's jurisdiction).

### Anti-Patterns to Avoid
- **Storing computed cross-border status on edges:** Do NOT add an `isCrossBorder` boolean to `TaxRelationshipData`. Cross-border status is DERIVED from the jurisdictions of the source and target nodes. Storing it would create a sync problem when entities change jurisdiction.
- **Requiring cross-border fields on domestic connections:** All cross-border fields MUST be optional. Domestic connections must continue to work identically to today with zero additional fields.
- **Auto-populating treaty rates from a database:** Treaty rate lookup is out of scope. The user enters the applicable rate. A full treaty database would be a separate feature (100+ bilateral treaties, each with dividend/interest/royalty rates by beneficial ownership threshold).
- **Coupling cross-border detection to edge type:** All 8 relationship types can be cross-border. Don't limit cross-border metadata to only equity/debt.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Currency code list | Full ISO 4217 library or API | Static array of ~15-20 common codes (AUD, GBP, USD, HKD, SGD, EUR, JPY, CHF, CAD, CNY, NZD, INR, KRW, THB, MYR, IDR) | Only need a dropdown selector. User can also type a custom code. The 6 supported jurisdictions cover AUD, GBP, USD, HKD, SGD, EUR. |
| Cross-border detection | Per-component jurisdiction comparison | Shared `isCrossBorder()` utility | Same logic needed in 3+ places. Centralize for consistency. |
| Transfer pricing flagging | Complex TP risk scoring | Simple boolean: cross-border + related party + service/management/licensing type | The tool flags for attention, not for compliance assessment. |
| Treaty rate validation | Treaty database with per-article rates | Simple percentage field (0-100) with optional treaty name text | Treaty rates are too complex for auto-lookup (beneficial ownership thresholds, look-through provisions, treaty shopping rules). |

**Key insight:** This phase adds DATA CAPTURE metadata to connections, not tax calculation logic. The cross-border fields are for the tax adviser to record structuring decisions, not for the tool to make tax determinations.

## Common Pitfalls

### Pitfall 1: Desktop Drag-and-Drop Jurisdiction Override
**What goes wrong:** All entities placed via desktop drag-and-drop get `canvasJurisdiction` instead of their native jurisdiction from the entity registry.
**Why it happens:** Canvas.tsx `onDrop` handler (line 226) uses `canvasJurisdiction` instead of `config.jurisdiction`. The mobile palette already does it correctly.
**How to avoid:** Fix `onDrop` to use `config.jurisdiction` from the entity registry (same as MobilePalette). This is a prerequisite for XBRD-01.
**Warning signs:** All entities on canvas show same jurisdiction flag regardless of their entity type.

### Pitfall 2: Derived vs Stored Cross-Border Status
**What goes wrong:** Storing `isCrossBorder: true` on the edge data, then failing to update it when an entity's jurisdiction changes.
**Why it happens:** Tempting to pre-compute for performance, but creates a data sync problem.
**How to avoid:** Always compute `isCrossBorder()` from source/target node jurisdictions at render time. For RelationshipEdge, the nodes are available via the `useStore` hook. For ConnectionPropertiesPanel, nodes are already subscribed from the graph store.
**Warning signs:** Edge shows cross-border styling but both entities are in the same jurisdiction (or vice versa).

### Pitfall 3: Breaking Existing Edge Styling
**What goes wrong:** Cross-border visual treatment overrides or obscures the existing relationship-type color and dash pattern.
**Why it happens:** Using a single visual dimension (e.g., stroke color) for both relationship type AND cross-border status.
**How to avoid:** Use an ADDITIONAL visual layer (double-stroke highlight behind the main path, or a secondary indicator like a small icon badge on the label). The existing color/dash system must remain unchanged.
**Warning signs:** Users can't tell if a cross-border edge is equity vs debt because the type color is gone.

### Pitfall 4: Transfer Pricing False Positives
**What goes wrong:** Flagging ALL cross-border connections for transfer pricing relevance, including equity/debt/trust connections.
**Why it happens:** Not filtering by relationship type before applying the TP flag.
**How to avoid:** Only auto-flag TP relevance on: (1) cross-border connections, (2) with relationship type in `['services', 'management', 'licensing']`, (3) between related parties. For Phase 20, "related party" can be simplified to "any connection exists" (since the tool models intentional structures, not random third-party relationships).
**Warning signs:** Every cross-border equity holding shows a TP warning.

### Pitfall 5: Snapshot Schema Backward Compatibility
**What goes wrong:** Existing saved structures fail to load because new cross-border fields are required in the schema.
**Why it happens:** Adding non-optional fields to `taxRelationshipDataSchema` in graph-snapshot-schema.ts.
**How to avoid:** All new fields must use `.optional()`. The existing `.passthrough()` on the schema already allows unknown fields, but explicitly declaring them as optional ensures type safety.
**Warning signs:** Loading a pre-Phase-20 saved structure throws a Zod validation error.

### Pitfall 6: Performance Regression in RelationshipEdge
**What goes wrong:** Adding a `useStore` call inside RelationshipEdge to look up source/target node jurisdictions causes re-renders on every node position change.
**Why it happens:** RelationshipEdge already subscribes to the full edges array for multigraph sibling detection. Adding a nodes subscription would double the render triggers.
**How to avoid:** Use a NARROW selector that only extracts the two specific nodes' jurisdictions. Or better: pass cross-border status as a computed prop from the Canvas level where nodes are already available, or use `useStore` with a selector that compares only `source.data.jurisdiction` and `target.data.jurisdiction` for the specific edge's source/target IDs.
**Warning signs:** Dragging a node causes all edges to re-render (not just connected ones).

## Code Examples

Verified patterns from the existing codebase:

### Cross-Border Fields on TaxRelationshipData
```typescript
// In models/relationships.ts -- extend TaxRelationshipData:
export interface TaxRelationshipData extends Record<string, unknown> {
  // ... existing fields ...

  // Cross-border fields (all optional -- only relevant for cross-border connections)
  /** Withholding tax rate as percentage (0-100), e.g. 15 for 15% */
  withholdingTaxRate?: number;
  /** Payment type subject to withholding */
  paymentType?: 'dividend' | 'interest' | 'royalty' | 'service-fee' | 'management-fee' | 'license-fee';
  /** Whether a treaty-reduced rate applies */
  treatyApplies?: boolean;
  /** Name of the applicable tax treaty, e.g. 'Australia-UK DTA' */
  treatyName?: string;
  /** ISO 4217 currency code for the connection, e.g. 'USD' */
  currencyCode?: string;
  /** Whether transfer pricing is relevant (auto-flagged, user can override) */
  transferPricingRelevant?: boolean;
}
```

### Common Currencies Constant
```typescript
// In lib/cross-border.ts:
/** Common ISO 4217 currency codes for the cross-border currency selector */
export const COMMON_CURRENCIES = [
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'NZD', name: 'New Zealand Dollar' },
] as const;

/** Payment types for withholding tax classification */
export const PAYMENT_TYPES = [
  { value: 'dividend', label: 'Dividend' },
  { value: 'interest', label: 'Interest' },
  { value: 'royalty', label: 'Royalty' },
  { value: 'service-fee', label: 'Service Fee' },
  { value: 'management-fee', label: 'Management Fee' },
  { value: 'license-fee', label: 'License Fee' },
] as const;
```

### Transfer Pricing Auto-Flag Rule (graph-validator.ts)
```typescript
// In graph-validator.ts, new Rule 8:

/** Relationship types that trigger TP relevance on cross-border connections */
const TP_RELEVANT_TYPES = new Set(['services', 'management', 'licensing']);

// Rule 8: Transfer pricing relevance on cross-border service/management/licensing
for (const edge of edges) {
  if (!edge.data?.relationshipType) continue;
  if (!TP_RELEVANT_TYPES.has(edge.data.relationshipType)) continue;

  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);
  if (!sourceNode || !targetNode) continue;

  if (sourceNode.data.jurisdiction !== targetNode.data.jurisdiction) {
    // Auto-flag TP relevance as info-level
    warnings.push({
      nodeId: edge.source,  // Flag on the service provider
      message: `Cross-border ${edge.data.relationshipType} connection may require transfer pricing documentation`,
      severity: 'info',
    });
  }
}
```

### Zod Schema Extension for Cross-Border Fields
```typescript
// In relationship-schemas.ts, extend baseRelationshipSchema:
const crossBorderFields = {
  withholdingTaxRate: z.number().min(0).max(100).optional(),
  paymentType: z.enum([
    'dividend', 'interest', 'royalty',
    'service-fee', 'management-fee', 'license-fee',
  ]).optional(),
  treatyApplies: z.boolean().optional(),
  treatyName: z.string().max(200).optional().or(z.literal('')),
  currencyCode: z.string().min(3).max(3).optional().or(z.literal('')),
  transferPricingRelevant: z.boolean().optional(),
};

// Add to base schema:
const baseRelationshipSchema = z.object({
  // ... existing fields ...
  ...crossBorderFields,
});
```

### RelationshipEdge Cross-Border Detection
```typescript
// In RelationshipEdge.tsx, add a narrow selector for jurisdiction comparison:
const isCrossBorderEdge = useStore((s) => {
  const sourceNode = s.nodes.find((n: TaxNode) => n.id === source);
  const targetNode = s.nodes.find((n: TaxNode) => n.id === target);
  if (!sourceNode || !targetNode) return false;
  return sourceNode.data.jurisdiction !== targetNode.data.jurisdiction;
});
```

### ConnectionPropertiesPanel Cross-Border Detection
```typescript
// In ConnectionPropertiesPanel, detect cross-border from existing node subscriptions:
const sourceNode = nodes.find((n) => n.id === edge.source);
const targetNode = nodes.find((n) => n.id === edge.target);
const isCrossBorderEdge =
  sourceNode != null &&
  targetNode != null &&
  sourceNode.data.jurisdiction !== targetNode.data.jurisdiction;
```

### Legend Update for Cross-Border
```typescript
// In CanvasLegend.tsx, add cross-border indicator:
{hasCrossBorderEdges && (
  <div className="flex items-center gap-2">
    <svg width="20" height="8" viewBox="0 0 20 8">
      {/* Amber highlight behind */}
      <line x1="0" y1="4" x2="20" y2="4"
        stroke="#F59E0B" strokeWidth="6" opacity="0.3" strokeLinecap="round" />
      {/* Foreground line */}
      <line x1="0" y1="4" x2="20" y2="4"
        stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
    </svg>
    <span className="text-xs text-gray-700">Cross-Border</span>
  </div>
)}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Desktop onDrop uses canvasJurisdiction for all entities | Should use config.jurisdiction from entity registry | Phase 20 fix | Enables cross-border structures via desktop drag-and-drop |
| Connections have no cross-border awareness | Cross-border detected from source/target jurisdictions | Phase 20 | Enables WHT, treaty, TP, currency metadata |
| All edges styled only by relationship type | Cross-border edges get additional visual indicator | Phase 20 | Users can visually distinguish cross-border flows |
| Graph validator has 7 rules | Add rule 8: TP auto-flag on cross-border services | Phase 20 | Proactive TP documentation reminder |

**Deprecated/outdated:**
- Nothing deprecated in this phase. All changes are additive.

## Open Questions

1. **Which cross-border fields should appear for which relationship types?**
   - What we know: WHT rate and payment type are most relevant for equity (dividends) and debt (interest). Treaty references apply to all cross-border connections. Currency applies to debt and equity. TP flags apply to services/management/licensing.
   - What's unclear: Should the currency field appear for ALL cross-border connection types, or only equity and debt (CONN-04 says "debt and equity")? Should payment type be limited to equity/debt or shown for all?
   - Recommendation: Follow CONN-01 and CONN-04 requirements precisely. Show WHT + payment type on equity/debt only. Show currency on equity/debt only. Show treaty fields on all cross-border. TP flag on services/management/licensing. This keeps the form focused and avoids showing irrelevant fields.

2. **Should transfer pricing flag be editable or auto-only?**
   - What we know: CONN-03 says "auto-flagged", suggesting automatic detection.
   - What's unclear: Can the user override the auto-flag (e.g., remove it if they determine TP is not relevant)?
   - Recommendation: Auto-flag as default `true` for qualifying connections (cross-border + service/management/licensing + related parties). User can toggle it off. The field persists in the data so the override survives undo/redo.

3. **Double-stroke visual vs distinct color for cross-border edges?**
   - What we know: Requirement says "dashed line style or distinct color" (XBRD-03).
   - What's unclear: Whether to use the double-stroke amber highlight (preserves type info) or a distinct dash pattern (simpler SVG).
   - Recommendation: Double-stroke amber highlight. It preserves all existing visual semantics (relationship type color + ownership/action dash pattern) while adding a clear cross-border indicator. The requirement says "dashed line style OR distinct color" -- the amber highlight qualifies as "distinct color" treatment.

4. **Desktop onDrop jurisdiction fix: should canvasJurisdiction still exist?**
   - What we know: `canvasJurisdiction` is stored in graph-store and serialized in snapshot metadata.
   - What's unclear: With entities getting their jurisdiction from the registry, what role does canvasJurisdiction serve?
   - Recommendation: Keep `canvasJurisdiction` for the double-click-to-create-entity shortcut (which creates a default entity) and for snapshot metadata. Fix `onDrop` to use `config.jurisdiction`. The canvasJurisdiction becomes "the default jurisdiction for quick-add" rather than "the jurisdiction override for all entities."

## Sources

### Primary (HIGH confidence)
- **Codebase analysis** -- All architecture findings verified by direct file reading:
  - `src/models/relationships.ts` -- TaxRelationshipData interface, current fields
  - `src/models/graph.ts` -- TaxEntityData with jurisdiction field, TaxEdge type
  - `src/models/jurisdiction.ts` -- JURISDICTIONS registry with 6 supported jurisdictions
  - `src/components/canvas/edges/RelationshipEdge.tsx` -- Edge rendering with per-type colors, dash patterns, multigraph offsets
  - `src/components/connections/ConnectionPropertiesPanel.tsx` -- Type-conditional form sections pattern
  - `src/lib/validation/relationship-schemas.ts` -- Zod schemas per relationship type with base+extension pattern
  - `src/lib/validation/graph-validator.ts` -- Pure validation function, 7 existing rules
  - `src/lib/validation/graph-snapshot-schema.ts` -- `.passthrough()` schema for backward compat
  - `src/stores/graph-store.ts` -- updateEdgeData, addEdge, Zustand + immer + temporal
  - `src/components/canvas/Canvas.tsx` -- onDrop handler jurisdiction bug (line 226)
  - `src/components/mobile/MobilePalette.tsx` -- Correct jurisdiction handling (line 103)
  - `src/lib/entity-registry.ts` -- 50+ entity types across 6 jurisdictions with config.jurisdiction

### Secondary (MEDIUM confidence)
- [OECD Withholding Tax Rates](https://www.oecd.org/en/publications/corporate-tax-statistics-2025_6a915941-en/full-report/withholding-tax-rates-and-tax-treaties_e2216eab.html) -- Standard WHT rates: dividends 5-15%, interest 0-10%, royalties 0-10% under treaty
- [PWC WHT Quick Charts](https://taxsummaries.pwc.com/quick-charts/withholding-tax-wht-rates) -- Default 30% US, treaty-reduced rates common
- [OECD Transfer Pricing](https://www.oecd.org/en/topics/sub-issues/transfer-pricing.html) -- Arm's length principle applies to services, management fees, IP licensing between related parties
- [ISO 4217 Currency Codes](https://www.iban.com/currency-codes) -- Standard 3-letter currency codes

### Tertiary (LOW confidence)
- None. All findings are from direct codebase analysis or authoritative tax/standards references.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- No new dependencies needed. All patterns verified in existing codebase.
- Architecture: HIGH -- Extending existing patterns (optional fields, type-conditional forms, edge styling). All touch points identified via direct code reading.
- Pitfalls: HIGH -- Desktop jurisdiction bug identified via code comparison. Performance patterns documented from existing edge implementation.
- Domain knowledge: MEDIUM -- Tax concepts (WHT, treaty, TP) are well-established but the specific field choices for the UI require planner judgment on what's "enough but not too much."

**Research date:** 2026-03-07
**Valid until:** 2026-04-07 (stable domain -- tax structuring patterns don't change rapidly)
