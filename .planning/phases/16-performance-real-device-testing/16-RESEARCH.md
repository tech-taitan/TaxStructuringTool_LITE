# Phase 16: Performance and Real-Device Testing - Research

**Researched:** 2026-03-06
**Domain:** Mobile web performance, CSS safe-area-insets, viewport culling, transition suppression, real-device testing
**Confidence:** HIGH

## Summary

Phase 16 is a polish and validation phase with four workstreams: (1) performance optimization so 20+ entities render smoothly on mid-range mobile hardware, (2) CSS transition suppression during drag to eliminate frame drops, (3) safe-area-inset implementation for notch/home-indicator devices, and (4) real-device testing across iOS Safari, Android Chrome, and iPad Safari.

The codebase audit reveals the app is already well-structured for performance -- EntityNode is `memo`-wrapped, `nodeTypes`/`edgeTypes` are defined outside components, the BottomSheet uses ref-based positioning (no React state during drag), and the spring animation uses pure rAF. However, several performance gaps exist: (a) `backdrop-filter: blur()` on the mobile toolbar creates expensive GPU compositing layers during pan/zoom, (b) CSS `transition: box-shadow 0.15s ease, filter 0.15s ease` on `.entity-node` fires during every drag frame causing paint storms, (c) React Flow's `onlyRenderVisibleElements` is not enabled (default `false`), and (d) safe-area-inset CSS is completely absent despite `viewportFit: 'cover'` being set in the root layout -- the `pb-safe` class used in MobilePalette is undefined and silently ignored.

**Primary recommendation:** Split into one plan (16-01) covering all four workstreams: enable `onlyRenderVisibleElements`, suppress transitions during drag via a CSS class toggle, replace `backdrop-blur-sm` with a solid semi-transparent background on mobile, add `env(safe-area-inset-*)` to all fixed bottom elements, and create a manual real-device test checklist validated against the full feature set.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @xyflow/react | 12.10.0 | React Flow canvas with `onlyRenderVisibleElements` | Already in project; built-in viewport culling |
| Tailwind CSS | 4.1.18 | Utility CSS with `@media (hover: hover)` | Already in project; safe-area via custom utilities |
| React | 19.2.3 | Component framework with memo/useCallback | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A | - | No new libraries needed | All optimizations use existing stack |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual device testing | BrowserStack / Playwright + real devices | Adds paid service dependency; manual testing is sufficient for a single-phase validation pass |
| `tailwindcss-safe-area` plugin | Hand-rolled CSS utilities | Adding a dependency for 4 CSS rules is overkill; use raw `env()` in globals.css |
| React virtualization (react-window) | React Flow's `onlyRenderVisibleElements` | React Flow's built-in culling handles node/edge virtualization natively |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── globals.css              # Safe-area utilities, drag transition suppression
│   └── layout.tsx               # Already has viewportFit: 'cover' (good)
├── components/
│   ├── canvas/
│   │   └── Canvas.tsx           # Add onlyRenderVisibleElements, drag class toggle
│   ├── editor/
│   │   └── MobileEditorLayout.tsx  # Safe-area insets on toolbar, remove backdrop-blur
│   └── mobile/
│       ├── BottomSheet.tsx       # Safe-area insets on full-height sheet
│       ├── MobileContextMenu.tsx # Verify safe-area clamping
│       └── MobilePalette.tsx     # Fix dead pb-safe class
```

### Pattern 1: Transition Suppression During Drag
**What:** Add a CSS class `is-dragging` to the React Flow container during node drag that disables expensive transitions and effects on all entity nodes.
**When to use:** During `onNodeDragStart` → `onNodeDragStop` lifecycle.
**Why:** The `.entity-node` has `transition: box-shadow 0.15s ease, filter 0.15s ease` which fires on EVERY frame during drag (React Flow updates transform positions continuously). This causes the browser to compute transitions for all visible nodes on every frame, creating paint storms on mobile.

```css
/* Source: Codebase analysis + web performance best practices */

/* Suppress ALL transitions on entity nodes during drag */
.react-flow.is-dragging .entity-node {
  transition: none !important;
}

/* Also suppress clip-path drop-shadow repaints */
.react-flow.is-dragging .entity-node--triangle,
.react-flow.is-dragging .entity-node--diamond,
.react-flow.is-dragging .entity-node--hexagon,
.react-flow.is-dragging .entity-node--shield {
  filter: none !important;
}
```

```tsx
// In Canvas.tsx:
const [isDragging, setIsDragging] = useState(false);

