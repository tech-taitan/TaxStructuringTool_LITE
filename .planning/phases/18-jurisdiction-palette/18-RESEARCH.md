# Phase 18: Jurisdiction Palette - Research

**Researched:** 2026-03-07
**Domain:** Jurisdiction tab bar UI in palette components, cross-jurisdiction search, responsive tab layout
**Confidence:** HIGH

## Summary

Phase 18 adds a jurisdiction tab bar to the existing EntityPalette (desktop sidebar) and MobilePalette (bottom sheet) components, allowing users to browse entity types by jurisdiction independently from the canvas default jurisdiction. It also adds cross-jurisdiction search with flag icons alongside results.

The codebase is well-positioned for this work. Phase 17 already made both palettes jurisdiction-aware -- they call `getEntitiesByCategory(canvasJurisdiction, cat.category)` to filter entities. The core change is introducing a `selectedPaletteJurisdiction` state in ui-store (defaulting to `canvasJurisdiction`) and a tab bar UI that sets it. When searching, the filter should ignore the selected jurisdiction and match across ALL jurisdictions, showing the jurisdiction flag alongside each result.

The primary constraint is the desktop palette sidebar width: only 256px (Tailwind w-64). Six tabs with flag emoji + 2-letter code require approximately 288px -- they will overflow. The tab design must use either flag-only tabs (~168px total, fits comfortably) or compact flag+code tabs with minimal padding (~37px per tab, very tight). On mobile, all approaches fit easily on even the smallest phone screens (320px iPhone SE gives 48px per tab).

**Primary recommendation:** Use flag emoji as the primary tab content with the 2-letter code as a tooltip/aria-label, ensuring all 6 tabs fit without horizontal scrolling on both the 256px desktop sidebar and the narrowest mobile screens. Store `selectedPaletteJurisdiction` in ui-store. When search is active, bypass jurisdiction filtering and search ALL 54 entities, showing the jurisdiction flag inline with each result.

## Standard Stack

### Core (No Changes)
| Library | Version | Purpose | Why No Change |
|---------|---------|---------|---------------|
| Next.js | 16.1.6 | App framework | No framework changes |
| React | 19.2.3 | UI rendering | Standard React components |
| Zustand | 5.0.11 | State management | Add 2 fields to ui-store |
| Tailwind CSS | v4 | Styling | Tab bar styling |
| Lucide React | 0.564.0 | Icons | Search icon already used |

### Supporting (No New Dependencies)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| lucide-react | 0.564.0 | Search icon in PaletteSearch | Already used |

### Alternatives Considered
| Instead of | Could Use | Why Not |
|------------|-----------|---------|
| Emoji flags in tabs | SVG flag icons (react-world-flags) | Only 6 jurisdictions; emoji is zero-dependency and already used in JURISDICTIONS registry |
| Custom tab component | Headless UI Tabs | Only 6 static tabs, no complex behavior needed. Plain buttons with active state styling are simpler and zero-dependency. |
| Scrollable tab bar | Fixed-width tabs | Success criteria PAL-03 explicitly requires "all 6 tabs visible without horizontal scrolling" |
| Radix UI Tabs | Plain div+button | No new dependency needed for simple tab selection |

**Installation:**
```bash
# No new packages to install. All changes use existing dependencies.
```

## Architecture Patterns

### Recommended Project Structure (Files Changed in Phase 18)
```
src/
  stores/
    ui-store.ts               # MODIFY: Add selectedPaletteJurisdiction state + setter + syncFromCanvas flag
  components/
    palette/
      EntityPalette.tsx        # MODIFY: Add JurisdictionTabBar, switch from canvasJurisdiction to selectedPaletteJurisdiction
      PaletteSearch.tsx        # NO CHANGE: Already a controlled input, behavior change is in parent
      PaletteCategory.tsx      # NO CHANGE: Receives items array, renders them
      PaletteItem.tsx          # MODIFY: Optionally show flag icon when in search mode (cross-jurisdiction results)
      JurisdictionTabBar.tsx   # NEW: Shared tab bar component used by both desktop and mobile palettes
    mobile/
      MobilePalette.tsx        # MODIFY: Add JurisdictionTabBar, add search input, switch to selectedPaletteJurisdiction
  lib/
    entity-registry.ts         # MODIFY: Add searchAllEntities() utility function
```

