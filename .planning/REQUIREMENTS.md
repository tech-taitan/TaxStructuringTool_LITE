# Requirements: Tax Structuring Tool

**Defined:** 2026-02-13
**Updated:** 2026-03-04 (v1.1 roadmap created)
**Core Value:** Tax lawyers can draw a structure and instantly understand its tax implications

## v1.0 Requirements (Shipped)

### Canvas

- [x] **CANV-01**: User can view a grid canvas with pan, zoom, and background grid lines
- [x] **CANV-02**: User can snap entities to grid when dragging or placing
- [x] **CANV-03**: User can select individual entities and connections by clicking
- [x] **CANV-04**: User can move entities on canvas with connected lines following
- [x] **CANV-05**: User can resize entity shapes on canvas
- [x] **CANV-06**: User can delete entities and connections via keyboard or context menu
- [x] **CANV-07**: User can undo and redo any canvas operation (Ctrl+Z / Ctrl+Shift+Z)
- [x] **CANV-08**: User can copy and paste entities (Ctrl+C / Ctrl+V)
- [x] **CANV-09**: User can use keyboard shortcuts for common operations (Delete, Ctrl+A, Ctrl+Z)
- [x] **CANV-10**: User can trigger smart auto-layout that arranges entities hierarchically

### Entities

- [x] **ENT-01**: User can see an entity palette sidebar listing all available entity types
- [x] **ENT-02**: User can drag an entity type from the palette and drop it onto the canvas
- [x] **ENT-03**: User can place Australian Pty Ltd company entities
- [x] **ENT-04**: User can place Australian trust entities (unit trusts, discretionary trusts, hybrid trusts, MITs)
- [x] **ENT-05**: User can place Australian partnership entities (general partnerships, limited partnerships)
- [x] **ENT-06**: User can place Australian venture capital entities (VCLPs, ESVCLPs)
- [x] **ENT-07**: User can place individual and SMSF entities
- [x] **ENT-08**: User can click an entity to open a properties panel showing name, type, jurisdiction, and type-specific fields
- [x] **ENT-09**: User can edit entity properties in the properties panel
- [x] **ENT-10**: User can load pre-built template structures

### Connections

- [x] **CONN-01**: User can draw a connection line between two entities by dragging from one to another
- [x] **CONN-02**: User can create equity connections with ownership percentage labels
- [x] **CONN-03**: User can create debt connections with principal/rate/term labels
- [x] **CONN-04**: User can create trustee/beneficiary relationship connections
- [x] **CONN-05**: User can create other agreement connections (management, services, licensing)
- [x] **CONN-06**: User can see relationship labels and percentages displayed on connection lines
- [x] **CONN-07**: User can edit connection properties (type, percentage, amount, terms) via click
- [x] **CONN-08**: User can see validation warnings for invalid configurations
- [x] **CONN-09**: User can filter connections by type using toggle visibility
- [x] **CONN-10**: User can filter connections by type using highlight/dim mode

### AI Analysis

- [x] **AI-01**: User can click an "Analyze Structure" button to trigger AI analysis
- [x] **AI-02**: User can see the AI response stream into the right-side panel in real time
- [x] **AI-03**: User can see formation steps section
- [x] **AI-04**: User can see transaction steps section
- [x] **AI-05**: User can see investor-level tax implications
- [x] **AI-06**: User can see fund-level tax implications
- [x] **AI-07**: User can see a disclaimer that AI analysis is not legal advice
- [x] **AI-08**: User can export the AI analysis report as a PDF document

### Persistence (Partial — local storage)

- [x] **PERS-03**: User can save the current structure (localStorage)
- [x] **PERS-04**: User's work is auto-saved periodically while editing
- [x] **PERS-05**: User can see a dashboard listing all their saved structures

## v1.1 Requirements — Mobile Experience

Requirements for mobile responsive editing. Each maps to roadmap phases 10-16.

### Responsive Layout

- [x] **RESP-01**: User can access the editor on a phone-sized screen (mobile gate removed)
- [x] **RESP-02**: User sees a full-screen canvas with overlay panels on phone (<768px)
- [x] **RESP-03**: User sees a tablet-optimized layout on medium screens (768px-1024px)
- [x] **RESP-04**: User's desktop experience is unchanged (three-column layout preserved on >1024px)
- [x] **RESP-05**: User can browse the structure dashboard with a responsive card layout on mobile

### Touch Canvas

- [x] **TOUCH-01**: User can pan the canvas with single-finger drag on touch devices
- [x] **TOUCH-02**: User can pinch-to-zoom on the canvas on touch devices
- [x] **TOUCH-03**: User can tap an entity to select it on touch devices
- [x] **TOUCH-04**: User can touch-drag entities to reposition them on the canvas
- [x] **TOUCH-05**: User sees touch-friendly entity nodes (no resize handles on phone, :active touch feedback)

### Mobile Entity Creation

- [x] **MENT-01**: User can open an entity palette via a floating action button on mobile
- [x] **MENT-02**: User can browse categorized entity types in a bottom sheet palette
- [x] **MENT-03**: User can tap an entity type to place it at the viewport center
- [x] **MENT-04**: User sees placed entities snapped to grid with smart overlap avoidance

### Mobile Properties

- [ ] **MPROP-01**: User can tap a selected entity to open properties in a bottom sheet
- [ ] **MPROP-02**: User can edit entity properties in the mobile bottom sheet (same fields as desktop)
- [ ] **MPROP-03**: User can tap a selected connection to open connection properties in a bottom sheet
- [ ] **MPROP-04**: User can run AI analysis and see streaming results in a mobile overlay
- [ ] **MPROP-05**: User sees mobile-friendly modals (connection type picker, delete confirmation, templates)