const onNodeDragStart = useCallback(() => {
  setIsDragging(true);
  useGraphStore.temporal.getState().pause();
}, []);

const onNodeDragStop = useCallback(() => {
  setIsDragging(false);
  useGraphStore.temporal.getState().resume();
}, []);

// On the wrapper div:
<div className={`w-full h-full canvas-mode-${interactionMode}${isDragging ? ' is-dragging' : ''}`}>
```

### Pattern 2: Backdrop-Filter Audit for Mobile
**What:** Replace `backdrop-blur-sm` (Tailwind: `backdrop-filter: blur(4px)`) with solid semi-transparent backgrounds on mobile to avoid expensive GPU compositing layers.
**When to use:** The mobile bottom toolbar in MobileEditorLayout.tsx and the CanvasLegend.

**Current (problematic on mobile):**
```tsx
className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
```

**Fixed (performant on mobile):**
```tsx
// Use useDeviceCapabilities to conditionally apply
className={`${isMobile
  ? 'bg-white dark:bg-gray-800'
  : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm'}`}
```

**Rationale:** `backdrop-filter: blur()` creates a new GPU compositing layer and forces the browser to re-render the blurred area every frame during pan/zoom. On mid-range mobile devices, this can drop frames significantly. Desktop GPUs handle this fine.

**Identified backdrop-filter usages:**
| File | Line | Element | Fix |
|------|------|---------|-----|
| `MobileEditorLayout.tsx` | 94 | Bottom toolbar | Remove `backdrop-blur-sm`, use solid `bg-white` |
| `CanvasLegend.tsx` | 146 | Legend overlay | Only visible on desktop (`!isMobile` already likely) -- verify |

### Pattern 3: React Flow onlyRenderVisibleElements
**What:** Enable React Flow's built-in viewport culling to skip rendering nodes/edges outside the visible viewport.
**When to use:** For canvases with 20+ entities where off-screen nodes cause unnecessary React renders.

```tsx
<ReactFlow
  onlyRenderVisibleElements={true}  // Enable viewport culling
  // ... other props
/>
```

**Caveats (from xyflow GitHub issues):**
- Edges may not render if one connected node is off-screen AND nodes have explicit width/height set. Our nodes DO have `width: NODE_WIDTH, height: NODE_HEIGHT` set -- this is a known issue (xyflow/xyflow#4516). Need to test this carefully.
- Node internal state is remounted when scrolled back into view. This mainly affects nodes with local `useState` -- our EntityNode has `isEditing` state for inline rename which could reset. This is acceptable (editing should commit on blur anyway).
- The prop adds some overhead for the viewport-intersection calculation, so it is only beneficial for larger graphs (20+ entities is the target).

**Recommendation:** Enable it and test thoroughly. If edge rendering issues appear, the fallback is to remove explicit width/height from node creation and let React Flow measure naturally.

### Pattern 4: Safe-Area-Inset CSS Utilities
**What:** Define custom CSS utility classes that apply `env(safe-area-inset-*)` padding/margin to elements that sit against screen edges.
**When to use:** Fixed bottom toolbars, FABs, bottom sheets, and any element flush with screen edges on notch/home-indicator devices.

**Prerequisite (ALREADY DONE):**
```tsx
// layout.tsx already has:
export const viewport: Viewport = {
  viewportFit: 'cover', // ← This is required for env(safe-area-inset-*) to work
};
```

**CSS utilities to add to globals.css:**
```css
/* ============================================================
 * Safe Area Inset Utilities (Phase 16)
 * Applied to elements flush with screen edges on notch/
 * home-indicator devices. Requires viewport-fit=cover (set
 * in layout.tsx).
 * ============================================================ */

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.safe-area-top {
  padding-top: env(safe-area-inset-top, 0px);
}

.safe-area-left {
  padding-left: env(safe-area-inset-left, 0px);
}