### Pattern 1: Palette-Local Jurisdiction Selection (Independent from Canvas)
**What:** A new `selectedPaletteJurisdiction` field in ui-store allows the palette to show entities from any jurisdiction, independent of `canvasJurisdiction` in graph-store. On initial load and when canvasJurisdiction changes, selectedPaletteJurisdiction syncs to match it.
**When to use:** Always -- this is the core new state for Phase 18.
**Why separate from canvasJurisdiction:** The canvas jurisdiction determines what jurisdiction is assigned to NEW entities when dropped/placed. The palette jurisdiction is purely a UI filter for browsing available entity types. A user may want to browse UK entities while working on an AU-default canvas.
**Example:**
```typescript
// In ui-store.ts -- add to UIState interface and initial state:
interface UIState {
  // ... existing fields ...

  /** Currently selected jurisdiction tab in the palette (desktop + mobile) */
  selectedPaletteJurisdiction: string;
  /** Set the palette jurisdiction filter */
  setSelectedPaletteJurisdiction: (jurisdiction: string) => void;
}

// Initial state:
selectedPaletteJurisdiction: 'AU',  // synced from canvasJurisdiction default

// Setter:
setSelectedPaletteJurisdiction: (jurisdiction) => set({ selectedPaletteJurisdiction: jurisdiction }),
```

### Pattern 2: Cross-Jurisdiction Search Bypass
**What:** When the search query is non-empty, the palette ignores `selectedPaletteJurisdiction` and searches ALL entities across all jurisdictions, showing a flag icon next to each result for disambiguation.
**When to use:** In EntityPalette.tsx and MobilePalette.tsx when the user types in the search input.
**Why:** Users searching for "Limited Partnership" should see LP entities from all jurisdictions, not just the selected tab. The flag icon tells them which jurisdiction each result belongs to.
**Example:**
```typescript
// In entity-registry.ts -- add new utility:
/**
 * Search all entities across all jurisdictions by display name.
 * Returns matches with jurisdiction info for cross-jurisdiction search.
 */
export function searchAllEntities(query: string): EntityTypeConfig[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return Object.values(ENTITY_REGISTRY).filter(
    (e) => e.displayName.toLowerCase().includes(q) ||
           e.shortName.toLowerCase().includes(q)
  );
}

// In EntityPalette.tsx useMemo:
const categoriesWithItems = useMemo(() => {
  const query = debouncedQuery.toLowerCase().trim();
  const jurisdiction = selectedPaletteJurisdiction;

  if (query) {
    // Cross-jurisdiction search: search ALL entities, group by category
    return CATEGORY_CONFIG.map((cat) => {
      const allItems = Object.values(ENTITY_REGISTRY).filter(
        (e) => e.category === cat.category &&
               (e.displayName.toLowerCase().includes(query) ||
                e.shortName.toLowerCase().includes(query))
      );
      return { ...cat, items: allItems };
    });
  }

  // No search: filter by selected jurisdiction
  return CATEGORY_CONFIG.map((cat) => {
    const items = getEntitiesByCategory(jurisdiction, cat.category);
    return { ...cat, items };
  });
}, [debouncedQuery, selectedPaletteJurisdiction]);
```

### Pattern 3: JurisdictionTabBar as Shared Component
**What:** A single `JurisdictionTabBar` component used by both EntityPalette and MobilePalette.
**When to use:** Always -- prevents duplicating tab bar logic/styling.
**Why shared:** Both palettes need identical tab behavior (6 tabs, flag display, active state, click handler). Only the container width differs (256px sidebar vs full mobile width).
**Example:**
```typescript
// JurisdictionTabBar.tsx
import { JURISDICTIONS, type Jurisdiction } from '@/models/jurisdiction';

const JURISDICTION_ORDER: Jurisdiction[] = ['AU', 'UK', 'US', 'HK', 'SG', 'LU'];

interface JurisdictionTabBarProps {
  selected: string;
  onSelect: (jurisdiction: string) => void;
  disabled?: boolean;  // disable during search mode
}

export function JurisdictionTabBar({ selected, onSelect, disabled }: JurisdictionTabBarProps) {
  return (
    <div className="flex border-b border-gray-200 px-2">
      {JURISDICTION_ORDER.map((code) => {
        const config = JURISDICTIONS[code];
        const isActive = selected === code;
        return (
          <button
            key={code}
            onClick={() => onSelect(code)}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium border-b-2 transition-colors ${
              isActive
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
            title={config.name}
            aria-label={`${config.name} entities`}
          >
            <span className="text-sm">{config.flag}</span>
            <span>{code}</span>
          </button>
        );
      })}
    </div>
  );
}
```

