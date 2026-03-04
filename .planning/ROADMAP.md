# Roadmap: Tax Structuring Tool

## Overview

This roadmap delivers a web application where tax lawyers can visually design multi-entity tax structures on a canvas, wire them with debt/equity/trust relationships, and get AI-powered tax analysis — all in the browser. v1.0 delivered the core desktop product. v1.1 extends the full editing experience to phone and tablet — responsive layout, touch-friendly canvas interactions, mobile-adapted panels, and performance hardening — so users can place entities, draw connections, edit properties, and run AI analysis from any device.

## Milestones

- v1.0 Core Product - Phases 1-7 (shipped 2026-02-18)
- v1.1 Mobile Experience - Phases 10-16 (in progress)
- Deferred - Phases 8-9 (sharing, customization)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

<details>
<summary>v1.0 Core Product (Phases 1-7) - SHIPPED 2026-02-18</summary>

- [x] **Phase 1: Canvas Foundation** - Working grid canvas with pan, zoom, snap-to-grid, and jurisdiction-aware data model
- [x] **Phase 2: Entity System** - Full Australian entity palette with drag-drop placement and properties editing
- [x] **Phase 3: Canvas Interactions** - Professional editing operations: select, move, resize, delete, undo/redo, copy/paste, shortcuts
- [x] **Phase 4: Connection System** - Debt, equity, trust, and agreement connections with labels and properties
- [x] **Phase 5: Smart Canvas** - Validation warnings, connection filtering, auto-layout, and template structures
- [x] **Phase 6: AI Analysis Engine** - Gemini-powered tax analysis with streaming, formation/transaction steps, and PDF export
- [x] **Phase 7: Local Persistence** - Save/load structures to browser localStorage, auto-save, and structure dashboard

</details>

**Deferred (from v1.0):**

- [ ] **Phase 8: Sharing** - Share links with view-only and editable modes
- [ ] **Phase 9: Entity Customization** - Per-entity-type shape, color, and icon customization

**v1.1 Mobile Experience:**

- [x] **Phase 10: Mobile Foundation** - Reusable hooks, BottomSheet primitive, and Zustand mobile state — no visible UI
- [x] **Phase 11: Responsive Layout Shell** - Remove mobile gate, full-screen canvas on phone, tablet layout, React Flow touch props
- [ ] **Phase 12: Mobile Entity Creation** - FAB, bottom sheet palette, tap-to-add entity placement
- [ ] **Phase 13: Mobile Properties Editing** - Properties bottom sheet, connection properties sheet, long-press context menu
- [ ] **Phase 14: Mobile Connection Drawing** - Connect mode toolbar toggle, tap-source-then-target flow, enlarged handles
- [ ] **Phase 15: Hover Audit and Toolbar Completion** - 74 hover interactions remediated, mobile toolbar with overflow menu, tablet MiniMap
- [ ] **Phase 16: Performance and Real-Device Testing** - Viewport culling, transition optimization, safe area insets, device test matrix

## Phase Details

<details>
<summary>v1.0 Core Product (Phases 1-7) - SHIPPED 2026-02-18</summary>

### Phase 1: Canvas Foundation
**Goal**: User has a professional-feeling empty workspace — a grid canvas they can pan and zoom, where entities will snap to grid positions, backed by a jurisdiction-aware labeled multigraph data model
**Depends on**: Nothing (first phase)
**Requirements**: CANV-01, CANV-02
**Success Criteria** (what must be TRUE):
  1. User can see a grid canvas with visible grid lines that fills the viewport
  2. User can pan the canvas by dragging and zoom in/out with scroll wheel or pinch
  3. User can see items snap to grid intersections when placed or moved on the canvas
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md -- Project scaffolding, TypeScript data model, and entity type registry
- [x] 01-02-PLAN.md -- Zustand graph store and React Flow canvas with grid/pan/zoom/snap
- [x] 01-03-PLAN.md -- Custom EntityNode and RelationshipEdge components
- [x] 01-04-PLAN.md -- Integration wiring, demo data, and visual verification checkpoint