.safe-area-right {
  padding-right: env(safe-area-inset-right, 0px);
}
```

**Elements that need safe-area-bottom:**
| Element | File | Current Bottom | Fix |
|---------|------|---------------|-----|
| Mobile bottom toolbar | `MobileEditorLayout.tsx:92` | `absolute bottom-4` | Add `safe-area-bottom` + adjust bottom offset |
| BottomSheet at full snap | `BottomSheet.tsx` | Uses `100dvh` | Sheet is full-height; content scroll area needs bottom padding |
| MobilePalette content | `MobilePalette.tsx:99` | `pb-safe` (DEAD CLASS) | Replace with `safe-area-bottom` |
| MobileContextMenu | `MobileContextMenu.tsx` | Viewport clamping via JS | Verify clamping accounts for safe area |

**Key finding:** `pb-safe` in MobilePalette.tsx line 99 is an UNDEFINED class. It is not part of Tailwind CSS v4 core, and no `tailwindcss-safe-area` plugin is installed. This class silently does nothing. Must be replaced with a working safe-area utility.

### Pattern 5: Real-Device Test Matrix
**What:** A structured manual test checklist covering all mobile features on target devices/browsers.
**When to use:** After all performance and safe-area fixes are applied.

**Target device matrix (from requirements MPOL-04, MPOL-05):**
| Device Category | Browser | Key Concern |
|----------------|---------|-------------|
| iPhone (notch) | Safari | Safe-area-inset-bottom (home indicator), safe-area-inset-top (notch) |
| iPhone (older, no notch) | Safari | 100dvh behavior, performance on A12 chip |
| Android mid-range | Chrome | 60fps pan/zoom/drag with 20+ entities |
| iPad | Safari | Tablet layout, MiniMap usability, landscape safe areas |

**Test scenarios per device:**
1. Load a 20+ entity structure -- verify smooth pan, zoom, pinch
2. Drag an entity -- verify no jank or frame drops during drag
3. Open bottom sheet (palette, properties) -- verify spring animation is smooth
4. Verify bottom toolbar is above home indicator / not clipped
5. Verify BottomSheet at full snap doesn't overlap status bar / notch
6. Test connect mode: tap-to-connect flow
7. Test context menu: long-press, position clamping near screen edges
8. Test overflow menu: open/close
9. Test landscape orientation (if applicable)
10. Test with slow 3G network (loading behavior)

### Anti-Patterns to Avoid
- **Don't use `will-change` everywhere:** Adding `will-change: transform` to all nodes creates excessive GPU layers. React Flow already applies `transform` to node wrappers, so the browser promotes them automatically. Adding `will-change` on the `.entity-node` inner div is unnecessary and wastes VRAM.
- **Don't disable all animations globally:** Only suppress transitions DURING drag. The scale-in animation, context menu animation, and spring animations are essential UX polish that should remain.
- **Don't set `onlyRenderVisibleElements` without testing edge rendering:** The explicit width/height on nodes can cause edge rendering bugs. Test with 20+ entities where some are off-screen and verify edges still render between on-screen and off-screen nodes.
- **Don't use `constant()` for safe-area-insets:** The old iOS 11.0 syntax. Always use `env()` which is universally supported (iOS 11.2+, all modern browsers).
- **Don't add `backdrop-filter` to elements that move during interaction:** The toolbar is static, but if any `backdrop-filter` element animates or is overlaid on the canvas during pan/zoom, it will cause frame drops.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Viewport culling | Custom intersection observer for nodes | `onlyRenderVisibleElements` prop | Built into React Flow, handles edges too |
| CSS safe-area insets | Complex JS-based inset detection | `env(safe-area-inset-*)` CSS | Native browser API, zero JS, works everywhere |
| Spring animation physics | New animation library | Existing `src/lib/spring.ts` | Already implemented with ~80 lines, 60fps proven |
| Frame rate monitoring | Custom rAF-based FPS counter | Chrome DevTools Performance panel | DevTools provides accurate frame-level analysis |

**Key insight:** This phase is about REMOVING performance obstacles and ADDING CSS insets -- not building new features. The existing architecture is sound; the issues are specific CSS properties and missing configuration.

## Common Pitfalls

### Pitfall 1: Entity Node Transition During Drag Causes Paint Storms
**What goes wrong:** Every frame during node drag, React Flow updates the wrapper transform. The `.entity-node` has `transition: box-shadow 0.15s ease, filter 0.15s ease` which the browser tries to animate on every position update, causing the compositor to recalculate transitions for ALL visible nodes every frame.
**Why it happens:** The transition was added for hover state smoothness but fires on any style recalculation, including transform-triggered repaints.
**How to avoid:** Add `.is-dragging .entity-node { transition: none !important; }` class during drag lifecycle.
**Warning signs:** Profiler shows long "Recalculate Style" entries during node drag; visible jank on mid-range phones.

### Pitfall 2: backdrop-filter on Mobile Toolbar Causing Frame Drops During Pan
**What goes wrong:** The `backdrop-blur-sm` on the mobile bottom toolbar creates a GPU compositing layer that must re-render the blurred canvas content on every pan/zoom frame.
**Why it happens:** `backdrop-filter: blur()` reads from the pixels behind the element and applies a Gaussian blur. During canvas pan/zoom, those background pixels change every frame, forcing re-blur every frame.
**How to avoid:** Use solid `bg-white` (not `bg-white/90 backdrop-blur-sm`) on mobile. Desktop can keep the frosted glass effect.
**Warning signs:** GPU usage spikes during pan; frame rate drops visible in DevTools Layers panel.

### Pitfall 3: Dead `pb-safe` Class Providing No Safe-Area Protection
**What goes wrong:** Content in MobilePalette appears to have safe-area bottom padding but actually has none. On iPhone with home indicator, the bottom palette items are obscured by the home indicator bar.
**Why it happens:** `pb-safe` was added assuming it was a Tailwind built-in or that a plugin was installed, but neither is true. Tailwind CSS v4 does NOT include safe-area utilities natively.
**How to avoid:** Define explicit CSS utility classes using `env(safe-area-inset-bottom)` in globals.css.
**Warning signs:** Content clipped by home indicator on iPhone X and later.

### Pitfall 4: onlyRenderVisibleElements Edge Rendering Bug
**What goes wrong:** Edges between on-screen and off-screen nodes may not render when `onlyRenderVisibleElements=true` and nodes have explicit `width`/`height` set.
**Why it happens:** React Flow's internal viewport intersection check uses node dimensions. When explicit dimensions are set, the calculation may incorrectly determine a node is off-screen, causing its connected edges to not render.
**How to avoid:** Test thoroughly with 20+ entities. If edges disappear, remove explicit `width`/`height` from node creation (let React Flow measure from DOM) or keep `onlyRenderVisibleElements` disabled and rely on other optimizations.
**Warning signs:** Edges visually disappear when one connected node is scrolled off-screen.

### Pitfall 5: Safe-Area Insets Not Updating on Orientation Change
**What goes wrong:** The safe-area-inset values are different in portrait vs landscape orientation (e.g., bottom inset only exists in portrait on iPhone, while landscape has left/right insets).
**Why it happens:** CSS `env()` values update automatically with orientation, but fixed positioning and manual JS calculations (like MobileContextMenu's viewport clamping) may not account for this.
**How to avoid:** Use CSS `env()` for all safe-area handling rather than JS-based inset detection. CSS `env()` values update reactively on orientation change.
**Warning signs:** Toolbar overlaps home indicator after rotating device.

### Pitfall 6: 100dvh on iOS Safari Can Still Cause Layout Shift
**What goes wrong:** When the iOS Safari address bar animates in/out, `100dvh` changes dynamically, causing layout recalculation.
**Why it happens:** `dvh` is the "dynamic viewport height" which includes the toolbar state. It changes as the Safari URL bar slides in/out.
**How to avoid:** The app already uses `100dvh` for MobileEditorLayout and BottomSheet, which is correct. The `overflow: hidden` on the outer container prevents scroll-triggered address bar changes. Verify this holds during testing.
**Warning signs:** Canvas height jumps when Safari address bar appears/disappears.

## Code Examples

### Example 1: Enabling onlyRenderVisibleElements
```tsx
// Source: React Flow API reference (https://reactflow.dev/api-reference/react-flow)
// In Canvas.tsx, add to ReactFlow props:

