# Roadmap: Tax Structuring Tool

## Overview

This roadmap delivers a web application where tax lawyers can visually design multi-entity tax structures on a canvas, wire them with debt/equity/trust relationships, and get AI-powered tax analysis — all in the browser. v1.0 delivered the core desktop product. v1.1 extended full editing to phone and tablet. v2.0 expanded the tool from Australia-only to six jurisdictions (AU, UK, US, HK, SG, LU) with cross-border connection metadata and multi-jurisdiction validation.

## Milestones

- ✅ **v1.0 Core Product** — Phases 1-7 (shipped 2026-02-18)
- ✅ **v1.1 Mobile Experience** — Phases 10-16 (shipped 2026-03-06)
- ✅ **v2.0 Multi-Jurisdiction** — Phases 17-21 (shipped 2026-03-08)
- Deferred — Phases 8-9 (sharing, customization)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

<details>
<summary>✅ v1.0 Core Product (Phases 1-7) — SHIPPED 2026-02-18</summary>

- [x] **Phase 1: Canvas Foundation** — Working grid canvas with pan, zoom, snap-to-grid, and jurisdiction-aware data model
- [x] **Phase 2: Entity System** — Full Australian entity palette with drag-drop placement and properties editing
- [x] **Phase 3: Canvas Interactions** — Professional editing operations: select, move, resize, delete, undo/redo, copy/paste, shortcuts
- [x] **Phase 4: Connection System** — Debt, equity, trust, and agreement connections with labels and properties
- [x] **Phase 5: Smart Canvas** — Validation warnings, connection filtering, auto-layout, and template structures
- [x] **Phase 6: AI Analysis Engine** — Gemini-powered tax analysis with streaming, formation/transaction steps, and PDF export
- [x] **Phase 7: Local Persistence** — Save/load structures to browser localStorage, auto-save, and structure dashboard

</details>

**Deferred (from v1.0):**

- [ ] **Phase 8: Sharing** — Share links with view-only and editable modes
- [ ] **Phase 9: Entity Customization** — Per-entity-type shape, color, and icon customization

<details>
<summary>✅ v1.1 Mobile Experience (Phases 10-16) — SHIPPED 2026-03-06</summary>

- [x] **Phase 10: Mobile Foundation** — Reusable hooks, BottomSheet primitive, and Zustand mobile state
- [x] **Phase 11: Responsive Layout Shell** — Remove mobile gate, full-screen canvas on phone, tablet layout, React Flow touch props
- [x] **Phase 12: Mobile Entity Creation** — FAB, bottom sheet palette, tap-to-add entity placement
- [x] **Phase 13: Mobile Properties Editing** — Properties bottom sheet, connection properties sheet, long-press context menu
- [x] **Phase 14: Mobile Connection Drawing** — Connect mode toolbar toggle, tap-source-then-target flow, enlarged handles
- [x] **Phase 15: Hover Audit and Toolbar Completion** — 74 hover interactions remediated, mobile toolbar with overflow menu, tablet MiniMap
- [x] **Phase 16: Performance and Real-Device Testing** — Viewport culling, transition optimization, safe area insets, device test matrix

</details>

<details>
<summary>✅ v2.0 Multi-Jurisdiction (Phases 17-21) — SHIPPED 2026-03-08</summary>

- [x] **Phase 17: Data Model and Entity Registry** — Expand jurisdiction types, entity categories, and ~45 new entity types across UK, US, HK, SG, LU
- [x] **Phase 18: Jurisdiction Palette** — Jurisdiction tab bar in desktop and mobile palettes with cross-jurisdiction search
- [x] **Phase 19: Properties and Field Validation** — Per-jurisdiction registration fields, tax status fields, and format validation
- [x] **Phase 20: Cross-Border Connections** — WHT rate, treaty, transfer pricing, and currency fields on cross-border edges with visual differentiation
- [x] **Phase 21: Validation and Canvas Polish** — Jurisdiction-specific structural validation, cross-jurisdiction false-positive prevention, and jurisdiction legend

</details>

## Progress

**Execution Order:**
v1.0: 1 > 2 > 3 > 4 > 5 > 6 > 7 (complete)
v1.1: 10 > 11 > 12 > 13 > 14 > 15 > 16 (complete)
v2.0: 17 > 18 > 19 > 20 > 21 (complete)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Canvas Foundation | v1.0 | 4/4 | Complete | 2026-02-14 |
| 2. Entity System | v1.0 | 2/2 | Complete | 2026-02-14 |
| 3. Canvas Interactions | v1.0 | 2/2 | Complete | 2026-02-15 |
| 4. Connection System | v1.0 | 2/2 | Complete | 2026-02-15 |
| 5. Smart Canvas | v1.0 | 2/2 | Complete | 2026-02-15 |
| 6. AI Analysis Engine | v1.0 | 2/2 | Complete | 2026-02-15 |
| 7. Local Persistence | v1.0 | 3/3 | Complete | 2026-03-04 |
| 8. Sharing | Deferred | 0/1 | Deferred | - |
| 9. Entity Customization | Deferred | 0/1 | Deferred | - |
| 10. Mobile Foundation | v1.1 | 1/1 | Complete | 2026-03-04 |
| 11. Responsive Layout Shell | v1.1 | 2/2 | Complete | 2026-03-04 |
| 12. Mobile Entity Creation | v1.1 | 1/1 | Complete | 2026-03-04 |
| 13. Mobile Properties Editing | v1.1 | 2/2 | Complete | 2026-03-05 |
| 14. Mobile Connection Drawing | v1.1 | 1/1 | Complete | 2026-03-06 |
| 15. Hover Audit and Toolbar Completion | v1.1 | 2/2 | Complete | 2026-03-06 |
| 16. Performance and Real-Device Testing | v1.1 | 1/1 | Complete | 2026-03-06 |
| 17. Data Model and Entity Registry | v2.0 | 2/2 | Complete | 2026-03-08 |
| 18. Jurisdiction Palette | v2.0 | 2/2 | Complete | 2026-03-08 |
| 19. Properties and Field Validation | v2.0 | 2/2 | Complete | 2026-03-08 |
| 20. Cross-Border Connections | v2.0 | 2/2 | Complete | 2026-03-08 |
| 21. Validation and Canvas Polish | v2.0 | 2/2 | Complete | 2026-03-08 |