### Phase 2: Entity System
**Goal**: User can browse all Australian entity types in a sidebar palette, drag any entity onto the canvas, and view/edit its properties — the canvas is populated with the building blocks of tax structures
**Depends on**: Phase 1
**Requirements**: ENT-01, ENT-02, ENT-03, ENT-04, ENT-05, ENT-06, ENT-07, ENT-08, ENT-09
**Success Criteria** (what must be TRUE):
  1. User can see a sidebar palette listing all Australian entity types organized by category (companies, trusts, partnerships, venture capital, other)
  2. User can drag any entity type from the palette and drop it onto the canvas, creating a visually distinct node
  3. User can place all 12+ Australian entity types: Pty Ltd, unit trusts, discretionary trusts, hybrid trusts, MITs, general partnerships, limited partnerships, VCLPs, ESVCLPs, individuals, and SMSFs
  4. User can click any placed entity to open a properties panel showing name, type, jurisdiction, and type-specific fields (ABN/ACN for companies, trust deed details for trusts, partnership agreement for partnerships)
  5. User can edit entity properties in the panel and see changes reflected on the canvas
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md -- Entity palette sidebar with categorized entity types, search, and drag-drop onto canvas
- [x] 02-02-PLAN.md -- Properties panel with view/edit, Zod validation, inline rename, and resizable layout

### Phase 3: Canvas Interactions
**Goal**: User has full professional editing control over entities on the canvas — selecting, moving, resizing, deleting, undoing, copying, and using keyboard shortcuts feels as responsive and natural as Lucidchart
**Depends on**: Phase 2
**Requirements**: CANV-03, CANV-04, CANV-05, CANV-06, CANV-07, CANV-08, CANV-09
**Success Criteria** (what must be TRUE):
  1. User can click to select entities and connections, seeing clear visual selection indicators
  2. User can drag entities to new positions with all connected lines following smoothly
  3. User can resize entity shapes and delete entities/connections via keyboard (Delete) or context menu
  4. User can undo any canvas operation with Ctrl+Z and redo with Ctrl+Shift+Z, with full operation history
  5. User can copy entities with Ctrl+C and paste with Ctrl+V, and use Ctrl+A to select all
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md -- Store overhaul (zundo temporal), multi-select, resize handles, helper lines, delete with confirmation, context menu
- [x] 03-02-PLAN.md -- Undo/redo system, copy/paste with ID remapping, keyboard shortcuts, editor toolbar

### Phase 4: Connection System
**Goal**: User can wire entities together with typed relationship lines — drawing debt, equity, trustee/beneficiary, and agreement connections with labeled percentages, amounts, and terms that are visible and editable
**Depends on**: Phase 3
**Requirements**: CONN-01, CONN-02, CONN-03, CONN-04, CONN-05, CONN-06, CONN-07
**Success Criteria** (what must be TRUE):
  1. User can draw a connection line between two entities by dragging from one entity's connection handle to another
  2. User can create all four connection types: equity (with ownership %), debt (with principal/rate/term), trustee/beneficiary, and agreement (management/services/licensing)
  3. User can see relationship type labels and ownership percentages displayed directly on connection lines
  4. User can click any connection to open a properties editor for type, percentage, amount, and terms
**Plans**: 2 plans

Plans:
- [x] 04-01-PLAN.md -- Connection drawing with type picker modal, store actions, enhanced edge visuals
- [x] 04-02-PLAN.md -- Connection properties editor panel with type-conditional forms and editor page integration

### Phase 5: Smart Canvas
**Goal**: The canvas actively helps users build correct structures — warning about invalid configurations, letting users filter complex diagrams by connection type, arranging entities hierarchically with one click, and loading pre-built template structures
**Depends on**: Phase 4
**Requirements**: CONN-08, CONN-09, CONN-10, CANV-10, ENT-10
**Success Criteria** (what must be TRUE):
  1. User can see validation warnings when a structure has invalid configurations (trust without trustee, circular ownership, missing required connections)
  2. User can toggle connection type visibility to show/hide specific types (debt, equity, other) and use highlight/dim mode to focus on one type
  3. User can trigger auto-layout that arranges entities hierarchically (investors top, fund middle, assets bottom) with clean connection routing
  4. User can load pre-built template structures (standard VCLP structure, family trust with corporate beneficiary, MIT with foreign investors) that place a complete working pattern on the canvas
**Plans**: 2 plans

Plans:
- [x] 05-01-PLAN.md -- Graph validation engine with warning display for invalid configurations (trust without trustee, circular ownership, missing partners, equity > 100%)
- [x] 05-02-PLAN.md -- Connection filtering (toggle visibility + highlight/dim), dagre auto-layout, and pre-built template structures (VCLP, Family Trust, MIT)