### Pattern 4: Search Result Flag Display
**What:** When showing cross-jurisdiction search results, display the jurisdiction flag emoji inline with each entity item.
**When to use:** Only during active search (when query is non-empty).
**Why:** Without the flag, the user cannot tell which "Limited Partnership" they are looking at (AU, UK, US, HK, SG, or LU versions all exist).
**Example:**
```typescript
// In PaletteItem.tsx -- add optional flag display:
interface PaletteItemProps {
  config: EntityTypeConfig;
  showFlag?: boolean;  // true during cross-jurisdiction search
}

// In render, after the icon:
{showFlag && (
  <span className="text-xs flex-shrink-0" title={config.jurisdiction}>
    {JURISDICTIONS[config.jurisdiction as Jurisdiction]?.flag}
  </span>
)}
```

### Anti-Patterns to Avoid
- **Storing selectedPaletteJurisdiction in graph-store:** The palette jurisdiction is a UI concern, not graph data. It should NOT be part of the undo/redo history and should NOT be serialized in snapshots. Put it in ui-store.
- **Making search results only show the selected jurisdiction:** PAL-02 explicitly requires "search across all jurisdictions." The whole point of search is to discover entities regardless of which tab is selected.
- **Horizontal scrolling for tabs:** PAL-03 explicitly forbids this. All 6 tabs must be visible without scrolling.
- **Adding separate search implementations for desktop and mobile:** Both palettes should use the same search logic. Extract it to entity-registry.ts or a shared hook.
- **Removing the canvasJurisdiction dependency when creating entities:** When a user drags/taps an entity from the palette, the created node's `jurisdiction` field should come from the entity config's own `jurisdiction` property (e.g., `uk-ltd` always creates a UK jurisdiction node), NOT from `selectedPaletteJurisdiction` or `canvasJurisdiction`. The entity registry already has the jurisdiction baked in.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tab component library | Complex tab system with panels, keyboard nav, ARIA roles | Simple div + button flex layout | Only 6 static tabs. No complex panel management needed. Buttons with active state styling is sufficient. |
| Search ranking/fuzzy match | Complex search scoring algorithm | Simple `.includes()` string match | 54 total entities with unique names. Simple substring match is adequate. Users type "LP" or "Trust", not fuzzy queries. |
| Flag rendering | SVG flag components or image sprites | Emoji flags from JURISDICTIONS registry | Already in the data model. Renders consistently across modern browsers. Only 6 flags. |
| Responsive tab layout | CSS media queries or useMediaQuery for tabs | `flex-1` on each tab (equal-width, auto-shrink) | `flex-1` distributes available width evenly regardless of container width. Works on both 256px sidebar and full-width mobile. |

**Key insight:** This phase is a UI chrome addition to existing data infrastructure. The entity registry, jurisdiction model, and palette filtering functions already exist from Phase 17. Phase 18 is purely about adding the tab bar UI element and modifying search behavior.

## Common Pitfalls

### Pitfall 1: Desktop Palette Width Cannot Fit Flag + Code Tabs
**What goes wrong:** The desktop EntityPalette sidebar is w-64 (256px). After 16px padding on each side, only 224px is available for tabs. Six tabs with flag emoji + 2-letter code at comfortable sizing need approximately 288px -- they overflow.
**Why it happens:** The sidebar was designed for a search input and entity list, not a tab bar.
**How to avoid:** Use `flex-1` on each tab so they share available width equally. Use compact content: flag emoji + 2-letter code at text-xs with minimal padding. At ~37px per tab, 6 tabs need 222px, which just barely fits in 224px. Alternatively, use flag-only tabs on desktop (28px each = 168px total, fits easily) with full country name as tooltip. Test on the actual 256px sidebar.
**Warning signs:** Tabs wrap to a second line or cause horizontal overflow on the palette sidebar.

