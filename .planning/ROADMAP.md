# Roadmap: Tax Structuring Tool

## Overview

This roadmap delivers a web application where tax lawyers can visually design multi-entity tax structures on a canvas, wire them with debt/equity/trust relationships, and get AI-powered tax analysis — all in the browser. v1.0 delivered the core desktop product. v1.1 extended full editing to phone and tablet. v2.0 expands the tool from Australia-only to six jurisdictions (AU, UK, US, HK, SG, LU) — adding ~45 new entity types, jurisdiction-organized palettes, per-jurisdiction property fields, cross-border connection metadata, and multi-jurisdiction validation — so tax lawyers can design cross-border structures on a single canvas.

## Milestones

- v1.0 Core Product - Phases 1-7 (shipped 2026-02-18)
- v1.1 Mobile Experience - Phases 10-16 (shipped 2026-03-06)
- Deferred - Phases 8-9 (sharing, customization)
- v2.0 Multi-Jurisdiction - Phases 17-21 (in progress)

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

<details>
<summary>v1.1 Mobile Experience (Phases 10-16) - SHIPPED 2026-03-06</summary>

- [x] **Phase 10: Mobile Foundation** - Reusable hooks, BottomSheet primitive, and Zustand mobile state — no visible UI
- [x] **Phase 11: Responsive Layout Shell** - Remove mobile gate, full-screen canvas on phone, tablet layout, React Flow touch props
- [x] **Phase 12: Mobile Entity Creation** - FAB, bottom sheet palette, tap-to-add entity placement
- [x] **Phase 13: Mobile Properties Editing** - Properties bottom sheet, connection properties sheet, long-press context menu
- [x] **Phase 14: Mobile Connection Drawing** - Connect mode toolbar toggle, tap-source-then-target flow, enlarged handles
- [x] **Phase 15: Hover Audit and Toolbar Completion** - 74 hover interactions remediated, mobile toolbar with overflow menu, tablet MiniMap
- [x] **Phase 16: Performance and Real-Device Testing** - Viewport culling, transition optimization, safe area insets, device test matrix

</details>

### v2.0 Multi-Jurisdiction (In Progress)

**Milestone Goal:** Tax lawyers can build cross-border structures with entities from 6 jurisdictions (AU, UK, US, HK, SG, LU) on a single canvas, with jurisdiction-specific property fields, cross-border connection metadata, and multi-jurisdiction validation.

- [x] **Phase 17: Data Model and Entity Registry** - Expand jurisdiction types, entity categories, and ~45 new entity types across UK, US, HK, SG, LU
- [ ] **Phase 18: Jurisdiction Palette** - Jurisdiction tab bar in desktop and mobile palettes with cross-jurisdiction search
- [ ] **Phase 19: Properties and Field Validation** - Per-jurisdiction registration fields, tax status fields, and format validation
- [ ] **Phase 20: Cross-Border Connections** - WHT rate, treaty, transfer pricing, and currency fields on cross-border edges with visual differentiation
- [ ] **Phase 21: Validation and Canvas Polish** - Jurisdiction-specific structural validation, cross-jurisdiction false-positive prevention, and jurisdiction legend

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

<details>
<summary>v1.1 Mobile Experience (Phases 10-16) - SHIPPED 2026-03-06</summary>

### Phase 10: Mobile Foundation
**Goal**: All reusable mobile primitives exist and are tested in isolation — hooks for device detection and long-press, a BottomSheet component with snap points, and Zustand store fields for mobile UI state — so every subsequent phase can compose from proven building blocks instead of building infrastructure inline
**Depends on**: Phase 7 (v1.0 complete)
**Requirements**: None (infrastructure phase — enables Phases 11-16)
**Plans**: 1 plan

Plans:
- [x] 10-01-PLAN.md -- Device detection hook, long-press hook, BottomSheet component, and mobile Zustand state