### Phase 6: AI Analysis Engine
**Goal**: User can click "Analyze Structure" and watch a streaming AI analysis appear in the right panel — covering the legal steps to form the structure, the transactions to wire it, investor-level and fund-level tax implications, with a clear disclaimer and PDF export
**Depends on**: Phase 4 (needs stable graph data model and connection types for serialization; Phase 5 is not blocking)
**Requirements**: AI-01, AI-02, AI-03, AI-04, AI-05, AI-06, AI-07, AI-08
**Success Criteria** (what must be TRUE):
  1. User can click an "Analyze Structure" button and see the AI response stream into the right-side panel in real time (not a spinner followed by a wall of text)
  2. User can see a formation steps section listing the legal steps to create the structure (ASIC registration, ABN/ACN, trust deeds, constitutions)
  3. User can see a transaction steps section listing the deal mechanics to wire the structure (capital contributions, debt issuances, ownership transfers, unit issuances)
  4. User can see investor-level tax implications (CGT treatment, income attribution, withholding tax, franking credits, CGT discount) and fund-level tax implications (MIT/AMIT, corporate tax rates, trust distribution rules, thin cap, Part IVA)
  5. User can see a prominent disclaimer that the analysis is not legal advice and should be verified by a qualified professional, and can export the full analysis report as a PDF document
**Plans**: 2 plans

Plans:
- [x] 06-01-PLAN.md -- Streaming AI pipeline: dependencies, graph serializer, system prompt, Gemini API route, AnalysisPanel with useCompletion, editor page integration
- [x] 06-02-PLAN.md -- Disclaimer component and PDF export with @react-pdf/renderer

### Phase 7: Local Persistence
**Goal**: User can save structures to their browser, have them auto-saved while editing, and return later to find everything preserved — with a dashboard showing all saved structures
**Depends on**: Phase 1 (graph snapshot format); can run in parallel with Phases 5-6
**Requirements**: PERS-03, PERS-04, PERS-05
**Success Criteria** (what must be TRUE):
  1. User can explicitly save the current structure via a Save button in the toolbar
  2. User's work is auto-saved periodically while editing a previously-saved structure
  3. User can see a dashboard listing all their saved structures with name, last-modified date, and visual preview
  4. User can open a saved structure from the dashboard and continue editing
  5. Saving a new structure redirects to a bookmarkable /editor/[id] URL
**Plans**: 3 plans

Plans:
- [x] 07-01-PLAN.md -- (Superseded) Original Supabase auth infrastructure -- replaced with local storage
- [x] 07-02-PLAN.md -- Local storage persistence: save/load CRUD, auto-save hook, Save button, editor/[id] route, dashboard with structure cards
- [x] 07-03-PLAN.md -- Gap closure: thumbnail capture for dashboard visual previews (PERS-05)

</details>

**Deferred (from v1.0):**

### Phase 8: Sharing
**Goal**: User can share any saved structure with colleagues via a generated link, choosing whether recipients can only view or also edit the structure
**Depends on**: Phase 7
**Requirements**: SHARE-01, SHARE-02, SHARE-03
**Success Criteria** (what must be TRUE):
  1. User can generate a share link for any saved structure with one click
  2. User can set the share link to view-only mode where recipients can see the structure and analysis but cannot modify anything
  3. User can set the share link to editable mode where recipients can modify the structure
**Plans**: TBD

Plans:
- [ ] 08-01: Share link generation, view-only and editable modes, access control enforcement

### Phase 9: Entity Customization
**Goal**: User can personalize how each entity type appears on the canvas — choosing different shapes, colors, and icons to match their firm's conventions or personal preferences
**Depends on**: Phase 2
**Requirements**: CUST-01, CUST-02, CUST-03, CUST-04
**Success Criteria** (what must be TRUE):
  1. User can access a settings page dedicated to entity type appearance customization
  2. User can customize the shape for each entity type (e.g., trusts as circles, companies as rectangles, partnerships as diamonds)
  3. User can customize the color and icon for each entity type, with changes reflected immediately on existing canvas entities
**Plans**: TBD

Plans:
- [ ] 09-01: Entity appearance settings page with shape, color, and icon customization per type

---

### v1.1 Mobile Experience (Phases 10-16)

**Milestone Goal:** Make the full Tax Structuring Tool work on phone and tablet — responsive layout, touch-friendly canvas editing, and mobile-adapted UI panels so users can place entities, draw connections, edit properties, run AI analysis, and manage structures from any device.