<ReactFlow
  onlyRenderVisibleElements={true}
  // ... existing props
/>
```

### Example 2: Drag Transition Suppression
```css
/* Source: Web performance best practices + codebase analysis */
/* In globals.css: */

/* Suppress entity node transitions during drag for 60fps on mobile */
.is-dragging .entity-node {
  transition: none !important;
}

/* Suppress drop-shadow filter repaints on clip-path shapes during drag */
.is-dragging .entity-node--triangle,
.is-dragging .entity-node--diamond,
.is-dragging .entity-node--hexagon,
.is-dragging .entity-node--shield {
  will-change: auto;
}
```

### Example 3: Safe-Area Bottom Toolbar
```tsx
// Source: MDN env() docs + Apple WebKit safe-area blog
// In MobileEditorLayout.tsx:

{/* Floating bottom toolbar with safe-area inset */}
<div
  className="absolute left-1/2 -translate-x-1/2 z-30
             flex items-center gap-1 px-3 py-2
             bg-white dark:bg-gray-800
             rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
  style={{ bottom: 'max(16px, calc(env(safe-area-inset-bottom, 0px) + 8px))' }}
>
```

### Example 4: Replacing Dead pb-safe Class
```tsx
// Source: Codebase analysis
// In MobilePalette.tsx, replace:
<div className="pb-safe">

