# Phase 13: Mobile Properties Editing — Context

## Phase Boundary

**In scope:** Entity properties bottom sheet, connection properties bottom sheet, long-press context menu, AI analysis mobile overlay, connection type picker adaptation, keyboard-aware sheet behavior.

**Out of scope:** Connection drawing flow (Phase 14), toolbar overflow menu (Phase 15), hover audit (Phase 15). Template picker and delete confirmation dialogs already work on mobile (Phase 11) — no changes needed beyond ensuring touch-friendly button sizes.

## Decisions

### 1. Properties Sheet Trigger and Behavior

**Two-step open: tap selected entity.** First tap selects the entity (shows selection ring). Second tap on the *same* already-selected entity opens the properties bottom sheet. This prevents accidental properties opening when the user just wants to select or move.

**Sheet updates in-place on entity switch.** While the properties sheet is open, tapping a different entity selects the new entity and the sheet updates to show the new entity's properties. No close-reopen cycle — smooth transition for comparing entities.

**Same pattern for connections.** First tap selects the connection (highlights it). Second tap on the same selected connection opens connection properties in a bottom sheet.

**Half-height initial snap, auto-expand on keyboard.** The properties sheet opens at the `half` snap point (~45% visible). When a text input is focused and the virtual keyboard appears, the sheet expands to `full` to keep form fields visible above the keyboard. When the keyboard dismisses, the sheet returns to `half`.

### 2. Long-Press Context Menu

**Floating action list near press location.** A compact vertical list of action buttons appears near the long-press point, positioned to avoid going offscreen (above the finger if near bottom, below if near top). Styled like iOS context menus — floating, with subtle shadow, rounded corners.

**Four actions: Delete, Copy, Connect, Properties.** Matching the roadmap spec. "Connect" starts the tap-to-connect flow with this entity as source (wired for Phase 14). "Properties" opens the properties bottom sheet.

**Auto-select on long-press.** Long-pressing an entity selects it AND shows the menu in one gesture. If the entity was already selected, the menu still appears. This means every long-press results in: entity selected + menu visible.

**Dismiss: tap outside or tap action.** Tapping anywhere outside the menu closes it without executing any action. Tapping an action executes it and closes the menu. No scrim overlay — the canvas remains visible.

### 3. AI Analysis Mobile Layout

**Full-screen overlay.** When triggered, a full-screen sheet slides up covering the canvas entirely. Has a close/back button at the top left and the analysis title. Dedicated reading experience for the streaming analysis content.

**Analysis is modal.** While the analysis overlay is open, the canvas is not interactive. The user must close/dismiss the overlay to return to editing. This simplifies state management — no need to handle canvas changes while analysis is visible.

**Dedicated toolbar button.** An "Analyze" icon button (e.g., Sparkles or Brain) is added directly to the floating bottom toolbar alongside the existing undo/redo/add/connect buttons. This makes analysis discoverable and one-tap accessible.

**PDF export included.** The mobile analysis overlay includes the same "Export PDF" button as the desktop analysis panel, using the same `@react-pdf/renderer` pipeline. Button appears at the bottom of the analysis content after streaming completes.

### 4. Modal Adaptations

**Connection type picker → bottom sheet.** On mobile, the connection type picker renders as a small bottom sheet (not the desktop centered modal). Shows the 4 connection types as tappable rows with colored icons and one-line descriptions. Half-height snap.

**Delete confirmation → keep centered dialog.** The existing centered confirmation dialog already works on mobile (Phase 11 made it render on all screen sizes). Only change: ensure Cancel and Delete buttons meet 44px minimum touch target height.

**Template picker → keep centered modal.** The existing template picker modal already renders on all screen sizes (Phase 11 fragment wrapper). No changes needed.

## Deferred Ideas

None — discussion stayed within phase scope.