### Phase 10: Mobile Foundation
**Goal**: All reusable mobile primitives exist and are tested in isolation — hooks for device detection and long-press, a BottomSheet component with snap points, and Zustand store fields for mobile UI state — so every subsequent phase can compose from proven building blocks instead of building infrastructure inline
**Depends on**: Phase 7 (v1.0 complete)
**Requirements**: None (infrastructure phase — enables Phases 11-16)
**Success Criteria** (what must be TRUE):
  1. `useDeviceCapabilities` hook correctly reports touch vs. mouse input via `matchMedia('(pointer: coarse)')`
  2. `useLongPress` hook fires a callback after 500ms hold and cancels on finger movement
  3. `BottomSheet` component renders at three snap points (collapsed, half, full) with touch drag-to-dismiss
  4. Zustand `ui-store` contains `isMobilePaletteOpen`, `isMobilePropertiesOpen`, `mobileTool`, and `pendingConnectionSource` fields with correct initial values
**Plans**: 1 plan

Plans:
- [x] 10-01-PLAN.md -- Device detection hook, long-press hook, BottomSheet component, and mobile Zustand state

### Phase 11: Responsive Layout Shell
**Goal**: Users can access the editor on any screen size — the mobile gate is removed, phones see a full-screen canvas ready for overlay panels, tablets see a two-column layout, and the desktop three-column layout is completely unchanged
**Depends on**: Phase 10
**Requirements**: RESP-01, RESP-02, RESP-03, RESP-04, RESP-05, TOUCH-01, TOUCH-02, TOUCH-03, TOUCH-04, TOUCH-05
**Success Criteria** (what must be TRUE):
  1. User on a phone (<768px) can open the editor and see a full-screen canvas instead of the "Larger Screen Required" gate
  2. User on a tablet (768px-1024px) sees a two-column layout with collapsible sidebar and canvas
  3. User on desktop (>1024px) sees the unchanged three-column layout (palette, canvas, properties)
  4. User on a touch device can pan with single-finger drag, pinch-to-zoom, tap to select entities, and touch-drag entities to reposition them
  5. User on a phone sees touch-friendly entity nodes without resize handles and with responsive hit areas
**Plans**: 2 plans

Plans:
- [x] 11-01-PLAN.md -- Remove mobile gate, MobileEditorLayout, breakpoint branching, responsive dashboard
- [x] 11-02-PLAN.md -- React Flow touch props, touch handle CSS, touch-friendly node adjustments, viewport meta

### Phase 12: Mobile Entity Creation
**Goal**: Users on mobile can add any entity type to the canvas — opening a categorized palette via a floating action button, tapping an entity type to place it at viewport center with smart grid snapping, completely replacing the desktop drag-and-drop flow that is non-functional on touch
**Depends on**: Phase 11
**Requirements**: MENT-01, MENT-02, MENT-03, MENT-04
**Success Criteria** (what must be TRUE):
  1. User can tap a floating action button on mobile to open the entity palette
  2. User can browse categorized entity types in a bottom sheet (companies, trusts, partnerships, venture capital, other)
  3. User can tap an entity type and see it placed at the viewport center on the canvas
  4. User sees placed entities snapped to grid with automatic overlap avoidance when multiple entities are placed
**Plans**: 1 plan

Plans:
- [ ] 12-01-PLAN.md -- Extract shared palette data, MobilePalette component, tap-to-add placement with grid snap and overlap avoidance, scale-in animation

### Phase 13: Mobile Properties Editing
**Goal**: Users on mobile can view and edit entity properties, connection properties, and trigger node actions — tapping a selected entity opens a properties bottom sheet, tapping a connection opens its properties, and long-pressing an entity reveals a context action menu for delete, copy, connect, and properties
**Depends on**: Phase 12
**Requirements**: MPROP-01, MPROP-02, MPROP-03, MPROP-04, MPROP-05, MNAV-04
**Success Criteria** (what must be TRUE):
  1. User can tap a selected entity to open its properties in a bottom sheet with the same fields as the desktop properties panel
  2. User can edit entity properties in the mobile bottom sheet and see changes reflected on the canvas
  3. User can tap a selected connection to open connection properties in a bottom sheet
  4. User can run AI analysis and see streaming results in a mobile full-screen overlay
  5. User can long-press an entity to see a context action menu with delete, copy, connect, and properties options
