# Phase 12: Mobile Entity Creation — Context

## Phase Boundary

**In scope:** FAB trigger (Plus button in existing toolbar), bottom sheet palette, tap-to-add entity placement at viewport center, grid snapping, overlap avoidance.

**Out of scope:** Entity properties editing (Phase 13), connection drawing (Phase 14), long-press context menus (Phase 13), toolbar overflow menu (Phase 15).

## Decisions

### 1. Palette Bottom Sheet Layout

**No search bar.** The mobile palette has 12 entity types across 6 categories — small enough to scan visually without search. Keeps the sheet simpler and avoids virtual keyboard interaction.

**All categories expanded (flat list).** Category headers serve as section dividers but are not collapsible accordions. Every entity type is visible immediately when the sheet opens. Maximum scannability — no extra taps to reveal items.

**List row items (like desktop).** Each entity type is displayed as a row with color bar + icon + entity name, matching the desktop palette visual language. Familiar layout, easy to read, good touch targets.

**Half-height initial snap.** The palette sheet opens at the `half` snap point (~45% visible). The canvas remains partially visible behind the sheet. User can drag to full height if desired but half is the default. Uses the existing BottomSheet component's snap point system.

### 2. Single Placement Flow (Close After Tap)

**Sheet closes immediately after placement.** When the user taps an entity type:
1. Entity is placed on the canvas (viewport center, snapped to grid, overlap-avoided)
2. Bottom sheet closes automatically (springs to collapsed)
3. User sees the entity appear on the canvas with a scale-in animation

To add another entity, the user taps the Plus button in the toolbar again. This is simple and unambiguous — one tap, one entity, sheet gone.

**Scale-in animation on placement.** The placed entity appears with a quick scale-from-zero animation (~150ms). This draws the user's eye to where the entity was placed, providing clear visual confirmation without a toast or dialog.

### 3. Overlap Avoidance — Spiral Search with Minimum Gap

**Spiral search pattern.** When the viewport center is occupied, the algorithm searches outward in a spiral from the center at grid-step increments (right, down, left, up, expanding outward). Finds the nearest open spot in any direction rather than always pushing entities in one direction.

**Minimum 20px gap between bounding boxes.** Two entities "overlap" if their rectangular bounding boxes (node position + dimensions) are less than 20px apart (one grid step). This ensures entities never touch edges and maintains visual breathing room.

**Grid snapping.** All placed entities snap to the nearest grid intersection (20px grid), matching the desktop snap-to-grid behavior already in place.

## Existing Wiring

- `MobileEditorLayout.tsx` Plus button already calls `setMobilePaletteOpen(true)` (wired in Phase 11)
- `ui-store.ts` has `isMobilePaletteOpen` state and `setMobilePaletteOpen` setter (built in Phase 10)
- `BottomSheet.tsx` component accepts `isOpen`, `onClose`, `snapPoints`, `initialSnap`, `children` (built in Phase 10)
- Desktop palette components: `EntityPalette.tsx`, `PaletteCategory.tsx`, `PaletteItem.tsx` — content extraction needed
- `CATEGORY_CONFIG` and `getEntitiesByCategory` in EntityPalette.tsx drive the category/item structure
- `ENTITY_REGISTRY` in `lib/entity-registry.ts` has all entity type configs

## Deferred Ideas

None captured during discussion.
