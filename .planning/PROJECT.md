# Tax Structuring Tool

## What This Is

A web application for tax lawyers to visually design multi-entity, multi-jurisdiction tax structures on a grid canvas, automatically see the legal and transactional steps required to create those structures, and get AI-powered tax analysis at both investor and fund level. Supports 6 jurisdictions (AU, UK, US, HK, SG, LU) with 54 entity types, cross-border connection metadata, and jurisdiction-specific validation. Works on desktop, tablet, and phone with full touch-friendly editing. Replaces the manual PowerPoint/Visio workflows tax professionals use today.

## Core Value

Tax lawyers can draw a structure and instantly understand its tax implications — no more manually piecing together diagrams and analysis across disconnected tools.

## Requirements

### Validated

<!-- Shipped and confirmed valuable -->

- ✓ Lucidchart-style grid canvas with snap-to-grid behavior — v1.0
- ✓ Drag-and-drop entity shapes from a sidebar palette — v1.0
- ✓ Full spectrum Australian entity types (12 types) — v1.0
- ✓ Debt and equity connection lines with labeled relationship types — v1.0
- ✓ Formation and transaction steps panel — v1.0
- ✓ AI-powered "Analyze Structure" with streaming Gemini analysis — v1.0
- ✓ AI analysis: investor-level and fund-level tax implications — v1.0
- ✓ AI analysis report in right-side panel with PDF export — v1.0
- ✓ Local persistence: save/load, auto-save, dashboard — v1.0
- ✓ Smart canvas: validation, filtering, auto-layout, templates — v1.0
- ✓ Professional editing: undo/redo, copy/paste, keyboard shortcuts — v1.0
- ✓ Responsive layout: full-screen canvas on phone, two-column on tablet, desktop unchanged — v1.1
- ✓ Touch canvas: pinch-to-zoom, touch-drag, tap-to-select, long-press context menu — v1.1
- ✓ Mobile entity placement via FAB + bottom sheet palette with tap-to-add — v1.1
- ✓ Tap-to-connect flow with source highlight, instruction banner, enlarged handles — v1.1
- ✓ Mobile properties/analysis as bottom sheets with keyboard-aware snap — v1.1
- ✓ Mobile toolbar with undo/redo, connect, edit, overflow menu (save/templates/layout/export) — v1.1
- ✓ Tablet MiniMap and two-column layout — v1.1
- ✓ All hover interactions touch-safe with :active feedback — v1.1
- ✓ Viewport culling, transition suppression, safe-area insets for notch devices — v1.1
- ✓ Multi-jurisdiction entity types: UK (9), US (11), HK (6), SG (7), LU (10) with distinct shapes, colors, flags — v2.0
- ✓ Mixed cross-border structures on a single canvas with amber visual differentiation — v2.0
- ✓ Jurisdiction-organized palette with 6 tabs and cross-jurisdiction search — v2.0
- ✓ Per-jurisdiction registration fields, tax status fields, and format validation (54 Zod schemas) — v2.0
- ✓ Cross-border connection metadata: WHT, treaty, TP flags, currency — v2.0
- ✓ Jurisdiction-aware validation rules (11 rules) with false-positive prevention — v2.0
- ✓ Jurisdiction color legend and left-border accent for visual navigation — v2.0

### Active

<!-- Next milestone — defining requirements -->

(None yet — run `/gsd:new-milestone` to define next milestone)

### Out of Scope

- Real-time multi-user collaboration — share links are sufficient
- Offline/PWA capabilities — future enhancement after responsive web is solid
- Non-covered jurisdictions — jurisdictions beyond AU, UK, US, HK, SG, LU come in future milestones
- Compliance filing or document generation — structuring and analysis tool, not compliance
- Native mobile app (React Native/Flutter) — responsive web handles mobile needs

## Current State

**Shipped:** v1.0 Core Product (2026-02-18) + v1.1 Mobile Experience (2026-03-06) + v2.0 Multi-Jurisdiction (2026-03-08)
**Source:** 14,218 LOC TypeScript across 80+ files
**Stack:** Next.js 16.1.6, React 19.2.3, React Flow 12.10.0, Zustand 5.0.11, Tailwind CSS v4.1.18, Gemini 2.5 Flash
**Approach:** Zero external dependencies for mobile or multi-jurisdiction — all touch primitives native APIs, all entity data in a single registry
**Entity registry:** 54 entity types across 6 jurisdictions (AU 12, UK 9, US 11, HK 6, SG 7, LU 10)