**Plans**: 2 plans

Plans:
- [ ] 13-01: MobilePropertiesSheet wrapping PropertiesPanel and ConnectionPropertiesPanel, keyboard-aware resize, responsive modals
- [ ] 13-02: NodeActionMenu with long-press trigger, AI analysis mobile overlay, mobile-friendly modal adaptations

### Phase 14: Mobile Connection Drawing
**Goal**: Users on mobile can draw connections between entities — entering a connect mode via toolbar, tapping a source entity then a target entity to create a connection, with clear visual feedback throughout the flow and enlarged touch-friendly handles
**Depends on**: Phase 13
**Requirements**: MCONN-01, MCONN-02, MCONN-03, MCONN-04
**Success Criteria** (what must be TRUE):
  1. User can see connection handles on touch devices that are always visible and have enlarged hit areas (44px minimum)
  2. User can tap a Connect button in the mobile toolbar to enter connect mode
  3. User can draw a connection by tapping a source entity then tapping a target entity (no drag precision required)
  4. User sees visual feedback during the connection flow — source entity highlights, instruction banner appears, and cancel option is available
**Plans**: TBD

Plans:
- [ ] 14-01: MobileConnectionFlow component, connect mode toggle, connectOnClick integration, enlarged handle CSS, visual feedback overlay

### Phase 15: Hover Audit and Toolbar Completion
**Goal**: Every interactive element works on touch without hover dependency — all 74 hover-based interactions across 22 files are remediated with always-visible or tap-triggered alternatives, the mobile toolbar is complete with undo/redo/overflow menu, and tablet gets a MiniMap for navigating large structures
**Depends on**: Phase 14
**Requirements**: MNAV-01, MNAV-02, MNAV-03, MPOL-01, MPOL-02, MPOL-03
**Success Criteria** (what must be TRUE):
  1. User can access undo, redo, add, connect, and edit tools via the mobile bottom toolbar
  2. User can access save, templates, auto-layout, and export via an overflow menu in the mobile toolbar
  3. User can interact with all UI elements on touch devices without any hover dependency (handles, tooltips, shadows, highlights all have touch-accessible alternatives)
  4. User sees :active touch feedback (scale, color change) on all interactive elements when tapped
  5. User on tablet can see a MiniMap for navigating large structures
**Plans**: 2 plans

Plans:
- [ ] 15-01: MobileToolbar completion (undo/redo, mode buttons, overflow menu), EditorToolbar desktop overflow
- [ ] 15-02: Hover audit across 22 files (@media hover/pointer wrapping), :active affordances, tablet MiniMap

### Phase 16: Performance and Real-Device Testing
**Goal**: The mobile experience performs smoothly on real mid-range hardware — 20+ entity structures render without jank, transitions are suppressed during drag, safe area insets are correct on notch devices, and the full feature set is validated on iOS Safari, Android Chrome, and iPad Safari
**Depends on**: Phase 15
**Requirements**: MPOL-04, MPOL-05
**Success Criteria** (what must be TRUE):
  1. User can work with 20+ entities on mobile without perceptible jank or frame drops during pan, zoom, and drag operations
  2. User on a notch/home-indicator device sees correct safe-area insets on the bottom toolbar, FAB, and bottom sheets
**Plans**: TBD

Plans:
- [ ] 16-01: Viewport culling, transition suppression during drag, backdrop-filter audit, safe area insets, real-device test matrix validation

## Progress

**Execution Order:**
v1.0: 1 > 2 > 3 > 4 > 5 > 6 > 7 (complete)
v1.1: 10 > 11 > 12 > 13 > 14 > 15 > 16
Note: Phase 10 before all v1.1 phases (primitives). Phase 11 before 12-16 (layout shell). Phase 12 before 13 (can't edit what you can't place). Phase 13 before 14 (mobileTool state machine). Phase 15 after 14 (audit after all interactions exist). Phase 16 last (optimize complete feature set).

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
| 12. Mobile Entity Creation | v1.1 | 0/1 | Planned | - |
| 13. Mobile Properties Editing | v1.1 | 0/2 | Not started | - |
| 14. Mobile Connection Drawing | v1.1 | 0/1 | Not started | - |
| 15. Hover Audit and Toolbar Completion | v1.1 | 0/2 | Not started | - |
| 16. Performance and Real-Device Testing | v1.1 | 0/1 | Not started | - |
