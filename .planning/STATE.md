# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-06)

**Core value:** Tax lawyers can draw a structure and instantly understand its tax implications
**Current focus:** Phase 19 — Properties and Field Validation (v2.0 Multi-Jurisdiction)

## Current Position

Phase: 18 of 21 (Jurisdiction Palette) -- COMPLETE
Plan: 2 of 2 in current phase
Status: Phase 18 Complete
Last activity: 2026-03-07 — Completed 18-02 (Cross-Jurisdiction Search)

Progress: v1.0 (17/17) + v1.1 (10/10) = 27 plans shipped | v2.0: [####------] 40% (4/10 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 31
- Average duration: 8 min
- Total execution time: ~3.9 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-canvas-foundation | 4/4 | 37 min | 9 min |
| 02-entity-system | 2/2 | ~15 min | ~8 min |
| 03-canvas-interactions | 2/2 | 11 min | 6 min |
| 04-connection-system | 2/2 | 8 min | 4 min |
| 05-smart-canvas | 2/2 | 22 min | 11 min |
| 06-ai-analysis-engine | 2/2 | 39 min | 20 min |
| 07-local-persistence | 3/3 | 10 min | 3 min |
| 10-mobile-foundation | 1/1 | 3 min | 3 min |
| 11-responsive-layout-shell | 2/2 | 7 min | 4 min |
| 12-mobile-entity-management | 1/1 | 5 min | 5 min |
| 13-mobile-properties-editing | 2/2 | 12 min | 6 min |
| 14-mobile-connection-drawing | 1/1 | 4 min | 4 min |
| 15-hover-audit-toolbar-completion | 2/2 | 6 min | 3 min |
| 16-performance-real-device-testing | 1/1 | 5 min | 5 min |
| 17-data-model-entity-registry | 2/2 | 7 min | 4 min |
| 18-jurisdiction-palette | 2/2 | 6 min | 3 min |

**Recent Trend:**
- Last 5 plans: 5 min, 4 min, 3 min, 3 min, 3 min
- Trend: Stable

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap v2.0]: 5 phases (17-21) derived from 25 requirements at comprehensive depth
- [Roadmap v2.0]: AI analysis engine deferred to future milestone (not built in v2.0)
- [Roadmap v2.0]: Entity registry expanded in one phase (not split by jurisdiction) to avoid horizontal layers
- [Roadmap v2.0]: Cross-border connection metadata and canvas visuals combined in Phase 20
- [Roadmap v2.0]: Validation refactored from hardcoded AU Sets to registry-derived Sets in Phase 21
- [Research]: EntityCategory type must be extended before adding non-AU entity registry entries -- DONE in 17-01
- [Research]: Graph validator hardcodes AU entity IDs — must derive from registry before cross-border validation
- [Research]: Zero new dependencies — all work is data model expansion and UI rendering
- [17-01]: Unicode escape sequences for flag emojis to match existing AU pattern
- [17-01]: New categories in logical palette order: fund after partnership, holding after fund, pension at end
- [17-01]: CanvasLegend required auto-fix for Record<EntityCategory> after type expansion
- [17-02]: JURISDICTIONS registry lookup with optional chaining for safe flag resolution across all jurisdictions
- [17-02]: canvasJurisdiction injected into EntityPalette useMemo for jurisdiction-aware palette filtering
- [18-01]: flex-1 tab layout for 6 jurisdiction tabs fitting 256px sidebar and all mobile widths
- [18-01]: selectedPaletteJurisdiction independent from canvasJurisdiction, synced via useEffect
- [18-01]: MobilePalette uses config.jurisdiction for entity node data (not canvasJurisdiction)
- [18-02]: Inline cross-jurisdiction filter in palettes rather than calling searchAllEntities (avoids second grouping step)
- [18-02]: Mobile search uses local useState, not shared paletteSearchQuery, to avoid cross-device state confusion
- [18-02]: showFlag prop threaded through PaletteCategory on desktop; inline flags on mobile

### Pending Todos

None.

### Blockers/Concerns

- ~~EntityCategory type hardcoded to AU classifications~~ — RESOLVED in 17-01 (now 9 categories)
- Graph validator hardcodes AU entity ID Sets — must refactor before adding jurisdiction rules (VAL pitfall)
- Tax status fields per jurisdiction based on training data — practitioner review needed before professional use
- Registration number format regexes need verification against official registrar documentation

## Session Continuity

Last session: 2026-03-08
Stopped at: Phase 18 complete — ready to plan Phase 19
Resume file: None