### Mobile Connection Drawing

- [ ] **MCONN-01**: User can see connection handles on touch devices (always visible, enlarged hit areas)
- [ ] **MCONN-02**: User can enter connect mode via a toolbar button on mobile
- [ ] **MCONN-03**: User can draw connections by tapping source entity then target entity
- [ ] **MCONN-04**: User sees visual feedback during connection flow (source highlight, instruction banner)

### Mobile Navigation

- [ ] **MNAV-01**: User can access undo/redo via mobile bottom toolbar
- [ ] **MNAV-02**: User can access add, connect, and edit tools via mobile toolbar buttons
- [ ] **MNAV-03**: User can access save, templates, auto-layout, and export via overflow menu
- [ ] **MNAV-04**: User can long-press an entity for a context action menu (delete, copy, connect, properties)

### Mobile Polish

- [ ] **MPOL-01**: User can interact with all UI elements on touch without hover dependency
- [ ] **MPOL-02**: User sees :active touch feedback on interactive elements
- [ ] **MPOL-03**: User can see a MiniMap on tablet for navigating large structures
- [ ] **MPOL-04**: User experiences smooth performance on mobile with 20+ entities
- [ ] **MPOL-05**: User sees correct safe-area insets on notch/home-indicator devices

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### User Accounts

- **PERS-01**: User can create an account with email and password
- **PERS-02**: User can sign in with Google OAuth

### Sharing

- **SHARE-01**: User can generate a share link for any saved structure
- **SHARE-02**: User can set share link to view-only mode
- **SHARE-03**: User can set share link to editable mode

### Customization

- **CUST-01**: User can access a settings page for entity type appearance
- **CUST-02**: User can customize the shape for each entity type
- **CUST-03**: User can customize the color for each entity type
- **CUST-04**: User can customize the icon for each entity type

### AI Enhancements

- **AI-09**: User can see citation validation flags on fabricated ITAA section references
- **AI-10**: User can see stale analysis indicator when structure has changed
- **AI-11**: User can compare tax implications of two structures side-by-side

### Mobile Enhancements

- **MGEST-01**: User can undo via two-finger swipe gesture (iOS)
- **MGEST-02**: User can trigger auto-layout by shaking the device

### Multi-Jurisdiction

- **JURSD-01**: User can place Singapore entities
- **JURSD-02**: User can place Hong Kong entities
- **JURSD-03**: User can place Luxembourg entities
- **JURSD-04**: User can place US entities
- **JURSD-05**: User can place UK entities
- **JURSD-06**: AI analysis covers cross-border withholding tax and treaty implications

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real-time multi-user collaboration | CRDT/OT complexity for minimal value — share links cover collaboration needs |
| Native mobile app (React Native/Flutter) | Responsive web handles mobile; single codebase, no app store friction |
| Drag-from-handle connection drawing on phone | Impossible precision on small screens; every competitor abandoned this |
| Multi-touch node manipulation (rotate/resize via pinch) | Conflicts with pinch-to-zoom; resize disabled on phone |
| Rubber-band multi-selection on phone | Conflicts with pan gesture; phone is single-select only |
| Inline rename via double-tap | Double-tap is zoom on mobile; rename via properties sheet |
| Floating/draggable panels on phone | Fixed snap-point bottom sheets provide better UX |
| Compliance filing or document generation | Different product domain |
| Offline/PWA capabilities | Future enhancement after responsive web is solid |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CANV-01 through CANV-10 | Phases 1-5 (v1.0) | Done |
| ENT-01 through ENT-10 | Phases 2, 5 (v1.0) | Done |
| CONN-01 through CONN-10 | Phases 4-5 (v1.0) | Done |
| AI-01 through AI-08 | Phase 6 (v1.0) | Done |
| PERS-03 through PERS-05 | Phase 7 (v1.0) | Done |
| RESP-01 | Phase 11 | Pending |
| RESP-02 | Phase 11 | Pending |
| RESP-03 | Phase 11 | Pending |
| RESP-04 | Phase 11 | Pending |
| RESP-05 | Phase 11 | Pending |
| TOUCH-01 | Phase 11 | Pending |
| TOUCH-02 | Phase 11 | Pending |
| TOUCH-03 | Phase 11 | Pending |
| TOUCH-04 | Phase 11 | Pending |
| TOUCH-05 | Phase 11 | Pending |
| MENT-01 | Phase 12 | Done |
| MENT-02 | Phase 12 | Done |
| MENT-03 | Phase 12 | Done |
| MENT-04 | Phase 12 | Done |
| MPROP-01 | Phase 13 | Pending |
| MPROP-02 | Phase 13 | Pending |
| MPROP-03 | Phase 13 | Pending |
| MPROP-04 | Phase 13 | Pending |
| MPROP-05 | Phase 13 | Pending |
| MNAV-04 | Phase 13 | Pending |
| MCONN-01 | Phase 14 | Pending |
| MCONN-02 | Phase 14 | Pending |
| MCONN-03 | Phase 14 | Pending |
| MCONN-04 | Phase 14 | Pending |
| MNAV-01 | Phase 15 | Pending |
| MNAV-02 | Phase 15 | Pending |
| MNAV-03 | Phase 15 | Pending |
| MPOL-01 | Phase 15 | Pending |
| MPOL-02 | Phase 15 | Pending |
| MPOL-03 | Phase 15 | Pending |
| MPOL-04 | Phase 16 | Pending |
| MPOL-05 | Phase 16 | Pending |

**Coverage:**
- v1.0 requirements: 38 shipped
- v1.1 requirements: 32 total
- Mapped to phases: 32/32
- Unmapped: 0

---
*Requirements defined: 2026-02-13*
*Last updated: 2026-03-04 after v1.1 roadmap creation*