### Pitfall 2: Tab State Not Syncing with Canvas Jurisdiction on Load
**What goes wrong:** User opens the editor. Canvas jurisdiction is 'AU' (default). But the palette shows a different jurisdiction's entities because `selectedPaletteJurisdiction` was initialized differently or not synced.
**Why it happens:** `selectedPaletteJurisdiction` is in ui-store, `canvasJurisdiction` is in graph-store. They are separate stores with no automatic sync.
**How to avoid:** Initialize `selectedPaletteJurisdiction` to 'AU' in ui-store (matching graph-store default). When loading a saved structure via `loadSnapshot()`, add a sync effect in the palette components: `useEffect(() => { setSelectedPaletteJurisdiction(canvasJurisdiction); }, [canvasJurisdiction])` -- but only on initial load or canvas jurisdiction change, NOT when the user manually switches tabs.
**Warning signs:** Opening a UK-jurisdiction saved structure shows AU entities in the palette.

### Pitfall 3: Search Not Clearing Tab Highlight / Tab Not Clearing Search
**What goes wrong:** User selects UK tab, then types a search query. The UK tab remains visually highlighted even though search results show all jurisdictions. Or: user clears search, but the tab bar still shows the previous tab's entities.
**Why it happens:** Two independent state variables (search query and selected jurisdiction) both affect what entities are shown but their visual states are not coordinated.
**How to avoid:** When search is active (query non-empty), visually dim or deactivate the tab bar to signal that search overrides the tab filter. When search is cleared, restore the tab bar to its last selected jurisdiction. The tabs should be visually disabled during search, not hidden -- hiding causes layout shift.
**Warning signs:** User sees UK tab highlighted but Australian entities in the list (because search matched them).

### Pitfall 4: MobilePalette Currently Has No Search Input
**What goes wrong:** The MobilePalette bottom sheet currently has no search functionality. It shows a flat list of entities by category. Phase 18 adds cross-jurisdiction search (PAL-02), which requires a search input in the mobile palette too.
**Why it happens:** MobilePalette was built for Phase 12 as a simple "tap to add" list. Search was not in scope.
**How to avoid:** Add a search input to MobilePalette below the tab bar and above the entity list. Reuse the same debounced search pattern from EntityPalette. The bottom sheet content area is scrollable, so the search input + tab bar should be pinned at the top (non-scrolling header area).
**Warning signs:** PAL-02 requires search "in both desktop sidebar and mobile bottom sheet palettes" but mobile has no search field.

### Pitfall 5: Entity Placement Uses Wrong Jurisdiction After Tab Switch
**What goes wrong:** User switches to UK tab, taps "Pty Ltd" (which should not appear, but in search mode might show AU entities). The placed entity gets the wrong jurisdiction because code is reading from selectedPaletteJurisdiction instead of the entity config.
**Why it happens:** Existing placement code in Canvas.tsx and MobilePalette.tsx sets `jurisdiction: canvasJurisdiction` on new nodes. If this is changed to `selectedPaletteJurisdiction`, it will produce incorrect results.
**How to avoid:** Entity placement MUST use the entity config's own `jurisdiction` field, NOT `selectedPaletteJurisdiction`. The entity config already has the correct jurisdiction baked in. When placing `uk-ltd`, use `config.jurisdiction` = 'UK'. When placing `au-pty-ltd`, use `config.jurisdiction` = 'AU'. The `canvasJurisdiction` is already only used as the default for `getEntitiesByCategory()` filtering, which is correct.
**Warning signs:** Placing a UK entity from the UK tab creates a node with jurisdiction 'AU' (the canvas default).

### Pitfall 6: Tab Bar Causes Layout Shift When Palette Collapses
**What goes wrong:** On desktop, when the palette sidebar collapses to 48px (w-12), the tab bar is still rendered, causing overflow or visual glitches.
**Why it happens:** EntityPalette has two modes: collapsed (icon strip) and expanded (search + categories). The tab bar should only appear in expanded mode.
**How to avoid:** Render the tab bar inside the expanded-mode block, between the toggle button header and the search input. In collapsed mode, show only the category icon strip (existing behavior, no change).
**Warning signs:** Collapsed palette shows partial tab text or broken layout.

