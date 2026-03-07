# Milestones: Tax Structuring Tool

## v1.0 — Core Product (Complete)

**Shipped:** 2026-02-18
**Phases:** 1–7 (of 9 planned; Phases 8–9 deferred)
**Last phase number:** 9

**What shipped:**
- Grid canvas with pan, zoom, snap-to-grid (Lucidchart-quality)
- Full Australian entity palette (12 types) with drag-drop placement
- Professional editing: select, move, resize, delete, undo/redo, copy/paste, keyboard shortcuts
- Typed connections: equity, debt, trustee/beneficiary, agreements with labels/properties
- Smart canvas: validation warnings, connection filtering, auto-layout, template structures
- AI analysis engine: Gemini-powered streaming analysis with formation/transaction steps, investor/fund-level tax implications, disclaimer, PDF export
- Local persistence: save/load to localStorage, auto-save, structure dashboard

**Deferred to future:**
- Sharing (share links with view-only/editable modes)
- Entity customization (shapes, colors, icons per type)

**Requirements shipped:** 38 of 50 v1 requirements completed
**Key decisions:** Next.js 16, React Flow 12, Zustand 5, Zod v4, Vercel AI SDK v6, dagre auto-layout, localStorage persistence (replaced original Supabase plan)

---

## v1.1 — Mobile Experience (Complete)

**Shipped:** 2026-03-06
**Phases:** 10–16 (7 phases, 10 plans)
**Last phase number:** 16
**Timeline:** 3 days (2026-03-04 → 2026-03-06)
**Stats:** 75 files changed, +10,297 lines, zero new dependencies

**What shipped:**
- Responsive layout shell: full-screen canvas on phone (<768px), two-column on tablet (768-1024px), desktop unchanged
- Touch canvas: pinch-to-zoom, single-finger pan, tap-to-select, touch-drag entities via React Flow
- Mobile entity creation: FAB + bottom sheet palette with tap-to-add, grid snap, overlap avoidance
- Mobile properties editing: bottom sheets for entity/connection properties, keyboard-aware snap, AI analysis overlay
- Tap-to-connect flow: connect mode toolbar toggle, source highlight, instruction banner, MobileConnectionTypePicker
- Mobile toolbar: undo/redo, connect, edit tools + overflow menu (save, templates, auto-layout, export PNG)
- Long-press context menu: delete, copy, connect, properties actions on entities
- Touch polish: all CSS :hover rules guarded with @media (hover: hover), :active feedback on all interactive elements
- Tablet MiniMap for navigating large structures
- Performance hardening: viewport culling (onlyRenderVisibleElements), drag transition suppression, backdrop-blur removal on mobile
- Safe-area insets: env(safe-area-inset-bottom) on toolbar, MobilePalette, BottomSheet for notch/home-indicator devices

**Deferred to future:**
- Sharing (share links with view-only/editable modes) — Phase 8
- Entity customization (shapes, colors, icons per type) — Phase 9

**Requirements shipped:** 32 of 32 v1.1 requirements completed (RESP-01 through MPOL-05)
**Key decisions:** Zero new dependencies for mobile, BottomSheet as primary mobile pattern, ref-based positioning for 60fps touch, CSS class toggle for drag suppression, plain CSS safe-area utilities (not Tailwind plugin)

---


## v2.0 — Multi-Jurisdiction (Complete)

**Shipped:** 2026-03-08
**Phases:** 17–21 (5 phases, 10 plans)
**Last phase number:** 21
**Timeline:** 2 days (2026-03-07 → 2026-03-08)
**Stats:** 56 files changed, +8,773 lines, zero new dependencies

**What shipped:**
- 54-entry entity registry spanning 6 jurisdictions (AU, UK, US, HK, SG, LU) with 9 UK, 11 US, 6 HK, 7 SG, 10 LU entity types — visually distinct shapes, colors, and flag emojis
- Jurisdiction tab bar in desktop sidebar and mobile bottom sheet palettes with cross-jurisdiction search and flag-annotated results
- Per-jurisdiction registration fields (Company Number, EIN, CR Number, UEN, RCS Number) and tax status fields with 12 regex validators and 54 Zod schemas
- Cross-border connection metadata: withholding tax rate, payment type, treaty references, transfer pricing flags, ISO 4217 currency — with amber double-stroke visual differentiation
- 11-rule graph validator with jurisdiction-specific structural rules (US S Corp shareholders, SG VCC fund manager, HK LPF fund manager) and cross-jurisdiction false-positive prevention
- Jurisdiction color legend (auto-appears at 2+ jurisdictions), left-border color accents per jurisdiction, flag emoji on all entity nodes

**Deferred to future:**
- Multi-jurisdiction AI analysis engine (cross-border treaty, WHT, PE, CFC, TP analysis)
- Cross-border template structures
- WHT rate matrix, PE risk flags, CFC warnings, jurisdiction comparison

**Requirements shipped:** 25 of 25 v2.0 requirements completed (EREG-01 through VAL-02)
**Tech debt:** 4 minor items (2 orphaned exports, TP auto-flag label mismatch, clip-path accent limitation)
**Key decisions:** Entity registry as single source of truth, jurisdiction-first dispatch in UI, inline cross-border detection, amber opacity-0.3 double-stroke, left-border-only accent preserving selection highlight

---