### Phase 11: Responsive Layout Shell
**Goal**: Users can access the editor on any screen size — the mobile gate is removed, phones see a full-screen canvas ready for overlay panels, tablets see a two-column layout, and the desktop three-column layout is completely unchanged
**Depends on**: Phase 10
**Requirements**: RESP-01, RESP-02, RESP-03, RESP-04, RESP-05, TOUCH-01, TOUCH-02, TOUCH-03, TOUCH-04, TOUCH-05
**Plans**: 2 plans

Plans:
- [x] 11-01-PLAN.md -- Remove mobile gate, MobileEditorLayout, breakpoint branching, responsive dashboard
- [x] 11-02-PLAN.md -- React Flow touch props, touch handle CSS, touch-friendly node adjustments, viewport meta

### Phase 12: Mobile Entity Creation
**Goal**: Users on mobile can add any entity type to the canvas — opening a categorized palette via a floating action button, tapping an entity type to place it at viewport center with smart grid snapping, completely replacing the desktop drag-and-drop flow that is non-functional on touch
**Depends on**: Phase 11
**Requirements**: MENT-01, MENT-02, MENT-03, MENT-04
**Plans**: 1 plan

Plans:
- [x] 12-01-PLAN.md -- Extract shared palette data, MobilePalette component, tap-to-add placement with grid snap and overlap avoidance, scale-in animation

### Phase 13: Mobile Properties Editing
**Goal**: Users on mobile can view and edit entity properties, connection properties, and trigger node actions — tapping a selected entity opens a properties bottom sheet, tapping a connection opens its properties, and long-pressing an entity reveals a context action menu for delete, copy, connect, and properties
**Depends on**: Phase 12
**Requirements**: MPROP-01, MPROP-02, MPROP-03, MPROP-04, MPROP-05, MNAV-04
**Plans**: 2 plans

Plans:
- [x] 13-01-PLAN.md -- MobilePropertiesSheet with two-step tap trigger, keyboard-aware snap, MobileConnectionTypePicker, 44px touch targets
- [x] 13-02-PLAN.md -- MobileContextMenu with long-press trigger, MobileAnalysisOverlay placeholder, Analyze toolbar button

### Phase 14: Mobile Connection Drawing
**Goal**: Users on mobile can draw connections between entities — entering a connect mode via toolbar, tapping a source entity then a target entity to create a connection, with clear visual feedback throughout the flow and enlarged touch-friendly handles
**Depends on**: Phase 13
**Requirements**: MCONN-01, MCONN-02, MCONN-03, MCONN-04
**Plans**: 1 plan

Plans:
- [x] 14-01-PLAN.md -- Connect mode toggle, tap-to-connect state machine, MobileConnectionBanner, source highlight CSS, enhanced handle visibility

### Phase 15: Hover Audit and Toolbar Completion
**Goal**: Every interactive element works on touch without hover dependency — all 74 hover-based interactions across 22 files are remediated with always-visible or tap-triggered alternatives, the mobile toolbar is complete with undo/redo/overflow menu, and tablet gets a MiniMap for navigating large structures
**Depends on**: Phase 14
**Requirements**: MNAV-01, MNAV-02, MNAV-03, MPOL-01, MPOL-02, MPOL-03
**Plans**: 2 plans

Plans:
- [x] 15-01-PLAN.md -- MobileOverflowMenu component, prop threading, toolbar overflow button for save/templates/layout/export
- [x] 15-02-PLAN.md -- CSS :hover wrapping in @media (hover: hover), :active touch feedback on all components, tablet MiniMap verification

### Phase 16: Performance and Real-Device Testing
**Goal**: The mobile experience performs smoothly on real mid-range hardware — 20+ entity structures render without jank, transitions are suppressed during drag, safe area insets are correct on notch devices, and the full feature set is validated on iOS Safari, Android Chrome, and iPad Safari
**Depends on**: Phase 15
**Requirements**: MPOL-04, MPOL-05
**Plans**: 1 plan