## Code Examples

### Example 1: ui-store Additions
```typescript
// Source: verified from src/stores/ui-store.ts (current state)
// ADD to UIState interface:
/** Currently selected jurisdiction in the palette tab bar */
selectedPaletteJurisdiction: string;
/** Set the palette jurisdiction filter */
setSelectedPaletteJurisdiction: (jurisdiction: string) => void;

// ADD to initial state:
selectedPaletteJurisdiction: 'AU',

// ADD setter:
setSelectedPaletteJurisdiction: (jurisdiction) => set({ selectedPaletteJurisdiction: jurisdiction }),
```

### Example 2: EntityPalette Layout with Tab Bar
```typescript
// Source: modifying src/components/palette/EntityPalette.tsx
// Current expanded mode structure:
//   <PaletteSearch />
//   <div className="flex-1 overflow-y-auto">categories...</div>

// New expanded mode structure:
//   <JurisdictionTabBar />     ← NEW: between header and search
//   <PaletteSearch />
//   <div className="flex-1 overflow-y-auto">categories...</div>

// The tab bar should be flex-shrink-0 (pinned) above the scrollable area.
```

### Example 3: MobilePalette Layout with Tab Bar + Search
```typescript
// Source: modifying src/components/mobile/MobilePalette.tsx
// Current structure (inside BottomSheet):
//   <h2>Add Entity</h2>
//   <div className="safe-area-bottom">categories...</div>

// New structure:
//   <div className="px-4 pb-2">
//     <h2>Add Entity</h2>
//   </div>
//   <JurisdictionTabBar />          ← NEW: pinned tab bar
//   <PaletteSearch />                ← NEW: search input
//   <div className="flex-1 overflow-y-auto safe-area-bottom">
//     categories with optional flag display...
//   </div>
```

### Example 4: Cross-Jurisdiction Search Results with Flags
```typescript
// When search is active, PaletteItem shows flag:
<div className="flex items-center gap-2 px-3 py-2 ...">
  <div className="flex-shrink-0 w-1 h-6 rounded-full" style={{ backgroundColor: config.color }} />
  {IconComponent && <IconComponent className="w-4 h-4 ..." />}
  {/* Flag shown during cross-jurisdiction search */}
  {showFlag && (
    <span className="text-xs flex-shrink-0">
      {JURISDICTIONS[config.jurisdiction as Jurisdiction]?.flag}
    </span>
  )}
  <span className="text-sm text-gray-700 truncate">{config.displayName}</span>
</div>
```

### Example 5: Search Utility Function
```typescript
// Source: to add to src/lib/entity-registry.ts
/**
 * Search all entities across ALL jurisdictions by display name or short name.
 * Used for cross-jurisdiction palette search.
 */
export function searchAllEntities(query: string): EntityTypeConfig[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return Object.values(ENTITY_REGISTRY).filter(
    (e) => e.displayName.toLowerCase().includes(q) ||
           e.shortName.toLowerCase().includes(q)
  );
}
```

## Width Budget Analysis

This is the critical constraint for PAL-03 (all 6 tabs visible without scrolling).

### Desktop Palette (w-64 = 256px)
| Element | Width |
|---------|-------|
| Sidebar border | 1px |
| Content area | 255px |
| Tab bar padding (px-2) | 8px each side = 16px |
| Available for tabs | 239px |
| Per tab (6 tabs) | 39.8px |

**Content options per tab:**
- Flag emoji only (~16-20px) + padding (8px) = 24-28px each. **Total: 144-168px. FITS with room.**
- 2-letter code only (~14-16px at text-xs) + padding (8px) = 22-24px each. **Total: 132-144px. FITS easily.**
- Flag + code (~34-36px) + padding (8px) = 42-44px each. **Total: 252-264px. TIGHT to OVERFLOW.**
- Flag + code with flex-1 (forced equal): **Works if no minimum width causes wrapping.**

