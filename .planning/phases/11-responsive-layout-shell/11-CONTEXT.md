# Phase 11: Responsive Layout Shell - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the editor accessible on all screen sizes. Remove the "Larger Screen Required" mobile gate, deliver three distinct layouts (phone full-screen canvas, tablet two-column, desktop three-column unchanged), enable basic touch interactions on the React Flow canvas, and make the dashboard responsive. This phase does NOT add mobile entity creation, properties editing, or connection drawing — those are Phases 12-14.

</domain>

<decisions>
## Implementation Decisions

### Phone Layout
- **Canvas**: Full-screen edge-to-edge canvas with no fixed chrome — maximum canvas real estate
- **Toolbar**: Floating bottom toolbar (thumb-reachable), contains primary actions (undo, redo, add, connect)
- **Shell slots**: Build mount points and state wiring for the palette and properties bottom sheets now, so Phase 12-13 just drop in content without re-architecting
- **Structure name**: Claude's Discretion — decide whether to show/edit the name in a minimal floating header or defer to a menu

### Tablet Layout
- **Sidebar**: Entity palette visible on the left by default (two-column: palette + canvas)
- **Sidebar width**: Claude's Discretion — pick what fits well (existing ~240px or a narrower compact variant)
- **Properties panel**: Right-side overlay when entity is selected (same as current tablet behavior in EditorLayout)
- **Landscape tablet**: Landscape orientation (1024px+) gets the full desktop three-column layout. Only portrait tablet uses the two-column layout.

### Touch Canvas Behavior
- **Default drag gesture**: Context-sensitive — touching an entity starts a move, touching empty canvas pans. No mode switching required for basic interactions.
- **Resize handles**: Hidden on touch devices. Entities are fixed-size on mobile/tablet. Removes a fiddly interaction.
- **Pinch-to-zoom**: Claude's Discretion — decide whether pinch works only on empty canvas or everywhere
- **Touch targets**: Enlarge hit areas to 44px minimum on touch devices. Visual node size stays the same; invisible padding extends the tap area.

### Dashboard Responsiveness
- **Card layout on phone**: Single column, full-width cards — one card per row for maximum thumbnail visibility
- **New Structure CTA**: Claude's Discretion — full-width button at top or FAB, whichever fits the mobile dashboard best
- **Delete flow**: Same button/menu-based delete as desktop — no swipe-to-delete in this phase
- **Navigation header**: Claude's Discretion — app-style header or responsive reflow of existing layout

### Desktop Layout
- **No changes** — the existing three-column layout (palette, canvas, properties) must be completely unchanged

</decisions>

<specifics>
## Specific Ideas

- The bottom toolbar on phone should feel like a map/drawing app toolbar (Google Maps, Figma mobile) — floating, minimal, thumb-reachable
- Context-sensitive drag (entity=move, empty=pan) matches how most touch canvas apps work — Miro, FigJam, etc.
- Shell slots for bottom sheets mean the MobileEditorLayout needs to render BottomSheet mount points even though they'll be empty until Phase 12-13

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-responsive-layout-shell*
*Context gathered: 2026-03-04*
