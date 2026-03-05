# Phase 15: Hover Audit and Toolbar Completion - Research

**Researched:** 2026-03-06
**Domain:** Touch accessibility, CSS hover remediation, mobile toolbar UX, React Flow MiniMap
**Confidence:** HIGH

## Summary

Phase 15 requires three workstreams: (1) completing the mobile bottom toolbar with missing actions and an overflow menu, (2) auditing and remediating all hover-dependent interactions so touch users are not blocked, and (3) adding a MiniMap for tablet users.

The actual codebase audit found **68 hover interactions across 22 files** (close to the roadmap's estimate of 74). Critically, **Tailwind CSS v4.1.18 already wraps `hover:` classes in `@media (hover: hover)`**, meaning Tailwind-generated hover styles will not trigger on touch-only devices. This is a major advantage -- it means most `hover:bg-gray-100` type styles are already safe. The real problems are: (a) CSS hover in `globals.css` that is NOT wrapped in media queries, (b) `group-hover:` patterns that hide content (tooltips, delete buttons) inaccessible on touch, (c) `onMouseEnter`/`onMouseLeave` JS handlers on `RelationshipEdge.tsx` that gate curvature handle visibility, and (d) missing `:active` feedback on many desktop-only components.

The mobile toolbar already has undo, redo, add (palette), connect, and analyze buttons. Missing are: save, templates, auto-layout, export, and a general overflow menu. The desktop `EditorToolbar` has all these features and can serve as the source-of-truth for what the overflow menu needs.

**Primary recommendation:** Split into two plans: Plan 15-01 completes the mobile toolbar with overflow menu and wires remaining actions; Plan 15-02 performs the hover audit, adds `@media (hover: hover)` guards to `globals.css`, converts `group-hover:` tooltips to always-visible or tap-triggered on touch, adds `:active` feedback everywhere, and conditionally renders the MiniMap for tablet.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | 4.1.18 | Utility-first CSS with built-in hover/pointer media queries | Already in project; v4 auto-wraps `hover:` in `@media (hover: hover)` |
| @xyflow/react | 12.10.0 | React Flow canvas with MiniMap component | Already in project; MiniMap already imported in Canvas.tsx |
| Zustand | (existing) | UI state management | Already manages mobileTool, toolbar state |
| lucide-react | (existing) | Icon library for toolbar buttons | Already used throughout |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A | - | No new libraries needed | All work uses existing stack |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom overflow menu | @headlessui/react Menu | Adds dependency for one component; hand-rolled is fine for a simple dropdown |
| CSS-only tooltip replacement | @radix-ui/react-tooltip | Adds dependency; native `title` attributes + always-visible text sufficient for touch |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── editor/
│   │   └── MobileEditorLayout.tsx    # Toolbar completion (Plan 15-01)
│   ├── mobile/
│   │   └── MobileOverflowMenu.tsx    # NEW: overflow menu component
│   ├── canvas/
│   │   ├── Canvas.tsx                # MiniMap conditional for tablet
│   │   ├── edges/RelationshipEdge.tsx # Hover handler remediation
│   │   └── nodes/EntityNode.tsx      # Already touch-aware
│   ├── palette/
│   │   ├── PaletteItem.tsx           # group-hover tooltip fix
│   │   └── EntityPalette.tsx         # group-hover tooltip fix
│   ├── toolbar/
│   │   └── EditorToolbar.tsx         # Desktop hover:bg audit
│   └── ...22 files with hover patterns
├── app/
│   └── globals.css                   # CSS :hover -> @media (hover: hover) wrapping
└── hooks/
    └── useDeviceCapabilities.ts      # Already provides isTouchDevice, isTablet
```

### Pattern 1: Tailwind v4 Hover Safety
**What:** Tailwind CSS v4 automatically generates `hover:` utilities inside `@media (hover: hover)` blocks. This means `hover:bg-gray-100` will NOT apply on touch-only devices -- it only activates on devices whose primary pointer supports hovering.
**When to use:** All Tailwind hover classes in .tsx files. These are already safe and do NOT need remediation.
**Confidence:** HIGH (verified: Tailwind v4.1.18 installed, official docs confirm this behavior)

**Impact on audit:** Of the 68 hover occurrences, approximately 55 are Tailwind `hover:` classes in .tsx files. These are already safe. The remaining ~13 are CSS `:hover` in globals.css (5) and `group-hover:` patterns that hide/show content (5), plus JS `onMouseEnter`/`onMouseLeave` handlers (6 in RelationshipEdge.tsx).

### Pattern 2: CSS :hover Wrapping with @media (hover: hover)
**What:** Raw CSS `:hover` rules in `globals.css` are NOT wrapped by Tailwind's v4 media query logic. They apply on all devices, including touch.
**When to use:** Wrap globals.css `:hover` rules in `@media (hover: hover) { }` to prevent touch activation.

```css
/* BEFORE (problematic on touch) */
.entity-node:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* AFTER (only on hover-capable devices) */
@media (hover: hover) {
  .entity-node:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
```

### Pattern 3: group-hover Tooltip Replacement on Touch
**What:** `hidden group-hover:block` tooltips are invisible on touch devices. Replace with always-visible alternatives or tap-triggered.
**When to use:** PaletteItem.tsx and EntityPalette.tsx collapsed mode tooltips. These are desktop-only sidebar components (not shown on mobile at all), so remediation is lower priority. For components that DO appear on touch (dashboard delete button), the codebase already handles this with `isTouchDevice ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'`.

```tsx
// Pattern already used in dashboard/page.tsx line 177:
className={`${isTouchDevice ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
```

### Pattern 4: :active Touch Feedback
**What:** Add `active:` Tailwind classes to provide visual press feedback on touch.
**When to use:** Every interactive button/link that lacks `:active` feedback. The mobile components (MobileEditorLayout, MobileContextMenu, MobileAnalysisOverlay) already use `active:bg-gray-100`. Desktop components do not.

```tsx
// Add active: alongside hover: for touch feedback
className="p-1.5 rounded hover:bg-gray-100 active:bg-gray-200 text-gray-600"
```

### Pattern 5: Tablet MiniMap Conditional Rendering
**What:** Show MiniMap on tablet, hide on phone. Currently hidden on all mobile.
**When to use:** Canvas.tsx currently renders `{!isMobile && <MiniMap ... />}`. Change to `{!isMobile && <MiniMap ... />}` is already correct for tablet since isTablet is NOT isMobile. But verify: `isMobile` is `max-width: 767px` and isTablet is `768px-1024px`. So tablet already gets the MiniMap! This is already correct in current code.

**Wait -- re-checking Canvas.tsx line 612:** `{!isMobile && <MiniMap ... />}` -- this means MiniMap shows on tablet (768px+) and desktop. The requirement MPOL-03 says "User on tablet can see a MiniMap for navigating large structures." This is ALREADY SATISFIED by the current code, since `!isMobile` includes tablet. No changes needed for basic MiniMap visibility.

However, the MiniMap may need touch-optimized styling for tablet -- the current minimap uses `pannable zoomable` props, which should work with touch input. Verification on real device is needed.

### Pattern 6: Mobile Overflow Menu
**What:** A "..." or ellipsis button in the mobile bottom toolbar that opens a popover/dropdown with additional actions: Save, Templates, Auto-Layout, Export.
**When to use:** MobileEditorLayout.tsx toolbar.

```tsx
// Overflow menu state
const [isOverflowOpen, setOverflowOpen] = useState(false);

// In toolbar:
<button onClick={() => setOverflowOpen(!isOverflowOpen)} aria-label="More actions">
  <MoreHorizontal className="w-5 h-5" />
</button>

// Overflow popover (positioned above the toolbar)
{isOverflowOpen && (
  <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg ...">
    <button onClick={onSave}>Save</button>
    <button onClick={onShowTemplates}>Templates</button>
    <button onClick={onAutoLayout}>Auto-Layout</button>
    <button onClick={onExport}>Export</button>
  </div>
)}
```

### Anti-Patterns to Avoid
- **Don't remove hover styles entirely:** Desktop users still benefit from hover feedback. Use `@media (hover: hover)` to scope, not delete.
- **Don't use `:hover` in globals.css without media query wrapping:** This will trigger on touch tap.
- **Don't add complex tooltip components:** Native `title` attributes work fine; the palette sidebar tooltips are desktop-only components anyway.
- **Don't change onMouseEnter/onMouseLeave to touch events on RelationshipEdge:** Instead, make the curvature handle always visible when edge is selected (selection is the touch equivalent of hover).
- **Don't over-engineer the overflow menu:** A simple positioned div with click-outside close is sufficient. No need for a portal or headless UI.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Media query detection | Custom JS media query checker | `useDeviceCapabilities` hook (existing) | Already provides `isTouchDevice`, `isTablet`, `isMobile` reactively |
| Overflow menu positioning | Complex positioning system | CSS `absolute bottom-full` on parent | Simple and reliable for bottom-toolbar menus |
| MiniMap component | Custom minimap | `@xyflow/react` `<MiniMap>` (existing) | Already imported and configured in Canvas.tsx |

**Key insight:** This phase is primarily a CSS and small-component audit phase. There are no complex new features to build -- just ensuring existing features work on touch.

## Common Pitfalls

### Pitfall 1: Confusing Tailwind v4 hover: safety with CSS :hover
**What goes wrong:** Developer assumes all hover patterns are safe because Tailwind v4 wraps `hover:` in `@media (hover: hover)`. But raw CSS `:hover` in globals.css is NOT wrapped.
**Why it happens:** Tailwind v4's hover behavior change only applies to Tailwind-generated utilities, not hand-written CSS.
**How to avoid:** Explicitly audit globals.css `:hover` rules. There are exactly 5 `:hover` blocks in globals.css that need wrapping.
**Warning signs:** Entity node hover shadow appearing on touch tap; edge updater showing on touch hover.

### Pitfall 2: group-hover: hiding essential content on touch
**What goes wrong:** `hidden group-hover:block` makes content permanently invisible on touch devices.
**Why it happens:** Tailwind v4 wraps `group-hover:` in `@media (hover: hover)` just like `hover:`. The element stays hidden on touch.
**How to avoid:** For critical functionality hidden behind group-hover (delete button in dashboard), use the existing pattern: `isTouchDevice ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'`. For desktop-only components (palette tooltips), no action needed since those components don't render on mobile.
**Warning signs:** Dashboard delete button invisible on iPad; palette tooltips inaccessible on tablet.

### Pitfall 3: RelationshipEdge hover-gated curvature handle
**What goes wrong:** The curvature drag handle on edges is only visible when `hovered` (via `onMouseEnter`/`onMouseLeave`) or `selected`. On touch, there is no hover -- the handle only appears when the edge is tapped to select.
**Why it happens:** The component was designed for mouse interaction where hovering an edge reveals controls.
**How to avoid:** On touch devices, make the handle visible whenever the edge is `selected`. This is already partially working -- `showHandle = !isStraight && (selected || hovered)` -- since touch users tap to select. Verify this is sufficient. Optionally, always show the handle on touch when an edge is selected (it does currently), so no code change may be needed.
**Warning signs:** User on touch device can't find the curvature adjustment; handle doesn't appear.

### Pitfall 4: Overflow menu click-outside on touch
**What goes wrong:** `mousedown` listener for click-outside doesn't fire reliably on touch.
**Why it happens:** Touch events (`touchstart`) fire before `mousedown`. The existing dropdown pattern uses `mousedown`.
**How to avoid:** Use `pointerdown` instead of `mousedown` for click-outside detection. This handles both mouse and touch. Or add both `mousedown` and `touchstart` listeners.
**Warning signs:** Overflow menu doesn't close when tapping outside on mobile.

### Pitfall 5: Missing Save/Templates/AutoLayout props in MobileEditorLayout
**What goes wrong:** MobileEditorLayout currently receives `onSave` but doesn't render it in the toolbar. The overflow menu needs `onAutoLayout`, `onShowTemplates`, `onExport` -- but these are not currently passed as props.
**Why it happens:** MobileEditorLayout was scaffolded with minimal props for Phase 11 and expanded incrementally.
**How to avoid:** When adding the overflow menu, thread all needed props from EditorLayout.tsx down to MobileEditorLayout. Check EditorLayout.tsx line 263-276 for the current props passed to MobileEditorLayout.
**Warning signs:** Overflow menu buttons that don't do anything because handlers aren't connected.

## Code Examples

### Example 1: globals.css hover wrapping
```css
/* Source: Current codebase analysis */

/* Wrap entity node hover shadows */
@media (hover: hover) {
  .entity-node:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06);
  }

  .entity-node--triangle:hover,
  .entity-node--diamond:hover,
  .entity-node--hexagon:hover,
  .entity-node--shield:hover {
    box-shadow: none;
    filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.2));
  }

  .react-flow__edge:hover .react-flow__edgeupdater {
    fill: #3B82F6;
    stroke: white;
    stroke-width: 1.5;
  }

  .dark .react-flow__controls button:hover {
    background: #374151;
  }
}
```

### Example 2: Mobile overflow menu component
```tsx
// Source: Based on existing MobileEditorLayout patterns

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Save, LayoutGrid, Download, BookOpen } from 'lucide-react';

interface MobileOverflowMenuProps {
  onSave?: () => void;
  isSaving?: boolean;
  canSave?: boolean;
  onAutoLayout: () => void;
  onShowTemplates: () => void;
  onExportPng?: () => void;
}

export function MobileOverflowMenu({
  onSave, isSaving, canSave,
  onAutoLayout, onShowTemplates, onExportPng,
}: MobileOverflowMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on tap outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-full text-gray-600 active:bg-gray-100"
        aria-label="More actions"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 min-w-[180px]
                        bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {onSave && (
            <button
              onClick={() => { onSave(); setIsOpen(false); }}
              disabled={!canSave || isSaving}
              className="w-full px-4 py-3 text-sm text-left active:bg-gray-100
                         flex items-center gap-3 disabled:opacity-30"
            >
              <Save className="w-4 h-4" /> Save
            </button>
          )}
          <button
            onClick={() => { onShowTemplates(); setIsOpen(false); }}
            className="w-full px-4 py-3 text-sm text-left active:bg-gray-100
                       flex items-center gap-3"
          >
            <BookOpen className="w-4 h-4" /> Templates
          </button>
          <button
            onClick={() => { onAutoLayout(); setIsOpen(false); }}
            className="w-full px-4 py-3 text-sm text-left active:bg-gray-100
                       flex items-center gap-3"
          >
            <LayoutGrid className="w-4 h-4" /> Auto-Layout
          </button>
          {onExportPng && (
            <button
              onClick={() => { onExportPng(); setIsOpen(false); }}
              className="w-full px-4 py-3 text-sm text-left active:bg-gray-100
                         flex items-center gap-3"
            >
              <Download className="w-4 h-4" /> Export PNG
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

### Example 3: Adding :active feedback to EditorToolbar buttons
```tsx
// Source: Based on existing EditorToolbar ToolbarButton pattern

// BEFORE:
className={`p-1.5 rounded transition-colors ${disabled
  ? 'text-gray-300 cursor-not-allowed'
  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
}`}

// AFTER (add active: for touch feedback):
className={`p-1.5 rounded transition-colors ${disabled
  ? 'text-gray-300 cursor-not-allowed'
  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
}`}
```

### Example 4: Tablet MiniMap verification
```tsx
// Source: Current Canvas.tsx lines 611-622
// Already renders MiniMap when !isMobile (includes tablet + desktop)

{!isMobile && <Controls />}
{!isMobile && (
  <MiniMap
    pannable
    zoomable
    nodeStrokeWidth={2}
    nodeColor="#e5e7eb"
    maskColor="rgba(243, 244, 246, 0.7)"
    style={{ width: 160, height: 100 }}
    position="bottom-left"
  />
)}
// Tablet (768px-1024px) already gets MiniMap -- MPOL-03 is satisfied
```

## Complete Hover Audit Results

### Files with hover patterns (22 files, 68 occurrences)

#### Category A: Tailwind `hover:` in .tsx -- SAFE (Tailwind v4 auto-wraps)
These are benign because Tailwind v4 generates them inside `@media (hover: hover)`. They still provide good UX on desktop. No changes needed for touch safety, but `:active` feedback should be added where missing.

| File | Count | Pattern | Needs `:active`? |
|------|-------|---------|-------------------|
| `EditorToolbar.tsx` | 19 | `hover:bg-gray-100`, `hover:text-gray-900`, etc. | YES -- ToolbarButton, dropdown items |
| `dashboard/page.tsx` | 7 | `hover:bg-blue-700`, `hover:shadow-md`, `hover:bg-red-700` | PARTIAL -- buttons OK, card shadow nice-to-have |
| `CanvasContextMenu.tsx` | 3 | `hover:bg-gray-100` on menu items | YES -- needs `active:bg-gray-200` |
| `EdgeContextMenu.tsx` | 4 | `hover:bg-gray-100` on menu items | YES -- needs `active:bg-gray-200` |
| `ConnectionTypePickerModal.tsx` | 3 | `hover:bg-gray-50`, `hover:border-gray-200` | YES |
| `TemplatePickerModal.tsx` | 3 | `hover:bg-gray-100`, `hover:border-blue-400`, `hover:shadow-md` | YES |
| `page.tsx` (home) | 2 | `hover:bg-blue-700`, `hover:bg-gray-50` | NO (landing page, not editor) |
| `editor/[id]/page.tsx` | 1 | `hover:text-blue-700` | NO (link text) |
| `EditorLayout.tsx` | 3 | `hover:bg-blue-700`, `hover:bg-blue-100`, `hover:bg-red-700` | PARTIAL |
| `MobileEditorLayout.tsx` | 2 | `hover:bg-blue-700`, `hover:bg-blue-100` (draft banner only) | NO (draft banner is rarely seen) |
| `EntityPalette.tsx` | 2 | `hover:bg-gray-100` on toggle + category items | Desktop-only component |
| `PaletteCategory.tsx` | 1 | `hover:bg-gray-50` | Desktop-only component |
| `PaletteItem.tsx` | 1 | `hover:bg-gray-100` | Desktop-only component |
| `EntitySearchBar.tsx` | 3 | `hover:bg-gray-100` on nav buttons | YES |
| `ShortcutLegend.tsx` | 1 | `hover:bg-gray-100` on close button | Desktop-only (keyboard shortcuts) |
| `ConnectionPropertiesPanel.tsx` | 2 | `hover:text-gray-700` on tabs | In properties panel (desktop sidebar) |
| `IdentitySection.tsx` | 1 | `hover:bg-gray-50` on section header | In properties panel |
| `RegistrationSection.tsx` | 1 | `hover:bg-gray-50` on section header | In properties panel |
| `TaxStatusSection.tsx` | 1 | `hover:bg-gray-50` on section header | In properties panel |
| `NotesSection.tsx` | 2 | `hover:bg-gray-50`, `hover:text-gray-700` | In properties panel |
| `ErrorSummary.tsx` | 1 | `hover:underline` on error links | In properties panel |

#### Category B: CSS `:hover` in globals.css -- NEEDS WRAPPING
These are raw CSS rules NOT processed by Tailwind. They fire on touch.

| Rule | Line | Impact | Fix |
|------|------|--------|-----|
| `.entity-node:hover` | 227-228 | Shadow on touch tap | Wrap in `@media (hover: hover)` |
| `.entity-node--triangle:hover` etc. | 232-238 | Drop-shadow on touch tap | Wrap in `@media (hover: hover)` |
| `.react-flow__edge:hover .react-flow__edgeupdater` | 61-65 | Edge updater shows on touch | Wrap in `@media (hover: hover)` |
| `.dark .react-flow__controls button:hover` | 284-286 | Controls hover in dark mode | Wrap in `@media (hover: hover)` |

#### Category C: `group-hover:` patterns -- CONDITIONAL FIX
| File | Pattern | Touch Impact | Fix |
|------|---------|--------------|-----|
| `PaletteItem.tsx:46` | `hidden group-hover:block` (tooltip) | Hidden on touch | Desktop-only component -- NO FIX needed |
| `EntityPalette.tsx:122` | `hidden group-hover:block` (collapsed tooltip) | Hidden on touch | Desktop-only component -- NO FIX needed |
| `ConnectionTypePickerModal.tsx:61` | `group-hover:text-gray-600` | Icon color stays gray-400 | Minor cosmetic -- NO FIX needed |
| `TemplatePickerModal.tsx:74` | `group-hover:text-blue-700` | Title stays gray-900 | Minor cosmetic -- NO FIX needed |
| `dashboard/page.tsx:177` | `group-hover:opacity-100` (delete btn) | ALREADY FIXED with isTouchDevice conditional | No action needed |

#### Category D: JS Mouse handlers -- NEEDS REVIEW
| File | Handler | Impact | Fix |
|------|---------|--------|-----|
| `RelationshipEdge.tsx:276-277` | `onMouseEnter`/`onMouseLeave` (hit area) | Curvature handle invisible on touch unless selected | OK -- handle shows on selection; touch selects by tapping |
| `RelationshipEdge.tsx:296-297` | `onMouseEnter`/`onMouseLeave` (label) | Same as above | OK -- same logic |
| `RelationshipEdge.tsx:317-318` | `onMouseEnter`/`onMouseLeave` (handle container) | Same as above | OK -- same logic |

**Assessment:** The `showHandle` logic (`selected || hovered`) means touch users see the handle when they tap-select an edge. This is sufficient -- no code changes needed.

#### Category E: Native `title` attributes (tooltips) -- LOW PRIORITY
26 occurrences of `title="..."` across EditorToolbar, EntitySearchBar, EntityPalette, and other components. These show on long-press on mobile browsers. Not a blocking issue -- they're supplementary information. No remediation needed.

### Summary: What Actually Needs Changing

| Category | Count | Action |
|----------|-------|--------|
| globals.css `:hover` wrapping | 4 rules | Wrap in `@media (hover: hover)` |
| `:active` feedback addition | ~15 components | Add `active:bg-gray-200` or similar alongside `hover:` |
| Mobile toolbar overflow menu | 1 new component | Create MobileOverflowMenu, wire to EditorLayout |
| Mobile toolbar prop threading | 1 file | Add save/templates/layout/export props to MobileEditorLayout |
| Tablet MiniMap | 0 changes | Already working (`!isMobile` includes tablet) |
| RelationshipEdge hover | 0 changes | Selection-gating already works for touch |
| group-hover tooltips | 0 changes | Desktop-only components or already fixed |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 `hover:` fires on touch tap | Tailwind v4 `hover:` only on `@media (hover: hover)` | Tailwind v4 (2024) | Most hover issues are already resolved for Tailwind classes |
| `@media (pointer: coarse)` as primary guard | `@media (hover: hover)` is the correct semantic guard | CSS Interaction Media Queries Level 5 | Use hover media feature for hover behavior, pointer for sizing |
| `mousedown` for click-outside | `pointerdown` for unified mouse+touch | PointerEvents now universal | Better cross-device compatibility |

**Deprecated/outdated:**
- Using `@media (pointer: coarse)` to guard hover styles is semantically incorrect. Use `@media (hover: hover)` for hover behavior. `(pointer: coarse)` is correct for sizing targets.
- Using `touchstart` event separately from `mousedown` -- use `pointerdown` which unifies both.

## Open Questions

1. **RelationshipEdge curvature handle UX on touch**
   - What we know: Handle shows when edge is selected (tapped). Edge selection requires tapping the edge path.
   - What's unclear: Is tapping a 24px-wide edge path reliable enough on touch? The existing `strokeWidth={24}` hit area might be sufficient.
   - Recommendation: Test on real device. If tapping edge is unreliable, consider making curvature handle always visible on touch (add `isTouchDevice` check to `showHandle` logic).

2. **Export options in overflow menu**
   - What we know: Desktop has PNG/SVG/PDF export. Mobile download behavior varies by browser.
   - What's unclear: Does `html-to-image` + download work on iOS Safari?
   - Recommendation: Include Export PNG in overflow menu. If real-device testing (Phase 16) shows issues, can add share sheet fallback then.

3. **Overflow menu vs full-screen action sheet**
   - What we know: Requirement says "overflow menu." Could be a small dropdown or a full-screen action sheet.
   - What's unclear: Which UX pattern is better on small phones.
   - Recommendation: Start with positioned dropdown (simpler). If Phase 16 testing shows usability issues on small phones, refactor to BottomSheet action sheet.

## Sources

### Primary (HIGH confidence)
- Codebase audit: 22 files, 68 hover occurrences, manually categorized (2026-03-06)
- [Tailwind CSS v4 Hover/Focus/Active States docs](https://tailwindcss.com/docs/hover-focus-and-other-states) - `hover:` wraps in `@media (hover: hover)`, `pointer-coarse`/`pointer-fine` variants built-in
- [React Flow MiniMap API Reference](https://reactflow.dev/api-reference/components/minimap) - Props, pannable, zoomable, nodeColor function
- @xyflow/react 12.10.0 installed, MiniMap already in Canvas.tsx

### Secondary (MEDIUM confidence)
- [Handling hover states on mobile in Tailwind CSS 4](https://bordermedia.org/blog/tailwind-css-4-hover-on-touch-device) - Confirms v4 behavior change
- [Smashing Magazine: Guide to Hover and Pointer Media Queries](https://www.smashingmagazine.com/2022/03/guide-hover-pointer-media-queries/) - `@media (hover: hover)` vs `(pointer: fine)` semantics
- [MDN @media/pointer](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/pointer) - coarse/fine/none definitions

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries, all existing tools verified
- Architecture: HIGH - Direct codebase audit with line-level precision
- Pitfalls: HIGH - Based on actual code patterns found in audit, not hypothetical
- Tailwind v4 hover behavior: HIGH - Verified version 4.1.18 installed, official docs confirm
- MiniMap tablet rendering: MEDIUM - Logic analysis says it works (`!isMobile` includes tablet), but needs real-device verification

**Research date:** 2026-03-06
**Valid until:** 2026-04-06 (stable -- no fast-moving dependencies)