**Recommendation:** Use flag + 2-letter code with `flex-1` on each tab. The text-xs code labels compress well. The flex layout will distribute equally. Test empirically but it should fit at ~40px per tab.

### Mobile (Smallest: iPhone SE 320px)
| Element | Width |
|---------|-------|
| Screen width | 320px |
| BottomSheet insets | 0px (full width) |
| Tab bar padding (px-2) | 16px |
| Available for tabs | 304px |
| Per tab (6 tabs) | 50.7px |

**Flag + code fits easily on all mobile devices.**

### Mobile (Standard: iPhone 14 393px)
| Element | Width |
|---------|-------|
| Available for tabs | 361px |
| Per tab | 60.2px |

**Plenty of room.**

## Key Existing Functions to Leverage

| Function | File | What It Does | How Phase 18 Uses It |
|----------|------|-------------|---------------------|
| `getEntitiesByCategory(jurisdiction, category)` | entity-registry.ts | Returns entities filtered by jurisdiction AND category | Used when tab is selected (no search) |
| `getEntitiesByJurisdiction(jurisdiction)` | entity-registry.ts | Returns all entities for a jurisdiction | Could be used for tab counts if desired |
| `JURISDICTIONS` registry | jurisdiction.ts | Maps code to name/flag/currency | Tab bar renders flags from this |
| `CATEGORY_CONFIG` | entity-registry.ts | Ordered list of categories for palette sections | Continues to drive category sections |
| `paletteSearchQuery` / `setPaletteSearch` | ui-store.ts | Current search text state | Reuse for mobile palette search too |

## State Flow Diagram

```
User Action           → State Change                    → UI Effect
───────────────────────────────────────────────────────────────────
Click jurisdiction tab → selectedPaletteJurisdiction = X → Palette shows X's entities
Type search query      → paletteSearchQuery = "..."      → Palette shows ALL jurisdictions,
                                                           tabs visually dimmed, flags on items
Clear search           → paletteSearchQuery = ""          → Palette restores to selected tab
Load saved structure   → canvasJurisdiction = Y           → selectedPaletteJurisdiction syncs to Y
Drag/tap entity        → (uses config.jurisdiction)       → Node created with entity's own jurisdiction
```

## Entity Counts Per Jurisdiction (for Tab Display)
| Jurisdiction | Flag | Count | Categories Present |
|-------------|------|-------|--------------------|
| AU | flag_au | 11 | company(1), trust(4), partnership(2), vc(2), individual(1), smsf(1) |
| UK | flag_gb | 9 | company(2), trust(2), partnership(3), individual(1), pension(1) |
| US | flag_us | 11 | company(4), trust(2), partnership(4), individual(1) |
| HK | flag_hk | 6 | company(2), partnership(1), fund(2), individual(1) |
| SG | flag_sg | 7 | company(2), trust(1), partnership(2), fund(1), individual(1) |
| LU | flag_lu | 10 | company(2), partnership(2), fund(4), holding(1), individual(1) |
| **Total** | | **54** | |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Palette shows canvasJurisdiction entities only | Palette has independent jurisdiction tabs | Phase 18 | Users can browse any jurisdiction without changing canvas default |
| No search on mobile palette | Search available on both desktop and mobile | Phase 18 | Unified search experience across form factors |
| Search filters within current jurisdiction | Search spans all jurisdictions with flag disambiguation | Phase 18 | Users discover entity types across jurisdictions |

## Open Questions

1. **Should tab bar show entity count badges?**
   - What we know: Each jurisdiction has 6-11 entities. Showing count (e.g., "AU (11)") helps users know what to expect.
   - What's unclear: Whether counts add value or just clutter in tight space.
   - Recommendation: Skip counts. The tabs are already tight at 256px. Users will see the count in each category section header (existing behavior). Entity counts are discoverable without badges.

2. **Should selectedPaletteJurisdiction reset when search clears?**
   - What we know: Two valid UX approaches: (a) keep the last selected tab, (b) reset to canvas jurisdiction.
   - What's unclear: Which feels more natural.
   - Recommendation: Keep the last selected tab. If the user selected UK, searched for "Trust", then cleared the search, they expect to return to the UK tab, not jump back to AU. The tab selection is intentional.