// With:
<div className="safe-area-bottom">

// Where .safe-area-bottom is defined in globals.css as:
// .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
```

### Example 5: Removing backdrop-blur on Mobile Toolbar
```tsx
// Source: Performance analysis + backdrop-filter GPU impact research
// In MobileEditorLayout.tsx:

// BEFORE (creates expensive GPU compositing layer on every pan frame):
className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"

// AFTER (solid background, no GPU compositing overhead):
className="bg-white dark:bg-gray-800"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `constant(safe-area-inset-bottom)` | `env(safe-area-inset-bottom)` | iOS 11.2 (2017) | Universal browser support; old syntax removed |
| `100vh` for full-height mobile | `100dvh` (dynamic viewport height) | 2023 (Safari 15.4) | Handles iOS Safari address bar correctly |
| Manual node virtualization | React Flow `onlyRenderVisibleElements` | React Flow v11+ | Built-in viewport culling for large graphs |
| `backdrop-filter` everywhere | Conditional based on device capability | 2024+ awareness | Mobile GPUs struggle with blur during animation |
| CSS transitions on all elements always | Suppressing transitions during interaction | Standard practice | Prevents paint storms during high-frequency updates |

**Deprecated/outdated:**
- Using `constant()` for safe-area-insets -- replaced by `env()` in iOS 11.2
- Using `100vh` on mobile Safari -- use `100dvh` or `100svh`/`100lvh` for specific behaviors
- Blanket `will-change: transform` on all animated elements -- modern browsers auto-promote; explicit `will-change` wastes GPU memory

## Codebase Performance Audit Summary

### What's Already Optimized (no changes needed)
| Pattern | Location | Status |
|---------|----------|--------|
| EntityNode wrapped in `React.memo` | `EntityNode.tsx:91` | GOOD |
| `nodeTypes` and `edgeTypes` defined outside component | `nodes/index.ts`, `edges/index.ts` | GOOD |
| RelationshipEdge wrapped in `React.memo` | `RelationshipEdge.tsx:79` | GOOD |
| BottomSheet uses ref-based positioning (no React state during drag) | `BottomSheet.tsx:57-63` | GOOD |
| Spring animation is pure rAF (no React state per frame) | `spring.ts` | GOOD |
| Temporal undo paused during drag | `Canvas.tsx:252-261` | GOOD |
| Touch handlers use refs not state | `BottomSheet.tsx:57-63` | GOOD |
| CSS hover rules wrapped in `@media (hover: hover)` | `globals.css` | GOOD (done in Phase 15) |
| `snapToGrid` enabled (reduces position update frequency) | `Canvas.tsx:591` | GOOD |

### What Needs Fixing (this phase)
| Issue | Location | Impact | Priority |
|-------|----------|--------|----------|
| Missing `onlyRenderVisibleElements` | `Canvas.tsx:554` | All nodes render always, even off-screen | HIGH |
| `transition: box-shadow, filter` on entity-node during drag | `globals.css:226` | Paint storms during drag on mobile | HIGH |
| `backdrop-blur-sm` on mobile toolbar | `MobileEditorLayout.tsx:94` | GPU compositing overhead during pan | HIGH |
| Dead `pb-safe` class (no safe-area protection) | `MobilePalette.tsx:99` | Home indicator overlaps content | HIGH |
| No safe-area-inset-bottom on mobile toolbar | `MobileEditorLayout.tsx:92` | Toolbar overlaps home indicator | HIGH |
| No safe-area-inset-bottom on BottomSheet content | `BottomSheet.tsx:279` | Sheet content hidden behind home indicator | MEDIUM |
| `backdrop-blur-sm` on CanvasLegend | `CanvasLegend.tsx:146` | Minor; legend may not show on mobile | LOW |

## Open Questions