## Context

**Current workflow:** Tax lawyers draw entity structures in PowerPoint or Visio manually, then separately analyze tax implications. There is no tool that combines visual structuring with automated tax logic.

**Target users:** Any tax professional doing entity structuring — Big Law tax teams, in-house tax departments at funds/PE firms/multinationals, and solo/small firm practitioners.

**Jurisdiction coverage:** 6 jurisdictions shipped (AU, UK, US, HK, SG, LU) with full entity type palettes, jurisdiction-specific property fields, cross-border connection metadata, and multi-jurisdiction validation. Future milestones may add Cayman, BVI, Ireland, Netherlands, Japan.

**Australian tax context:** The tool must understand Australian tax concepts including:
- Corporate tax rates (25% base rate entity / 30% otherwise)
- Trust taxation (present entitlement, trust distribution rules, streaming)
- CGT discount (50% for individuals/trusts holding 12+ months)
- Franking credits and imputation system
- MIT/AMIT withholding tax regime for foreign investors
- VCLP/ESVCLP carried interest and CGT concessions
- Thin capitalisation rules for debt structures
- Part IVA general anti-avoidance provisions

**AI integration:** The analysis engine is model-flexible. Gemini 2.5 Flash is preferred for speed/cost, but the architecture should support swapping models. The AI receives a serialized representation of the structure (entities, connections, relationship types) and returns a structured tax analysis. Multi-jurisdiction AI analysis (cross-border treaty, WHT, PE, CFC, TP) is deferred to a future milestone.

## Constraints

- **Tech stack**: Web-first — must run in modern browsers without plugins
- **AI model**: Must support Gemini 2.5 Flash API; architecture should be model-agnostic for future flexibility
- **Jurisdiction**: 6 jurisdictions shipped (AU, UK, US, HK, SG, LU); entity type registry and AI prompts are jurisdiction-extensible
- **Canvas**: Must feel responsive and professional — Lucidchart-quality interaction (snap to grid, smooth dragging, clean connection lines)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Australia-first jurisdiction | User's primary market and expertise | ✓ Good — 12 entity types shipped |
| Gemini 2.5 Flash as default AI | Speed and cost for real-time analysis | ✓ Good — streaming analysis works well |
| Web-first platform | Accessibility for all user types, no install friction | ✓ Good — desktop + mobile from single codebase |
| Lucidchart-style canvas UX | Familiar interaction model for professionals | ✓ Good — React Flow delivers |
| Model-agnostic AI architecture | Flexibility to swap/add models as needs evolve | ✓ Good — model swap is config change |
| Share via links (not real-time collab) | Simpler v1, covers most professional workflows | — Pending (deferred) |
| Responsive web over native app | Single codebase, no app store friction, progressive enhancement | ✓ Good — full mobile editing without native app |
| Mobile-first v1.1 milestone | Users need mobile access for meetings/travel; biggest gap in current product | ✓ Good — 7 phases, 10 plans, 3 days |
| Zero new dependencies for mobile | Minimize bundle size, avoid framework lock-in | ✓ Good — all primitives native APIs |
| BottomSheet as primary mobile pattern | Consistent with iOS/Android UX conventions | ✓ Good — palette, properties, context menu all use it |
| All 5 jurisdictions in one milestone | Users need cross-border structures; partial jurisdiction support has limited value | ✓ Good — 54 entity types, 5 phases, 2 days |
| Entity registry as single source of truth | One data structure drives palette, properties, validation, and canvas | ✓ Good — zero duplication across 6 jurisdictions |
| Jurisdiction-first dispatch in UI | Switch on jurisdiction before entity type to isolate per-jurisdiction rendering | ✓ Good — zero AU regressions, clean separation |
| Inline cross-border detection | Compare jurisdictions at each use site rather than shared hook | ✓ Good — simpler, no extra abstraction |
| Left-border-only accent for jurisdiction | Preserves selection highlight on other 3 borders | ✓ Good — works with existing selection UX |

---
*Last updated: 2026-03-08 after v2.0 milestone completion*