3. **Should the mobile palette search use the same paletteSearchQuery in ui-store?**
   - What we know: Desktop palette uses `paletteSearchQuery` from ui-store. Mobile palette currently has no search.
   - What's unclear: Whether sharing the same state field means opening mobile palette after desktop search shows stale query.
   - Recommendation: Use a separate local state for each palette's search (useState within the component), not the shared ui-store field. The mobile bottom sheet opens/closes independently from the desktop sidebar. Sharing state would create confusing cross-device sync. The desktop palette can keep using ui-store for persistence across collapse/expand; the mobile palette should use local state that clears when the sheet closes.

4. **Tab bar position relative to search input?**
   - What we know: Two layout options: (a) tabs above search, (b) search above tabs.
   - Recommendation: Tabs above search. The tab bar acts as primary navigation (which jurisdiction am I browsing?). Search is secondary (filter within or across). This matches standard UI patterns (tabs > content filter > content list). Also, when search is active and tabs are dimmed, having tabs on top keeps them visible as context.

## Sources

### Primary (HIGH confidence)
- **Direct codebase analysis** -- All source files read and verified:
  - `src/components/palette/EntityPalette.tsx` -- 166 lines, uses canvasJurisdiction from graph-store, debounced search with 150ms delay, categoriesWithItems useMemo
  - `src/components/mobile/MobilePalette.tsx` -- 137 lines, uses canvasJurisdiction from graph-store, NO search input currently, tap-to-place with overlap resolution
  - `src/components/palette/PaletteSearch.tsx` -- 31 lines, controlled search input with lucide Search icon
  - `src/components/palette/PaletteCategory.tsx` -- 63 lines, collapsible section with chevron, hides when items.length === 0
  - `src/components/palette/PaletteItem.tsx` -- 54 lines, draggable entity with ghost preview and hover tooltip
  - `src/lib/entity-registry.ts` -- 947 lines, 54 entity types, CATEGORY_CONFIG (9 categories), getEntitiesByCategory(), getEntitiesByJurisdiction(), getEntityConfig()
  - `src/models/jurisdiction.ts` -- 70 lines, Jurisdiction type (6 codes), JURISDICTIONS registry with flag emojis
  - `src/stores/ui-store.ts` -- 258 lines, paletteSearchQuery + setPaletteSearch, isMobilePaletteOpen, NO selectedPaletteJurisdiction
  - `src/stores/graph-store.ts` -- 265 lines, canvasJurisdiction + setCanvasJurisdiction
  - `src/lib/constants.ts` -- PALETTE_WIDTH_EXPANDED = 256, PALETTE_WIDTH_COLLAPSED = 48
  - `src/components/editor/EditorLayout.tsx` -- Desktop layout renders EntityPalette directly
  - `src/components/editor/MobileEditorLayout.tsx` -- Mobile layout renders MobilePalette as bottom sheet
  - `src/components/mobile/BottomSheet.tsx` -- 287 lines, snap points (collapsed/half/full), drag handle, portal rendering
  - `src/hooks/useDeviceCapabilities.ts` -- isMobile (<768px), isTablet (768-1024px), isTouchDevice
- **Phase 17 research** -- `.planning/phases/17-data-model-entity-registry/17-RESEARCH.md` -- Entity counts verified (AU:11, UK:9, US:11, HK:6, SG:7, LU:10 = 54 total)

### Secondary (MEDIUM confidence)
- **Width calculations** -- Manually computed based on Tailwind classes and standard font metrics. Tab widths are estimates; actual rendering depends on font, browser, and emoji rendering engine. Must be tested empirically.

### Tertiary (LOW confidence)
- None. All findings verified from source code.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, verified from package.json
- Architecture: HIGH -- all patterns verified from direct source analysis; clear state management pattern (ui-store for UI, graph-store for data)
- Tab layout/width: MEDIUM -- width calculations are estimates based on standard metrics, empirical testing required
- Pitfalls: HIGH -- all 6 pitfalls identified from actual code patterns with specific file references and line numbers

**Research date:** 2026-03-07
**Valid until:** 2026-04-07 (stable -- pure UI addition with no dependency on fast-moving libraries)