1. **onlyRenderVisibleElements + explicit node dimensions edge rendering**
   - What we know: React Flow issue #4516 reports edges not rendering when one node is off-screen and nodes have explicit `width`/`height`. Our nodes are created with `width: NODE_WIDTH, height: NODE_HEIGHT`.
   - What's unclear: Whether this is fixed in @xyflow/react 12.10.0 or still an issue.
   - Recommendation: Enable the prop and test with 20+ entities on canvas. If edges disappear when scrolling, either remove explicit dimensions or revert the prop.

2. **Real device access for testing**
   - What we know: The test matrix requires iPhone (notch), Android mid-range, and iPad. Testing requires physical devices or a cloud testing service.
   - What's unclear: Whether the developer has physical devices or needs BrowserStack/Sauce Labs.
   - Recommendation: Start with Chrome DevTools device emulation + responsive mode for initial validation. Use physical devices for final safe-area and performance verification. If no physical devices available, BrowserStack Live provides real device access.

3. **Landscape safe-area-insets on iPad**
   - What we know: iPad in landscape has safe-area-inset-left and safe-area-inset-right for the camera housing region (newer iPads with Face ID).
   - What's unclear: Whether any UI elements in the app are flush with left/right screen edges on tablet.
   - Recommendation: The mobile toolbar is centered (`left-1/2 -translate-x-1/2`), so left/right insets are likely irrelevant. Verify during real-device testing.

4. **Performance threshold definition**
   - What we know: Requirement says "no perceptible jank" with 20+ entities.
   - What's unclear: What FPS constitutes "no perceptible jank" on 60Hz vs 120Hz displays.
   - Recommendation: Target consistent 60fps for all interactions (pan, zoom, drag). Use Chrome DevTools Performance panel to verify frame times stay under 16.7ms during interactions.

## Sources

### Primary (HIGH confidence)
- [React Flow Performance Guide](https://reactflow.dev/learn/advanced-use/performance) - Memoization, onlyRenderVisibleElements, style simplification
- [React Flow API Reference](https://reactflow.dev/api-reference/react-flow) - `onlyRenderVisibleElements` default value (false), all performance props
- [xyflow/xyflow#4516](https://github.com/xyflow/xyflow/issues/4516) - Edge rendering bug with explicit node dimensions + viewport culling
- [MDN env() CSS function](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env) - Safe-area-inset specification and browser support
- [WebKit: Designing Websites for iPhone X](https://webkit.org/blog/7929/designing-websites-for-iphone-x/) - Original safe-area-inset documentation from Apple
- Codebase audit: 80+ files reviewed for performance patterns, transitions, safe-area handling (2026-03-06)

### Secondary (MEDIUM confidence)
- [SitePoint: Achieve 60 FPS Mobile Animations with CSS3](https://www.sitepoint.com/achieve-60-fps-mobile-animations-with-css3/) - Transform/opacity as performant properties, will-change guidance
- [shadcn-ui/ui#327](https://github.com/shadcn-ui/ui/issues/327) - CSS backdrop-filter performance issues documented
- [Bugzilla #1718471](https://bugzilla.mozilla.org/show_bug.cgi?id=1718471) - backdrop-filter: blur laggy with many elements
- [Synergy Codes: Ultimate Guide to Optimize React Flow Performance](https://medium.com/@lukasz.jazwa_32493/the-ultimate-guide-to-optimize-react-flow-project-performance-42f4297b2b7b) - Comprehensive React Flow optimization techniques

### Tertiary (LOW confidence)
- [tailwindcss-safe-area npm](https://www.npmjs.com/package/tailwindcss-safe-area) - Community plugin for safe-area Tailwind utilities (NOT recommended -- hand-rolled is simpler)

## Metadata

**Confidence breakdown:**
- Performance optimization: HIGH - Based on direct codebase audit, React Flow official docs, and well-documented CSS performance patterns
- Safe-area insets: HIGH - MDN and Apple WebKit docs are authoritative; `viewportFit: 'cover'` already set in codebase
- Transition suppression: HIGH - Standard web performance technique; specific transitions identified in codebase audit
- onlyRenderVisibleElements edge bug: MEDIUM - Issue documented on GitHub but unclear if fixed in current version
- Real-device testing: MEDIUM - Test matrix and scenarios are well-defined, but actual device results unknown until execution
- backdrop-filter mobile impact: MEDIUM - Multiple sources report issues; actual impact depends on specific device GPU

**Research date:** 2026-03-06
**Valid until:** 2026-04-06 (stable -- no fast-moving dependencies)
