# Tax Structuring Tool (LITE)

I spend my days working with tax structure diagrams and mapping out the companies, trusts, partnerships, and ownership chains that sit behind real businesses and family groups. It's detailed, visual work, and the tools I had available never quite fit my use case. General diagramming apps don't understand what a discretionary trust is and PowerPoint, visio just never really did it. Specialised tax software buries the visual side under compliance workflows.

So I built this.

Tax Structuring Tool LITE is a free, open-source starting point for anyone who works with entity structure diagrams. It ships with Australian entity types and relationship categories baked in, but the codebase is designed to be forked, extended, and adapted. If you work in tax, legal, corporate advisory, or wealth planning and you've wished for a better diagramming tool — this is the foundation to build on.

No backend. No accounts. Everything runs in your browser and saves to localStorage. Clone it, run it, make it yours.

## What You Can Do

**Drag, drop, and connect entities** on an interactive canvas with pan, zoom, snap-to-grid, and dark mode. Draw typed relationships between them — equity, debt, trustee, beneficiary, partnership, management, services, licensing — each color-coded and carrying its own metadata (ownership percentages, interest rates, share classes, and more).

**Start from templates** like a Family Trust with Corporate Beneficiary, a VCLP structure, or a MIT with Foreign Investors. Or start from a blank canvas.

**Export your work** as PNG, SVG, or PDF for client presentations and documentation.

**Edit efficiently** with undo/redo, copy/paste, multi-select alignment tools, auto-layout, right-click context menus, and keyboard shortcuts for everything (press `?` to see them all).

## Entity Types

Eleven Australian entity types across six categories, each with a distinct shape and color:

| Category | Entities | Shape | Color |
|----------|----------|-------|-------|
| Companies | Pty Ltd | Rectangle | Blue |
| Trusts | Unit, Discretionary, Hybrid, MIT, SMSF | Triangle | Violet |
| Partnerships | General, Limited | Triangle | Emerald |
| Venture Capital | VCLP, ESVCLP | Triangle | Amber |
| Individuals | Individual | Oval | Slate |
| Super Funds | SMSF | Triangle | Teal |

Every entity carries jurisdiction-specific fields — ABN, ACN, TFN — plus tax status configuration and freeform notes.

## Relationships

Seven relationship types, each with its own color and metadata fields:

- **Equity** (blue) — ownership percentage, share class
- **Debt** (red) — principal, interest rate, maturity, security
- **Trustee / Beneficiary** (purple) — fixed or discretionary
- **Partnership** (green) — partnership interest
- **Management / Services / Licensing** (gray) — control and contract arrangements

Filter by type to isolate a single layer of the structure, or highlight one relationship category to focus your analysis.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start building.

## Build On It

This is a starting point, not a finished product. The codebase is structured to make it straightforward to extend:

```
src/
  app/                    # Next.js pages (home, dashboard, editor)
  components/
    canvas/               # React Flow canvas, nodes, edges, legend
    palette/              # Entity drag-and-drop sidebar
    properties/           # Entity properties panel (identity, tax, notes)
    connections/          # Connection type picker and properties
    toolbar/              # Editor toolbar (zoom, layout, export, filters)
    templates/            # Pre-built structure templates
    context-menu/         # Right-click menus
  stores/
    graph-store.ts        # Zustand store for entities and relationships
    ui-store.ts           # UI state (panels, mode, theme)
  hooks/                  # Auto-save, validation, keyboard shortcuts
  lib/
    local-storage-db.ts   # localStorage persistence layer
    export.ts             # PNG/SVG/PDF export
    validation/           # Zod schemas for entities and relationships
```

Some ideas for where to take it:
- Add entity types for other jurisdictions (US LLCs, UK LLPs, etc.)
- Wire up a backend for multi-user collaboration and cloud sync
- Add tax calculation logic on top of the relationship graph
- Build data export formats (JSON, CSV) alongside the visual exports
- Integrate with compliance or document management systems

## Tech Stack

- **Framework**: Next.js 16 + React 19 + TypeScript
- **Canvas**: React Flow (XYFlow) v12
- **State**: Zustand + Zundo (undo/redo) + Immer
- **Styling**: Tailwind CSS v4
- **Layout**: Dagre for auto-arrangement
- **Export**: html-to-image + jsPDF
- **Validation**: Zod

## Current Limitations

- Desktop and tablet only (no mobile support)
- Single-user, single-browser (no sync or collaboration)
- ~5-10MB localStorage limit (suitable for ~50-100 structures)
- Australian jurisdiction focus
- Visual export only (no data export format yet)

## License

Open source. Fork it, extend it, ship something better.