Plans:
- [x] 16-01-PLAN.md -- Performance optimizations (viewport culling, drag transition suppression, backdrop-blur removal) and safe-area-inset CSS for notch/home-indicator devices, with real-device validation checkpoint

</details>

### v2.0 Multi-Jurisdiction (Phases 17-21)

### Phase 17: Data Model and Entity Registry
**Goal**: All 6 jurisdictions' entity types exist in the registry with visually distinct shapes, colors, and flag icons — the foundation that every subsequent phase reads from
**Depends on**: Phase 16 (v1.1 complete)
**Requirements**: EREG-01, EREG-02, EREG-03, EREG-04, EREG-05, EREG-06
**Success Criteria** (what must be TRUE):
  1. User can see all 9 UK entity types (Ltd, PLC, LLP, LP, GP, Unit Trust, Discretionary Trust, Individual, Pension Scheme) available in the entity registry with correct category assignments
  2. User can see all 11 US entity types (C Corp, S Corp, LLC Disregarded, LLC Partnership-Taxed, GP, LP, LLLP, Grantor Trust, Non-Grantor Trust, Individual, 501(c)(3)) available in the entity registry with correct category assignments
  3. User can see all 6 HK, 7 SG, and 10 LU entity types available in the entity registry with correct category assignments
  4. User can see jurisdiction-specific visual styling on entity nodes — each jurisdiction has a distinct flag icon and color accent that differentiates it from other jurisdictions at a glance
  5. Existing AU-only saved structures load and render without any changes or errors
**Plans**: 2 plans

Plans:
- [x] 17-01-PLAN.md -- Expand Jurisdiction type, EntityCategory, COLORS, CATEGORY_CONFIG, PALETTE_ICONS; add 9 UK and 11 US entity registry entries
- [x] 17-02-PLAN.md -- Add 6 HK, 7 SG, and 10 LU entity registry entries; fix jurisdictionFlag lookup for correct flag display

### Phase 18: Jurisdiction Palette
**Goal**: Users can browse and discover entity types organized by jurisdiction in both desktop sidebar and mobile bottom sheet palettes, with cross-jurisdiction search
**Depends on**: Phase 17
**Requirements**: PAL-01, PAL-02, PAL-03
**Success Criteria** (what must be TRUE):
  1. User can see jurisdiction tabs (AU, UK, US, HK, SG, LU) in both the desktop sidebar palette and mobile bottom sheet palette, and switching tabs shows only that jurisdiction's entity types
  2. User can type a search term and see matching entity types from all jurisdictions with jurisdiction flag icons shown alongside each result
  3. User can see all 6 jurisdiction tabs without needing to scroll horizontally to discover them, on both desktop and mobile screen sizes
**Plans**: 2 plans

Plans:
- [ ] 18-01-PLAN.md -- Jurisdiction tab bar component, selectedPaletteJurisdiction state in ui-store, integration into both EntityPalette and MobilePalette
- [ ] 18-02-PLAN.md -- Cross-jurisdiction search bypass with flag icons in results, search input in MobilePalette, tab dimming during search

### Phase 19: Properties and Field Validation
**Goal**: Users can view and edit jurisdiction-specific registration and tax status fields for any entity, with format validation that matches each jurisdiction's official registration number patterns
**Depends on**: Phase 18
**Requirements**: PROP-01, PROP-02, PROP-03, PROP-04, PROP-05, PROP-06
**Success Criteria** (what must be TRUE):
  1. User can open properties for a UK entity and see UK-specific fields (Company Number, UTR, NINO, Corporation Tax rate, Small Profits eligibility, trust rates, IHT relevance)
  2. User can open properties for a US entity and see US-specific fields (EIN, SSN/ITIN, State of formation, check-the-box election, S Corp election, federal tax rate)
  3. User can open properties for HK, SG, and LU entities and see jurisdiction-appropriate registration and tax status fields for each
  4. User can see inline validation errors when entering registration numbers in incorrect formats (UK Company Number must be 8 characters, US EIN must be XX-XXXXXXX, SG UEN must be 9-10 characters, LU RCS must be B-XXXXXX)
  5. Existing AU entity properties continue to display and validate correctly with no regressions
