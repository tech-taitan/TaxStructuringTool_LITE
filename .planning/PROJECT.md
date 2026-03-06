# Tax Structuring Tool

## What This Is

A web application for tax lawyers to visually design multi-entity tax structures on a grid canvas, automatically see the legal and transactional steps required to create those structures, and get AI-powered tax analysis at both investor and fund level. Works on desktop, tablet, and phone with full touch-friendly editing. Replaces the manual PowerPoint/Visio workflows tax professionals use today.

## Core Value

Tax lawyers can draw a structure and instantly understand its tax implications — no more manually piecing together diagrams and analysis across disconnected tools.

## Requirements

### Validated

<!-- Shipped and confirmed valuable in v1.0 -->

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

### Active

<!-- v2.0 Multi-Jurisdiction — defining requirements -->

- Multi-jurisdiction entity types: UK, US, Hong Kong, Singapore, Luxembourg (full depth, 8-15 types each)
- Mixed cross-border structures on a single canvas
- Jurisdiction-organized palette (all 6 jurisdictions visible)
- Cross-border AI analysis: treaty implications, withholding taxes, PE risk, transfer pricing flags
- Jurisdiction-aware validation rules per entity type

### Out of Scope

- Real-time multi-user collaboration — share links are sufficient
- Offline/PWA capabilities — future enhancement after responsive web is solid
- Non-covered jurisdictions — jurisdictions beyond AU, UK, US, HK, SG, LU come in future milestones
- Compliance filing or document generation — structuring and analysis tool, not compliance
- Native mobile app (React Native/Flutter) — responsive web handles mobile needs

## Current State

**Shipped:** v1.0 Core Product (2026-02-18) + v1.1 Mobile Experience (2026-03-06)
**Source:** 11,368 LOC TypeScript across 75+ files
**Stack:** Next.js 16.1.6, React 19.2.3, React Flow 12.10.0, Zustand 5.0.11, Tailwind CSS v4.1.18, Gemini 2.5 Flash
**Approach:** Zero external dependencies for mobile — all touch primitives built with native APIs (matchMedia, rAF, touch events, visualViewport)
**Next milestone:** v2.0 Multi-Jurisdiction — UK, US, HK, Singapore, Luxembourg entity types with cross-border AI analysis

## Context

**Current workflow:** Tax lawyers draw entity structures in PowerPoint or Visio manually, then separately analyze tax implications. There is no tool that combines visual structuring with automated tax logic.

**Target users:** Any tax professional doing entity structuring — Big Law tax teams, in-house tax departments at funds/PE firms/multinationals, and solo/small firm practitioners.

**Jurisdiction roadmap:** Australia shipped in v1.0. v2.0 adds UK, US, Hong Kong, Singapore, and Luxembourg — each with full entity type palettes, jurisdiction-specific tax rules, and cross-border analysis. Future milestones may add additional jurisdictions.

**Australian tax context:** The tool must understand Australian tax concepts including:
- Corporate tax rates (25% base rate entity / 30% otherwise)
- Trust taxation (present entitlement, trust distribution rules, streaming)
- CGT discount (50% for individuals/trusts holding 12+ months)
- Franking credits and imputation system
- MIT/AMIT withholding tax regime for foreign investors
- VCLP/ESVCLP carried interest and CGT concessions
- Thin capitalisation rules for debt structures
- Part IVA general anti-avoidance provisions

**AI integration:** The analysis engine is model-flexible. Gemini 2.5 Flash is preferred for speed/cost, but the architecture should support swapping models. The AI receives a serialized representation of the structure (entities, connections, relationship types) and returns a structured tax analysis.

## Constraints

- **Tech stack**: Web-first — must run in modern browsers without plugins
- **AI model**: Must support Gemini 2.5 Flash API; architecture should be model-agnostic for future flexibility
- **Jurisdiction**: v2.0 expands to 6 jurisdictions (AU, UK, US, HK, SG, LU); entity type registry and AI prompts must be jurisdiction-extensible
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
| Zero new dependencies for mobile | Minimize bundle size, avoid framework lock-in | ✓ Good — all primitives native APIs (~80 lines spring, ref-based BottomSheet) |
| BottomSheet as primary mobile pattern | Consistent with iOS/Android UX conventions | ✓ Good — palette, properties, context menu all use it |

| All 5 jurisdictions in one milestone | Users need cross-border structures; partial jurisdiction support has limited value | — Pending |

---
*Last updated: 2026-03-06 after v2.0 milestone start*