**Plans**: TBD

Plans:
- [ ] 19-01: Per-jurisdiction registration field renderers (UK, US, HK, SG, LU) in RegistrationSection
- [ ] 19-02: Per-jurisdiction tax status field renderers and Zod format validation schemas

### Phase 20: Cross-Border Connections
**Goal**: Users can build mixed cross-border structures with connection metadata that captures the tax-relevant details of cross-border flows — withholding tax rates, treaty references, transfer pricing flags, and currency — with visual differentiation of cross-border connections
**Depends on**: Phase 19
**Requirements**: XBRD-01, XBRD-03, CONN-01, CONN-02, CONN-03, CONN-04
**Success Criteria** (what must be TRUE):
  1. User can place entities from different jurisdictions on the same canvas and connect them with equity, debt, or agreement connections
  2. User can set withholding tax rate and payment type (dividend/interest/royalty) on any cross-border equity or debt connection
  3. User can indicate whether a treaty-reduced rate applies and specify the applicable treaty name on any cross-border connection
  4. User can see transfer pricing relevance auto-flagged on cross-border service/management/licensing connections between related parties
  5. User can visually distinguish cross-border connections from domestic connections via dashed line style or distinct color

**Plans**: TBD

Plans:
- [ ] 20-01: Cross-border edge metadata fields (WHT rate, treaty, transfer pricing, currency) on TaxRelationshipData and connection properties UI
- [ ] 20-02: Cross-border connection visual differentiation and auto-detection of cross-border edges

### Phase 21: Validation and Canvas Polish
**Goal**: The canvas actively validates jurisdiction-specific structural rules across mixed-jurisdiction structures without false positives, and provides visual aids (jurisdiction legend, border color accents) that help users navigate complex cross-border diagrams
**Depends on**: Phase 20
**Requirements**: XBRD-02, XBRD-04, VAL-01, VAL-02
**Success Criteria** (what must be TRUE):
  1. User can see validation warnings for jurisdiction-specific structural rules (UK trust without trustee, US S Corp with ineligible shareholder type, SG VCC without fund manager) displayed alongside existing AU validation rules
  2. User can build a structure with entities from 3+ jurisdictions and see only the validation rules relevant to each entity's own jurisdiction — no false positives from other jurisdictions' rules
  3. User can see a jurisdiction color legend on the canvas when entities from 2+ jurisdictions are present, showing which color accent maps to which jurisdiction
  4. User can visually distinguish which jurisdiction each entity belongs to via flag icon and jurisdiction-specific border color accent, even on a canvas with 20+ entities from mixed jurisdictions

**Plans**: TBD

Plans:
- [ ] 21-01: Refactor graph-validator from hardcoded AU Sets to registry-derived Sets; add jurisdiction-specific validation rules
- [ ] 21-02: Jurisdiction color legend component and XBRD-02 border color accent on entity nodes

## Progress

**Execution Order:**
v1.0: 1 > 2 > 3 > 4 > 5 > 6 > 7 (complete)
v1.1: 10 > 11 > 12 > 13 > 14 > 15 > 16 (complete)
v2.0: 17 > 18 > 19 > 20 > 21
Note: Phase 17 first (registry is foundation for everything). Phase 18 after 17 (palette needs registry entries). Phase 19 after 18 (properties need entities placeable). Phase 20 after 19 (cross-border connections need entities configured). Phase 21 last (validation needs full cross-border structures to validate).

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
| 18. Jurisdiction Palette | v2.0 | 0/2 | Planned | - |
| 19. Properties and Field Validation | v2.0 | 0/2 | Not started | - |
| 20. Cross-Border Connections | v2.0 | 0/2 | Not started | - |
| 21. Validation and Canvas Polish | v2.0 | 0/2 | Not started | - |
